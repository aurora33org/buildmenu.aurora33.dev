interface BandwidthBarProps {
  bytes: number;
  maxBytes?: number;
  showLabel?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function BandwidthBar({ bytes, maxBytes, showLabel = true }: BandwidthBarProps) {
  // If maxBytes is not provided, use a reasonable default based on the data
  const max = maxBytes || Math.max(bytes * 1.5, 1024 * 1024); // At least 1MB
  const percentage = Math.min((bytes / max) * 100, 100);

  // Determine color based on usage percentage
  const getColorClass = () => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getColorClass()} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-gray-600 min-w-[60px] text-right">
            {formatBytes(bytes)}
          </span>
        )}
      </div>
    </div>
  );
}
