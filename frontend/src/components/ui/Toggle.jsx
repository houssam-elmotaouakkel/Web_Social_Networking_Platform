export default function Toggle({ enabled, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                  border-2 border-transparent transition-colors duration-200 ease-in-out
                  focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                  ${enabled ? 'bg-gradient-brand' : 'bg-bg-hover'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
                    ring-0 transition-transform duration-200 ease-in-out
                    ${enabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}
