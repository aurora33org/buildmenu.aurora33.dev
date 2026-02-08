interface SectionFrameProps {
  children: React.ReactNode;
  color?: string;
  accentColor?: string;
}

export function SectionFrame({
  children,
  color = '#D4AF37',
  accentColor = '#C5A572'
}: SectionFrameProps) {
  return (
    <div className="relative p-8 md:p-12">
      {/* Corner flourishes */}
      <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M 2 2 L 2 20 M 2 2 L 20 2 M 5 5 L 5 15 M 5 5 L 15 5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none" style={{ transform: 'rotate(90deg)' }}>
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M 2 2 L 2 20 M 2 2 L 20 2 M 5 5 L 5 15 M 5 5 L 15 5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none" style={{ transform: 'rotate(180deg)' }}>
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M 2 2 L 2 20 M 2 2 L 20 2 M 5 5 L 5 15 M 5 5 L 15 5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none" style={{ transform: 'rotate(270deg)' }}>
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M 2 2 L 2 20 M 2 2 L 20 2 M 5 5 L 5 15 M 5 5 L 15 5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Border with gradient */}
      <div
        className="absolute inset-0 rounded-sm pointer-events-none"
        style={{
          border: `1px solid ${accentColor}`,
          opacity: 0.3,
          boxShadow: `inset 0 0 30px rgba(212, 175, 55, 0.05)`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
