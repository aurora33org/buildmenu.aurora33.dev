'use client';

import { DiamondDivider, SectionFrame } from './ornaments';

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

interface ElegantTemplateProps {
  restaurantName: string;
  categories: Category[];
  settings: RestaurantSettings;
}

export function ElegantTemplate({
  restaurantName,
  categories,
  settings
}: ElegantTemplateProps) {
  const primaryColor = settings.primary_color || '#D4AF37';
  const secondaryColor = settings.secondary_color || '#8B7355';
  const accentColor = settings.accent_color || '#C5A572';
  const backgroundColor = settings.background_color || '#FAF9F6';
  const textColor = settings.text_color || '#333333';
  const headingFont = settings.font_heading || 'Cormorant, serif';
  const bodyFont = settings.font_body || 'Lora, serif';

  const visibleCategories = categories.filter(cat => cat.is_visible);

  // Helper to convert hex to RGB for CSS variables
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '212, 175, 55';
    return `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`;
  };

  return (
    <div
      className="min-h-screen py-20 md:py-32 px-6 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${backgroundColor} 0%, ${backgroundColor}ee 100%)`,
        color: textColor,
        fontFamily: bodyFont,
        // Paper texture
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.06)',
          zIndex: 1
        }}
      />

      <div className="max-w-[900px] mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-32 md:mb-40">
          <h1
            className="text-5xl md:text-8xl lg:text-9xl font-bold mb-8 md:mb-12 animate-fade-in"
            style={{
              fontFamily: headingFont,
              letterSpacing: '0.08em',
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor}dd 50%, ${primaryColor}aa 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: `0px 2px 4px rgba(${hexToRgb(primaryColor)}, 0.15)`,
              lineHeight: 1.1
            }}
          >
            {restaurantName}
          </h1>

          {/* Ornamental Divider */}
          <div className="mt-12 animate-fade-in-delayed">
            <DiamondDivider color={primaryColor} />
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-32 md:space-y-40">
          {visibleCategories.map((category, categoryIndex) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            const featuredItems = visibleItems.filter(item => item.is_featured);
            const regularItems = visibleItems.filter(item => !item.is_featured);

            if (visibleItems.length === 0) return null;

            return (
              <section
                key={category.id}
                className="animate-slide-in"
                style={{
                  animationDelay: `${categoryIndex * 150}ms`
                }}
              >
                <h2
                  className="text-3xl md:text-5xl font-bold text-center mb-6"
                  style={{
                    fontFamily: headingFont,
                    fontVariant: 'small-caps',
                    letterSpacing: '0.12em',
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {category.name}
                </h2>

                {category.description && (
                  <p
                    className="text-center text-base md:text-lg mb-12 italic max-w-2xl mx-auto"
                    style={{
                      color: secondaryColor,
                      lineHeight: 1.8,
                      fontFamily: bodyFont
                    }}
                  >
                    {category.description}
                  </p>
                )}

                {/* Ornamental Divider */}
                <div className="mb-16">
                  <DiamondDivider color={accentColor} width={150} opacity={0.6} />
                </div>

                {/* Featured Items */}
                {featuredItems.length > 0 && (
                  <div className="mb-12">
                    <SectionFrame color={primaryColor} accentColor={accentColor}>
                      <div className="space-y-10">
                        {featuredItems.map((item) => (
                          <div
                            key={item.id}
                            className="group"
                          >
                            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 md:gap-6">
                              <div className="flex-1">
                                <h3
                                  className="text-xl md:text-2xl font-bold mb-3 transition-opacity duration-300 group-hover:opacity-85"
                                  style={{
                                    color: textColor,
                                    fontFamily: headingFont,
                                    fontFeatureSettings: '"liga" 1',
                                    letterSpacing: '0.02em'
                                  }}
                                >
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p
                                    className="text-sm md:text-base"
                                    style={{
                                      color: secondaryColor,
                                      fontFamily: bodyFont,
                                      lineHeight: 1.8
                                    }}
                                  >
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.base_price !== null && (
                                <div
                                  className="text-2xl md:text-3xl font-bold whitespace-nowrap transition-transform duration-300 group-hover:scale-105"
                                  style={{
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontFamily: headingFont,
                                    fontFeatureSettings: '"tnum" 1',
                                    textDecoration: 'underline',
                                    textDecorationColor: accentColor,
                                    textDecorationThickness: '1px',
                                    textUnderlineOffset: '6px'
                                  }}
                                >
                                  ${item.base_price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionFrame>
                  </div>
                )}

                {/* Regular Items */}
                <div className="space-y-8">
                  {regularItems.map((item) => (
                    <div
                      key={item.id}
                      className="group transition-all duration-300"
                    >
                      <div
                        className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 md:gap-6 pb-6"
                        style={{
                          borderBottom: `1px solid rgba(${hexToRgb(accentColor)}, 0.15)`
                        }}
                      >
                        <div className="flex-1">
                          <h3
                            className="text-lg md:text-xl font-semibold mb-2 transition-opacity duration-300 group-hover:opacity-85"
                            style={{
                              color: textColor,
                              fontFamily: headingFont,
                              fontFeatureSettings: '"liga" 1'
                            }}
                          >
                            {item.name}
                          </h3>
                          {item.description && (
                            <p
                              className="text-sm md:text-base"
                              style={{
                                color: secondaryColor,
                                fontFamily: bodyFont,
                                lineHeight: 1.8
                              }}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.base_price !== null && (
                          <div
                            className="text-xl md:text-2xl font-bold whitespace-nowrap transition-transform duration-300 group-hover:scale-105"
                            style={{
                              color: primaryColor,
                              fontFamily: headingFont,
                              fontFeatureSettings: '"tnum" 1',
                              textShadow: `0px 1px 1px rgba(${hexToRgb(primaryColor)}, 0.1)`
                            }}
                          >
                            ${item.base_price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section Divider (except last) */}
                {categoryIndex < visibleCategories.length - 1 && (
                  <div className="mt-24 md:mt-32">
                    <DiamondDivider color={accentColor} width={250} opacity={0.4} />
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer Ornament */}
        <div className="mt-32 md:mt-40">
          <DiamondDivider color={primaryColor} opacity={0.3} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Shimmer effect for gold elements */
        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        h1:hover {
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
