import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-40 flex items-center justify-between rounded-xl bg-emerald-500 p-4 text-white shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <Download size={20} />
            </div>
            <div>
              <p className="font-semibold">অ্যাপটি ইনস্টল করুন</p>
              <p className="text-xs opacity-90">সহজ ব্যবহারের জন্য হোম স্ক্রিনে যোগ করুন</p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-600 shadow-sm active:scale-95 transition-transform"
          >
            ইনস্টল
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
