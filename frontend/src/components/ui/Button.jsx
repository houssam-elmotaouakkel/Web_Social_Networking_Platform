import Spinner from './Spinner'

const variants = {
  primary: 'bg-gradient-brand hover:bg-gradient-brand-hover text-white',
  secondary: 'bg-bg-hover hover:bg-border text-text-primary',
  danger: 'bg-danger hover:bg-danger-hover text-white',
  ghost: 'bg-transparent hover:bg-bg-hover text-text-secondary',
  outline: 'border border-border hover:bg-bg-hover text-text-primary',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}