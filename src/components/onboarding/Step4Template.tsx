import { Card, CardContent } from '@/components/shared/ui/card';

interface Step4TemplateProps {
  templateId: string;
  setTemplateId: (value: string) => void;
  error?: string;
}

const templates = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Diseño tradicional y profesional',
    preview: '📋',
    colors: 'bg-slate-100 border-slate-300',
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Estilo minimalista y limpio',
    preview: '✨',
    colors: 'bg-blue-100 border-blue-300',
  },
  {
    id: 'elegant',
    name: 'Elegante',
    description: 'Sofisticado y refinado',
    preview: '💎',
    colors: 'bg-purple-100 border-purple-300',
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Simple y directo',
    preview: '⚪',
    colors: 'bg-gray-100 border-gray-300',
  },
];

export function Step4Template({ templateId, setTemplateId, error }: Step4TemplateProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Selecciona una Plantilla</h2>
        <p className="text-muted-foreground">
          Elige el estilo visual para tu menú. Podrás personalizarlo después.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = templateId === template.id;
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md hover:scale-105'
              }`}
              onClick={() => setTemplateId(template.id)}
            >
              <CardContent className="p-6">
                <div
                  className={`w-full h-32 rounded-lg border-2 flex items-center justify-center mb-4 ${template.colors}`}
                >
                  <span className="text-5xl">{template.preview}</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                {isSelected && (
                  <div className="mt-3 text-sm font-medium text-primary">
                    ✓ Seleccionado
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-green-900 mb-2">
          ¡Casi listo!
        </h3>
        <p className="text-sm text-green-800">
          Una vez que completes el onboarding, podrás empezar a crear tu menú y personalizar colores, fuentes y más.
        </p>
      </div>
    </div>
  );
}
