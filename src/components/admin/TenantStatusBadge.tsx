interface TenantStatusBadgeProps {
  status: 'active' | 'paused' | 'pending' | 'inactive';
}

const statusConfig = {
  active: {
    label: 'Activo',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  paused: {
    label: 'Pausado',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏸',
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⏳',
  },
  inactive: {
    label: 'Inactivo',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '○',
  },
};

export function TenantStatusBadge({ status }: TenantStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
