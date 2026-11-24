import { AppIcons } from '#/generated/icons'

/** A native select drawn as a filter chip. The visible label is the field name or the chosen value. */
export function SelectChip({
  testId,
  label,
  value,
  active,
  anyLabel,
  options,
  onChange,
}: {
  testId: string
  label: string
  value: string
  active: boolean
  anyLabel?: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)
  const shown = value && selected ? selected.label : label
  return (
    <div
      className={`relative inline-flex min-h-touch-target items-center gap-xs rounded-full px-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
        active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface'
      }`}
    >
      {active ? <AppIcons.check className="size-icon-sm" /> : null}
      <span className="pointer-events-none text-label">{shown}</span>
      <select
        data-testid={testId}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {anyLabel !== undefined ? <option value="">{anyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
