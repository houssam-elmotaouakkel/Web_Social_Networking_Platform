import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(({ label, error, className = '', placeholder, type, ...props }, ref) => {
  const hasValue = props.value !== undefined ? props.value.length > 0 : false
  const floatingLabel = label || placeholder
  const isPassword = type === 'password'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          ref={ref}
          placeholder=" "
          type={isPassword && showPassword ? 'text' : type}
          className={`
            peer w-full rounded-xl border border-border bg-bg-input px-4 pt-6 pb-2
            text-text-primary
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {floatingLabel && (
          <label
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
              peer-placeholder-shown:text-base peer-placeholder-shown:text-text-muted
              peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-accent
              ${hasValue ? 'top-2 translate-y-0 text-xs text-accent' : 'top-1/2 -translate-y-1/2 text-base text-text-muted'}
            `}
          >
            {floatingLabel}
          </label>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input