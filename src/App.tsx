import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import CustomerDetails from './pages/CustomerDetails';
import OfflineBanner from './components/OfflineBanner';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-background text-slate-200 selection:bg-emerald-500/30">
          <OfflineBanner />
        <div className="mx-auto max-w-5xl min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />
          </Routes>
          
          <footer className="mt-16 pb-16 text-center border-t border-slate-800/50 pt-10">
            <div className="flex flex-col gap-3">
              <p className="text-lg font-black leading-tight bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                ২০২৬-হিসাব নোট আপনার প্রতিষ্ঠানের সমস্ত হিসাবের সঙ্গী-
              </p>
              <p className="text-[11px] uppercase tracking-[0.15em] font-black bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
                মোঃ অনিকুর রহমান রাতুল,ফ্রন্ট-এন্ড ডেভেলপার 
              </p>
            </div>
          </footer>
        </div>
          <InstallPrompt />
        </div>
      </Router>
    </AppProvider>
  );
}
