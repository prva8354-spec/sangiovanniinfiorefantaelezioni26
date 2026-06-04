import { Outlet, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Outlet />
    </div>
  )
}
