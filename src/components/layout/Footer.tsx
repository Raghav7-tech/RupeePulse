import { ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'

export function Footer() {
  return <footer><div className="footer-grid"><div className="brand footer-brand"><span className="brand-mark"><TrendingUp /></span><span><b>Rupee<span>Pulse</span></b><small>Money clarity, without the lecture.</small></span></div><div><b><Zap /> One coupled engine</b><p>Every choice recalculates your complete month.</p></div><div><b><ShieldCheck /> Browser-private</b><p>No accounts, no bank link, no data leaving your device.</p></div><div><b><Sparkles /> Honest forecasts</b><p>Ranges, drivers and trade-offs — never fake certainty.</p></div></div><div className="footer-bottom"><span>Built for India’s financially ambitious Gen Z.</span><span>100% client-side • Demo data</span></div></footer>
}
