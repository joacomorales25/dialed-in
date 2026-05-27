import { useState } from 'react'

export default function ShotForm({ coffees, recipes, selectedCoffee, onSubmit, onClose }) {
  const [form, setForm] = useState({
    coffeeId: selectedCoffee?.id ?? '',
    recipeId: '',   // optional — link this shot to a recipe
    dose: 18, yield: 36, time: 27,
    grinder: 10, pressure: 9,
    notes: '', rating: 3, dialedIn: false,
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // When a recipe is selected, auto-fill its params
  function handleRecipeChange(e) {
    const recipeId = e.target.value
    if (!recipeId) {
      setForm(prev => ({ ...prev, recipeId: '' }))
      return
    }
    const recipe = recipes.find(r => r.id === Number(recipeId))
    if (recipe) {
      setForm(prev => ({
        ...prev,
        recipeId,
        dose:    recipe.dose,
        yield:   recipe.yield,
        time:    recipe.time,
        grinder: recipe.grinder,
      }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-app-surface border border-app-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <h2 className="text-ink-primary font-semibold text-sm">Record Shot</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">

          {/* Coffee */}
          <div>
            <label className="label">Coffee *</label>
            <select name="coffeeId" value={form.coffeeId} onChange={handleChange} className="input" required>
              <option value="">Select a coffee</option>
              {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Recipe — optional, auto-fills params */}
          <div>
            <label className="label">Based on recipe <span className="text-ink-muted normal-case font-normal">(optional — auto-fills params)</span></label>
            <select name="recipeId" value={form.recipeId} onChange={handleRecipeChange} className="input">
              <option value="">No recipe</option>
              {/* TODO: filter recipes by selected coffee if desired */}
              {recipes.map(r => <option key={r.id} value={r.id}>{r.coffeeName} — {r.dose}g·{r.yield}g·{r.time}s</option>)}
            </select>
          </div>

          {/* Params */}
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

          {/* Rating */}
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setForm(p => ({ ...p, rating: star }))}>
                  <svg className={`w-6 h-6 ${star <= form.rating ? 'text-amber-400' : 'text-app-border'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Dialed in */}
          <div className="flex items-center gap-2.5 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <input type="checkbox" id="dialedIn" name="dialedIn" checked={form.dialedIn} onChange={handleChange} className="w-4 h-4 accent-emerald-500" />
            <label htmlFor="dialedIn" className="text-sm text-emerald-400 cursor-pointer">Mark as dialed in</label>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Too bitter, grind coarser..." rows={2} className="input resize-none" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Shot</button>
          </div>
        </form>
      </div>
    </div>
  )
}
