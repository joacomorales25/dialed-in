export default function DialInProgress({ shots }) {
  if (shots.length === 0) {
    return (
      <div className="card p-6 text-center text-coffee-400">
        <p className="text-sm">Todavía no hay shots para este café.</p>
      </div>
    )
  }

  const dialedInShot = shots.find((s) => s.dialedIn)
  const progress = Math.min(Math.round((shots.length / 5) * 100), 100)
  const avgRating = (shots.reduce((a, s) => a + s.rating, 0) / shots.length).toFixed(1)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-coffee-800">Estado del Dial-In</h3>
        {dialedInShot ? (
          <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Dialeado
          </span>
        ) : (
          <span className="badge bg-amber-100 text-amber-700">En progreso</span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <p className="text-2xl font-bold text-coffee-800">{shots.length}</p>
          <p className="text-coffee-400 text-xs mt-0.5">Shots</p>
        </div>
        <div className="text-center border-x border-coffee-100">
          <p className="text-2xl font-bold text-coffee-800">{avgRating}</p>
          <p className="text-coffee-400 text-xs mt-0.5">Rating prom.</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-coffee-800">
            {dialedInShot ? dialedInShot.time + 's' : '—'}
          </p>
          <p className="text-coffee-400 text-xs mt-0.5">Tiempo final</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-coffee-400 mb-1.5">
          <span>Progreso dial-in</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-cream-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              dialedInShot ? 'bg-green-500' : 'bg-coffee-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Evolución visual simplificada */}
      <div className="mt-5">
        <p className="text-xs text-coffee-400 mb-3">Evolución del rating</p>
        <div className="flex items-end gap-2 h-12">
          {shots.map((shot, i) => {
            const height = `${(shot.rating / 5) * 100}%`
            return (
              <div key={shot.id} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: '40px' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t transition-all duration-300 ${
                      shot.dialedIn ? 'bg-green-400' : 'bg-coffee-400'
                    }`}
                    style={{ height: `${(shot.rating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-coffee-400">#{i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
