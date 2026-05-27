import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../api'

export default function SettingsPage() {
  const [settings, setSettings] = useState({})
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error)
  }, [])

  function handleChange(e) {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    updateSettings(settings)
      .then(updated => { setSettings(updated); setSaved(true) })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <h1 className="text-ink-primary font-semibold text-base">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg">
        <form onSubmit={handleSave} className="space-y-6">

          {/* General */}
          <section>
            <h2 className="text-ink-primary text-sm font-semibold mb-3">General</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Language</label>
                <select name="language" value={settings.language ?? ''} onChange={handleChange} className="input">
                  <option value="English">English</option>
                  <option value="Español">Español</option>
                </select>
              </div>
              <div>
                <label className="label">Units</label>
                <select name="units" value={settings.units ?? ''} onChange={handleChange} className="input">
                  <option value="metric">Metric (g, ml)</option>
                  <option value="imperial">Imperial (oz)</option>
                </select>
              </div>
            </div>
          </section>

          <div className="border-t border-app-border" />

          {/* Shot defaults */}
          <section>
            <h2 className="text-ink-primary text-sm font-semibold mb-1">Shot defaults</h2>
            <p className="text-ink-muted text-xs mb-3">Pre-fill values when recording a new shot.</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Dose (g)</label>
                <input type="number" name="defaultDose" value={settings.defaultDose ?? ''} onChange={handleChange} step="0.1" className="input" />
              </div>
              <div>
                <label className="label">Yield (g)</label>
                <input type="number" name="defaultYield" value={settings.defaultYield ?? ''} onChange={handleChange} step="0.1" className="input" />
              </div>
              <div>
                <label className="label">Time (s)</label>
                <input type="number" name="defaultTime" value={settings.defaultTime ?? ''} onChange={handleChange} className="input" />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save settings</button>
            {saved && <span className="text-emerald-400 text-sm">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
