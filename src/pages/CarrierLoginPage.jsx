import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SuperDispatchLogo from '../components/SuperDispatchLogo'
import CarrierPortal from '../components/CarrierPortal'

const apiUrl = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'summit_carrier_session'
const RESEND_SECONDS = 60

function EyeIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5h15a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H9.2L5 20.2V15H4.5A1.5 1.5 0 013 13.5v-7A1.5 1.5 0 014.5 4.5z"
        fill="#fff"
      />
      <path
        d="M12 14.2a1.05 1.05 0 110-2.1 1.05 1.05 0 010 2.1zm-.95-3.55c.12-.72.62-1.18 1.45-1.18.82 0 1.35.42 1.35 1.08 0 .52-.28.86-.9 1.22l-.28.16c-.3.18-.4.34-.38.62v.2h-1.12v-.28c-.04-.5.14-.82.58-1.1l.3-.18c.4-.24.52-.4.52-.66 0-.28-.22-.46-.56-.46-.36 0-.58.2-.66.52l-1.1-.12z"
        fill="#E31C23"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="1.8" />
      <path d="M12 10.5v6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.15" fill="#3b82f6" />
    </svg>
  )
}

function CarrierLoginPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [email, setEmail] = useState(() => (import.meta.env.DEV ? params?.get('email') || '' : ''))
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [stage, setStage] = useState(() =>
    import.meta.env.DEV && params?.get('stage') === 'verify' ? 'verify' : 'credentials',
  )
  const [carrierId, setCarrierId] = useState(null)
  const [code, setCode] = useState('')
  const [codeTouched, setCodeTouched] = useState(
    () => import.meta.env.DEV && params?.get('stage') === 'verify',
  )
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS)

  useEffect(() => {
    fetch(`${apiUrl}/api/track/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'carrier-login', referrer: document.referrer }),
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (stage !== 'verify') return
    setResendSeconds(RESEND_SECONDS)
    setCode('')
    setCodeTouched(true)
    setError('')
    const timer = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [stage])

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/carriers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const raw = await res.text()
      let data
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        throw new Error('Login API returned an invalid response. Check Netlify functions and environment variables.')
      }

      if (!res.ok) throw new Error(data.error || 'Login failed.')

      setCarrierId(data.carrierId ?? null)
      await new Promise((resolve) => setTimeout(resolve, 5000))
      setStage('verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setCodeTouched(true)
    setError('')

    if (!code) return

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/carriers/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierId, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed.')

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSession(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCredentials = () => {
    setStage('credentials')
    setCode('')
    setCodeTouched(false)
    setError('')
    setPassword('')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
    setEmail('')
    setPassword('')
    setStage('credentials')
    setCode('')
    setCodeTouched(false)
  }

  const codeMissing = codeTouched && !code
  const canSubmitCode = code.length === 6 && !loading

  if (session) {
    return (
      <div className="sd-login-page">
        <div className="sd-login-main">
          <CarrierPortal session={session} onLogout={handleLogout} />
        </div>
      </div>
    )
  }

  return (
    <div className={`sd-login-page${stage === 'verify' ? ' sd-verify-page' : ''}`}>
      <header className={`sd-login-topbar${stage === 'verify' ? ' sd-login-topbar-verify' : ''}`}>
        <Link to="/" className="sd-brand" aria-label="SuperDispatch home">
          <SuperDispatchLogo size={28} />
          <span className="sd-brand-name">SuperDispatch</span>
        </Link>
        {stage === 'credentials' && (
          <Link to="/carrier-signup" className="sd-signup-btn">
            Sign Up
          </Link>
        )}
      </header>

      <div className="sd-login-main">
        <div className={`sd-login-stage${stage === 'verify' ? ' sd-verify-stage' : ''}`}>
          <div className="sd-dot-panel" aria-hidden="true" />

          {stage === 'credentials' ? (
            <div className="sd-login-card">
              <h1 className="sd-login-title">Carrier TMS</h1>

              <form onSubmit={handleCredentialsSubmit} noValidate className="sd-login-form">
                <div className="sd-field">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    id="loginEmail"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={touched.email && !email ? 'input-error' : ''}
                    autoFocus
                  />
                  {touched.email && !email && (
                    <span className="field-inline-error">Enter email</span>
                  )}
                </div>

                <div className="sd-field">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="sd-password-field">
                    <input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      className={touched.password && !password ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="sd-password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {touched.password && !password && (
                    <span className="field-inline-error">Enter password</span>
                  )}
                </div>

                {error && <span className="field-error">{error}</span>}

                <button type="submit" className="sd-login-btn" disabled={loading}>
                  {loading ? 'Signing In...' : 'Log In'}
                </button>
                {loading && (
                  <p className="sd-login-status">Checking credentials and sending verification code...</p>
                )}
              </form>

              <div className="sd-login-links">
                <a href="#forgot-password">Forgot password?</a>
                <a href="#contact-support">Contact support</a>
              </div>
            </div>
          ) : (
            <div className="sd-login-card sd-verify-card">
              <div className="sd-verify-heading">
                <button
                  type="button"
                  className="sd-verify-back"
                  onClick={handleBackToCredentials}
                  aria-label="Back to sign in"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="sd-verify-title">Check your inbox!</h1>
              </div>

              <p className="sd-verify-intro">
                We&apos;ve sent you a temporary 6-digit login code at{' '}
                <strong>{email}</strong>. Please enter this code to login to your account.
              </p>

              <form onSubmit={handleVerifySubmit} className="sd-login-form sd-verify-form" noValidate>
                <div className="sd-field">
                  <label htmlFor="verifyCode">Verification Code</label>
                  <input
                    id="verifyCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      if (error) setError('')
                    }}
                    onBlur={() => setCodeTouched(true)}
                    className={codeMissing || error ? 'input-error' : ''}
                    autoFocus
                  />
                  {codeMissing && (
                    <span className="field-inline-error">Enter Verification Code</span>
                  )}
                  {!codeMissing && error && (
                    <span className="field-inline-error">{error}</span>
                  )}
                </div>

                <div className="sd-verify-help">
                  <p>
                    Didn&apos;t receive a code? Check your spam folder.
                    {resendSeconds > 0 ? (
                      <>
                        {' '}
                        Resend code in {resendSeconds} sec.
                      </>
                    ) : (
                      <>
                        {' '}
                        <a
                          href="#resend"
                          onClick={(e) => {
                            e.preventDefault()
                            setResendSeconds(RESEND_SECONDS)
                          }}
                        >
                          Resend code
                        </a>
                      </>
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  className={`sd-login-btn sd-verify-login-btn${!canSubmitCode ? ' is-disabled' : ''}`}
                  disabled={!canSubmitCode}
                >
                  {loading ? 'Verifying...' : 'Log In'}
                </button>
              </form>

              <a href="#sms" className="sd-verify-sms">
                Receive Code via SMS(Text Message)
              </a>

              <div className="sd-verify-info">
                <span className="sd-verify-info-icon">
                  <InfoIcon />
                </span>
                <div>
                  <p>
                    Two-Factor Authentication (2FA) is now required to log in to Super Dispatch.
                  </p>
                  <a href="#learn-more">Learn more</a>
                </div>
              </div>
            </div>
          )}

          {stage === 'credentials' ? (
            <div className="sd-login-legal">
              <p>
                By signing in, you agree to Super Dispatch&apos;s{' '}
                <a href="#terms">Terms &amp; Conditions</a>
                {' '}and{' '}
                <a href="#privacy">Privacy Policy</a>
              </p>
              <p className="sd-login-copyright">© 2024 Super Dispatch. All rights reserved.</p>
            </div>
          ) : (
            <p className="sd-verify-copyright">© 2026 Super Dispatch. All rights reserved.</p>
          )}
        </div>
      </div>

      <button type="button" className="sd-chat-btn" aria-label="Contact support">
        <ChatIcon />
      </button>
    </div>
  )
}

export default CarrierLoginPage
