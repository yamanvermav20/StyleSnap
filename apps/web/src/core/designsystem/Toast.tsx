import { useEffect } from 'react'

/** A short confirmation that fades after a few seconds. */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDone, 3200)
    return () => window.clearTimeout(timer)
  }, [message, onDone])

  if (!message) return null
  return (
    <div
      role="status"
      data-testid="toast"
      className="toast-offset fixed inset-x-lg z-40 mx-auto w-fit max-w-md rounded-full bg-on-background px-lg py-md text-label text-background shadow-high"
    >
      {message}
    </div>
  )
}
