/**
 * Everafter — route table and the two app shells.
 *
 * Guest routes wear GuestLayout (masthead + footer, brand register).
 * Admin routes wear AdminLayout (left nav on --night, product register).
 *
 * File ownership note for parallel work: page components live in
 * src/pages/guest/* and src/pages/admin/*. Replace their contents freely —
 * these import paths are frozen.
 */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { buttonClass } from './components/ui'
import { useWeddingStore } from './lib/store'
import { formatDate } from './lib/format'

import Home from './pages/guest/Home'
import Story from './pages/guest/Story'
import Schedule from './pages/guest/Schedule'
import Travel from './pages/guest/Travel'
import Party from './pages/guest/Party'
import Registry from './pages/guest/Registry'
import Faq from './pages/guest/Faq'
import Photos from './pages/guest/Photos'
import RsvpPage from './pages/guest/rsvp/RsvpPage'

import Overview from './pages/admin/Overview'
import AdminGuests from './pages/admin/Guests'
import AdminSettings from './pages/admin/Settings'

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

const GUEST_LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/story', label: 'Story' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/travel', label: 'Travel' },
  { to: '/party', label: 'Party' },
  { to: '/registry', label: 'Registry' },
  { to: '/faq', label: 'FAQ' },
  { to: '/photos', label: 'Photos' },
]

type AdminIconName = 'overview' | 'guests' | 'settings'

const ADMIN_LINKS: { to: string; label: string; end?: boolean; icon: AdminIconName }[] = [
  { to: '/admin', label: 'Overview', end: true, icon: 'overview' },
  { to: '/admin/guests', label: 'Guest list', icon: 'guests' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

function AdminIcon({ name }: { name: AdminIconName }) {
  const common = {
    className: 'admin-nav__icon',
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'guests') {
    return (
      <svg {...common}>
        <circle cx="6" cy="5.5" r="2.4" />
        <path d="M1.8 13.4c0-2.3 1.9-3.8 4.2-3.8s4.2 1.5 4.2 3.8" />
        <path d="M11 3.6a2.2 2.2 0 0 1 0 4.3M12.2 13.4c0-1.6-.5-2.6-1.4-3.3" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2.2" />
        <path d="M8 1.6v1.6M8 12.8v1.6M14.4 8h-1.6M3.2 8H1.6M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1M12.5 12.5l-1.1-1.1M4.6 4.6 3.5 3.5" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M2 13V7.2M6 13V3.4M10 13V8.8M14 13V5.6" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Guest shell                                                                 */
/* -------------------------------------------------------------------------- */

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function GuestLayout() {
  const config = useWeddingStore((s) => s.config)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const [firstName, secondName] = config.coupleNames
  const shortNames = `${firstName.split(' ')[0]} & ${secondName.split(' ')[0]}`

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Escape closes; focus moves in on open and back to the toggle on close.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="guest-header no-print">
        <div className="container guest-header__inner">
          <Link className="guest-brand" to="/">
            <span>{firstName.split(' ')[0]}</span>
            <span className="guest-brand__amp" aria-hidden="true">
              &amp;
            </span>
            <span className="visually-hidden">and</span>
            <span>{secondName.split(' ')[0]}</span>
          </Link>

          <nav className="guest-nav" aria-label="Wedding site">
            {GUEST_LINKS.map((link) => (
              <NavLink key={link.to} className="guest-nav__link" to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="guest-header__actions">
            <Link className={buttonClass({ variant: 'primary', size: 'sm' })} to="/rsvp">
              RSVP
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="guest-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="guest-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="guest-menu-toggle__bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="visually-hidden">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <div
            className="guest-menu-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="guest-menu"
            ref={menuRef}
            className="guest-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="guest-menu__head">
              <span className="eyebrow">{shortNames}</span>
              <button
                type="button"
                className="guest-menu__close"
                onClick={() => {
                  setMenuOpen(false)
                  toggleRef.current?.focus()
                }}
              >
                <span aria-hidden="true">×</span>
                <span className="visually-hidden">Close menu</span>
              </button>
            </div>

            {GUEST_LINKS.map((link) => (
              <NavLink key={link.to} className="guest-menu__link" to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}

            <Link
              className={buttonClass({
                variant: 'primary',
                block: true,
                className: 'guest-menu__cta',
              })}
              to="/rsvp"
            >
              RSVP
            </Link>
          </div>
        </>
      ) : null}

      <main className="app-main" id="main">
        <Outlet />
      </main>

      <footer className="guest-footer no-print">
        <div className="container guest-footer__inner">
          <p className="guest-footer__names">{shortNames}</p>
          <p className="guest-footer__meta">
            {formatDate(config.dateISO)} · {config.city}
          </p>
          <hr className="rule rule--short rule--center" aria-hidden="true" />
          <p className="guest-footer__meta">
            Questions? Write to us at{' '}
            <a className="link" href={`mailto:${config.contactEmail}`}>
              {config.contactEmail}
            </a>
            .
          </p>
          <nav className="guest-footer__links" aria-label="Footer">
            <Link className="link small" to="/rsvp">
              RSVP
            </Link>
            <Link className="link small" to="/schedule">
              Schedule
            </Link>
            <Link className="link small" to="/travel">
              Travel
            </Link>
            <Link className="link small" to="/admin">
              Couple’s dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Admin shell                                                                 */
/* -------------------------------------------------------------------------- */

function AdminLayout() {
  const config = useWeddingStore((s) => s.config)
  const [firstName, secondName] = config.coupleNames
  const shortNames = `${firstName.split(' ')[0]} & ${secondName.split(' ')[0]}`

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main">
        Skip to content
      </a>

      <nav className="admin-nav on-night" aria-label="Dashboard">
        <Link className="admin-nav__brand" to="/admin">
          {shortNames}
          <small>Everafter dashboard</small>
        </Link>

        <div className="admin-nav__list">
          {ADMIN_LINKS.map((link) => (
            <NavLink key={link.to} className="admin-nav__link" to={link.to} end={link.end}>
              <AdminIcon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </div>

        <p className="admin-nav__foot">
          <Link to="/">View the guest site</Link>
        </p>
      </nav>

      <main className="admin-main" id="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Fallback                                                                    */
/* -------------------------------------------------------------------------- */

function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">This page slipped the envelope</p>
      <h1>We can’t find that page</h1>
      <p className="muted">Everything else is where you left it.</p>
      <Link className={buttonClass({ variant: 'secondary' })} to="/">
        Back to the beginning
      </Link>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {children}
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<Story />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/party" element={<Party />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/rsvp" element={<RsvpPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="guests" element={<AdminGuests />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  )
}
