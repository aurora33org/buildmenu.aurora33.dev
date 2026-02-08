interface CornerFlourishProps {
  color?: string;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function CornerFlourish({
  color = '#D4AF37',
  size = 60,
  position = 'top-left'
}: CornerFlourishProps) {
  const rotations = {
    'top-left': 0,
    'top-right': 90,
    'bottom-right': 180,
    'bottom-left': 270,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotations[position]}deg)` }}
    >
      <defs>
        <linearGradient id={`flourish-gradient-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#F9E79F" />
          <stop offset="100%" stopColor="#C5A572" />
        </linearGradient>
      </defs>

      {/* Art Deco corner design */}
      <path
        d="M 2 2 L 2 20 M 2 2 L 20 2"
        stroke={`url(#flourish-gradient-${position})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 5 5 L 5 15 M 5 5 L 15 5"
        stroke={`url(#flourish-gradient-${position})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle
        cx="8"
        cy="8"
        r="2"
        fill={`url(#flourish-gradient-${position})`}
        opacity="0.5"
      />
    </svg>
  );
}
