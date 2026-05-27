import { useState } from 'react'
import ShotForm      from '../components/shots/ShotForm'
import ConfirmDialog from '../components/ConfirmDialog'

// TODO: replace with API call → GET /api/coffees
const MOCK_COFFEES = [
  { id: 1, name: 'Ethiopia Yirgacheffe' },
  { id: 2, name: 'Colombia El Paraíso' },
  { id: 3, name: 'Guatemala Huehuetenango' },
]

// TODO: replace with API call → GET /api/recipes
const MOCK_RECIPES = [
  { id: 1, coffeeName: 'Ethiopia Yirgacheffe',    dose: 18,   yield: 36, time: 27, grinder: 12 },
  { id: 2, coffeeName: 'Guatemala Huehuetenango', dose: 18,   yield: 36, time: 28, grinder: 11 },
  { id: 3, coffeeName: 'Colombia El Paraíso',     dose: 17.5, yield: 35, time: 30, grinder: 13 },
]

// TODO: replace with API call → GET /api/shots
const MOCK_SHOTS = [
  { id: 1, coffeeId: 1, recipeId: null, date: '2026-04-18', dose: 18, yield: 36, time: 32, grinder: 10, rating: 2, notes: 'Too bitter, grind coarser',   dialedIn: false },
  { id: 2, coffeeId: 1, recipeId: null, date: '2026-04-18', dose: 18, yield: 36, time: 29, grinder: 11, rating: 3, notes: 'Better, still a bit sour',     dialedIn: false },
  { id: 3, coffeeId: 1, recipeId: 1,    date: '2026-04-19', dose: 18, yield: 36, time: 27, grinder: 12, rating: 5, notes: 'Perfect — sweet and balanced', dialedIn: true  },
]

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i <= n ? 'bg-amber-400' : 'bg-app-border'}`} />
      ))}
    </div>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function ShotsPage() {
  // TODO: replace initial values with API fetches
  const [coffees]           = useState(MOCK_COFFEES)
  const [recipes]           = useState(MOCK_RECIPES) // TODO: GET /api/recipes
  const [shots, setShots]   = useState(MOCK_SHOTS)
  const [selected, setSelected] = useState(MOCK_COFFEES[0])
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null) // shot object pending deletion

  const visibleShots = shots.filter(s => s.coffeeId === selected.id)

  // TODO: replace body with → POST /api/shots, then refresh list
  function handleAdd(form) {
    setShots(prev => [...prev, {
      id:       Math.max(...prev.map(s => s.id), 0) + 1,
      coffeeId: Number(form.coffeeId),
      recipeId: form.recipeId ? Number(form.recipeId) : null,
      date:     new Date().toISOString().split('T')[0],
      dose:     Number(form.dose),
      yield:    Number(form.yield),
      time:     Number(form.time),
      grinder:  Number(form.grinder),
      rating:   Number(form.rating),
      notes:    form.notes || '',
      dialedIn: Boolean(form.dialedIn),
    }])
    setShowForm(false)
  }

  // TODO: replace body with → DELETE /api/shots/:id, then refresh list
  function handleDeleteConfirm() {
    setShots(prev => prev.filter(s => s.id !== toDelete.id))
    setToDelete(null)
  }

  function recipeName(id) {
    if (!id) return null
    const r = recipes.find(r => r.id === id)
    return r ? r.coffeeName : null
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-ink-primary font-semibold text-base">Shots</h1>
          <span className="text-ink-muted text-xs bg-app-surface border border-app-border rounded px-1.5 py-0.5">{visibleShots.length}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Record Shot
        </button>
      </div>

      {/* Coffee selector */}
      {/* TODO: populate from API → GET /api/coffees */}
      <div className="flex items-center gap-1 px-6 py-2.5 border-b border-app-border flex-shrink-0 overflow-x-auto">
        {coffees.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
              selected.id === c.id
                ? 'bg-app-hover text-ink-primary'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-app-hover'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex items-center px-6 py-2.5 border-b border-app-border text-ink-muted text-xs font-medium flex-shrink-0 gap-4">
        <span className="w-16">Date</span>
        <span className="w-20">Dose / Yield</span>
        <span className="w-14 hidden sm:block">Time</span>
        <span className="w-16 hidden sm:block">Grinder</span>
        <span className="w-16">Rating</span>
        <span className="flex-1 hidden md:block">Notes</span>
        <span className="w-24 hidden lg:block">Recipe</span>
        <span className="w-20 text-right">Status</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {visibleShots.map(s => (
          <div key={s.id} className="flex items-center px-6 py-3.5 hover:bg-app-hover border-b border-app-border gap-4 group transition-colors">
            <span className="w-16 text-ink-secondary text-sm">{fmtDate(s.date)}</span>
            <span className="w-20 text-ink-primary text-sm font-medium tabular-nums">{s.dose}g → {s.yield}g</span>
            <span className="w-14 text-ink-secondary text-sm hidden sm:block tabular-nums">{s.time}s</span>
            <span className="w-16 text-ink-secondary text-sm hidden sm:block">#{s.grinder}</span>
            <div className="w-16"><Stars n={s.rating} /></div>
            <span className="flex-1 text-ink-muted text-sm truncate hidden md:block">{s.notes}</span>
            <span className="w-24 hidden lg:block">
              {recipeName(s.recipeId)
                ? <span className="text-xs bg-app-accent/10 text-app-accent border border-app-accent/20 px-2 py-0.5 rounded-full truncate max-w-full block">{recipeName(s.recipeId)}</span>
                : <span className="text-ink-muted text-sm">–</span>
              }
            </span>
            <div className="w-20 flex justify-end">
              {s.dialedIn
                ? <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Dialed in</span>
                : <span className="text-sm text-ink-muted">–</span>
              }
            </div>
            <button
              onClick={() => setToDelete(s)}
              className="w-8 flex justify-end text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <ShotForm
          coffees={coffees}
          recipes={recipes}
          selectedCoffee={selected}
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete shot?"
          message={`Shot from ${fmtDate(toDelete.date)} will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
