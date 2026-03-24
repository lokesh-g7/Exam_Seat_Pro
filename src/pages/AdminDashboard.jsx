import { useState, useCallback, useEffect } from 'react'
import CSVUpload from '../components/CSVUpload'
import HallGrid from '../components/HallGrid'
import Heatmap from '../components/Heatmap'
import SearchBar from '../components/SearchBar'
import ConflictPanel from '../components/ConflictPanel'
import StatsBar from '../components/StatsBar'
import ExportButton from '../components/ExportButton'
import {
  standardSeating,
  marksBasedSeating,
  randomSeating,
  optimizedSeating,
  generateSampleData,
  calculateConflicts,
} from '../utils/seatingEngine'

const ALGORITHMS = [
  { id: 'standard', name: 'Standard', desc: 'Dept grouping + round-robin interleave', icon: '📋' },
  { id: 'marks', name: 'Marks Based', desc: 'Sort by marks + interleave depts', icon: '📊' },
  { id: 'random', name: 'Random', desc: 'Shuffled with dept constraints', icon: '🎲' },
  { id: 'optimized', name: 'Optimized (AI)', desc: 'Iterative swap optimization', icon: '🧠' },
]

const ALGO_MAP = {
  standard: standardSeating,
  marks: marksBasedSeating,
  random: randomSeating,
  optimized: optimizedSeating,
}

const STORAGE_KEY = 'examseat_pro_data'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export default function AdminDashboard({ onLogout }) {
  const [students, setStudents] = useState([])
  const [halls, setHalls] = useState([])
  const [algorithm, setAlgorithm] = useState('standard')
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightConflicts, setHighlightConflicts] = useState(true)
  const [activeTab, setActiveTab] = useState('grid') // grid | heatmap | conflicts
  const [isGenerating, setIsGenerating] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    const saved = loadFromStorage()
    if (saved && saved.students?.length > 0) {
      setStudents(saved.students)
      setAlgorithm(saved.algorithm || 'standard')
      // Re-generate with saved algo
      const fn = ALGO_MAP[saved.algorithm || 'standard']
      setHalls(fn(saved.students))
    }
  }, [])

  const handleDataLoaded = useCallback((data) => {
    setStudents(data)
    setHalls([])
    saveToStorage({ students: data, algorithm })
  }, [algorithm])

  const handleSampleData = useCallback(() => {
    const sample = generateSampleData(112)
    setStudents(sample)
    setHalls([])
    saveToStorage({ students: sample, algorithm })
  }, [algorithm])

  const handleGenerate = useCallback(() => {
    if (students.length === 0) return
    setIsGenerating(true)
    // Use setTimeout to allow UI to show "generating" state
    setTimeout(() => {
      const fn = ALGO_MAP[algorithm]
      const result = fn(students)
      setHalls(result)
      saveToStorage({ students, algorithm })
      setIsGenerating(false)
    }, 100)
  }, [students, algorithm])

  const handleClear = useCallback(() => {
    setStudents([])
    setHalls([])
    setSearchTerm('')
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-glow">
                EP
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Exam<span className="text-gradient">Seat</span> Pro
                </h1>
                <p className="text-xs text-white/30">Intelligent Seating Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {halls.length > 0 && <ExportButton halls={halls} />}
              {students.length > 0 && (
                <button onClick={handleClear} className="btn-secondary text-sm px-4 py-2" id="clear-data-btn">
                  Clear Data
                </button>
              )}
              <button onClick={onLogout} className="btn-secondary text-sm px-4 py-2 border-red-500/50 text-red-300 hover:bg-red-500/20" id="logout-btn">
                Log Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Step 1: Upload */}
          {students.length === 0 && (
            <section className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-4xl font-bold text-white">
                  Smart Exam <span className="text-gradient">Seating</span>
                </h2>
                <p className="text-white/40 text-lg max-w-lg mx-auto">
                  Upload your student data and generate conflict-free seating arrangements with AI-powered optimization.
                </p>
              </div>

              <CSVUpload onDataLoaded={handleDataLoaded} onSampleData={handleSampleData} />
            </section>
          )}

          {/* Step 2: Configure & Generate */}
          {students.length > 0 && halls.length === 0 && (
            <section className="max-w-3xl mx-auto space-y-6 animate-in">
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-bold text-white">Choose Algorithm</h2>
                <p className="text-white/40">
                  {students.length} students loaded · Select a seating algorithm
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALGORITHMS.map((algo) => (
                  <button
                    key={algo.id}
                    id={`algo-${algo.id}-btn`}
                    onClick={() => setAlgorithm(algo.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
                      algorithm === algo.id
                        ? 'bg-primary-500/10 border-primary-500/40 shadow-glow'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{algo.icon}</span>
                      <span className={`font-semibold ${algorithm === algo.id ? 'text-primary-300' : 'text-white'}`}>
                        {algo.name}
                      </span>
                    </div>
                    <p className="text-sm text-white/40">{algo.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
                id="generate-seating-btn"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Generate Seating Arrangement
                  </>
                )}
              </button>
            </section>
          )}

          {/* Step 3: Results */}
          {halls.length > 0 && (() => {
            const totalConflicts = halls.reduce((sum, grid) => sum + calculateConflicts(grid).length, 0);
            
            return (
              <section className="space-y-6 animate-in">
                {/* Stats Bar */}
                <StatsBar
                halls={halls}
                students={students}
                algorithm={ALGORITHMS.find(a => a.id === algorithm)?.name || algorithm}
              />

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1">
                  <SearchBar value={searchTerm} onChange={setSearchTerm} />
                </div>

                <div className="flex items-center gap-3">
                  {/* Tab switches */}
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                    {[
                      { id: 'grid', label: 'Grid View' },
                      { id: 'heatmap', label: 'Heatmap' },
                      { id: 'conflicts', label: 'Conflicts' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}-btn`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-500/20 text-primary-300'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Conflict toggle */}
                  <button
                    onClick={() => setHighlightConflicts(!highlightConflicts)}
                    id="toggle-conflicts-btn"
                    className={`p-2.5 rounded-xl border transition-all duration-200 ${
                      highlightConflicts
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                    title="Toggle conflict highlighting"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  </button>

                  {/* Re-generate */}
                  <button
                    onClick={handleGenerate}
                    className={`text-sm px-4 py-2.5 flex items-center gap-2 transition-all duration-300 ${
                      totalConflicts > 0
                        ? 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-glow shadow-red-500/30 ring-2 ring-red-500/50 animate-pulse-slow'
                        : 'btn-primary'
                    }`}
                    id="regenerate-btn"
                    title={totalConflicts > 0 ? "Fix remaining conflicts" : "Regenerate with same settings"}
                  >
                    <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {totalConflicts > 0 ? `Fix ${totalConflicts} Conflicts` : 'Regenerate'}
                  </button>
                </div>
              </div>

              {/* Active View */}
              {activeTab === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {halls.map((grid, i) => (
                    <HallGrid
                      key={i}
                      grid={grid}
                      hallIndex={i}
                      searchTerm={searchTerm}
                      highlightConflicts={highlightConflicts}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'heatmap' && <Heatmap halls={halls} />}
              {activeTab === 'conflicts' && <ConflictPanel halls={halls} />}
            </section>
            );
          })()}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-white/20 text-sm">
            ExamSeat Pro · Intelligent Seating Arrangement Engine
          </div>
        </footer>
      </div>
    </div>
  )
}
