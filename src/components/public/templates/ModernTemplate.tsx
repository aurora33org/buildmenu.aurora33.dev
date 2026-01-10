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

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: bodyFont
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h1
            className="text-5xl md:text-6xl font-extrabold tracking-tight"
            style={{
              color: primaryColor,
              fontFamily: headingFont
            }}
          >
            {restaurantName}
          </h1>
        </header>

        {/* Categories Grid */}
        <div className="space-y-16">
          {visibleCategories.map((category) => {
            const visibleItems = category.items.filter(item => item.is_visible);
            if (visibleItems.length === 0) return null;

            return (
              <section key={category.id}>
                <h2
                  className="text-3xl font-bold mb-6 pb-3 border-b-4"
                  style={{
                    color: primaryColor,
                    borderColor: accentColor,
                    fontFamily: headingFont
                  }}
                >
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-lg mb-8" style={{ color: secondaryColor }}>
                    {category.description}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold" style={{ color: textColor }}>
                          {item.name}
                        </h3>
                        {item.base_price !== null && (
                          <span
                            className="text-xl font-bold ml-3 flex-shrink-0"
                            style={{ color: accentColor }}
                          >
                            ${item.base_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm leading-relaxed" style={{ color: secondaryColor }}>
                          {item.description}
                        </p>
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
