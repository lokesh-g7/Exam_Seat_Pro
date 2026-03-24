import { useMemo } from 'react'
import { calculateConflicts, calculateSQI } from '../utils/seatingEngine'

export default function ConflictPanel({ halls }) {
  const hallData = useMemo(() => {
    return halls.map((grid, i) => {
      const conflicts = calculateConflicts(grid)
      const { sqi, rating } = calculateSQI(conflicts)
      return { hallIndex: i, conflicts, sqi, rating }
    })
  }, [halls])

  const overallConflicts = hallData.reduce((sum, h) => sum + h.conflicts.length, 0)
  const avgSQI = hallData.length > 0
    ? Math.round(hallData.reduce((sum, h) => sum + h.sqi, 0) / hallData.length)
    : 100

  function sqiColor(sqi) {
    if (sqi >= 90) return 'text-emerald-400'
    if (sqi >= 70) return 'text-amber-400'
    if (sqi >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  function sqiBg(sqi) {
    if (sqi >= 90) return 'bg-emerald-500/20 border-emerald-500/30'
    if (sqi >= 70) return 'bg-amber-500/20 border-amber-500/30'
    if (sqi >= 50) return 'bg-orange-500/20 border-orange-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="glass-card p-6 animate-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-white">Conflict Analysis & SQI</h3>
          <p className="text-xs text-white/40">Seating Quality Index across all halls</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`rounded-xl border p-4 text-center ${sqiBg(avgSQI)}`}>
          <p className={`text-3xl font-bold font-mono ${sqiColor(avgSQI)}`}>{avgSQI}</p>
          <p className="text-xs text-white/50 mt-1">Average SQI</p>
        </div>
        <div className="rounded-xl border bg-white/5 border-white/10 p-4 text-center">
          <p className="text-3xl font-bold font-mono text-white">{overallConflicts}</p>
          <p className="text-xs text-white/50 mt-1">Total Conflicts</p>
        </div>
      </div>

      {/* Per-Hall */}
      <div className="space-y-3">
        {hallData.map(({ hallIndex, conflicts, sqi, rating }) => (
          <div key={hallIndex} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-300">
                {hallIndex + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Hall {hallIndex + 1}</p>
                <p className="text-xs text-white/40">{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold font-mono ${sqiColor(sqi)}`}>{sqi}</p>
              <p className={`text-xs ${sqiColor(sqi)}`}>{rating}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conflict Details */}
      {overallConflicts > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-medium text-white/50 mb-3">Conflict Details</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {hallData.flatMap(({ hallIndex, conflicts }) =>
              conflicts.map((c) => (
                <div key={`${hallIndex}-${c.key}`} className="flex items-center gap-3 p-2 bg-red-500/5 rounded-lg text-xs border border-red-500/10">
                  <span className="badge bg-red-500/20 text-red-300">H{hallIndex + 1}</span>
                  <span className="text-white/70">
                    <span className="font-medium text-white">{c.student1.name}</span>
                    {' ↔ '}
                    <span className="font-medium text-white">{c.student2.name}</span>
                  </span>
                  <span className="ml-auto badge bg-white/10 text-white/50">
                    {c.type === 'same-dept-diff-year' ? 'Dept+Year' : 'Same Dept'} (+{c.score})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
