function CentralDispatchLogo({ size = 32, className = '', alt = '' }) {
  const height = size
  const width = Math.round(size * (34 / 47))

  return (
    <img
      src="/logo.png?v=2"
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      aria-hidden={alt ? undefined : true}
    />
  )
}

export default CentralDispatchLogo
