import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const CoffeeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
)
const ShotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const RecipeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const navItems = [
  { to: '/coffees', label: 'Coffees', Icon: CoffeeIcon },
  { to: '/shots',   label: 'Shots',   Icon: ShotIcon   },
  { to: '/recipes', label: 'Recipes', Icon: RecipeIcon  },
]

function NavItem({ to, label, Icon }) {
  const { pathname } = useLocation()
  const active = pathname.startsWith(to)
  return (
    <NavLink
      to={to}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
        active ? 'bg-app-hover text-ink-primary' : 'text-ink-secondary hover:text-ink-primary hover:bg-app-hover'
      }`}
    >
      <span className={active ? 'text-app-accent' : 'text-ink-muted'}><Icon /></span>
      {label}
    </NavLink>
  )
}

function Dropdown({ items, onClose }) {
  const ref = useRef()
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 w-48 bg-app-surface border border-app-border rounded-lg shadow-xl z-50 py-1 overflow-hidden">
      {items.map((item, i) =>
        item === 'divider'
          ? <div key={i} className="border-t border-app-border my-1" />
          : (
            <button
              key={i}
              onClick={() => { item.onClick(); onClose() }}
              className="w-full text-left px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary hover:bg-app-hover transition-colors flex items-center gap-2.5"
            >
              {item.icon && <span className="text-ink-muted">{item.icon}</span>}
              {item.label}
            </button>
          )
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [userOpen, setUserOpen]           = useState(false)
  const navigate = useNavigate()

  const workspaceItems = [
    {
      label: 'Settings',
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      onClick: () => navigate('/settings'),
    },
    'divider',
    {
      label: 'Sign out',
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
      onClick: () => {}, // TODO: implement sign out
    },
  ]

  const userItems = [
    {
      label: 'View profile',
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Settings',
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      onClick: () => navigate('/settings'),
    },
  ]

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-app-border" style={{ background: '#13131A' }}>

        {/* Workspace header with dropdown */}
        <div className="h-12 flex items-center px-3 border-b border-app-border relative">
          <button
            onClick={() => setWorkspaceOpen(o => !o)}
            className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-app-hover cursor-pointer w-full transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-app-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">G</div>
            <span className="text-ink-primary font-medium text-sm tracking-tight flex-1 text-left">GaggiMate</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {workspaceOpen && <Dropdown items={workspaceItems} onClose={() => setWorkspaceOpen(false)} />}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <div className="px-2 pt-1 pb-2">
            <p className="text-ink-muted text-[11px] font-semibold uppercase tracking-widest">My Workspace</p>
          </div>
          {navItems.map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} />
          ))}
        </nav>

        {/* User with dropdown */}
        <div className="p-2 border-t border-app-border relative">
          <button
            onClick={() => setUserOpen(o => !o)}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-app-hover cursor-pointer transition-colors w-full"
          >
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">J</div>
            <span className="text-ink-secondary text-sm truncate flex-1 text-left">Joaquín</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {userOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full px-2">
              <Dropdown items={userItems} onClose={() => setUserOpen(false)} />
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
