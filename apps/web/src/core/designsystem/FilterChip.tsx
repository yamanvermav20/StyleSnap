import { AppIcons } from '#/generated/icons'

/** A capsule toggle. Selected chips use primaryContainer and a check. */
export function FilterChip({
  testId,
  label,
  pressed,
  onClick,
}: {
  testId: string
  label: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-touch-target shrink-0 items-center gap-xs rounded-full px-lg text-label motion-safe:transition motion-safe:duration-fast motion-safe:ease-standard ${
        pressed ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface'
      }`}
    >
      {pressed ? <AppIcons.check className="size-icon-sm" /> : null}
      {label}
    </button>
  )
}
