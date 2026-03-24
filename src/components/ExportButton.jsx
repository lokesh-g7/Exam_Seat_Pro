import { flattenHalls } from '../utils/seatingEngine'

export default function ExportButton({ halls }) {
  function exportCSV() {
    const rows = flattenHalls(halls)
    const headers = ['Hall', 'Seat', 'Row', 'Column', 'Name', 'Dept', 'Year', 'Marks', 'ID']
    const csvLines = [
      headers.join(','),
      ...rows.map(r => [r.hall, r.seat, r.row, r.col, r.name, r.dept, r.year, r.marks, r.id].join(','))
    ]
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seating_arrangement_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={exportCSV} className="btn-secondary flex items-center gap-2" id="export-csv-btn">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export CSV
    </button>
  )
}
