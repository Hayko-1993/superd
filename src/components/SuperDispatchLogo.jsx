function SuperDispatchLogo({ size = 28, className = '' }) {
  const height = size
  const width = Math.round(size * (34 / 47))

  return (
    <img
      src="/logo.png?v=2"
      alt=""
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      aria-hidden="true"
    />
  )
}

export default SuperDispatchLogo
