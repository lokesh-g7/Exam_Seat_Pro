import { useState } from 'react';

// Common storage keys for demo DB
const USERS_KEY = 'examseat_pro_users';

function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUser(user) {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function Auth({ onLogin }) {
  const [view, setView] = useState('studentLogin'); 
  // 'studentLogin' | 'studentSignup' | 'adminLogin'

  const [formData, setFormData] = useState({
    name: '',
    id: '', // Used for registration number
    dept: '',
    year: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    // Simple hardcoded admin check
    if (formData.id === 'admin' && formData.password === 'admin123') {
      onLogin({ role: 'admin', name: 'Administrator' });
    } else {
      setError('Invalid admin credentials. (Try admin / admin123)');
    }
  };

  const handleStudentSignup = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const users = getStoredUsers();
    if (users.find(u => u.id === formData.id)) {
      setError('Register number already exists');
      return;
    }
    
    const newUser = {
      role: 'student',
      name: formData.name,
      id: formData.id,
      dept: formData.dept,
      year: formData.year,
      password: formData.password,
    };
    saveUser(newUser);
    onLogin(newUser);
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    const users = getStoredUsers();
    const user = users.find(u => 
      u.id === formData.id && 
      u.dept === formData.dept && 
      u.year === formData.year && 
      u.password === formData.password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid student credentials. Please check register number, department, year, and password.');
    }
  };

  // Determine specific theme class rendering for the auth container
  const isDark = view === 'adminLogin';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDark ? 'bg-surface-950 text-white' : 'bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-200 text-surface-900'}`}>
      
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className={`relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40 shadow-orange-500/10'}`}>
        
        <div className="text-center mb-8">
          <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-4 shadow-lg ${isDark ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-primary-500/20' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/30'}`}>
            EP
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {view === 'adminLogin' ? 'Admin Gateway' : view === 'studentLogin' ? 'Student Portal' : 'Create Account'}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            {view === 'adminLogin' ? 'Sign in to manage seating' : 'Access your exam seat allocation'}
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-3 rounded-lg text-sm flex items-start gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* --- ADMIN LOGIN --- */}
        {view === 'adminLogin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Admin User ID</label>
              <input type="text" name="id" value={formData.id} onChange={handleChange} className="input-field w-full" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field w-full" required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Sign In as Admin</button>
          </form>
        )}

        {/* --- STUDENT LOGIN --- */}
        {view === 'studentLogin' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Register Number</label>
              <input type="text" name="id" value={formData.id} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                <input type="text" name="dept" placeholder="e.g. CSE" value={formData.dept} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Year</label>
                <input type="number" name="year" min="1" max="5" value={formData.year} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all">
              Sign In to Portal
            </button>
          </form>
        )}

        {/* --- STUDENT SIGNUP --- */}
        {view === 'studentSignup' && (
          <form onSubmit={handleStudentSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Register Number</label>
              <input type="text" name="id" value={formData.id} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                <input type="text" name="dept" placeholder="e.g. CSE" value={formData.dept} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Year</label>
                <input type="number" name="year" min="1" max="5" value={formData.year} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Confirm</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all">
              Create Account
            </button>
          </form>
        )}

        {/* --- View Switcher --- */}
        <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200/50'} text-center text-sm`}>
          {view === 'adminLogin' ? (
            <button onClick={() => { setView('studentLogin'); setError(''); }} className="text-primary-400 hover:text-primary-300 transition-colors">
              I'm a student
            </button>
          ) : (
            <div className="space-y-2">
              <div>
                <span className="text-slate-500">
                  {view === 'studentLogin' ? "Don't have an account? " : "Already registered? "}
                </span>
                <button 
                  onClick={() => { setView(view === 'studentLogin' ? 'studentSignup' : 'studentLogin'); setError(''); }} 
                  className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                >
                  {view === 'studentLogin' ? "Sign Up" : "Sign In"}
                </button>
              </div>
              <div>
                <button onClick={() => { setView('adminLogin'); setError(''); }} className="text-slate-400 hover:text-slate-600 font-semibold transition-colors mt-2 text-xs">
                  Admin Login
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
