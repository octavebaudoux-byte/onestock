export default function Logo({ size = 'md', showText = true, animated = true }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 56, text: 'text-4xl' },
    xl: { icon: 72, text: 'text-5xl' },
  }

  const s = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${animated ? 'group' : ''}`}>
        {/* Glow effect */}
        {animated && (
          <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg group-hover:bg-cyan-500/40 transition-all duration-500 animate-logo-pulse" />
        )}

        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 ${animated ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}
        >
          <defs>
            <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Shoe box base */}
          <rect x="4" y="34" width="56" height="24" rx="4" fill="url(#boxGrad)" stroke="url(#logoGrad1)" strokeWidth="2" />

          {/* Box lid line */}
          <line x1="4" y1="42" x2="60" y2="42" stroke="url(#logoGrad1)" strokeWidth="1.5" opacity="0.5" />

          {/* Sneaker silhouette */}
          <path
            d="M12 34 C12 28 14 22 20 20 L28 18 C30 17 32 17 34 18 L38 20 C40 21 42 22 44 22 L50 22 C54 22 56 24 56 28 L56 34"
            fill="none"
            stroke="url(#logoGrad2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'animate-sneaker-draw' : ''}
          />

          {/* Swoosh / detail on sneaker */}
          <path
            d="M18 28 Q28 32 42 24"
            fill="none"
            stroke="url(#logoGrad1)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
            className={animated ? 'animate-swoosh' : ''}
          />

          {/* Lace dots */}
          <circle cx="26" cy="22" r="1.5" fill="#60A5FA" className={animated ? 'animate-dot-1' : ''} />
          <circle cx="32" cy="20" r="1.5" fill="#06B6D4" className={animated ? 'animate-dot-2' : ''} />
          <circle cx="38" cy="22" r="1.5" fill="#8B5CF6" className={animated ? 'animate-dot-3' : ''} />

          {/* Stock chart arrow inside box */}
          <path
            d="M14 52 L24 46 L32 50 L48 44"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          <path
            d="M44 44 L48 44 L48 48"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent`}>
            One<span className="text-white">Stock</span>
          </span>
        </div>
      )}
    </div>
  )
}
