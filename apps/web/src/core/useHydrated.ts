import { useEffect, useState } from 'react'

/**
 * False while the page is rendering on the server and during hydration, true after mount.
 * Data queries wait for this so a missing API renders the loading state instead of crashing SSR.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}
