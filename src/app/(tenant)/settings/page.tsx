'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Label } from '@/components/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';

interface Settings {
  template_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  font_heading: string | null;
  font_body: string | null;
}

const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Cormorant',
  'Crimson Text',
];

const TEMPLATES = [
  { id: 'classic', name: 'Clásico', description: 'Diseño tradicional y profesional' },
  { id: 'modern', name: 'Moderno', description: 'Estilo minimalista y limpio' },
  { id: 'elegant', name: 'Elegante', description: 'Sofisticado y refinado' },
  { id: 'minimal', name: 'Minimalista', description: 'Simple y directo' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    template_id: 'classic',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    accent_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937',
    font_heading: 'Inter',
    font_body: 'Inter',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
    loadGoogleFonts();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.settings) {
        setSettings({
          template_id: data.settings.template_id || 'classic',
          primary_color: data.settings.primary_color || '#2563eb',
          secondary_color: data.settings.secondary_color || '#64748b',
          accent_color: data.settings.accent_color || '#f59e0b',
          background_color: data.settings.background_color || '#ffffff',
          text_color: data.settings.text_color || '#1f2937',
          font_heading: data.settings.font_heading || 'Inter',
          font_body: data.settings.font_body || 'Inter',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleFonts = () => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS.map(font => `family=${font.replace(' ', '+')}`).join('&')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Configuración guardada exitosamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza la apariencia de tu menú público
        </p>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Plantilla</CardTitle>
          <CardDescription>
            Selecciona el estilo visual de tu menú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  settings.template_id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSettings({ ...settings, template_id: template.id })}
              >
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colores</CardTitle>
          <CardDescription>
            Personaliza la paleta de colores de tu menú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <div className="flex gap-3 items-center">
                <input
                  id="primaryColor"
                  type="color"
                  value={settings.primary_color || '#2563eb'}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color || '#2563eb'}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 h-10 px-3 border rounded font-mono text-sm"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Color Secundario</Label>
              <div className="flex gap-3 items-center">
                <input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondary_color || '#64748b'}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondary_color || '#64748b'}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 h-10 px-3 border rounded font-mono text-sm"
                  placeholder="#64748b"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Color de Acento</Label>
              <div className="flex gap-3 items-center">
                <input
                  id="accentColor"
                  type="color"
                  value={settings.accent_color || '#f59e0b'}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accent_color || '#f59e0b'}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="flex-1 h-10 px-3 border rounded font-mono text-sm"
                  placeholder="#f59e0b"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Color de Fondo</Label>
              <div className="flex gap-3 items-center">
                <input
                  id="backgroundColor"
                  type="color"
                  value={settings.background_color || '#ffffff'}
                  onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.background_color || '#ffffff'}
                  onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                  className="flex-1 h-10 px-3 border rounded font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Color de Texto</Label>
              <div className="flex gap-3 items-center">
                <input
                  id="textColor"
                  type="color"
                  value={settings.text_color || '#1f2937'}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.text_color || '#1f2937'}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="flex-1 h-10 px-3 border rounded font-mono text-sm"
                  placeholder="#1f2937"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fonts */}
      <Card>
        <CardHeader>
          <CardTitle>Tipografía</CardTitle>
          <CardDescription>
            Selecciona las fuentes de Google Fonts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="headingFont">Fuente de Títulos</Label>
              <select
                id="headingFont"
                value={settings.font_heading || 'Inter'}
                onChange={(e) => setSettings({ ...settings, font_heading: e.target.value })}
                className="w-full h-10 px-3 border rounded"
                style={{ fontFamily: settings.font_heading || 'Inter' }}
              >
                {GOOGLE_FONTS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFont">Fuente de Cuerpo</Label>
              <select
                id="bodyFont"
                value={settings.font_body || 'Inter'}
                onChange={(e) => setSettings({ ...settings, font_body: e.target.value })}
                className="w-full h-10 px-3 border rounded"
                style={{ fontFamily: settings.font_body || 'Inter' }}
              >
                {GOOGLE_FONTS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Font Preview */}
          <div className="mt-6 p-6 border rounded-lg" style={{
            backgroundColor: settings.background_color || '#ffffff',
            color: settings.text_color || '#1f2937',
          }}>
            <h3
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: settings.font_heading || 'Inter',
                color: settings.primary_color || '#2563eb',
              }}
            >
              Vista Previa de Títulos
            </h3>
            <p
              className="text-base"
              style={{
                fontFamily: settings.font_body || 'Inter',
              }}
            >
              Este es un ejemplo de cómo se verá el texto del cuerpo en tu menú. Los colores y fuentes se aplicarán automáticamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
