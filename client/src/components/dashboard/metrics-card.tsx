import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  description?: string;
}

export default function MetricsCard({ title, value, icon, change, description }: MetricsCardProps) {
  const getChangeClass = (type: string) => {
    switch (type) {
      case 'positive':
        return 'badge-success';
      case 'negative':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="metric-card" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted-foreground mb-1 text-sm">{title}</p>
          <h3 className="h4 mb-0" data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </h3>
        </div>
        <div className="bg-primary bg-opacity-10 p-2 rounded">
          {icon}
        </div>
      </div>
      
      {(change || description) && (
        <div className="d-flex align-items-center mt-2">
          {change && (
            <span className={`badge ${getChangeClass(change.type)}`}>
              {change.value}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground ms-2 text-sm">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
