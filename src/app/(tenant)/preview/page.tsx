'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function PreviewPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSlug();
  }, []);

  const fetchSlug = async () => {
    try {
      const response = await fetch('/api/restaurant/info');
      const data = await response.json();

      if (data.restaurant && data.restaurant.slug) {
        setSlug(data.restaurant.slug);
      }
    } catch (error) {
      console.error('Error fetching slug:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenNewTab = () => {
    if (slug) {
      window.open(`/${slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando vista previa...</p>
      </div>
    );
  }

  if (!slug) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Vista Previa</h1>
        <p className="text-muted-foreground mt-2">
          No se pudo cargar la vista previa del menú
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vista Previa</h1>
          <p className="text-muted-foreground mt-2">
            Así es como tus clientes verán tu menú
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNewTab}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir en Nueva Pestaña
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-white" style={{ minHeight: '600px' }}>
        <iframe
          key={refreshKey}
          src={`/${slug}`}
          className="w-full h-full"
          style={{ minHeight: '600px' }}
          title="Menu Preview"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Los cambios que hagas en el editor de menú o en la configuración
          se reflejarán aquí. Usa el botón "Actualizar" para ver los cambios más recientes.
        </p>
      </div>
    </div>
  );
}
