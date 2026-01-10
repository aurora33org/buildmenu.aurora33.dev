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

  return (
    <div
      className="min-h-screen py-16 px-4"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: bodyFont
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <h1
            className="text-4xl md:text-5xl font-light tracking-wide"
            style={{
              color: primaryColor,
              fontFamily: headingFont
            }}
          >
            {restaurantName}
          </h1>
        </header>

        {/* Categories */}
        <div className="space-y-14">
          {visibleCategories.map((category) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            if (visibleItems.length === 0) return null;

            return (
              <section key={category.id}>
                <h2
                  className="text-2xl font-medium mb-8"
                  style={{
                    color: primaryColor,
                    fontFamily: headingFont
                  }}
                >
                  {category.name}
                </h2>

                <div className="space-y-6">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start gap-4 pb-4 border-b"
                      style={{ borderColor: '#e5e5e5' }}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1" style={{ color: textColor }}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm" style={{ color: secondaryColor }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.base_price !== null && (
                        <span
                          className="text-lg font-medium flex-shrink-0"
                          style={{ color: textColor }}
                        >
                          ${item.base_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
