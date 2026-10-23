'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

const config = {
  success: { border: 'border-l-emerald-500', icon: <CheckCircle2 size={17} className="text-emerald-500" />, bg: 'bg-emerald-50' },
  error:   { border: 'border-l-red-500',     icon: <XCircle size={17} className="text-red-500" />,         bg: 'bg-red-50' },
  info:    { border: 'border-l-indigo-500',  icon: <Info size={17} className="text-indigo-500" />,         bg: 'bg-indigo-50' },
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const { border, icon, bg } = config[type]

  return (
    <div className={`toast-animate fixed top-4 right-4 z-50 bg-white border border-slate-200 border-l-4 ${border} rounded-2xl shadow-xl shadow-slate-200/80 flex items-center gap-3 px-4 py-3.5 text-sm max-w-sm min-w-[280px]`}>
      <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
      <span className="flex-1 font-medium text-slate-700">{message}</span>
      <button onClick={onClose} className="shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => setToast({ message, type })
  const hide = () => setToast(null)
  return { toast, show, hide }
}
