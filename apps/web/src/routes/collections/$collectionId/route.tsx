import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/collections/$collectionId')({
  component: () => <Outlet />,
})
