import { useState, useEffect } from 'react';

export default function StudentDashboard({ user, onLogout }) {
  const [seatData, setSeatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch seating arrangement from Real-time SQL Database
  useEffect(() => {
    fetch(`http://localhost:3001/api/allocation/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not allocated');
        return res.json();
      })
      .then(data => {
        setSeatData(data);
      })
      .catch(err => {
        setSeatData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-200 flex items-center justify-center">
        <svg className="animate-spin w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-200 text-slate-800 p-6 font-sans">
      
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-orange-400/20 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12 bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
              EP
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-800">Student Portal</h1>
              <p className="text-xs text-slate-500">Welcome, {user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-white/60 hover:bg-white text-slate-700 rounded-lg text-sm font-semibold transition-all shadow-sm">
            Sign Out
          </button>
        </header>

        <main className="grid gap-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl shadow-orange-500/5">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Seating Allocation</h2>
            
            {seatData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-2xl text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                  </div>
                  <p className="text-orange-100 font-medium mb-1">Assigned Hall</p>
                  <p className="text-6xl font-black">{seatData.hall}</p>
                  
                  <div className="mt-8 pt-6 border-t border-orange-300/30 flex justify-between items-end">
                    <div>
                      <p className="text-orange-100 text-sm">Seat Number</p>
                      <p className="text-4xl font-bold">{seatData.seat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-100 text-sm">Position</p>
                      <p className="text-2xl font-semibold font-mono">R{seatData.row} C{seatData.col}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/80 p-5 rounded-2xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-400 mb-1">Student Details</p>
                    <p className="text-lg font-bold text-slate-700">{user.name}</p>
                    <p className="text-slate-500">Reg: {user.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 p-5 rounded-2xl border border-slate-100">
                      <p className="text-sm font-semibold text-slate-400 mb-1">Department</p>
                      <p className="text-lg font-bold text-slate-700">{user.dept}</p>
                    </div>
                    <div className="bg-white/80 p-5 rounded-2xl border border-slate-100">
                      <p className="text-sm font-semibold text-slate-400 mb-1">Year</p>
                      <p className="text-lg font-bold text-slate-700">{user.year}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Not Allocated Yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Your seat assignment has not been published or your register number was not found in the recent allocation.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
