import { strings } from '#/generated/strings'
import { destructiveButtonClass, secondaryButtonClass } from './styles'
import { ModalDialog } from './ModalDialog'

export function ConfirmDialog({
  open,
  title,
  titleId,
  body,
  confirmLabel,
  confirmTestId,
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  titleId: string
  body: string
  confirmLabel: string
  confirmTestId: string
  pending?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <ModalDialog labelledBy={titleId} onClose={onClose}>
      <h2 id={titleId} className="text-title">
        {title}
      </h2>
      <p className="mt-sm text-body text-on-surface-variant">{body}</p>
      <div className="mt-lg flex flex-wrap justify-end gap-sm">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          {strings.commonCancel}
        </button>
        <button type="button" data-testid={confirmTestId} disabled={pending} onClick={onConfirm} className={destructiveButtonClass}>
          {confirmLabel}
        </button>
      </div>
    </ModalDialog>
  )
}
