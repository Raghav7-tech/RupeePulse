import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { useFinanceStore } from '../../store/useFinanceStore'

export function Toast() {
  const { toast, clearToast, undoState, undo } = useFinanceStore()
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(clearToast, 4500)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])
  if (!toast) return null
  return <div className="toast" role="status" aria-live="polite"><span><Check /></span><p>{toast}</p>{undoState && <button onClick={undo}>Undo</button>}<button aria-label="Dismiss notification" onClick={clearToast}><X /></button></div>
}
