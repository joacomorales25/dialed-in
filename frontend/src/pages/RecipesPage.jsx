import { useState, useEffect, useCallback } from 'react'
import RecipeForm    from '../components/recipes/RecipeForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { getRecipes, createRecipe, likeRecipe, deleteRecipe } from '../api'

const roastColor = { light: 'text-amber-400', medium: 'text-orange-400', dark: 'text-stone-400' }

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ name }) {
  return (
    <div className="w-6 h-6 rounded-full bg-app-surface border border-app-border flex items-center justify-center text-xs text-ink-secondary font-medium flex-shrink-0">
      {name[0].toUpperCase()}
    </div>
  )
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function RecipesPage() {
  const [recipes, setRecipes]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null) // recipe object pending deletion

  const loadRecipes = useCallback(() => {
    getRecipes().then(setRecipes).catch(console.error)
  }, [])

  useEffect(() => { loadRecipes() }, [loadRecipes])

  function handleAdd(form) {
    createRecipe({
      coffeeName: form.coffeeName,
      roaster:    form.roaster   || null,
      roast:      form.roast,
      dose:       Number(form.dose),
      yield:      Number(form.yield),
      time:       Number(form.time),
      grinder:    Number(form.grinder),
      notes:      form.notes     || null,
    })
      .then(() => { loadRecipes(); setShowForm(false) })
      .catch(console.error)
  }

  function handleLike(id) {
    likeRecipe(id).then(loadRecipes).catch(console.error)
  }

  function handleDeleteConfirm() {
    deleteRecipe(toDelete.id)
      .then(() => { loadRecipes(); setToDelete(null) })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-ink-primary font-semibold text-base">Recipes</h1>
          <span className="text-ink-muted text-xs bg-app-surface border border-app-border rounded px-1.5 py-0.5">{recipes.length}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Share Recipe
        </button>
      </div>

      <div className="flex items-center px-6 py-2.5 border-b border-app-border text-ink-muted text-xs font-medium flex-shrink-0 gap-4">
        <span className="flex-1 min-w-0">Coffee</span>
        <span className="w-16 hidden sm:block">Roast</span>
        <span className="w-28 hidden md:block">Params</span>
        <span className="w-12 hidden md:block">Ratio</span>
        <span className="w-24 hidden lg:block">Notes</span>
        <span className="w-24 hidden sm:block">Author</span>
        <span className="w-12 text-right">Likes</span>
        <span className="w-16 text-right hidden lg:block">Date</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {recipes.map(r => (
          <div key={r.id} className="flex items-center px-6 py-3.5 hover:bg-app-hover border-b border-app-border gap-4 group transition-colors">
            <div className="flex-1 min-w-0">
              <span className="text-ink-primary text-sm font-medium truncate block">{r.coffeeName}</span>
              <span className="text-ink-muted text-xs truncate block">{r.roaster}</span>
            </div>
            <span className={`w-16 text-sm capitalize hidden sm:block ${roastColor[r.roast]}`}>{r.roast}</span>
            <span className="w-28 text-ink-secondary text-sm hidden md:block tabular-nums">{r.dose}g · {r.yield}g · {r.time}s · #{r.grinder}</span>
            <span className="w-12 text-ink-muted text-sm hidden md:block tabular-nums">1:{(r.yield / r.dose).toFixed(1)}</span>
            <span className="w-24 text-ink-muted text-sm truncate hidden lg:block">{r.notes}</span>
            <div className="w-24 items-center gap-1.5 hidden sm:flex">
              <Avatar name={r.author} />
              <span className="text-ink-secondary text-sm truncate">{r.author}</span>
            </div>
            <button
              onClick={() => handleLike(r.id)}
              className="w-12 flex items-center justify-end gap-1 text-ink-muted hover:text-red-400 text-sm transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {r.likes}
            </button>
            <span className="w-16 text-right text-ink-muted text-sm hidden lg:block">{fmtDate(r.createdAt)}</span>
            <button
              onClick={() => setToDelete(r)}
              className="w-8 flex justify-end text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {showForm && <RecipeForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}

      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.coffeeName}" recipe?`}
          message="This recipe will be permanently removed."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
