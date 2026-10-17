import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsOverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // percentage change
  icon: React.ElementType;
  iconBg?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const AnalyticsOverviewCard: React.FC<AnalyticsOverviewCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBg = 'from-brand-600 to-brand-400',
  valuePrefix = '',
  valueSuffix = '',
  loading = false,
  children,
}) => {
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend === undefined || trend === 0 ? 'text-gray-400' : trend > 0 ? 'text-emerald-400' : 'text-red-400';

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="skeleton w-16 h-5 rounded-lg" />
        </div>
        <div className="skeleton w-24 h-8 rounded-lg mb-2" />
        <div className="skeleton w-32 h-4 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="card group hover:shadow-card-hover transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center shadow-glow-sm`}>
          <Icon size={18} className="text-white" />
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={13} />
            {trend !== 0 && `${Math.abs(trend).toFixed(1)}%`}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1.5">
        <span className="text-2xl md:text-3xl font-display font-bold text-white">
          {valuePrefix}{typeof value === 'number' ? value.toLocaleString() : value}{valueSuffix}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm text-gray-400 font-medium">{title}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}

      {/* Custom content (e.g., mini chart) */}
      {children && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
};

export default AnalyticsOverviewCard;
