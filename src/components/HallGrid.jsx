import { useMemo } from 'react'
import { calculateConflicts, ROWS, COLS } from '../utils/seatingEngine'

const DEPT_COLORS_MAP = {}
const PALETTE = [
  { bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', text: 'text-indigo-300', ring: 'ring-indigo-500' },
  { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-300', ring: 'ring-emerald-500' },
  { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300', ring: 'ring-amber-500' },
  { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-300', ring: 'ring-rose-500' },
  { bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-300', ring: 'ring-violet-500' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-300', ring: 'ring-cyan-500' },
  { bg: 'bg-lime-500/20', border: 'border-lime-500/40', text: 'text-lime-300', ring: 'ring-lime-500' },
  { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/40', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500' },
]

function getDeptColor(dept) {
  if (!DEPT_COLORS_MAP[dept]) {
    const idx = Object.keys(DEPT_COLORS_MAP).length % PALETTE.length
    DEPT_COLORS_MAP[dept] = PALETTE[idx]
  }
  return DEPT_COLORS_MAP[dept]
}

export default function HallGrid({ grid, hallIndex, searchTerm, highlightConflicts }) {
  const conflicts = useMemo(() => calculateConflicts(grid), [grid])

  const conflictSeats = useMemo(() => {
    const seats = new Set()
    conflicts.forEach(c => {
      seats.add(`${c.student1.row}-${c.student1.col}`)
      seats.add(`${c.student2.row}-${c.student2.col}`)
    })
    return seats
  }, [conflicts])

  function isSearchMatch(student) {
    if (!searchTerm || !student) return false
    const term = searchTerm.toLowerCase()
    return (
      student.name.toLowerCase().includes(term) ||
      student.dept.toLowerCase().includes(term) ||
      student.id?.toLowerCase().includes(term)
    )
  }

  return (
    <div className="glass-card p-6 animate-in">
      {/* Hall Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-white">
            {hallIndex + 1}
          </div>
          <div>
            <h3 className="font-semibold text-white">Hall {hallIndex + 1}</h3>
            <p className="text-xs text-white/40">
              {grid.flat().filter(Boolean).length} students · {ROWS}×{COLS} layout
            </p>
          </div>
        </div>
        {conflicts.length > 0 && highlightConflicts && (
          <span className="badge bg-red-500/20 text-red-300 border border-red-500/30">
            {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Column Headers */}
      <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: `2rem repeat(${COLS}, 1fr)` }}>
        <div />
        {Array.from({ length: COLS }, (_, c) => (
          <div key={c} className="text-center text-xs text-white/30 font-mono">
            C{c + 1}
          </div>
        ))}
      </div>

      {/* Seat Grid */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `2rem repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: ROWS }, (_, r) => (
          <>
            <div key={`label-${r}`} className="flex items-center justify-center text-xs text-white/30 font-mono">
              R{r + 1}
            </div>
            {Array.from({ length: COLS }, (_, c) => {
              const student = grid[r][c]
              const isConflict = highlightConflicts && conflictSeats.has(`${r + 1}-${c + 1}`)
              const isMatch = isSearchMatch(student)
              const deptColor = student ? getDeptColor(student.dept) : null

              return (
                <div
                  key={`${r}-${c}`}
                  id={`seat-${hallIndex}-${r}-${c}`}
                  className={`seat-cell group relative
                    ${student
                      ? `${deptColor.bg} ${deptColor.border}
                         ${isConflict ? 'ring-2 ring-red-500 border-red-500/50 animate-pulse' : ''}
                         ${isMatch ? 'ring-2 ring-yellow-400 scale-110 z-10 shadow-lg shadow-yellow-400/20' : ''}
                         hover:scale-105 hover:z-10 hover:shadow-lg`
                      : 'bg-white/[0.02] border-white/[0.05]'
                    }
                  `}
                  title={student ? `${student.name} (${student.dept}, Year ${student.year})` : 'Empty'}
                >
                  {student ? (
                    <>
                      <span className={`font-semibold truncate w-full text-center px-0.5 leading-tight ${deptColor.text}`}>
                        {student.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {student.dept}
                      </span>

                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                        <div className="bg-surface-800 border border-white/20 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                          <p className="font-semibold text-white">{student.name}</p>
                          <p className="text-white/50">{student.dept} · Year {student.year} · {student.marks}%</p>
                          <p className="text-white/30 font-mono">Seat {student.seat} · R{student.row}C{student.col}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-white/10 text-lg">·</span>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {[...new Set(grid.flat().filter(Boolean).map(s => s.dept))].map(dept => {
          const color = getDeptColor(dept)
          return (
            <div key={dept} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${color.bg} ${color.border} border`} />
              <span className="text-white/50">{dept}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
