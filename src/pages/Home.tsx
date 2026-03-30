import React, { useState } from 'react';
import { Plus, Search, UserPlus, Users, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CustomerCard from '../components/CustomerCard';
import Modal from '../components/Modal';
import { motion } from 'motion/react';

export default function Home() {
  const { state, addCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const { getCustomerBalance } = useApp();

  const filteredCustomers = state.customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    
    if (!matchesSearch) return false;

    const balance = getCustomerBalance(c.id);
    if (filter === 'due') return balance > 0;
    if (filter === 'paid') return balance <= 0;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addCustomer({
      id: crypto.randomUUID(),
      name: formData.name,
      phone: formData.phone,
      createdAt: new Date().toISOString(),
    });

    setFormData({ name: '', phone: '' });
    setIsModalOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      id,
      name,
    });
  };

  const confirmDelete = () => {
    deleteCustomer(deleteConfirm.id);
    setDeleteConfirm({ ...deleteConfirm, isOpen: false });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <header className="sticky top-0 z-50 shrink-0 w-full bg-state-950/80
       backdrop-blur-md border-b border-white/5"> 
      
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-slate-900 z-0" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl z-0" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl z-0" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col gap-6 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              হিসাব নোট
            </h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-emerald-400 border border-white/10 backdrop-blur-md">
            <Users size={20} />
          </div>
        </div>
      </header>

      <div className="px-4 flex flex-col gap-6">
        <section className="grid grid-cols-2 gap-4 relative z-20">
        <div className="rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 p-4 shadow-xl border border-emerald-500/20 backdrop-blur-md flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              মোট গ্রাহক
            </span>
          </div>
          <p className="text-2xl font-black text-white">
            {state.customers.length.toLocaleString('bn-BD')} <span className="text-xs font-normal text-slate-400">জন</span>
          </p>
        </div>
        <div className="rounded-2xl bg-linear-to-br from-rose-500/20 to-rose-500/5 p-4 shadow-xl border border-rose-500/20 backdrop-blur-md flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-rose-400" />
            <span className="text-xs font-black uppercase tracking-wider bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              মোট বাকি
            </span>
          </div>
          <p className="text-2xl font-black text-rose-400">
            ৳ {state.transactions.reduce((acc, t) => t.type === 'due' ? acc + t.amount : acc - t.amount, 0).toLocaleString('bn-BD')}
          </p>
        </div>
      </section>

      <div className="relative z-20">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="গ্রাহকের নাম বা ফোন নম্বর খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl bg-card border border-slate-700/50 p-4 pl-12 text-white placeholder:text-slate-500 shadow-xl focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-hide relative z-20">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 min-w-fit whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${filter === 'all' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}
        >
          সব ({state.customers.length})
        </button>
        <button
          onClick={() => setFilter('due')}
          className={`flex-1 min-w-fit whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${filter === 'due' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}
        >
          বাকি আছে ({state.customers.filter(c => getCustomerBalance(c.id) > 0).length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex-1 min-w-fit whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${filter === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}
        >
          পরিশোধিত ({state.customers.filter(c => getCustomerBalance(c.id) <= 0).length})
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-linear-to-b from-emerald-400 to-cyan-500 rounded-full" />
          <h3 className="text-lg font-black bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tight">
            গ্রাহক তালিকা
          </h3>
        </div>
        <div className="h-px flex-1 bg-slate-800/50 ml-4" />
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar relative z-10">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{duration: 0.2}}
              style={{transform:'translateZ(0)'}}
            >
              <CustomerCard 
                customer={customer} 
                onDelete={handleDeleteClick}
              />
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-500">
            <div className="rounded-full bg-slate-800 p-6">
              <Users size={48} className="opacity-20" />
            </div>
            <p className="text-center font-medium">কোনো গ্রাহক পাওয়া যায়নি</p>
          </div>
        )}
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-6 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform z-30"
      >
        <Plus size={28} />
      </button>

      </div>

      {/* New Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="নতুন গ্রাহক যোগ করুন"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">গ্রাহকের নাম</label>
            <input
              autoFocus
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="যেমন: রহিম আহমেদ"
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">ফোন নম্বর</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="যেমন: 017XXXXXXXX"
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 p-3 font-bold text-white shadow-md active:scale-95 transition-transform"
          >
            <UserPlus size={20} />
            <span>গ্রাহক যোগ করুন</span>
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        title="গ্রাহক মুছে ফেলুন"
      >
        <div className="flex flex-col gap-6">
          <p className="text-slate-300">
            আপনি কি নিশ্চিত যে আপনি <span className="font-bold text-white">"{deleteConfirm.name}"</span> এবং তার সকল হিসাব মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
              className="flex-1 rounded-xl bg-slate-800 p-4 font-bold text-white active:scale-95 transition-transform"
            >
              না, থাক
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 rounded-xl bg-rose-500 p-4 font-bold text-white shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
            >
              হ্যাঁ, মুছে ফেলুন
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
