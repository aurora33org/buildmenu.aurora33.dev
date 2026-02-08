'use client';

import { ClassicDivider, FrenchFlourish } from './ornaments';

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

interface ClassicTemplateProps {
  restaurantName: string;
  categories: Category[];
  settings: RestaurantSettings;
}

export function ClassicTemplate({
  restaurantName,
  categories,
  settings
}: ClassicTemplateProps) {
  const primaryColor = settings.primary_color || '#1a1a1a';
  const secondaryColor = settings.secondary_color || '#4a4a4a';
  const accentColor = settings.accent_color || '#8b7355';
  const backgroundColor = settings.background_color || '#ffffff';
  const textColor = settings.text_color || '#2d2d2d';
  const headingFont = settings.font_heading || 'Playfair Display, serif';
  const bodyFont = settings.font_body || 'Lora, serif';

  const visibleCategories = categories.filter(cat => cat.is_visible);

  // Golden ratio spacing system (base 16px)
  const SPACING = {
    xs: 16,    // 16px
    sm: 26,    // 16 * 1.618
    md: 42,    // 16 * 1.618²
    lg: 68,    // 16 * 1.618³
    xl: 110,   // 16 * 1.618⁴
  };

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '139, 115, 85';
    return `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`;
  };

  return (
    <div
      className="min-h-screen py-12 md:py-16 px-6 relative"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: bodyFont,
        // Paper texture
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Sepia overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'rgba(139, 115, 85, 0.025)',
          zIndex: 0
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-20 md:mb-28 animate-fade-in">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{
              fontFamily: headingFont,
              letterSpacing: '0.08em',
              color: primaryColor,
              textShadow: `0px 1px 2px rgba(0, 0, 0, 0.1)`,
            }}
          >
            {restaurantName}
          </h1>

          <ClassicDivider color={accentColor} />
        </header>

        {/* Categories */}
        <div style={{ marginTop: `${SPACING.xl}px` }}>
          {visibleCategories.map((category, categoryIndex) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            const featuredItems = visibleItems.filter(item => item.is_featured);
            const regularItems = visibleItems.filter(item => !item.is_featured);

            if (visibleItems.length === 0) return null;

            return (
              <section
                key={category.id}
                style={{ marginBottom: `${SPACING.lg}px` }}
                className="animate-slide-in"
              >
                {/* Category Header */}
                <div className="text-center mb-10 md:mb-12">
                  <h2
                    className="text-3xl md:text-5xl font-bold mb-4"
                    style={{
                      fontFamily: headingFont,
                      letterSpacing: '0.05em',
                      color: primaryColor,
                    }}
                  >
                    {category.name}
                  </h2>

                  {category.description && (
                    <p
                      className="text-base md:text-lg italic max-w-2xl mx-auto"
                      style={{
                        color: secondaryColor,
                        lineHeight: 1.8,
                        fontFamily: bodyFont
                      }}
                    >
                      {category.description}
                    </p>
                  )}

                  <div className="mt-6">
                    <ClassicDivider color={accentColor} width={120} />
                  </div>
                </div>

                {/* Featured Items with Frame */}
                {featuredItems.length > 0 && (
                  <div className="mb-10">
                    {featuredItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative p-8 md:p-12 mb-8 group hover:scale-[1.01] transition-transform duration-300"
                        style={{
                          border: `1px solid rgba(${hexToRgb(accentColor)}, 0.3)`,
                          boxShadow: `inset 0 0 30px rgba(${hexToRgb(accentColor)}, 0.03)`,
                          background: `linear-gradient(135deg, ${backgroundColor} 0%, rgba(${hexToRgb(accentColor)}, 0.02) 100%)`,
                        }}
                      >
                        {/* Corner flourishes */}
                        <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
                          <FrenchFlourish color={accentColor} position="top-left" size={48} />
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none">
                          <FrenchFlourish color={accentColor} position="top-right" size={48} />
                        </div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none">
                          <FrenchFlourish color={accentColor} position="bottom-right" size={48} />
                        </div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none">
                          <FrenchFlourish color={accentColor} position="bottom-left" size={48} />
                        </div>

                        {/* Ribbon badge */}
                        <div
                          className="absolute -top-0 right-8 md:right-12 px-6 py-2 text-xs font-bold tracking-widest"
                          style={{
                            backgroundColor: accentColor,
                            color: backgroundColor,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 50% 85%, 0% 100%)'
                          }}
                        >
                          DESTACADO
                        </div>

                        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-6">
                          <div className="flex-1">
                            <h3
                              className="text-2xl md:text-3xl font-bold mb-3"
                              style={{
                                color: textColor,
                                fontFamily: headingFont,
                              }}
                            >
                              {item.name}
                            </h3>
                            {item.description && (
                              <p
                                className="text-base md:text-lg"
                                style={{
                                  color: secondaryColor,
                                  lineHeight: 1.8,
                                  fontFamily: bodyFont
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          {item.base_price !== null && (
                            <div
                              className="text-2xl md:text-3xl font-bold whitespace-nowrap"
                              style={{
                                color: primaryColor,
                                fontFamily: headingFont,
                                fontFeatureSettings: '"tnum" 1',
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

                {/* Regular Items */}
                <div style={{ marginTop: `${SPACING.md}px` }}>
                  {regularItems.map((item) => (
                    <div
                      key={item.id}
                      className="group mb-6 md:mb-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline md:gap-4">
                        <h3
                          className="text-lg md:text-xl font-semibold mb-2 md:mb-0"
                          style={{
                            color: textColor,
                            fontFamily: headingFont,
                          }}
                        >
                          {item.name}
                        </h3>

                        {/* Gradient separator - desktop only */}
                        <div className="hidden md:flex flex-1 items-center h-px mx-4">
                          <div
                            className="w-full h-px"
                            style={{
                              background: `linear-gradient(to right, rgba(${hexToRgb(accentColor)}, 0.3) 0%, transparent 50%, rgba(${hexToRgb(accentColor)}, 0.3) 100%)`
                            }}
                          />
                        </div>

                        {item.base_price !== null && (
                          <div
                            className="text-xl md:text-2xl font-bold whitespace-nowrap transition-transform duration-300 group-hover:scale-105"
                            style={{
                              color: primaryColor,
                              fontFamily: headingFont,
                              fontFeatureSettings: '"tnum" 1',
                              textShadow: `0px 1px 1px rgba(0, 0, 0, 0.05)`
                            }}
                          >
                            ${item.base_price.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p
                          className="text-sm md:text-base mt-2"
                          style={{
                            color: secondaryColor,
                            lineHeight: 1.8,
                            fontFamily: bodyFont
                          }}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Subtle bottom border */}
                      <div
                        className="mt-4 md:mt-6 h-px"
                        style={{
                          background: `linear-gradient(to right, transparent 0%, rgba(${hexToRgb(accentColor)}, 0.15) 50%, transparent 100%)`
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Section divider */}
                {categoryIndex < visibleCategories.length - 1 && (
                  <div style={{ marginTop: `${SPACING.lg}px`, marginBottom: `${SPACING.lg}px` }}>
                    <ClassicDivider color={accentColor} width={200} />
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-24 md:mt-32 pt-8 text-center">
          <ClassicDivider color={accentColor} width={160} />
          <p
            className="text-sm mt-6"
            style={{
              color: secondaryColor,
              fontFamily: bodyFont,
              letterSpacing: '0.1em'
            }}
          >
            Gracias por su visita
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
