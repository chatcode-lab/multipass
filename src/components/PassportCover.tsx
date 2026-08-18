interface PassportCoverProps {
  codes: string[];
  names?: string[];
  size?: "small" | "medium" | "large";
}

const TONES = ["forest", "burgundy", "navy", "umber", "charcoal"];

function toneForCode(code: string): string {
  const value = [...code].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return TONES[value % TONES.length];
}

export default function PassportCover({ codes, names = [], size = "medium" }: PassportCoverProps) {
  const shownCodes = codes.slice(0, 4);
  return (
    <div className={`passport-stack passport-stack--${size}`} aria-hidden="true">
      {shownCodes.map((code, index) => (
        <div
          className={`passport-cover passport-cover--${toneForCode(code)}`}
          key={code}
          style={{ "--stack-index": index } as React.CSSProperties}
        >
          <span className="passport-cover__country">{names[index] ?? code}</span>
          <span className={`passport-cover__flag fi fi-${code.toLowerCase()}`} />
          <span className="passport-cover__mark">✦</span>
          <span className="passport-cover__label">Passport</span>
        </div>
      ))}
      {codes.length > shownCodes.length && <span className="passport-stack__more">+{codes.length - shownCodes.length}</span>}
    </div>
  );
}

