import { useEffect, useRef, type ReactNode } from 'react'

/** Native dialog. Mount it only while it should be open. */
export function ModalDialog({
  testId,
  labelledBy,
  onClose,
  children,
}: {
  testId?: string
  labelledBy?: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    try {
      dialog.showModal()
    } catch {
      dialog.setAttribute('open', '')
    }
  }, [])

  return (
    <dialog
      ref={ref}
      data-testid={testId}
      aria-labelledby={labelledBy}
      onClose={onClose}
      className="w-full max-w-md rounded-xl bg-surface p-lg text-on-surface shadow-high"
    >
      {children}
    </dialog>
  )
}
