import { motion } from 'framer-motion'

export default function MagnaLoader({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center justify-center text-center ${className}`}>
      <svg viewBox="0 0 320 260" className="h-auto w-56 max-w-full sm:w-64" role="img" aria-label="Growth chart loading animation">
        <line x1="24" y1="22" x2="24" y2="232" stroke="#2A1AD8" strokeWidth="5" strokeLinecap="round" />
        <line x1="24" y1="232" x2="300" y2="232" stroke="#2A1AD8" strokeWidth="5" strokeLinecap="round" />

        {[52, 88, 126, 165, 206].map((x, idx) => (
          <motion.rect
            key={`loader-bar-${x}`}
            x={x}
            y={216 - (idx + 1) * 30}
            width="34"
            height={(idx + 1) * 30}
            rx="3"
            fill="#B948FF"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 1, 0] }}
            style={{ originY: 1 }}
            transition={{ duration: 1.8, delay: idx * 0.1, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.45 }}
          />
        ))}

        <motion.line
          x1="46"
          y1="198"
          x2="270"
          y2="44"
          stroke="#00ffff"
          strokeWidth="9"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, delay: 0.65, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.25 }}
        />
        <motion.polygon
          points="270,44 250,44 270,26 286,44"
          fill="#00ffff"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1, 0.7] }}
          transition={{ duration: 2, delay: 1.25, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.25 }}
        />
      </svg>
      {message && <span className="sr-only">{message}</span>}
    </div>
  )
}
