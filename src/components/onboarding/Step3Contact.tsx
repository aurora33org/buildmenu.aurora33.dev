import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Textarea } from '@/components/shared/ui/textarea';

interface Step3ContactProps {
  contactEmail: string;
  setContactEmail: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  facebookUrl: string;
  setFacebookUrl: (value: string) => void;
  instagramHandle: string;
  setInstagramHandle: (value: string) => void;
  tiktokHandle: string;
  setTiktokHandle: (value: string) => void;
  error?: string;
}

export function Step3Contact({
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
  address,
  setAddress,
  facebookUrl,
  setFacebookUrl,
  instagramHandle,
  setInstagramHandle,
  tiktokHandle,
  setTiktokHandle,
  error,
}: Step3ContactProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Datos de Contacto y Redes</h2>
        <p className="text-muted-foreground">
          Toda esta información es opcional y aparecerá en tu menú público
        </p>
      </div>

      <div className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Información de Contacto</h3>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de Contacto</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contacto@restaurante.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Teléfono</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+52 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle Principal 123, Colonia Centro, Ciudad, CP 12345"
              rows={2}
              maxLength={200}
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Redes Sociales</h3>

          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input
              id="facebookUrl"
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/turestaurante"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramHandle">Instagram Handle</Label>
            <Input
              id="instagramHandle"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="@turestaurante"
            />
            <p className="text-xs text-muted-foreground">
              Con o sin @
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokHandle">TikTok Handle</Label>
            <Input
              id="tiktokHandle"
              value={tiktokHandle}
              onChange={(e) => setTiktokHandle(e.target.value)}
              placeholder="@turestaurante"
            />
            <p className="text-xs text-muted-foreground">
              Con o sin @
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Puedes actualizar esta información en cualquier momento desde la configuración.
        </p>
      </div>
    </div>
  );
}
