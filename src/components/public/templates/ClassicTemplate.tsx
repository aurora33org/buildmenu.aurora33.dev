import { cn } from '@/lib/utils';

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
  const headingFont = settings.font_heading || 'serif';
  const bodyFont = settings.font_body || 'sans-serif';

  const visibleCategories = categories.filter(cat => cat.is_visible);

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: bodyFont
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 pb-8 border-b-2" style={{ borderColor: accentColor }}>
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              color: primaryColor,
              fontFamily: headingFont
            }}
          >
            {restaurantName}
          </h1>
          <div
            className="w-24 h-1 mx-auto mt-4"
            style={{ backgroundColor: accentColor }}
          />
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {visibleCategories.map((category) => {
            const visibleItems = category.items.filter(item => item.is_visible);

            if (visibleItems.length === 0) return null;

            return (
              <section key={category.id} className="space-y-6">
                {/* Category Header */}
                <div className="text-center mb-6">
                  <h2
                    className="text-2xl md:text-3xl font-semibold mb-2"
                    style={{
                      color: primaryColor,
                      fontFamily: headingFont
                    }}
                  >
                    {category.name}
                  </h2>
                  {category.description && (
                    <p
                      className="text-sm italic mt-2"
                      style={{ color: secondaryColor }}
                    >
                      {category.description}
                    </p>
                  )}
                  <div
                    className="w-16 h-0.5 mx-auto mt-3"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group",
                        item.is_featured && "bg-opacity-5 p-3 rounded-md"
                      )}
                      style={item.is_featured ? { backgroundColor: accentColor } : undefined}
                    >
                      {/* Item Name and Price */}
                      <div className="flex items-baseline gap-2">
                        <h3
                          className="font-medium text-lg flex-shrink-0"
                          style={{ color: primaryColor }}
                        >
                          {item.name}
                          {item.is_featured && (
                            <span
                              className="ml-2 text-xs font-normal uppercase tracking-wide"
                              style={{ color: accentColor }}
                            >
                              Destacado
                            </span>
                          )}
                        </h3>
                        <div
                          className="flex-1 border-b border-dotted mb-1"
                          style={{ borderColor: secondaryColor, opacity: 0.3 }}
                        />
                        {item.base_price !== null && (
                          <span
                            className="font-medium text-lg flex-shrink-0"
                            style={{ color: primaryColor }}
                          >
                            ${item.base_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Item Description */}
                      {item.description && (
                        <p
                          className="text-sm mt-1 leading-relaxed"
                          style={{ color: secondaryColor }}
                        >
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

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center" style={{ borderColor: accentColor }}>
          <p className="text-sm" style={{ color: secondaryColor }}>
            Gracias por su visita
          </p>
        </footer>
      </div>
    </div>
  );
}
