import { createFileRoute, Link } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'

export const Route = createFileRoute('/regolamento')({
  component: RegolamentoPage,
})

function RegolamentoPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2">📋 Regolamento</h1>
          <p className="text-slate-400">FantaElezioni San Giovanni in Fiore 2026</p>
        </div>

        <div className="space-y-8">

          {/* 1. Registrazione */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-amber-400 mb-4">1. Registrazione</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex gap-2"><span className="text-amber-400">•</span> Registrazione con email e password</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> Ogni utente può creare <strong className="text-white">una sola squadra</strong></li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> La squadra ha un nome scelto dall'utente</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> L'email è nascosta agli altri utenti e visibile solo all'admin</li>
            </ul>
          </section>

          {/* 2. Composizione */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-amber-400 mb-4">2. Composizione della Squadra</h2>
            <div className="space-y-3 text-slate-300">
              <p>Ogni squadra è composta da:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span className="text-amber-400">•</span> <strong className="text-white">1 Sindaco</strong> tra i 4 candidati</li>
                <li className="flex gap-2"><span className="text-amber-400">•</span> Da <strong className="text-white">5 a 10 consiglieri</strong> di qualsiasi coalizione</li>
                <li className="flex gap-2"><span className="text-amber-400">•</span> È possibile scegliere consiglieri collegati al proprio sindaco <em>o</em> delle coalizioni avversarie</li>
                <li className="flex gap-2"><span className="text-amber-400">•</span> <strong className="text-white">Nessun vincolo di coalizione</strong> nella composizione della squadra</li>
              </ul>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-4">
                <p className="text-amber-300 font-medium">📊 Previsioni percentuali</p>
                <p className="text-slate-300 text-sm mt-1">
                  Per ogni sindaco dovrai inserire la tua previsione percentuale (es. 35%).
                  La precisione della previsione ti darà punti bonus!
                </p>
              </div>
            </div>
          </section>

          {/* 3. Vincitore */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-amber-400 mb-4">3. Vincitore</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex gap-2"><span className="text-amber-400">•</span> Vince la squadra con <strong className="text-white">più punti</strong> a fine elezioni</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> In caso di pareggio: vince chi ha <strong className="text-white">creato prima</strong> la squadra</li>
            </ul>
          </section>

          {/* 4. Punteggio */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-amber-400 mb-6">4. Sistema di Punteggio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Sindaco */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">🏛️ Sindaco</h3>
                <div className="space-y-2">
                  {[
                    ['Eletto al primo turno', '+75 pt', 'text-green-400'],
                    ['Eletto al ballottaggio', '+35 pt', 'text-green-400'],
                    ['Secondo classificato', '+25 pt', 'text-blue-400'],
                    ['Sotto il 10%', '-10 pt', 'text-red-400'],
                  ].map(([label, pts, color]) => (
                    <div key={label} className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-300 text-sm">{label}</span>
                      <span className={`${color} font-bold text-sm`}>{pts}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consiglieri */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">🧑‍💼 Consiglieri</h3>
                <div className="space-y-2">
                  {[
                    ['Eletto', '+30 pt', 'text-green-400'],
                    ['Non eletto ma lista sopra soglia', '+10 pt', 'text-blue-400'],
                  ].map(([label, pts, color]) => (
                    <div key={label} className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-300 text-sm">{label}</span>
                      <span className={`${color} font-bold text-sm`}>{pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bonus percentuale */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5">
              <h3 className="text-lg font-bold text-amber-400 mb-3">📊 Bonus Percentuale</h3>
              <p className="text-slate-300 text-sm mb-4">
                Viene assegnato in base alla precisione della previsione. Si parte da <strong className="text-amber-400">+25 punti massimi</strong> e si sottrae 1 punto per ogni punto percentuale di differenza tra previsione e risultato reale. Il bonus minimo è 0.
              </p>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Esempi:</p>
                {[
                  ['45% previsto → 45% ottenuto', '+25 punti', 'text-green-400'],
                  ['42% previsto → 45% ottenuto', '+22 punti', 'text-green-400'],
                  ['35% previsto → 45% ottenuto', '+15 punti', 'text-yellow-400'],
                  ['20% previsto → 45% ottenuto', '0 punti', 'text-red-400'],
                ].map(([scenario, pts, color]) => (
                  <div key={scenario} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{scenario}</span>
                    <span className={`${color} font-bold`}>{pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Classifica */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-amber-400 mb-4">5. Classifica</h2>
            <p className="text-slate-300 mb-3">La classifica mostra in tempo reale:</p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex gap-2"><span className="text-amber-400">•</span> Posizione in classifica</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> Nome squadra</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> Punteggio totale</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> Sindaco scelto</li>
            </ul>
          </section>

          {/* Live */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-amber-400 mb-4">🔴 Pagina Live</h2>
            <p className="text-slate-300">
              Durante lo spoglio, la pagina Live mostrerà in tempo reale le percentuali dei candidati sindaco e gli aggiornamenti dei risultati man mano che le sezioni vengono contate.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center py-4">
            <Link
              to="/login"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg px-8 py-4 rounded-xl transition-all inline-block"
            >
              🚀 Crea la tua squadra!
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
