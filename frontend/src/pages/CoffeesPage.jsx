import { useState, useEffect, useCallback } from 'react'
import { getCoffees, createCoffee, deleteCoffee } from '../api'
import CoffeeForm    from '../components/coffees/CoffeeForm'
import ConfirmDialog from '../components/ConfirmDialog'

const roastDot = { light: 'bg-amber-300', medium: 'bg-orange-500', dark: 'bg-stone-500' }

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function CoffeesPage() {
  const [coffees, setCoffees]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(() => {
    getCoffees().then(setCoffees).catch(console.error)
  }, [])

  useEffect(() => { load() }, [load])

  function handleAdd(form) {
    createCoffee({
      name:      form.name,
      roaster:   form.roaster,
      origin:    form.origin    || null,
      altitude:  form.altitude  || null,
      process:   form.process   || null,
      roast:     form.roast,
      roastDate: form.roastDate || null,
      notes:     form.notes     || null,
    }).then(() => { load(); setShowForm(false) }).catch(console.error)
  }

  function handleDeleteConfirm() {
    deleteCoffee(toDelete.id)
      .then(() => { load(); setToDelete(null) })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-ink-primary font-semibold text-base">Coffees</h1>
          <span className="text-ink-muted text-xs bg-app-surface border border-app-border rounded px-1.5 py-0.5">{coffees.length}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Coffee
        </button>
      </div>

      <div className="flex items-center px-6 py-2.5 border-b border-app-border text-ink-muted text-xs font-medium flex-shrink-0 gap-4">
        <span className="flex-1 min-w-0">Name</span>
        <span className="w-36 hidden sm:block">Roaster</span>
        <span className="w-24 hidden md:block">Origin</span>
        <span className="w-20 hidden md:block">Process</span>
        <span className="w-16">Roast</span>
        <span className="w-20 text-right hidden lg:block">Roast date</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {coffees.map(c => (
          <div key={c.id} className="flex items-center px-6 py-3.5 hover:bg-app-hover border-b border-app-border gap-4 group transition-colors">
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${roastDot[c.roast]}`} />
              <div className="min-w-0">
                <span className="text-ink-primary text-sm font-medium">{c.name}</span>
                <span className="text-ink-muted text-sm ml-2 hidden xl:inline">{c.notes}</span>
              </div>
            </div>
            <span className="w-36 text-ink-secondary text-sm truncate hidden sm:block">{c.roaster}</span>
            <span className="w-24 text-ink-secondary text-sm hidden md:block">{c.origin}</span>
            <span className="w-20 text-ink-secondary text-sm hidden md:block">{c.process}</span>
            <span className="w-16 text-ink-secondary text-sm capitalize">{c.roast}</span>
            <span className="w-20 text-right text-ink-muted text-sm hidden lg:block">{fmtDate(c.roastDate)}</span>
            <button
              onClick={() => setToDelete(c)}
              className="w-8 flex justify-end text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {showForm && <CoffeeForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.name}"?`}
          message="This coffee and all its shots will be permanently removed."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
