import type {
  CombinationCoverage,
  CombinationInsights,
  PassportAccess,
  SnapshotManifest,
} from "./types";

const EASY_ACCESS = new Set(["citizenship", "visa_free", "eta", "visa_on_arrival"]);
const MAX_REPORTED_TIES = 10;

interface CoverageMask {
  code: string;
  words: Uint32Array;
}

export interface SecondPassportCandidate {
  code: string;
  combinedAccessibleDestinations: number;
  combinedMobilityScore: number;
  marginalEasyDestinations: number;
  candidateEasyDestinations: number;
  gainedDestinationCodes: string[];
}

function popcount32(value: number): number {
  let current = value - ((value >>> 1) & 0x55555555);
  current = (current & 0x33333333) + ((current >>> 2) & 0x33333333);
  return (((current + (current >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function countMask(words: Uint32Array): number {
  let count = 0;
  for (const word of words) count += popcount32(word >>> 0);
  return count;
}

function unionCount(first: Uint32Array, second: Uint32Array, third?: Uint32Array): number {
  let count = 0;
  for (let index = 0; index < first.length; index += 1) {
    count += popcount32((first[index] | second[index] | (third?.[index] ?? 0)) >>> 0);
  }
  return count;
}

function unionMasks(masks: Uint32Array[], wordCount: number): Uint32Array {
  const union = new Uint32Array(wordCount);
  for (const mask of masks) {
    for (let index = 0; index < wordCount; index += 1) union[index] |= mask[index];
  }
  return union;
}

function uncoveredCodes(
  codes: string[],
  masksByCode: Map<string, Uint32Array>,
  manifest: SnapshotManifest,
): string[] {
  const union = unionMasks(codes.map((code) => masksByCode.get(code)!), Math.ceil(manifest.destinations.length / 32));
  return manifest.destinations
    .filter((_, index) => (union[index >>> 5] & (1 << (index & 31))) === 0)
    .map((destination) => destination.code);
}

function coverageResult(
  codes: string[],
  accessibleDestinations: number,
  masksByCode: Map<string, Uint32Array>,
  manifest: SnapshotManifest,
): CombinationCoverage {
  return {
    codes,
    accessibleDestinations,
    mobilityScore: Math.max(0, accessibleDestinations - 1),
    uncoveredDestinationCodes: uncoveredCodes(codes, masksByCode, manifest),
  };
}

function toBigIntMask(words: Uint32Array): bigint {
  let result = 0n;
  for (let index = 0; index < words.length; index += 1) {
    result |= BigInt(words[index] >>> 0) << BigInt(index * 32);
  }
  return result;
}

function bigintPopcount(value: bigint): number {
  let current = value;
  let count = 0;
  while (current) {
    current &= current - 1n;
    count += 1;
  }
  return count;
}

function exactMinimumCover(
  masks: CoverageMask[],
  destinationCount: number,
): { codes: string[]; requiredCodes: string[] } {
  const fullMask = (1n << BigInt(destinationCount)) - 1n;
  const bigintMasks = masks.map(({ code, words }) => ({ code, mask: toBigIntMask(words) & fullMask }));
  const requiredCodes: string[] = [];

  for (let destinationIndex = 0; destinationIndex < destinationCount; destinationIndex += 1) {
    const bit = 1n << BigInt(destinationIndex);
    const covering = bigintMasks.filter(({ mask }) => (mask & bit) !== 0n);
    if (covering.length === 0) throw new Error(`Destination ${destinationIndex} has no easy-access passport`);
    if (covering.length === 1 && !requiredCodes.includes(covering[0].code)) requiredCodes.push(covering[0].code);
  }

  const requiredMask = requiredCodes.reduce(
    (union, code) => union | (bigintMasks.find((candidate) => candidate.code === code)?.mask ?? 0n),
    0n,
  );
  const targetMask = fullMask & ~requiredMask;
  const candidates = bigintMasks
    .filter(({ code }) => !requiredCodes.includes(code))
    .map(({ code, mask }) => ({ code, mask: mask & targetMask }))
    .filter(({ mask }) => mask !== 0n);

  // A subset can never beat a superset when every passport has the same cost.
  const reducedCandidates = candidates.filter((candidate, candidateIndex) =>
    !candidates.some((other, otherIndex) =>
      candidateIndex !== otherIndex &&
      (candidate.mask | other.mask) === other.mask &&
      (candidate.mask !== other.mask || otherIndex < candidateIndex),
    ),
  );

  const candidatesByDestination = Array.from({ length: destinationCount }, (_, destinationIndex) => {
    const bit = 1n << BigInt(destinationIndex);
    return reducedCandidates
      .map((candidate, index) => ((candidate.mask & bit) !== 0n ? index : -1))
      .filter((index) => index >= 0);
  });

  const greedyCodes: string[] = [];
  let greedyUncovered = targetMask;
  while (greedyUncovered) {
    const next = reducedCandidates
      .map((candidate, index) => ({ index, gain: bigintPopcount(candidate.mask & greedyUncovered) }))
      .sort((first, second) => second.gain - first.gain || first.index - second.index)[0];
    if (!next || next.gain === 0) throw new Error("The destination catalog cannot be fully covered");
    greedyCodes.push(reducedCandidates[next.index].code);
    greedyUncovered &= ~reducedCandidates[next.index].mask;
  }

  const initialMaxGain = Math.max(...reducedCandidates.map((candidate) => bigintPopcount(candidate.mask)));
  const firstPossibleSize = Math.ceil(bigintPopcount(targetMask) / initialMaxGain);
  let solution: string[] | null = null;

  for (let limit = firstPossibleSize; limit <= greedyCodes.length && !solution; limit += 1) {
    const memo = new Set<string>();
    const search = (uncovered: bigint, remaining: number, selected: string[]): boolean => {
      if (uncovered === 0n) {
        solution = selected;
        return true;
      }
      if (remaining === 0) return false;

      let largestGain = 0;
      for (const candidate of reducedCandidates) {
        largestGain = Math.max(largestGain, bigintPopcount(candidate.mask & uncovered));
      }
      if (largestGain === 0 || largestGain * remaining < bigintPopcount(uncovered)) return false;

      const memoKey = `${remaining}:${uncovered.toString(36)}`;
      if (memo.has(memoKey)) return false;
      memo.add(memoKey);

      let options: number[] | null = null;
      for (let destinationIndex = 0; destinationIndex < destinationCount; destinationIndex += 1) {
        if ((uncovered & (1n << BigInt(destinationIndex))) === 0n) continue;
        const destinationOptions = candidatesByDestination[destinationIndex]
          .filter((index) => (reducedCandidates[index].mask & uncovered) !== 0n);
        if (options === null || destinationOptions.length < options.length) options = destinationOptions;
        if (options.length <= 1) break;
      }

      const orderedOptions = (options ?? []).sort((first, second) =>
        bigintPopcount(reducedCandidates[second].mask & uncovered) -
          bigintPopcount(reducedCandidates[first].mask & uncovered) ||
        first - second,
      );
      for (const index of orderedOptions) {
        const candidate = reducedCandidates[index];
        if (search(uncovered & ~candidate.mask, remaining - 1, [...selected, candidate.code])) return true;
      }
      return false;
    };
    search(targetMask, limit, []);
  }

  if (!solution) throw new Error("Could not find an exact passport cover");
  return { codes: [...requiredCodes, ...solution], requiredCodes };
}

function marginalGains(
  codes: string[],
  masksByCode: Map<string, Uint32Array>,
  wordCount: number,
): Array<{ code: string; addedDestinations: number; cumulativeDestinations: number }> {
  const remaining = [...codes];
  const covered = new Uint32Array(wordCount);
  const result: Array<{ code: string; addedDestinations: number; cumulativeDestinations: number }> = [];

  while (remaining.length) {
    const next = remaining
      .map((code, index) => {
        const mask = masksByCode.get(code)!;
        let gain = 0;
        for (let wordIndex = 0; wordIndex < wordCount; wordIndex += 1) {
          gain += popcount32((mask[wordIndex] & ~covered[wordIndex]) >>> 0);
        }
        return { code, index, gain };
      })
      .sort((first, second) => second.gain - first.gain || first.index - second.index)[0];
    const mask = masksByCode.get(next.code)!;
    for (let wordIndex = 0; wordIndex < wordCount; wordIndex += 1) covered[wordIndex] |= mask[wordIndex];
    result.push({
      code: next.code,
      addedDestinations: next.gain,
      cumulativeDestinations: countMask(covered),
    });
    remaining.splice(remaining.indexOf(next.code), 1);
  }
  return result;
}

export function analyzePassportCombinations(
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
): CombinationInsights {
  const wordCount = Math.ceil(manifest.destinations.length / 32);
  const masks: CoverageMask[] = manifest.passports.map((passport) => {
    const detail = details[passport.code];
    if (!detail) throw new Error(`Missing passport detail for ${passport.code}`);
    const words = new Uint32Array(wordCount);
    manifest.destinations.forEach((destination, destinationIndex) => {
      if (EASY_ACCESS.has(detail.statuses[destination.code])) {
        words[destinationIndex >>> 5] |= 1 << (destinationIndex & 31);
      }
    });
    return { code: passport.code, words };
  });
  const masksByCode = new Map(masks.map(({ code, words }) => [code, words]));

  let bestPairCount = -1;
  let bestPairCodes: string[][] = [];
  let bestPairTieCount = 0;
  for (let first = 0; first < masks.length; first += 1) {
    for (let second = first + 1; second < masks.length; second += 1) {
      const accessible = unionCount(masks[first].words, masks[second].words);
      if (accessible > bestPairCount) {
        bestPairCount = accessible;
        bestPairCodes = [];
        bestPairTieCount = 0;
      }
      if (accessible === bestPairCount) {
        bestPairTieCount += 1;
        if (bestPairCodes.length < MAX_REPORTED_TIES) {
          bestPairCodes.push([masks[first].code, masks[second].code]);
        }
      }
    }
  }

  let bestTripleCount = -1;
  let bestTripleCodes: string[][] = [];
  let bestTripleTieCount = 0;
  for (let first = 0; first < masks.length; first += 1) {
    for (let second = first + 1; second < masks.length; second += 1) {
      for (let third = second + 1; third < masks.length; third += 1) {
        const accessible = unionCount(masks[first].words, masks[second].words, masks[third].words);
        if (accessible > bestTripleCount) {
          bestTripleCount = accessible;
          bestTripleCodes = [];
          bestTripleTieCount = 0;
        }
        if (accessible === bestTripleCount) {
          bestTripleTieCount += 1;
          if (bestTripleCodes.length < MAX_REPORTED_TIES) {
            bestTripleCodes.push([masks[first].code, masks[second].code, masks[third].code]);
          }
        }
      }
    }
  }

  const minimum = exactMinimumCover(masks, manifest.destinations.length);
  const gains = marginalGains(minimum.codes, masksByCode, wordCount);

  return {
    schemaVersion: 1,
    snapshotVersion: manifest.version,
    checkedAt: manifest.checkedAt,
    destinationCount: manifest.destinations.length,
    bestPairs: bestPairCodes.map((codes) =>
      coverageResult(codes, bestPairCount, masksByCode, manifest),
    ),
    bestPairTieCount,
    bestTriples: bestTripleCodes.map((codes) =>
      coverageResult(codes, bestTripleCount, masksByCode, manifest),
    ),
    bestTripleTieCount,
    minimumCover: {
      size: minimum.codes.length,
      codes: gains.map(({ code }) => code),
      requiredCodes: minimum.requiredCodes,
      accessibleDestinations: gains.at(-1)?.cumulativeDestinations ?? 0,
      marginalGains: gains,
    },
  };
}

export function rankSecondPassportCandidates(
  baseCode: string,
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
): SecondPassportCandidate[] {
  const normalizedBaseCode = baseCode.toUpperCase();
  const base = details[normalizedBaseCode];
  if (!base) throw new Error(`Missing passport detail for ${normalizedBaseCode}`);

  const baseEasy = new Set(manifest.destinations
    .filter((destination) => EASY_ACCESS.has(base.statuses[destination.code]))
    .map((destination) => destination.code));

  return manifest.passports
    .filter((passport) => passport.code !== normalizedBaseCode)
    .map((passport) => {
      const candidate = details[passport.code];
      if (!candidate) throw new Error(`Missing passport detail for ${passport.code}`);
      const candidateEasyCodes = manifest.destinations
        .filter((destination) => EASY_ACCESS.has(candidate.statuses[destination.code]))
        .map((destination) => destination.code);
      const gainedDestinationCodes = candidateEasyCodes.filter((code) => !baseEasy.has(code));
      const combinedAccessibleDestinations = baseEasy.size + gainedDestinationCodes.length;
      return {
        code: passport.code,
        combinedAccessibleDestinations,
        combinedMobilityScore: Math.max(0, combinedAccessibleDestinations - 1),
        marginalEasyDestinations: gainedDestinationCodes.length,
        candidateEasyDestinations: candidateEasyCodes.length,
        gainedDestinationCodes,
      };
    })
    .sort((first, second) =>
      second.combinedAccessibleDestinations - first.combinedAccessibleDestinations
      || second.marginalEasyDestinations - first.marginalEasyDestinations
      || second.candidateEasyDestinations - first.candidateEasyDestinations
      || first.code.localeCompare(second.code));
}
