import { AlertTriangle } from 'lucide-react';

interface PausedBannerProps {
  reason: string;
}

export function PausedBanner({ reason }: PausedBannerProps) {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Tu cuenta está pausada
            </p>
            <p className="text-sm text-amber-700">
              Motivo: {reason}. Contacta con soporte para más información.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
