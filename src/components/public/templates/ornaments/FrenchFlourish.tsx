interface FrenchFlourishProps {
  color?: string;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function FrenchFlourish({
  color = '#8b7355',
  size = 48,
  position = 'top-left'
}: FrenchFlourishProps) {
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
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotations[position]}deg)` }}
    >
      {/* French bistro corner design */}
      <path
        d="M 2 2 L 2 18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 2 2 L 18 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 6 6 L 6 14 M 6 6 L 14 6"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle
        cx="10"
        cy="10"
        r="1.5"
        fill={color}
        opacity="0.3"
      />
    </svg>
  );
}
