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

  return (
    <div
      className="min-h-screen py-16 px-6"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: bodyFont
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-20">
          <h1
            className="text-6xl md:text-7xl font-bold tracking-wide mb-6"
            style={{
              color: primaryColor,
              fontFamily: headingFont,
              letterSpacing: '0.05em'
            }}
          >
            {restaurantName}
          </h1>

          {/* Ornamental Divider */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div
              className="h-px flex-1 max-w-24"
              style={{ backgroundColor: accentColor }}
            />
            <div
              className="w-2 h-2 rotate-45"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="h-px flex-1 max-w-24"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-20">
          {visibleCategories.map((category, categoryIndex) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            if (visibleItems.length === 0) return null;

            return (
              <section key={category.id}>
                <h2
                  className="text-4xl font-bold text-center mb-4"
                  style={{
                    color: primaryColor,
                    fontFamily: headingFont,
                    letterSpacing: '0.03em'
                  }}
                >
                  {category.name}
                </h2>

                {category.description && (
                  <p
                    className="text-center text-lg mb-8 italic"
                    style={{ color: secondaryColor }}
                  >
                    {category.description}
                  </p>
                )}

                {/* Ornamental Divider */}
                <div className="flex items-center justify-center gap-3 mb-12">
                  <div
                    className="h-px w-16"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="h-px w-16"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>

                <div className="space-y-8">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="group transition-all duration-300 hover:translate-x-2"
                    >
                      <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-opacity-20"
                        style={{ borderColor: accentColor }}
                      >
                        <div className="flex-1">
                          <h3
                            className="text-2xl font-semibold mb-2 transition-colors duration-300"
                            style={{
                              color: textColor,
                              fontFamily: headingFont
                            }}
                          >
                            {item.name}
                          </h3>
                          {item.description && (
                            <p
                              className="text-base leading-relaxed"
                              style={{
                                color: secondaryColor,
                                fontFamily: bodyFont
                              }}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.base_price !== null && (
                          <div
                            className="text-2xl font-bold whitespace-nowrap transition-all duration-300 group-hover:scale-110"
                            style={{
                              color: primaryColor,
                              fontFamily: headingFont
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
                  <div className="flex items-center justify-center gap-4 mt-16">
                    <div
                      className="h-px flex-1 max-w-32"
                      style={{ backgroundColor: accentColor, opacity: 0.5 }}
                    />
                    <div
                      className="w-3 h-3 rotate-45"
                      style={{ backgroundColor: primaryColor, opacity: 0.3 }}
                    />
                    <div
                      className="w-2 h-2 rotate-45"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div
                      className="w-3 h-3 rotate-45"
                      style={{ backgroundColor: primaryColor, opacity: 0.3 }}
                    />
                    <div
                      className="h-px flex-1 max-w-32"
                      style={{ backgroundColor: accentColor, opacity: 0.5 }}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer Ornament */}
        <div className="flex items-center justify-center gap-4 mt-24">
          <div
            className="h-px w-24"
            style={{ backgroundColor: accentColor, opacity: 0.3 }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="h-px w-24"
            style={{ backgroundColor: accentColor, opacity: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
