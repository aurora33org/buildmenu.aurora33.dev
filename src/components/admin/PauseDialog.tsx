'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select';

interface PauseDialogProps {
  tenantId: string;
  tenantName: string;
  onConfirm: (tenantId: string, reason: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const PAUSE_REASONS = [
  'Falta de pago',
  'Mantenimiento programado',
  'Suspensión temporal (consultar con soporte)',
  'Exceso de ancho de banda',
];

export function PauseDialog({
  tenantId,
  tenantName,
  onConfirm,
  onCancel,
  isOpen,
}: PauseDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(PAUSE_REASONS[0] || '');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(tenantId, selectedReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Pausar Tenant
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que quieres pausar a <strong>{tenantName}</strong>?
            El menú público dejará de estar disponible.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de pausa
            </label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {PAUSE_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Confirmar Pausa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
