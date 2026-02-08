interface DiamondDividerProps {
  color?: string;
  width?: number;
  opacity?: number;
}

export function DiamondDivider({
  color = '#D4AF37',
  width = 200,
  opacity = 1
}: DiamondDividerProps) {
  return (
    <svg
      width={width}
      height="20"
      viewBox="0 0 200 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#F9E79F" stopOpacity="1" />
          <stop offset="100%" stopColor="#C5A572" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Left line */}
      <line
        x1="0"
        y1="10"
        x2="85"
        y2="10"
        stroke="url(#gold-gradient)"
        strokeWidth="1"
      />

      {/* Diamond */}
      <path
        d="M100 2 L108 10 L100 18 L92 10 Z"
        fill="url(#gold-gradient)"
      />

      {/* Right line */}
      <line
        x1="115"
        y1="10"
        x2="200"
        y2="10"
        stroke="url(#gold-gradient)"
        strokeWidth="1"
      />
    </svg>
  );
}
