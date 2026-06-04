import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { IdentityProvider } from '../lib/identity-context'
import { CallbackHandler } from '../components/CallbackHandler'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FantaElezioni San Giovanni in Fiore 2026' },
      { name: 'description', content: 'Il gioco di fantapolitica per le elezioni comunali di San Giovanni in Fiore 2026' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-950 text-white min-h-screen">
  {children}
  <Scripts />
</body>
    </html>
  )
}
