import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, ChevronRight, Trash2 } from 'lucide-react';
import { Customer } from '../types';
import { useApp } from '../context/AppContext';

export default function CustomerCard({ 
  customer, 
  onDelete 
}: { 
  customer: Customer;
  onDelete?: (e: React.MouseEvent, id: string, name: string) => void;
}) {
  const { getCustomerBalance } = useApp();
  const balance = getCustomerBalance(customer.id);

  return (
    <div className="group relative">
      <Link
        to={`/customer/${customer.id}`}
        className="flex items-center justify-between rounded-xl bg-card p-4 shadow-lg shadow-slate-950/40 transition-all hover:scale-[1.01] active:scale-[0.98] border border-slate-700/50 pr-12 min-h-[80px]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700 
          text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <User size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white truncate text-sm sm:text-base">{customer.name}</h3>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-400/80">
              <Phone size={10} className="text-emerald-500" />
              <span className="truncate">{customer.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-wider bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              বাকি
            </p>
            <p className={`text-sm sm:text-base font-bold ${balance > 0 ? 'text-rose-400' : balance < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
              ৳{Math.abs(balance).toLocaleString('bn-BD')}
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-600 shrink-0" />
        </div>
      </Link>
      
      {onDelete && (
        <button
          onClick={(e) => onDelete(e, customer.id, customer.name)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-rose-500 transition-colors z-10"
          title="মুছে ফেলুন"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
 );
}
