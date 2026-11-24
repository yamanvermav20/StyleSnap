import type { ReactNode } from 'react'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { secondaryButtonClass } from './styles'

/** Loading, error and empty states shared by every screen that loads data. */
export function StateMessage(
  props:
    | { variant: 'loading' }
    | { variant: 'error'; body?: string; onRetry?: () => void }
    | { variant: 'empty'; icon: ReactNode; title: string; body: string; action?: { label: string; onClick: () => void } },
) {
  if (props.variant === 'loading') {
    return (
      <div role="status" data-testid="state.loading" className="flex flex-col items-center gap-md py-xxl">
        <span className="size-icon-lg rounded-full border-2 border-outline border-t-primary motion-safe:animate-spin" />
        <span className="sr-only">{strings.commonLoading}</span>
      </div>
    )
  }

  if (props.variant === 'error') {
    return (
      <div data-testid="state.error" className="flex flex-col items-start gap-md py-xl">
        <AppIcons.offline className="size-icon-lg text-on-surface-variant" />
        <h2 className="text-title">{strings.commonErrorTitle}</h2>
        <p className="max-w-md text-body text-on-surface-variant">{props.body ?? strings.commonErrorBody}</p>
        {props.onRetry ? (
          <button type="button" data-testid="state.retry" onClick={props.onRetry} className={secondaryButtonClass}>
            <AppIcons.retry className="size-icon-sm" />
            {strings.commonRetry}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div data-testid="state.empty" className="flex flex-col items-start gap-md py-xl">
      <span className="text-on-surface-variant">{props.icon}</span>
      <h2 className="text-title">{props.title}</h2>
      <p className="max-w-md text-body text-on-surface-variant">{props.body}</p>
      {props.action ? (
        <button type="button" data-testid="state.emptyAction" onClick={props.action.onClick} className={secondaryButtonClass}>
          {props.action.label}
        </button>
      ) : null}
    </div>
  )
}
