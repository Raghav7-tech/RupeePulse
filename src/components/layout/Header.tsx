import { useEffect, useState } from 'react'
import { FastForward, Menu, Play, RotateCcw, TrendingUp, X } from 'lucide-react'
import { calculateMetrics } from '../../engine/engine'
import { inr } from '../../lib/format'
import { useFinanceStore } from '../../store/useFinanceStore'
import { navItems, type Page } from '../../app/navigation'

export function Header({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  const { finance, nextDay, reset, jumpToDay } = useFinanceStore()
  const metrics = calculateMetrics(finance)
  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || finance.day >= 30) return
    const timer = window.setTimeout(nextDay, 440)
    return () => window.clearTimeout(timer)
  }, [playing, finance.day, nextDay])

  const navigate = (next: Page) => {
    setPage(next)
    setMenuOpen(false)
  }

  return <>
    <header className="topbar">
      <div className="nav-shell">
        <button className="brand" onClick={() => navigate('today')} aria-label="RupeePulse home">
          <span className="brand-mark"><TrendingUp size={21} /></span>
          <span><b>Rupee<span>Pulse</span></b><small>₹10K • 30 days</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>{item.label}</button>)}
        </nav>
        <div className="nav-actions">
          <div className="day-pill" aria-label={`Day ${finance.day} of 30`}><span className="pulse" /> Day {finance.day}<span>/30</span></div>
          <button className="icon-label next" onClick={nextDay} disabled={finance.day >= 30} data-testid="next-day-button"><FastForward size={15} /><span>Next day</span></button>
          <button className={`icon-label autoplay ${playing && finance.day < 30 ? 'on' : ''}`} aria-pressed={playing} aria-label={playing && finance.day < 30 ? 'Pause automatic day advance' : 'Automatically advance through the month'} onClick={() => setPlaying(value => !value)}><Play size={14} fill="currentColor" /><span>{playing && finance.day < 30 ? 'Pause' : 'Auto'}</span></button>
          <div className="balance-mini"><span>Balance</span><b>{inr(metrics.balance)}</b></div>
          <button className="icon-button desktop-only" aria-label="Reset scenario" onClick={reset} data-testid="reset-button"><RotateCcw size={17} /></button>
          <button className="icon-button menu-button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
    {menuOpen && <div className="mobile-menu" id="mobile-menu">
      {navItems.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={18} aria-hidden="true" />{item.label}</button>)}
      <div className="mobile-menu-actions"><button onClick={reset}><RotateCcw size={16} /> Reset</button><label>Jump to day <input aria-label="Jump to day" type="number" min="8" max="30" value={finance.day} onChange={event => jumpToDay(Number(event.target.value))} /></label></div>
    </div>}
  </>
}
