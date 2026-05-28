import { Progress } from '@/components/ui/progress'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-progress-complete'
  if (percentage >= 75) return 'bg-progress-good'
  if (percentage >= 50) return 'bg-progress-warning'
  return 'bg-progress-danger'
}

export function ProgressBar({ value, max = 100, showLabel = true, size = 'md' }: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0
  const colorClass = getProgressColor(percentage)

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={percentage}
        className={cn('flex-1', size === 'sm' ? 'h-1.5' : 'h-2')}
        indicatorClassName={colorClass}
      />
      {showLabel && (
        <span className={cn(
          'font-medium tabular-nums',
          size === 'sm' ? 'text-xs w-8' : 'text-sm w-10',
          percentage >= 100 ? 'text-progress-complete' :
          percentage >= 75 ? 'text-progress-good' :
          percentage >= 50 ? 'text-progress-warning' :
          'text-progress-danger'
        )}>
          {percentage}%
        </span>
      )}
    </div>
  )
}
