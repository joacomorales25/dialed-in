const STARS = [1, 2, 3, 4, 5]

export default function ShotTimeline({ shots }) {
  if (shots.length === 0) {
    return (
      <div className="text-center py-12 text-coffee-400">
        <p className="text-sm">Registrá tu primer shot para ver la evolución.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-coffee-200" />

      <div className="space-y-4">
        {shots.map((shot, index) => (
          <div key={shot.id} className="flex gap-4">
            {/* Dot en la línea */}
            <div className="relative flex-shrink-0 w-10 flex justify-center pt-1">
              <div
                className={`w-3 h-3 rounded-full border-2 z-10 ${
                  shot.dialedIn
                    ? 'bg-green-400 border-green-500'
                    : 'bg-white border-coffee-400'
                }`}
              />
            </div>

            {/* Card del shot */}
            <div className={`card flex-1 p-4 mb-1 ${shot.dialedIn ? 'border-green-200 bg-green-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-coffee-400">
                    Shot #{index + 1} · {new Date(shot.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </p>
                  {shot.dialedIn && (
                    <span className="badge bg-green-100 text-green-700 mt-1 text-[10px]">
                      ✓ Dial-in logrado
                    </span>
                  )}
                </div>
                {/* Rating estrellas */}
                <div className="flex gap-0.5">
                  {STARS.map((s) => (
                    <svg
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= shot.rating ? 'text-amber-400' : 'text-coffee-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Parámetros */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-coffee-400 font-medium text-[10px] uppercase">Dosis</p>
                  <p className="text-coffee-800 font-semibold">{shot.dose}g</p>
                </div>
                <div>
                  <p className="text-coffee-400 font-medium text-[10px] uppercase">Rendimiento</p>
                  <p className="text-coffee-800 font-semibold">{shot.yield}g</p>
                </div>
                <div>
                  <p className="text-coffee-400 font-medium text-[10px] uppercase">Tiempo</p>
                  <p className="text-coffee-800 font-semibold">{shot.time}s</p>
                </div>
                <div>
                  <p className="text-coffee-400 font-medium text-[10px] uppercase">Molienda</p>
                  <p className="text-coffee-800 font-semibold">#{shot.grinder}</p>
                </div>
              </div>

              {/* Notas */}
              {shot.notes && (
                <p className="mt-3 text-xs text-coffee-500 italic border-t border-coffee-100 pt-2">
                  "{shot.notes}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
