// StatCard component - displays statistics with icon, value, and growth indicator
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../components/ui/utils';

// Props interface for StatCard component
interface StatCardProps {
  icon: LucideIcon; // Icon component to display
  label: string; // Label text for the statistic
  value: string | number; // The main value to display
  growth?: number; // Optional growth percentage (positive or negative)
  iconColor?: string; // Custom icon color
  iconBgColor?: string; // Custom icon background color
}

// Displays a statistic card with icon, value, and optional growth indicator
export function StatCard({ icon: Icon, label, value, growth, iconColor = '#374151', iconBgColor = '#F3F4F6' }: StatCardProps) {
  // Determine if growth is positive or negative
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#F3F4F6]">
      <div className="flex items-start justify-between">
        {/* Left side - Label, Value, and Growth */}
        <div className="flex-1">
          <p className="text-xs md:text-sm text-[#6B7280] mb-1 md:mb-2">{label}</p>
          <p className="text-xl md:text-2xl font-semibold text-[#111827] mb-1">{value}</p>
          {/* Growth indicator with trending icon */}
          {growth !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs md:text-sm',
              isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'
            )}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
              )}
              <span className="font-medium">
                {Math.abs(growth)}%
              </span>
            </div>
          )}
        </div>
        {/* Right side - Icon */}
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}