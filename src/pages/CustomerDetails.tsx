import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Phone, Calendar, History, Wallet, ReceiptText, Edit2, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, TransactionType } from '../types';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addTransaction, updateTransaction, deleteTransaction, updateCustomer, deleteCustomer, getCustomerBalance } = useApp();

  const customer = state.customers.find((c) => c.id === id);
  const transactions = state.transactions.filter((t) => t.customerId === id);
  const balance = getCustomerBalance(id || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('due');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Customer State
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({ name: '', phone: '' });

  // Edit Transaction State
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Correction State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'customer' | 'transaction';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'customer',
    id: '',
    title: '',
    message: '',
  });

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-slate-400">গ্রাহক পাওয়া যায়নি</p>
        <Link to="/" className="text-emerald-400 underline">হোমে ফিরে যান</Link>
      </div>
    );
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addTransaction({
      id: crypto.randomUUID(),
      customerId: customer.id,
      type: transactionType,
      amount: parseFloat(amount),
      note: note || (transactionType === 'due' ? 'বাকি' : 'পরিশোধ'),
      date: new Date().toISOString(),
    });

    setAmount('');
    setNote('');
    setIsModalOpen(false);
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer({
      ...customer,
      name: editCustomerData.name,
      phone: editCustomerData.phone,
    });
    setIsEditCustomerModalOpen(false);
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !amount) return;

    updateTransaction({
      ...editingTransaction,
      amount: parseFloat(amount),
      note: note,
      date: new Date(date).toISOString(),
    });

    setAmount('');
    setNote('');
    setEditingTransaction(null);
    setIsEditTransactionModalOpen(false);
  };

  const handleCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBalance = parseFloat(newBalance);
    if (isNaN(targetBalance)) return;

    const diff = targetBalance - balance;
    if (diff === 0) {
      setIsCorrectionModalOpen(false);
      return;
    }

    addTransaction({
      id: crypto.randomUUID(),
      customerId: customer.id,
      type: diff > 0 ? 'due' : 'payment',
      amount: Math.abs(diff),
      note: 'হিসাব সংশোধন',
      date: new Date().toISOString(),
    });

    setNewBalance('');
    setIsCorrectionModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm.type === 'customer') {
      deleteCustomer(deleteConfirm.id);
      navigate('/');
    } else {
      deleteTransaction(deleteConfirm.id);
    }
    setDeleteConfirm({ ...deleteConfirm, isOpen: false });
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">গ্রাহকের বিবরণ</h1>
        <button
          onClick={() => setDeleteConfirm({
            isOpen: true,
            type: 'customer',
            id: customer.id,
            title: 'গ্রাহক মুছে ফেলুন',
            message: 'আপনি কি নিশ্চিত যে আপনি এই গ্রাহক এবং তার সকল হিসাব মুছে ফেলতে চান?',
          })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 active:scale-90 transition-transform"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <section className="rounded-2xl bg-card p-6 shadow-xl shadow-slate-950/50 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
          <button
            onClick={() => {
              setEditCustomerData({ name: customer.name, phone: customer.phone });
              setIsEditCustomerModalOpen(true);
            }}
            className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <Edit2 size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-emerald-400 text-2xl font-bold">
            {customer.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{customer.name}</h2>
            <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
              <Phone size={14} className="text-emerald-500" />
              <span>{customer.phone}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/30 relative group">
            <button
              onClick={() => {
                setNewBalance(Math.abs(balance).toString());
                setIsCorrectionModalOpen(true);
              }}
              className="absolute top-2 right-2 p-1 text-slate-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <RefreshCw size={12} />
            </button>
            <p className="text-[10px] font-black uppercase tracking-wider bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1 flex items-center gap-1">
              <Wallet size={12} className="text-emerald-400" /> মোট হিসাব
            </p>
            <p className={`text-lg font-bold ${balance > 0 ? 'text-rose-400' : balance < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
              ৳ {Math.abs(balance).toLocaleString('bn-BD')}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {balance > 0 ? 'বাকি আছে' : balance < 0 ? 'অতিরিক্ত জমা' : 'হিসাব সমান'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/30">
            <p className="text-[10px] font-black uppercase tracking-wider bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-rose-400" /> শুরুর তারিখ
            </p>
            <p className="text-sm font-semibold text-white">
              {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: bn })}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-white">
            <History size={18} className="text-emerald-400" />
            লেনদেনের ইতিহাস
          </h3>
          <span className="text-xs font-black uppercase tracking-widest bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
            {transactions.length.toLocaleString('bn-BD')} টি লেনদেন
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between rounded-xl bg-card p-4 border border-slate-700/30 shadow-md shadow-slate-950/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.type === 'due' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {t.type === 'due' ? <Plus size={18} /> : <Minus size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.note}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(t.date), 'dd MMM, hh:mm a', { locale: bn })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-bold ${t.type === 'due' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ৳ {t.amount.toLocaleString('bn-BD')}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTransaction(t);
                          setAmount(t.amount.toString());
                          setNote(t.note);
                          setDate(new Date(t.date).toISOString().split('T')[0]);
                          setIsEditTransactionModalOpen(true);
                        }}
                        className="p-1 text-slate-600 hover:text-emerald-400 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({
                          isOpen: true,
                          type: 'transaction',
                          id: t.id,
                          title: 'লেনদেন মুছে ফেলুন',
                          message: 'আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি মুছে ফেলতে চান?',
                        })}
                        className="p-1 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                <ReceiptText size={40} className="opacity-20 mb-2" />
                <p className="text-sm">কোনো লেনদেন নেই</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          onClick={() => {
            setTransactionType('due');
            setAmount('');
            setNote('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 p-4 font-bold text-white shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span>বাকি যোগ</span>
        </button>
        <button
          onClick={() => {
            setTransactionType('payment');
            setAmount('');
            setNote('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 p-4 font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
        >
          <Minus size={20} />
          <span>পরিশোধ</span>
        </button>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={transactionType === 'due' ? 'বাকি যোগ করুন' : 'পরিশোধ যোগ করুন'}
      >
        <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">টাকার পরিমাণ (৳)</label>
            <input
              autoFocus
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="যেমন: ৫০০"
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none text-lg font-bold"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">নোট (ঐচ্ছিক)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: চাল কেনা"
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className={`mt-2 flex items-center justify-center gap-2 rounded-lg p-3 font-bold text-white shadow-md active:scale-95 transition-transform ${transactionType === 'due' ? 'bg-rose-500' : 'bg-emerald-500'}`}
          >
            {transactionType === 'due' ? <Plus size={20} /> : <Minus size={20} />}
            <span>নিশ্চিত করুন</span>
          </button>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditCustomerModalOpen}
        onClose={() => setIsEditCustomerModalOpen(false)}
        title="গ্রাহকের তথ্য পরিবর্তন"
      >
        <form onSubmit={handleUpdateCustomer} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">নাম</label>
            <input
              autoFocus
              type="text"
              required
              value={editCustomerData.name}
              onChange={(e) => setEditCustomerData({ ...editCustomerData, name: e.target.value })}
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">ফোন নম্বর</label>
            <input
              type="tel"
              required
              value={editCustomerData.phone}
              onChange={(e) => setEditCustomerData({ ...editCustomerData, phone: e.target.value })}
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 p-3 font-bold text-white shadow-md active:scale-95 transition-transform"
          >
            <Check size={20} />
            <span>পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={isEditTransactionModalOpen}
        onClose={() => setIsEditTransactionModalOpen(false)}
        title="লেনদেন পরিবর্তন"
      >
        <form onSubmit={handleUpdateTransaction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">টাকার পরিমাণ (৳)</label>
            <input
              autoFocus
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none text-lg font-bold"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">তারিখ</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">নোট</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 p-3 font-bold text-white shadow-md active:scale-95 transition-transform"
          >
            <Check size={20} />
            <span>পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </form>
      </Modal>

      {/* Balance Correction Modal */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="মোট হিসাব সংশোধন"
      >
        <form onSubmit={handleCorrection} className="flex flex-col gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-2">
            <p className="text-xs text-slate-500 mb-1">বর্তমান হিসাব</p>
            <p className="text-xl font-bold text-white">৳ {Math.abs(balance).toLocaleString('bn-BD')}</p>
            <p className="text-[10px] text-slate-400">{balance > 0 ? 'বাকি আছে' : 'অতিরিক্ত জমা'}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">নতুন হিসাব (৳)</label>
            <input
              autoFocus
              type="number"
              required
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="নতুন টাকার পরিমাণ লিখুন"
              className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:border-emerald-500 focus:outline-none text-lg font-bold"
            />
            <p className="text-[10px] text-slate-500 italic">* এটি স্বয়ংক্রিয়ভাবে একটি 'সংশোধন' লেনদেন যোগ করবে।</p>
          </div>
          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 p-3 font-bold text-white shadow-md active:scale-95 transition-transform"
          >
            <RefreshCw size={20} />
            <span>সংশোধন নিশ্চিত করুন</span>
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        title={deleteConfirm.title}
      >
        <div className="flex flex-col gap-6">
          <p className="text-slate-300">{deleteConfirm.message}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
              className="flex-1 rounded-lg bg-slate-800 p-3 font-bold text-white border border-slate-700 active:scale-95 transition-transform"
            >
              না
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 rounded-lg bg-rose-500 p-3 font-bold text-white shadow-md active:scale-95 transition-transform"
            >
              হ্যাঁ, মুছে ফেলুন
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
