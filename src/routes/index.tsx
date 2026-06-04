import { createFileRoute, Link } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'
import { useIdentity } from '../lib/identity-context'
import { mayors } from '../data/candidates'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const user = null
const ready = true
  // import { useIdentity } from '../lib/identity-context'

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🗳️</span> Elezioni Comunali 2026
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 leading-tight">
            <span className="text-white">FANTA</span>
            <span className="text-amber-400">ELEZIONI</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-300 mb-6">
            San Giovanni in Fiore 2026
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Crea la tua squadra, scegli il tuo sindaco e i tuoi consiglieri.
            Sfida gli altri giocatori e scala la classifica con le tue previsioni elettorali!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ready && user ? (
              <Link
                to="/squadra"
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25"
              >
                🏟️ La mia squadra
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25"
              >
                🚀 Gioca ora — è gratis!
              </Link>
            )}
            <Link
              to="/classifica"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors border border-slate-600"
            >
              🏆 Classifica
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black text-center mb-12">
          <span className="text-white">Come </span>
          <span className="text-amber-400">funziona?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📝', step: '1', title: 'Registrati', desc: 'Crea il tuo account gratuito con email e password. Ogni utente può creare una sola squadra.' },
            { icon: '⚽️', step: '2', title: 'Crea la squadra', desc: 'Scegli 1 sindaco, da 5 a 10 consiglieri da qualsiasi lista e inserisci le tue previsioni percentuali.' },
            { icon: '🏆', step: '3', title: 'Vinci la classifica', desc: 'Accumula punti in base ai risultati reali delle elezioni. Chi ha più punti vince!' },
          ].map((item) => (
            <div key={item.step} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-amber-500/40 transition-colors">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="w-8 h-8 bg-amber-500 text-slate-900 font-black rounded-full flex items-center justify-center text-sm mx-auto mb-3">{item.step}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Candidates */}
      <section className="bg-slate-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-12">
            <span className="text-white">Candidati a </span>
            <span className="text-amber-400">Sindaco</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mayors.map((mayor) => (
              <div key={mayor.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center hover:border-amber-500/40 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 mx-auto mb-3">
                  {mayor.name.charAt(0)}
                </div>
                <h3 className="text-white font-bold">{mayor.name}</h3>
                <p className="text-slate-400 text-sm mt-1">Candidato Sindaco</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black text-center mb-12">
          <span className="text-white">Il sistema di </span>
          <span className="text-amber-400">punteggio</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">🏛️ Sindaco</h3>
            <div className="space-y-3">
              {[
                ['Eletto al primo turno', '+75 pt', 'text-green-400'],
                ['Eletto al ballottaggio', '+35 pt', 'text-green-400'],
                ['Secondo classificato', '+25 pt', 'text-blue-400'],
                ['Sotto il 10%', '-10 pt', 'text-red-400'],
              ].map(([label, pts, color]) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                  <span className="text-slate-300">{label}</span>
                  <span className={`${color} font-bold`}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">🧑‍💼 Consiglieri & Bonus %</h3>
            <div className="space-y-3">
              {[
                ['Consigliere eletto', '+30 pt', 'text-green-400'],
                ['Lista sopra soglia', '+10 pt', 'text-blue-400'],
                ['Bonus previsione esatta', '+25 pt', 'text-amber-400'],
                ['-1 pt per ogni % di scarto', 'min 0', 'text-slate-400'],
              ].map(([label, pts, color]) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <span className={`${color} font-bold`}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link to="/regolamento" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4">
            Leggi il regolamento completo →
          </Link>
        </div>
      </section>

      {!user && (
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Pronto a sfidare tutti?</h2>
            <p className="text-slate-800 mb-8">Registrati ora, è completamente gratuito!</p>
            <Link to="/login" className="bg-slate-900 text-amber-400 font-black text-lg px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors inline-block">
              Crea il tuo account
            </Link>
          </div>
        </section>
      )}

      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>FantaElezioni San Giovanni in Fiore 2026 — Gioco di fantapolitica</p>
          <p className="mt-1">Solo a scopo ludico. I dati elettorali sono reali.</p>
        </div>
      </footer>
    </div>
  )
}
