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

interface MinimalTemplateProps {
  restaurantName: string;
  categories: Category[];
  settings: RestaurantSettings;
}

export function MinimalTemplate({
  restaurantName,
  categories,
  settings
}: MinimalTemplateProps) {
  const primaryColor = settings.primary_color || '#000000';
  const secondaryColor = settings.secondary_color || '#666666';
  const backgroundColor = settings.background_color || '#ffffff';
  const textColor = settings.text_color || '#1a1a1a';
  const headingFont = settings.font_heading || 'Inter, sans-serif';
  const bodyFont = settings.font_body || 'Inter, sans-serif';

  const visibleCategories = categories.filter(cat => cat.is_visible);

  // 8px baseline grid system
  const UNIT = 8;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: bodyFont,
        fontWeight: 300,
      }}
    >
      {/* Fixed header */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor,
          borderBottom: `0.5px solid rgba(0, 0, 0, 0.05)`,
          padding: `${UNIT}px ${UNIT * 4}px`,
        }}
      >
        <div
          className="text-xs font-light tracking-widest uppercase"
          style={{
            color: primaryColor,
            letterSpacing: '0.15em',
            fontFamily: headingFont
          }}
        >
          {restaurantName}
        </div>
      </header>

      {/* Main content with asymmetric margins (golden ratio) */}
      <div
        className="max-w-[800px] mx-auto px-8 md:pl-20 md:pr-12"
        style={{
          paddingTop: `${UNIT * 12}px`, // 96px (fixed header + spacing)
          paddingBottom: `${UNIT * 12}px`,
        }}
      >
        {/* Main title */}
        <div style={{ marginBottom: `${UNIT * 16}px` }}>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight animate-fade-in"
            style={{
              fontFamily: headingFont,
              fontWeight: 100,
              letterSpacing: '-0.03em',
              color: primaryColor,
              lineHeight: 1.1,
            }}
          >
            {restaurantName}
          </h1>
        </div>

        {/* Categories */}
        <div>
          {visibleCategories.map((category, categoryIndex) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            const featuredItems = visibleItems.filter(item => item.is_featured);
            const regularItems = visibleItems.filter(item => !item.is_featured);

            if (visibleItems.length === 0) return null;

            return (
              <section
                key={category.id}
                className="relative animate-slide-in"
                style={{
                  marginBottom: `${UNIT * 12}px`,
                  animationDelay: `${categoryIndex * 100}ms`
                }}
              >
                {/* Large category number in background */}
                <div
                  className="absolute -left-4 md:-left-16 top-0 select-none pointer-events-none"
                  style={{
                    fontSize: '120px',
                    fontWeight: 100,
                    lineHeight: 1,
                    color: primaryColor,
                    opacity: 0.03,
                  }}
                >
                  {String(categoryIndex + 1).padStart(2, '0')}
                </div>

                {/* Category title */}
                <h2
                  className="text-2xl md:text-4xl font-light tracking-tight"
                  style={{
                    fontFamily: headingFont,
                    fontWeight: 100,
                    color: primaryColor,
                    marginBottom: `${UNIT * 2}px`,
                    lineHeight: 1.5,
                  }}
                >
                  {category.name}
                </h2>

                {category.description && (
                  <p
                    className="text-sm md:text-base"
                    style={{
                      color: secondaryColor,
                      fontWeight: 300,
                      marginBottom: `${UNIT * 6}px`,
                      lineHeight: 1.5,
                    }}
                  >
                    {category.description}
                  </p>
                )}

                {/* Hairline divider */}
                <div
                  style={{
                    height: '0.5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    marginTop: `${UNIT * 3}px`,
                    marginBottom: `${UNIT * 6}px`,
                  }}
                />

                {/* Featured Items */}
                {featuredItems.length > 0 && (
                  <div style={{ marginBottom: `${UNIT * 6}px` }}>
                    {featuredItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="minimal-item featured-item"
                        style={{
                          marginBottom: `${UNIT * 5}px`,
                          padding: `${UNIT * 3}px`,
                          border: `1px solid rgba(0, 0, 0, 0.08)`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          animationDelay: `${itemIndex * 100}ms`
                        }}
                      >
                        {/* Featured badge */}
                        <div
                          className="text-[10px] font-medium tracking-widest uppercase mb-3"
                          style={{
                            color: primaryColor,
                            letterSpacing: '0.15em',
                            opacity: 0.5
                          }}
                        >
                          Destacado
                        </div>

                        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                          <h3
                            className="text-xl md:text-2xl font-light relative item-name"
                            style={{
                              fontFamily: headingFont,
                              fontWeight: 300,
                              color: textColor,
                              flex: 1,
                            }}
                          >
                            {item.name}
                          </h3>

                          {item.base_price !== null && (
                            <div
                              className="text-2xl md:text-3xl font-light price-fade-in"
                              style={{
                                color: primaryColor,
                                fontFamily: headingFont,
                                fontWeight: 300,
                                fontFeatureSettings: '"tnum" 1',
                                ['--delay' as string]: `${itemIndex * 0.1}s`
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
                              fontWeight: 300,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular Items */}
                <div>
                  {regularItems.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="minimal-item"
                      style={{
                        marginBottom: `${UNIT * 4}px`,
                        animationDelay: `${(featuredItems.length + itemIndex) * 100}ms`
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                        <h3
                          className="text-base md:text-lg font-light relative item-name"
                          style={{
                            fontFamily: headingFont,
                            fontWeight: 300,
                            color: textColor,
                            flex: 1,
                          }}
                        >
                          {item.name}
                        </h3>

                        {item.base_price !== null && (
                          <div
                            className="text-lg md:text-xl font-light price-fade-in"
                            style={{
                              color: primaryColor,
                              fontFamily: headingFont,
                              fontWeight: 300,
                              fontFeatureSettings: '"tnum" 1',
                              ['--delay' as string]: `${(featuredItems.length + itemIndex) * 0.1}s`
                            }}
                          >
                            ${item.base_price.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: secondaryColor,
                            fontWeight: 300,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Hairline bottom border */}
                      <div
                        style={{
                          height: '0.5px',
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          marginTop: `${UNIT * 3}px`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
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
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
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

        .minimal-item {
          transition: opacity 0.2s ease;
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .minimal-item:hover {
          opacity: 0.7;
        }

        /* Underline animation on hover */
        .item-name {
          position: relative;
        }

        .item-name::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 0.5px;
          background: black;
          transition: width 0.3s ease;
        }

        .minimal-item:hover .item-name::after {
          width: 100%;
        }

        /* Price fade-in animation */
        .price-fade-in {
          animation: fadeInUp 0.4s ease forwards;
          animation-delay: var(--delay);
        }

        /* Featured item hover */
        .featured-item {
          transition: all 0.3s ease;
        }

        .featured-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }

        /* Mobile: symmetric margins */
        @media (max-width: 768px) {
          .minimal-item:hover {
            opacity: 1;
          }

          .item-name::after {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
