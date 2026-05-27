import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../api'

export default function ProfilePage() {
  const [profile, setProfile] = useState({})
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})

  useEffect(() => {
    getProfile()
      .then(p => { setProfile(p); setForm(p) })
      .catch(console.error)
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSave(e) {
    e.preventDefault()
    updateProfile(form)
      .then(updated => { setProfile(updated); setEditing(false) })
      .catch(console.error)
  }

  function handleCancel() {
    setForm(profile)
    setEditing(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <h1 className="text-ink-primary font-semibold text-base">Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-ghost">Edit</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-semibold">
            {profile.name?.[0] ?? '?'}
          </div>
          <div>
            <p className="text-ink-primary font-semibold text-sm">{profile.name ?? ''}</p>
            <p className="text-ink-muted text-sm">@{profile.username ?? ''}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Username</label>
                <input name="username" value={form.username} onChange={handleChange} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} className="input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Machine</label>
                <input name="machine" value={form.machine} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Grinder</label>
                <input name="grinder" value={form.grinder} onChange={handleChange} className="input" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleCancel} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save changes</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Field label="Email"   value={profile.email} />
            <Field label="Bio"     value={profile.bio} />
            <Field label="Machine" value={profile.machine} />
            <Field label="Grinder" value={profile.grinder} />
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="border-b border-app-border pb-4">
      <p className="label mb-1">{label}</p>
      <p className="text-ink-primary text-sm">{value || <span className="text-ink-muted">—</span>}</p>
    </div>
  )
}
