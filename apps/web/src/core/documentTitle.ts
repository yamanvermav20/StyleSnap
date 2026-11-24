import { useEffect } from 'react'
import { AppIdentity } from '#/generated/app'

/** Browser-tab title. The separator is web chrome, like the navigation bar on mobile. */
export function documentTitle(screen: string) {
  return `${screen} · ${AppIdentity.name}`
}

/** Updates the tab title once a screen's name is known (category, outfit, collection). */
export function useDocumentTitle(screen: string | undefined) {
  useEffect(() => {
    if (!screen) return
    document.title = documentTitle(screen)
  }, [screen])
}
