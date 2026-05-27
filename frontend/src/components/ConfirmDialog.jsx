export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-app-surface border border-app-border rounded-xl w-full max-w-sm shadow-2xl p-5">
        <h2 className="text-ink-primary font-semibold text-sm mb-1">{title}</h2>
        <p className="text-ink-secondary text-sm mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
