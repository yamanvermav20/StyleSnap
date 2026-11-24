import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { HeadContent, Link, Outlet, ScriptOnce, Scripts, useRouterState, createRootRouteWithContext } from '@tanstack/react-router'
import type { AppContainer } from '#/core/AppContainer'
import { AppearanceEffect, appearanceScript } from '#/core/AppearanceEffect'
import { AppIdentity } from '#/generated/app'
import { AppIcons } from '#/generated/icons'
import { defaultLocale, strings } from '#/generated/strings'
import { defaultSearchQuery } from '#/features/search/searchQuery'
import { iconButtonClass } from '#/core/designsystem/styles'
import appCss from '../styles.css?url'

export interface RouterContext {
  queryClient: QueryClient
  container: AppContainer
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: AppIdentity.name },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  component: AppShell,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <head>
        <ScriptOnce children={appearanceScript} />
        <HeadContent />
      </head>
      <body className="bg-background text-on-background antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function tabClass(active: boolean) {
  return `flex min-h-touch-target min-w-touch-target flex-1 flex-col items-center justify-center gap-xs rounded-full px-sm py-sm text-caption md:flex-none md:flex-row md:px-lg md:py-0 md:text-label ${
    active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant'
  }`
}

function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const discover = pathname === '/' || pathname.startsWith('/categories') || pathname.startsWith('/outfits')
  const search = pathname.startsWith('/search')
  const collections = pathname.startsWith('/collections')
  const wardrobe = pathname.startsWith('/wardrobe')

  return (
    <>
      <AppearanceEffect />
      <header className="sticky top-0 z-20 border-b border-outline bg-background">
        <div className="flex items-center gap-md px-lg py-sm md:px-xl">
          <Link to="/" className="text-title text-on-background">
            {AppIdentity.name}
          </Link>
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-outline bg-background md:static md:z-auto md:ms-auto md:justify-end md:border-0 md:bg-transparent">
            <Link to="/" data-testid="tabs.discover" aria-current={discover ? 'page' : undefined} className={tabClass(discover)}>
              <AppIcons.discover className="size-icon-md" />
              {strings.tabsDiscover}
            </Link>
            <Link
              to="/search"
              search={defaultSearchQuery}
              data-testid="tabs.search"
              aria-current={search ? 'page' : undefined}
              className={tabClass(search)}
            >
              <AppIcons.search className="size-icon-md" />
              {strings.tabsSearch}
            </Link>
            <Link
              to="/collections"
              data-testid="tabs.collections"
              aria-current={collections ? 'page' : undefined}
              className={tabClass(collections)}
            >
              <AppIcons.collections className="size-icon-md" />
              {strings.tabsCollections}
            </Link>
            <Link to="/wardrobe" data-testid="tabs.wardrobe" aria-current={wardrobe ? 'page' : undefined} className={tabClass(wardrobe)}>
              <AppIcons.wardrobe className="size-icon-md" />
              {strings.tabsWardrobe}
            </Link>
          </nav>
          <Link
            to="/settings"
            aria-label={strings.feedOpenSettings}
            data-testid="feed.openSettings"
            className={`ms-auto md:ms-0 ${iconButtonClass}`}
          >
            <AppIcons.settings className="size-icon-md" />
          </Link>
        </div>
      </header>
      <main className="px-lg py-xl md:px-xl">
        <Outlet />
        <div aria-hidden className="h-touch-target md:hidden" />
        <div aria-hidden className="h-lg md:hidden" />
      </main>
    </>
  )
}
