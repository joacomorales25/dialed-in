import { useState } from 'react'

const EMPTY = {
  coffeeId: '', roast: 'medium',
  dose: 18, yield: 36, time: 27, grinder: 10, notes: '',
}

export default function RecipeForm({ onSubmit, onClose, coffees = [] }) {
  const [form, setForm] = useState(EMPTY)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  const ratio = form.yield && form.dose ? (form.yield / form.dose).toFixed(1) : '—'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-app-surface border border-app-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <h2 className="text-ink-primary font-semibold text-sm">Share Recipe</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="label">Coffee *</label>
            <select name="coffeeId" value={form.coffeeId} onChange={handleChange} className="input" required>
              <option value="">Select a coffee…</option>
              {coffees.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.roaster}</option>
              ))}
            </select>
            {coffees.length === 0 && (
              <p className="text-ink-muted text-xs mt-1">No coffees yet — add one first.</p>
            )}
          </div>
          <div>
            <label className="label">Roast</label>
            <select name="roast" value={form.roast} onChange={handleChange} className="input">
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dose (g) *</label>
              <input type="number" name="dose" value={form.dose} onChange={handleChange} step="0.1" className="input" required />
            </div>
            <div>
              <label className="label">Yield (g) *</label>
              <input type="number" name="yield" value={form.yield} onChange={handleChange} step="0.1" className="input" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Time (s) *</label>
              <input type="number" name="time" value={form.time} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Grinder setting *</label>
              <input type="number" name="grinder" value={form.grinder} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted bg-app-hover px-3 py-2 rounded-md">
            Extraction ratio: <span className="text-ink-primary font-medium ml-1">1:{ratio}</span>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="What worked well..." rows={2} className="input resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Publish Recipe</button>
          </div>
        </form>
      </div>
    </div>
  )
}
