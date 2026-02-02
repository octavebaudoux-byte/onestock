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
          <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg group-hover:bg-blue-600/40 transition-all duration-500" />
        )}

        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 ${animated ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}
        >
          <defs>
            <linearGradient id="main-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>

          {/* Design futuriste - Forme hexagonale */}
          <g transform="translate(256, 200)">
            {/* Hexagone principal */}
            <path d="M 0,-80 L 70,-40 L 70,40 L 0,80 L -70,40 L -70,-40 Z"
                  fill="url(#main-gradient)"
                  opacity="0.15"/>

            {/* Hexagone interne */}
            <path d="M 0,-60 L 52,-30 L 52,30 L 0,60 L -52,30 L -52,-30 Z"
                  fill="none"
                  stroke="url(#main-gradient)"
                  strokeWidth="3"/>

            {/* Sneaker stylisée et futuriste */}
            <g transform="translate(-50, -15)">
              {/* Base sneaker géométrique */}
              <path d="M 20,0 L 80,0 Q 90,0 95,8 L 100,25 L 15,25 Q 10,25 10,20 Z"
                    fill="url(#main-gradient)"/>

              {/* Ligne dynamique futuriste */}
              <path d="M 30,8 L 75,8 Q 85,8 88,15"
                    fill="none"
                    stroke="url(#accent-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"/>

              {/* Détails technologiques */}
              <circle cx="85" cy="15" r="3" fill="#3b82f6"/>
              <circle cx="75" cy="18" r="2" fill="#60a5fa"/>
            </g>
          </g>

          {/* Éléments géométriques décoratifs */}
          <g opacity="0.15">
            <circle cx="256" cy="200" r="120" fill="none" stroke="#1e40af" strokeWidth="1"/>
            <circle cx="256" cy="200" r="140" fill="none" stroke="#1e40af" strokeWidth="0.5"/>
          </g>

          {/* Points de connexion futuristes */}
          <circle cx="186" cy="160" r="4" fill="#3b82f6" opacity="0.4"/>
          <circle cx="326" cy="160" r="4" fill="#3b82f6" opacity="0.4"/>
          <circle cx="186" cy="240" r="4" fill="#3b82f6" opacity="0.4"/>
          <circle cx="326" cy="240" r="4" fill="#3b82f6" opacity="0.4"/>

          {/* Lignes de connexion subtiles */}
          <line x1="186" y1="160" x2="256" y2="140" stroke="#1e40af" strokeWidth="1" opacity="0.2"/>
          <line x1="326" y1="160" x2="256" y2="140" stroke="#1e40af" strokeWidth="1" opacity="0.2"/>
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
