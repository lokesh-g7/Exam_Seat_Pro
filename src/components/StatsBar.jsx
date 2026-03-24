import { useMemo } from 'react'
import { calculateConflicts, calculateSQI } from '../utils/seatingEngine'

export default function StatsBar({ halls, students, algorithm }) {
  const stats = useMemo(() => {
    if (!halls || halls.length === 0) return null

    let totalConflicts = 0
    let totalSQI = 0
    halls.forEach(grid => {
      const conflicts = calculateConflicts(grid)
      const { sqi } = calculateSQI(conflicts)
      totalConflicts += conflicts.length
      totalSQI += sqi
    })

    const avgSQI = Math.round(totalSQI / halls.length)
    const totalSeated = halls.reduce(
      (sum, grid) => sum + grid.flat().filter(Boolean).length, 0
    )

    return {
      totalStudents: students.length,
      totalSeated,
      totalHalls: halls.length,
      totalConflicts,
      avgSQI,
    }
  }, [halls, students])

  if (!stats) return null

  const items = [
    {
      label: 'Students',
      value: stats.totalSeated,
      sub: `of ${stats.totalStudents}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'text-blue-400',
    },
    {
      label: 'Halls',
      value: stats.totalHalls,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
      color: 'text-purple-400',
    },
    {
      label: 'Conflicts',
      value: stats.totalConflicts,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      ),
      color: stats.totalConflicts === 0 ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      label: 'Avg SQI',
      value: stats.avgSQI,
      sub: stats.avgSQI >= 90 ? 'Excellent' : stats.avgSQI >= 70 ? 'Good' : stats.avgSQI >= 50 ? 'Fair' : 'Poor',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      color: stats.avgSQI >= 90 ? 'text-emerald-400' : stats.avgSQI >= 70 ? 'text-amber-400' : 'text-red-400',
    },
    {
      label: 'Algorithm',
      value: algorithm,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      color: 'text-primary-400',
      isText: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-in">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <div className="flex items-center gap-2">
            <span className={item.color}>{item.icon}</span>
            <span className="text-xs text-white/40 font-medium">{item.label}</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${item.color}`}>
            {item.isText ? item.value : item.value}
          </p>
          {item.sub && <p className="text-xs text-white/30">{item.sub}</p>}
        </div>
      ))}
    </div>
  )
}
