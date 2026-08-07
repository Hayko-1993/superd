function SuperDispatchLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill="#E31C23" />
      <circle cx="20" cy="20" r="14.5" stroke="#fff" strokeWidth="2.2" fill="none" />
      <circle cx="20" cy="20" r="8.5" stroke="#fff" strokeWidth="2.2" fill="none" />
      <circle cx="20" cy="20" r="3.2" fill="#fff" />
    </svg>
  )
}

export default SuperDispatchLogo
