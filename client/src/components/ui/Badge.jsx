const COLORS = {
  green: { bg: '#00e67620', text: '#00e676' },
  teal: { bg: '#2dd4bf20', text: '#2dd4bf' },
  blue: { bg: '#38bdf820', text: '#38bdf8' },
  purple: { bg: '#a78bfa20', text: '#a78bfa' },
  orange: { bg: '#ff6b2b20', text: '#ff6b2b' },
  red: { bg: '#ff3d5a20', text: '#ff3d5a' },
  yellow: { bg: '#fbbf2420', text: '#fbbf24' },
  gray: { bg: '#4a5f7a20', text: '#4a5f7a' },
}

export default function Badge({ color = 'green', children, className = '' }) {
  const c = COLORS[color] || COLORS.green
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={{ background: c.bg, color: c.text }}>
      {children}
    </span>
  )
}
