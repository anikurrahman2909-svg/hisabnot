export type TransactionType = 'due' | 'payment';

export interface Transaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface AppState {
  customers: Customer[];
  transactions: Transaction[];
}
