import { useState, useRef } from 'react'
import { parseCSV } from '../utils/seatingEngine'

const DEPT_COLORS = [
  'from-indigo-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
  'from-fuchsia-500 to-pink-500',
]

export default function CSVUpload({ onDataLoaded, onSampleData }) {
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    setFileName(file.name)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const students = parseCSV(e.target.result)
        if (students.length === 0) {
          setError('No valid student records found in CSV.')
          return
        }
        const depts = [...new Set(students.map(s => s.dept))]
        setPreview({
          total: students.length,
          depts,
          sample: students.slice(0, 5),
        })
        onDataLoaded(students)
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) handleFile(file)
    else setError('Please drop a .csv file')
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragOver
            ? 'border-primary-400 bg-primary-500/10 scale-[1.02]'
            : 'border-white/20 hover:border-primary-400/50 hover:bg-white/5'}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          id="csv-upload-input"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {fileName ? fileName : 'Drop CSV file here or click to browse'}
            </p>
            <p className="text-sm text-white/40 mt-1">
              Required columns: <span className="text-primary-400 font-mono">S. No., Reg. no., Name, Dept, Year</span> · Optional: <span className="text-white/50 font-mono">Marks</span>
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="glass-card p-6 space-y-4 animate-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Data Preview</h3>
            <span className="badge bg-primary-500/20 text-primary-300">{preview.total} students</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {preview.depts.map((dept, i) => (
              <span key={dept} className={`badge bg-gradient-to-r ${DEPT_COLORS[i % DEPT_COLORS.length]} text-white`}>
                {dept}
              </span>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-4 py-2 text-left text-white/50 font-medium">S.No.</th>
                  <th className="px-4 py-2 text-left text-white/50 font-medium">Reg. No.</th>
                  <th className="px-4 py-2 text-left text-white/50 font-medium">Name</th>
                  <th className="px-4 py-2 text-left text-white/50 font-medium">Dept</th>
                  <th className="px-4 py-2 text-left text-white/50 font-medium">Year</th>
                  <th className="px-4 py-2 text-left text-white/50 font-medium">Marks</th>
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((s, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 text-white/70">{s.sno || i + 1}</td>
                    <td className="px-4 py-2 text-white/70 font-mono">{s.id}</td>
                    <td className="px-4 py-2 text-white">{s.name}</td>
                    <td className="px-4 py-2">
                      <span className={`badge bg-gradient-to-r ${DEPT_COLORS[preview.depts.indexOf(s.dept) % DEPT_COLORS.length]} text-white`}>
                        {s.dept}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white/70">{s.year}</td>
                    <td className="px-4 py-2 text-white/70">{s.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Or Separator + Sample */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-sm">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        onClick={onSampleData}
        className="btn-secondary w-full flex items-center justify-center gap-2"
        id="load-sample-btn"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        Load Sample Data (112 Students, 7 Departments)
      </button>
    </div>
  )
}
