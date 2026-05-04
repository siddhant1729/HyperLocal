import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'

const icons = {
  success: <CheckCircle className="w-5 h-5 text-brand-400" />,
  info:    <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  error:   <XCircle className="w-5 h-5 text-red-400" />,
}

const borders = {
  success: 'border-brand-500/30',
  info:    'border-blue-500/30',
  warning: 'border-amber-500/30',
  error:   'border-red-500/30',
}

export default function Toast({ toast, onClose }) {
  return (
    <div className={`flex items-start gap-3 glass p-4 min-w-72 max-w-sm shadow-2xl border ${borders[toast.type] || borders.info} animate-slide-up`}>
      {icons[toast.type] || icons.info}
      <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
