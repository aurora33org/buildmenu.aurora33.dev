'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Textarea } from '@/components/shared/ui/textarea';
import { generateSlug } from '@/lib/utils/slug';

interface Step2RestaurantProps {
  restaurantName: string;
  setRestaurantName: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  error?: string;
}

export function Step2Restaurant({
  restaurantName,
  setRestaurantName,
  slug,
  setSlug,
  description,
  setDescription,
  error,
}: Step2RestaurantProps) {
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-generate slug from restaurant name
  useEffect(() => {
    if (restaurantName && !slugTouched) {
      const generated = generateSlug(restaurantName);
      setSlug(generated);
    }
  }, [restaurantName, slugTouched, setSlug]);

  // Check slug availability
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const checkSlug = async () => {
      setCheckingSlug(true);
      try {
        const response = await fetch(`/api/onboarding/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        setSlugAvailable(data.available);
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    };

    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const getSlugStatusIcon = () => {
    if (checkingSlug) return '⏳';
    if (slugAvailable === true) return '✅';
    if (slugAvailable === false) return '❌';
    return '';
  };

  const getSlugStatusText = () => {
    if (checkingSlug) return 'Verificando...';
    if (slugAvailable === true) return 'Disponible';
    if (slugAvailable === false) return 'Ya está en uso';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Información del Restaurante</h2>
        <p className="text-muted-foreground">
          Configura los datos básicos de tu negocio
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Nombre del Restaurante *</Label>
          <Input
            id="restaurantName"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="La Taquería"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            URL del Menú (slug) *
            {getSlugStatusIcon() && (
              <span className="ml-2 text-sm">
                {getSlugStatusIcon()} {getSlugStatusText()}
              </span>
            )}
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="la-taqueria"
            required
          />
          <div className="text-xs space-y-1">
            <p className="text-muted-foreground">
              Tu menú será accesible en: <span className="font-mono font-semibold">tudominio.com/{slug || 'tu-slug'}</span>
            </p>
            <p className="text-yellow-600 font-medium">
              ⚠️ El slug NO se puede cambiar después. Elige con cuidado.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tacos auténticos hechos con ingredientes frescos..."
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/500 caracteres
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
