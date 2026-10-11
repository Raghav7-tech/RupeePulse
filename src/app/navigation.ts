import { BarChart3, Home, Sparkles, Target, type LucideIcon } from 'lucide-react'

export type Page = 'today' | 'simulator' | 'forecast' | 'plans'

export interface NavItem {
  id: Page
  label: string
  short: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { id: 'today', label: 'Today', short: 'Today', icon: Home },
  { id: 'simulator', label: 'Decision Lab', short: 'Simulate', icon: Sparkles },
  { id: 'forecast', label: 'Forecast', short: 'Forecast', icon: BarChart3 },
  { id: 'plans', label: 'Plans & Goals', short: 'Plans', icon: Target },
]
