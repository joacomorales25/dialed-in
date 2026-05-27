const ROAST_STYLES = {
  claro:  { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  medio:  { bg: 'bg-orange-100', text: 'text-orange-800' },
  oscuro: { bg: 'bg-coffee-200', text: 'text-coffee-800' },
}

export default function RecipeCard({ recipe, onLike }) {
  const roastStyle = ROAST_STYLES[recipe.roast] ?? ROAST_STYLES.medio
  const ratio = (recipe.yield / recipe.dose).toFixed(1)

  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Top */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-coffee-900 leading-snug">{recipe.coffeeName}</h3>
          <span className={`badge flex-shrink-0 ${roastStyle.bg} ${roastStyle.text}`}>
            {recipe.roast.charAt(0).toUpperCase() + recipe.roast.slice(1)}
          </span>
        </div>
        <p className="text-coffee-400 text-xs mt-0.5">{recipe.roaster}</p>
      </div>

      {/* Params grid */}
      <div className="grid grid-cols-4 gap-2 bg-cream-100 rounded-lg p-3">
        <div className="text-center">
          <p className="text-coffee-800 font-bold text-lg leading-none">{recipe.dose}g</p>
          <p className="text-coffee-400 text-[10px] mt-1 uppercase font-medium">Dosis</p>
        </div>
        <div className="text-center border-x border-cream-300">
          <p className="text-coffee-800 font-bold text-lg leading-none">{recipe.yield}g</p>
          <p className="text-coffee-400 text-[10px] mt-1 uppercase font-medium">Rend.</p>
        </div>
        <div className="text-center border-r border-cream-300">
          <p className="text-coffee-800 font-bold text-lg leading-none">{recipe.time}s</p>
          <p className="text-coffee-400 text-[10px] mt-1 uppercase font-medium">Tiempo</p>
        </div>
        <div className="text-center">
          <p className="text-coffee-800 font-bold text-lg leading-none">#{recipe.grinder}</p>
          <p className="text-coffee-400 text-[10px] mt-1 uppercase font-medium">Molienda</p>
        </div>
      </div>

      {/* Ratio */}
      <div className="flex items-center gap-2 text-xs text-coffee-500">
        <span className="badge bg-coffee-100 text-coffee-600">Ratio 1:{ratio}</span>
      </div>

      {/* Notes */}
      {recipe.notes && (
        <p className="text-xs text-coffee-500 italic">"{recipe.notes}"</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-coffee-100">
        <div className="flex items-center gap-1.5 text-xs text-coffee-400">
          <div className="w-5 h-5 rounded-full bg-coffee-200 flex items-center justify-center text-[9px] font-bold text-coffee-600 uppercase">
            {recipe.author.charAt(0)}
          </div>
          {recipe.author}
        </div>

        {/* TODO: manejar estado de "ya le di like" */}
        <button
          onClick={() => onLike(recipe.id)}
          className="flex items-center gap-1.5 text-xs text-coffee-400 hover:text-coffee-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {recipe.likes}
        </button>
      </div>
    </div>
  )
}
