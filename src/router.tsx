import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree'

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
})
