import { PASSPORT_COLORS } from "@/data/passport-colors";
import { flagEmojiFor } from "@/lib/geography";

interface PassportCoverProps {
  codes: string[];
  names?: string[];
  size?: "small" | "medium" | "large";
}

export default function PassportCover({ codes, names = [], size = "medium" }: PassportCoverProps) {
  const shownCodes = codes.slice(0, 4);
  const dimensions = {
    small: { width: 38, height: 54, offset: 4 },
    medium: { width: 98, height: 134, offset: 11 },
    large: { width: 178, height: 242, offset: 16 },
  }[size];
  const stackStyle = {
    "--cover-width": `${dimensions.width}px`,
    "--cover-height": `${dimensions.height}px`,
    "--stack-offset": `${dimensions.offset}px`,
    width: dimensions.width + dimensions.offset * Math.max(0, shownCodes.length - 1),
    height: dimensions.height,
  } as React.CSSProperties;
  return (
    <div className={`passport-stack passport-stack--${size}`} style={stackStyle} aria-hidden="true">
      {shownCodes.map((code, index) => (
        <div
          className="passport-cover"
          key={code}
          style={{
            "--stack-index": index,
            "--passport-color": PASSPORT_COLORS[code] ?? "#293633",
          } as React.CSSProperties}
        >
          <span className="passport-cover__country">{names[index] ?? code}</span>
          <span className="passport-cover__emblem"><span className="country-flag">{flagEmojiFor(code)}</span></span>
          <span className="passport-cover__mark">✦</span>
          <span className="passport-cover__label">Passport</span>
        </div>
      ))}
      {codes.length > shownCodes.length && <span className="passport-stack__more">+{codes.length - shownCodes.length}</span>}
    </div>
  );
}
