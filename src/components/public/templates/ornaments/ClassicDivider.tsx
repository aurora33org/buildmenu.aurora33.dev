interface ClassicDividerProps {
  color?: string;
  width?: number;
}

export function ClassicDivider({
  color = '#8b7355',
  width = 180
}: ClassicDividerProps) {
  return (
    <svg
      width={width}
      height="24"
      viewBox="0 0 180 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Left line */}
      <line
        x1="0"
        y1="12"
        x2="70"
        y2="12"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Center ornament - fleur de lis style */}
      <path
        d="M90 4 L94 12 L90 20 L86 12 Z M90 8 L92 12 L90 16 L88 12 Z"
        fill={color}
        opacity="0.6"
      />
      <circle cx="90" cy="12" r="2" fill={color} opacity="0.4" />

      {/* Right line */}
      <line
        x1="110"
        y1="12"
        x2="180"
        y2="12"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
