import { useState } from 'react'

const EMPTY = {
  name: '', roaster: '', origin: '', altitude: '',
  process: 'Washed', roast: 'medium', roastDate: '', notes: '',
}

export default function CoffeeForm({ onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-app-surface border border-app-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <h2 className="text-ink-primary font-semibold text-sm">Add Coffee</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="label">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ethiopia Yirgacheffe" className="input" required />
          </div>
          <div>
            <label className="label">Roaster *</label>
            <input name="roaster" value={form.roaster} onChange={handleChange} placeholder="Onyx Coffee Lab" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Origin</label>
              <input name="origin" value={form.origin} onChange={handleChange} placeholder="Ethiopia" className="input" />
            </div>
            <div>
              <label className="label">Altitude</label>
              <input name="altitude" value={form.altitude} onChange={handleChange} placeholder="1900–2200 masl" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Process</label>
              <select name="process" value={form.process} onChange={handleChange} className="input">
                <option>Washed</option>
                <option>Natural</option>
                <option>Honey</option>
                <option>Anaerobic</option>
              </select>
            </div>
            <div>
              <label className="label">Roast level</label>
              <select name="roast" value={form.roast} onChange={handleChange} className="input">
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Roast date</label>
            <input type="date" name="roastDate" value={form.roastDate} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Tasting notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Jasmine, peach, black tea" rows={2} className="input resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Coffee</button>
          </div>
        </form>
      </div>
    </div>
  )
}
