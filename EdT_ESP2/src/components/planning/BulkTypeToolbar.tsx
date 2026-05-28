import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface BulkTypeToolbarProps {
  cellCount: number
  onSelectType: (type: string) => void
  onCancel: () => void
}

const TYPE_OPTIONS = [
  { value: 'DEP', label: 'DEP', color: '#2E7D32', textColor: 'white' },
  { value: 'HE', label: 'HE', color: '#1565C0', textColor: 'white' },
  { value: 'ST', label: 'ST', color: '#1565C0', textColor: 'white' },
  { value: 'AUTRE', label: 'AUTRE', color: '#C62828', textColor: 'white' },
]

export function BulkTypeToolbar({ cellCount, onSelectType, onCancel }: BulkTypeToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className="text-xs text-slate-300 font-medium px-2 whitespace-nowrap">
        {cellCount} cellule{cellCount > 1 ? 's' : ''} →
      </span>
      <div className="flex items-center gap-1">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelectType(opt.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-md transition-all hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer"
            style={{ backgroundColor: opt.color, color: opt.textColor }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-slate-400 hover:text-white ml-1"
        onClick={onCancel}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
