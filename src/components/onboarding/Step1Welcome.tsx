import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';

interface Step1WelcomeProps {
  fullName: string;
  setFullName: (value: string) => void;
  error?: string;
}

export function Step1Welcome({ fullName, setFullName, error }: Step1WelcomeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Bienvenido a Menu Builder</h2>
        <p className="text-muted-foreground">
          Vamos a configurar tu cuenta en 4 simples pasos
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre Completo *</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juan Pérez"
            required
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Este es tu nombre personal, no el del restaurante
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-blue-900 mb-2">
          ¿Qué viene después?
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Paso 2: Información de tu restaurante</li>
          <li>• Paso 3: Datos de contacto y redes sociales</li>
          <li>• Paso 4: Selección de plantilla de menú</li>
        </ul>
      </div>
    </div>
  );
}
