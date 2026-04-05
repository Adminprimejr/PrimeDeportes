'use client'

import { useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastMessage {
  id: number
  type: 'success' | 'error'
  message: string
}

let _addToast: ((type: 'success' | 'error', message: string) => void) | null = null

export function toast(type: 'success' | 'error', message: string) {
  _addToast?.(type, message)
}

function ToastItem({ item, onRemove }: { item: ToastMessage; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), 3500)
    return () => clearTimeout(timer)
  }, [item.id, onRemove])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border text-sm font-black shadow-lg max-w-sm ${
      item.type === 'success'
        ? 'bg-[#050a15] border-green-400/50 text-green-400'
        : 'bg-[#050a15] border-red-400/50 text-red-400'
    }`}>
      {item.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      <span className="flex-1">{item.message}</span>
      <button onClick={() => onRemove(item.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  let counter = 0

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now() + counter++
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Register the global handler
  useEffect(() => {
    _addToast = addToast
    return () => { _addToast = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-16 right-4 z-[200] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onRemove={removeToast} />
      ))}
    </div>
  )
}
