import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ballottaggio')({
  component: BallottaggioPage,
})

function BallottaggioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <h1 className="text-5xl font-black">
        🗳️ Ballottaggio
      </h1>
    </div>
  )
}
