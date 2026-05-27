const ROAST_STYLES = {
  claro:  { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Tueste Claro'  },
  medio:  { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Tueste Medio'  },
  oscuro: { bg: 'bg-coffee-200', text: 'text-coffee-800', label: 'Tueste Oscuro' },
}

const PROCESS_STYLES = {
  Lavado:  { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  Natural: { bg: 'bg-rose-50',   text: 'text-rose-700'   },
  Honey:   { bg: 'bg-yellow-50', text: 'text-yellow-700' },
}

export default function CoffeeCard({ coffee, onDelete }) {
  const roastStyle  = ROAST_STYLES[coffee.roast]  ?? ROAST_STYLES.medio
  const processStyle = PROCESS_STYLES[coffee.process] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }

  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-coffee-900 truncate">{coffee.name}</h3>
          <p className="text-coffee-500 text-xs mt-0.5">{coffee.roaster}</p>
        </div>
        <button
          onClick={() => onDelete(coffee.id)}
          className="text-coffee-300 hover:text-red-400 transition-colors p-1 rounded flex-shrink-0"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`badge ${roastStyle.bg} ${roastStyle.text}`}>
          {roastStyle.label}
        </span>
        <span className={`badge ${processStyle.bg} ${processStyle.text}`}>
          {coffee.process}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
        <div>
          <p className="text-coffee-400 font-medium uppercase tracking-wide text-[10px]">Origen</p>
          <p className="text-coffee-700 mt-0.5">{coffee.origin}</p>
        </div>
        <div>
          <p className="text-coffee-400 font-medium uppercase tracking-wide text-[10px]">Altura</p>
          <p className="text-coffee-700 mt-0.5">{coffee.altitude}</p>
        </div>
        <div className="col-span-2">
          <p className="text-coffee-400 font-medium uppercase tracking-wide text-[10px]">Notas de cata</p>
          <p className="text-coffee-700 mt-0.5 italic">"{coffee.notes}"</p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-coffee-100 flex items-center justify-between">
        <p className="text-coffee-400 text-xs">
          Tostado: {new Date(coffee.roastDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        {/* TODO: navegar a los shots de este café */}
        <button className="text-coffee-500 hover:text-coffee-700 text-xs font-medium flex items-center gap-1 transition-colors">
          Ver shots
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
