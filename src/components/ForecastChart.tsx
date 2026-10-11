import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ForecastPoint } from '../engine/types'
import { inr } from '../lib/format'

interface Props { data: ForecastPoint[]; full?: boolean }

export default function ForecastChart({ data, full = false }: Props) {
  if (!full) return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 3, left: -28, bottom: 0 }}>
      <defs><linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00e6a4" stopOpacity={.28}/><stop offset="100%" stopColor="#00e6a4" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="3 6" stroke="#27313d" vertical={false}/>
      <XAxis dataKey="day" tickFormatter={d => `D${d}`} tick={{ fill: '#738091', fontSize: 11 }} axisLine={false} tickLine={false}/>
      <YAxis tick={{ fill: '#738091', fontSize: 10 }} axisLine={false} tickLine={false}/>
      <Area type="monotone" dataKey="expected" stroke="#00e6a4" strokeWidth={2.5} fill="url(#mintFill)" />
    </AreaChart>
  </ResponsiveContainer>

  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 16, right: 16, left: 2, bottom: 0 }}>
      <defs><linearGradient id="expectedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00e6a4" stopOpacity={.24}/><stop offset="100%" stopColor="#00e6a4" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="4 7" stroke="#26303a" vertical={false}/>
      <XAxis dataKey="day" tickFormatter={d => `D${d}`} tick={{ fill:'#7f8b99',fontSize:11 }} axisLine={false}/>
      <YAxis tickFormatter={v => `₹${v/1000}k`} tick={{ fill:'#7f8b99',fontSize:11 }} axisLine={false}/>
      <Tooltip contentStyle={{ background:'#141b23',border:'1px solid #2b3541',borderRadius:12 }} formatter={(v) => inr(Number(v ?? 0))} labelFormatter={d => `Day ${d}`} />
      <Area type="monotone" dataKey="expected" stroke="#00e6a4" fill="url(#expectedFill)" strokeWidth={3}/>
      <Line type="monotone" dataKey="best" stroke="#8b7dff" dot={false} strokeDasharray="5 5"/>
      <Line type="monotone" dataKey="worst" stroke="#ff6b78" dot={false} strokeDasharray="5 5"/>
    </AreaChart>
  </ResponsiveContainer>
}
