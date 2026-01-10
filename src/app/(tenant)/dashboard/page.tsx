'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import Link from 'next/link';
import { Download, QrCode as QrIcon } from 'lucide-react';

export default function TenantDashboardPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleGenerateQr = async () => {
    setLoadingQr(true);
    try {
      const response = await fetch('/api/menu/qr');
      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setMenuUrl(data.menuUrl);
        setShowQr(true);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'menu-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    if (!menuUrl) return;

    try {
      await navigator.clipboard.writeText(menuUrl);
      alert('URL copiada al portapapeles');
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Menú</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu menú digital para tu restaurante
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Editor de Menú</CardTitle>
            <CardDescription>Edita categorías y platillos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/menu">Editar Menú</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalización</CardTitle>
            <CardDescription>Colores, fuentes y template</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menú Público</CardTitle>
            <CardDescription>Vista de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/preview">Ver Preview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL Pública & Código QR</CardTitle>
          <CardDescription>Comparte tu menú con tus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleGenerateQr}
              disabled={loadingQr}
              className="w-full sm:w-auto"
            >
              <QrIcon className="w-4 h-4 mr-2" />
              {loadingQr ? 'Generando...' : 'Generar Código QR'}
            </Button>

            {showQr && qrCode && (
              <div className="space-y-4 mt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">URL de tu menú:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={menuUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded text-sm font-mono bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyUrl}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-white flex flex-col items-center">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                  <Button
                    onClick={handleDownloadQr}
                    variant="outline"
                    className="mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar QR Code (PNG)
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Descarga e imprime este código QR para que tus clientes puedan
                    escanear y ver tu menú digital desde sus teléfonos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
