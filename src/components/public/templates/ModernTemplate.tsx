'use client';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  is_visible: boolean;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_visible: boolean;
  items: MenuItem[];
}

interface RestaurantSettings {
  template_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  font_heading: string | null;
  font_body: string | null;
}

interface ModernTemplateProps {
  restaurantName: string;
  categories: Category[];
  settings: RestaurantSettings;
}

export function ModernTemplate({
  restaurantName,
  categories,
  settings
}: ModernTemplateProps) {
  const primaryColor = settings.primary_color || '#2563eb';
  const secondaryColor = settings.secondary_color || '#64748b';
  const accentColor = settings.accent_color || '#f59e0b';
  const backgroundColor = settings.background_color || '#f8fafc';
  const textColor = settings.text_color || '#1e293b';
  const headingFont = settings.font_heading || 'Poppins, sans-serif';
  const bodyFont = settings.font_body || 'Inter, sans-serif';

  const visibleCategories = categories.filter(cat => cat.is_visible);

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '37, 99, 235';
    return `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`;
  };

  return (
    <div
      className="min-h-screen py-16 md:py-24 px-4 md:px-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(120deg, ${backgroundColor} 0%, ${backgroundColor}f5 100%)`,
        color: textColor,
        fontFamily: bodyFont
      }}
    >
      {/* Geometric background elements */}
      <div
        className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl pointer-events-none opacity-[0.08] animate-float"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute bottom-40 left-10 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full blur-3xl pointer-events-none opacity-[0.06] animate-float-delayed"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-[0.04]"
        style={{ backgroundColor: secondaryColor }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-20 md:mb-28">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 animate-slide-down"
            style={{
              fontFamily: headingFont,
              letterSpacing: '-0.02em',
              fontWeight: 900,
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {restaurantName}
          </h1>
          <div
            className="h-1 w-24 mx-auto rounded-full animate-scale-in"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
              animationDelay: '0.3s'
            }}
          />
        </header>

        {/* Categories */}
        <div className="space-y-24 md:space-y-32">
          {visibleCategories.map((category, categoryIndex) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            const featuredItems = visibleItems.filter(item => item.is_featured);
            const regularItems = visibleItems.filter(item => !item.is_featured);

            if (visibleItems.length === 0) return null;

            return (
              <section
                key={category.id}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${categoryIndex * 100}ms` }}
              >
                {/* Category number background */}
                <div
                  className="absolute -left-4 md:-left-8 top-0 text-[120px] md:text-[180px] font-light leading-none select-none pointer-events-none"
                  style={{
                    color: primaryColor,
                    opacity: 0.03,
                    fontWeight: 100
                  }}
                >
                  {String(categoryIndex + 1).padStart(2, '0')}
                </div>

                {/* Category header */}
                <div
                  className="relative mb-8 md:mb-12 pl-6 border-l-4 rounded-sm"
                  style={{
                    borderColor: accentColor,
                    background: `linear-gradient(90deg, rgba(${hexToRgb(accentColor)}, 0.08) 0%, transparent 100%)`
                  }}
                >
                  <h2
                    className="text-3xl md:text-5xl font-bold mb-2"
                    style={{
                      fontFamily: headingFont,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: primaryColor
                    }}
                  >
                    {category.name}
                  </h2>
                  {category.description && (
                    <p
                      className="text-base md:text-lg"
                      style={{
                        color: secondaryColor,
                        lineHeight: 1.7
                      }}
                    >
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Featured Items - Full width cards */}
                {featuredItems.length > 0 && (
                  <div className="mb-8 space-y-6">
                    {featuredItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="modern-card modern-card-featured group p-6 md:p-8 rounded-2xl relative overflow-hidden"
                        style={{
                          animationDelay: `${itemIndex * 50}ms`,
                          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--primary), var(--accent)) border-box',
                          border: '2px solid transparent',
                          ['--primary' as string]: primaryColor,
                          ['--accent' as string]: accentColor,
                        }}
                      >
                        {/* Featured badge */}
                        <div
                          className="absolute top-0 right-8 px-4 py-1 text-xs font-bold tracking-widest text-white"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)'
                          }}
                        >
                          DESTACADO
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className="text-2xl md:text-3xl font-bold mb-3"
                              style={{
                                color: textColor,
                                fontFamily: headingFont,
                                fontWeight: 700
                              }}
                            >
                              {item.name}
                            </h3>
                            {item.description && (
                              <p
                                className="text-base md:text-lg"
                                style={{
                                  color: secondaryColor,
                                  lineHeight: 1.7
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          {item.base_price !== null && (
                            <div
                              className="text-3xl md:text-4xl font-bold whitespace-nowrap price-pulse"
                              style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontFamily: headingFont,
                                fontWeight: 700,
                                fontFeatureSettings: '"tnum" 1'
                              }}
                            >
                              ${item.base_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular Items - Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {regularItems.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="modern-card group p-6 rounded-2xl"
                      style={{
                        animationDelay: `${(featuredItems.length + itemIndex) * 50}ms`
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <h3
                          className="text-lg md:text-xl font-bold mb-2"
                          style={{
                            color: textColor,
                            fontFamily: headingFont,
                            fontWeight: 700
                          }}
                        >
                          {item.name}
                        </h3>
                        {item.description && (
                          <p
                            className="text-sm md:text-base mb-4 flex-1"
                            style={{
                              color: secondaryColor,
                              lineHeight: 1.7
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                        {item.base_price !== null && (
                          <div
                            className="text-xl md:text-2xl font-bold mt-auto"
                            style={{
                              color: accentColor,
                              fontFamily: headingFont,
                              fontWeight: 700,
                              fontFeatureSettings: '"tnum" 1'
                            }}
                          >
                            ${item.base_price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Diagonal divider (except last) */}
                {categoryIndex < visibleCategories.length - 1 && (
                  <div className="relative h-16 md:h-24 my-16 md:my-24 overflow-hidden">
                    <div
                      className="absolute inset-0 transform -skew-y-2 opacity-10"
                      style={{
                        background: `linear-gradient(90deg, ${primaryColor} 0%, ${accentColor} 100%)`
                      }}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, -20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, 20px);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 5px currentColor);
            opacity: 1;
          }
          50% {
            filter: drop-shadow(0 0 15px currentColor);
            opacity: 0.9;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-slide-down {
          animation: slide-down 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
          transform-origin: center;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .modern-card {
          background: white;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .modern-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.05),
            0 20px 60px rgba(0,0,0,0.12);
        }

        .modern-card-featured {
          box-shadow:
            0 4px 8px rgba(0,0,0,0.06),
            0 15px 50px rgba(0,0,0,0.10);
        }

        .modern-card-featured:hover {
          transform: translateY(-6px);
          box-shadow:
            0 6px 10px rgba(0,0,0,0.08),
            0 25px 70px rgba(0,0,0,0.15);
        }

        .price-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Reduce animations on mobile */
        @media (max-width: 768px) {
          .animate-float,
          .animate-float-delayed {
            animation: none;
          }

          .price-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
