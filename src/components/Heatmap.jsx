import { calculateHeatmap } from '../utils/seatingEngine'

const HEAT_COLORS = [
  'bg-blue-500/80',
  'bg-emerald-500/80',
  'bg-amber-500/80',
  'bg-rose-500/80',
  'bg-violet-500/80',
  'bg-cyan-500/80',
  'bg-lime-500/80',
  'bg-fuchsia-500/80',
]

export default function Heatmap({ halls }) {
  if (!halls || halls.length === 0) return null

  const allDepts = new Set()
  const hallHeatmaps = halls.map((grid) => {
    const hm = calculateHeatmap(grid)
    Object.keys(hm).forEach(d => allDepts.add(d))
    return hm
  })
  const deptList = [...allDepts].sort()

  return (
    <div className="glass-card p-6 animate-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-white">Department Heatmap</h3>
          <p className="text-xs text-white/40">Distribution of departments across halls</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-white/50 font-medium">Department</th>
              {hallHeatmaps.map((_, i) => (
                <th key={i} className="px-4 py-3 text-center text-white/50 font-medium">
                  Hall {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deptList.map((dept, deptIdx) => (
              <tr key={dept} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${HEAT_COLORS[deptIdx % HEAT_COLORS.length]}`} />
                    <span className="text-white font-medium">{dept}</span>
                  </div>
                </td>
                {hallHeatmaps.map((hm, i) => {
                  const data = hm[dept]
                  const pct = data ? parseFloat(data.percentage) : 0
                  return (
                    <td key={i} className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${HEAT_COLORS[deptIdx % HEAT_COLORS.length]}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40 font-mono">
                          {data ? `${data.count} (${data.percentage}%)` : '—'}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
