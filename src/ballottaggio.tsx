import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ballottaggio')({
  component: BallottaggioPage,
})

function BallottaggioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-8">
        Ballottaggio
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 text-xl font-semibold">
          Marco Ambrogio
        </button>

        <button className="bg-red-600 hover:bg-red-700 rounded-xl p-4 text-xl font-semibold">
          Antonio Barile
        </button>
      </div>
    </div>
  )
}
