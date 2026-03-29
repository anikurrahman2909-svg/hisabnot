import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Customer, Transaction } from '../types';

type Action =
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  customers: [],
  transactions: [],
};

const AppContext = createContext<{
  state: AppState;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getCustomerBalance: (customerId: string) => number;
} | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;
  switch (action.type) {
    case 'ADD_CUSTOMER':
      newState = { ...state, customers: [action.payload, ...state.customers] };
      break;
    case 'UPDATE_CUSTOMER':
      newState = {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
      break;
    case 'DELETE_CUSTOMER':
      newState = {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
        transactions: state.transactions.filter((t) => t.customerId !== action.payload),
      };
      break;
    case 'ADD_TRANSACTION':
      newState = { ...state, transactions: [action.payload, ...state.transactions] };
      break;
    case 'UPDATE_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
      break;
    case 'DELETE_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
      break;
    case 'LOAD_DATA':
      newState = action.payload;
      break;
    default:
      return state;
  }
  localStorage.setItem('hisab_note_data', JSON.stringify(newState));
  return newState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('hisab_note_data');
    if (savedData) {
      try {
        dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
  }, []);

  const addCustomer = (customer: Customer) => dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  const updateCustomer = (customer: Customer) => dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
  const deleteCustomer = (id: string) => dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  const addTransaction = (transaction: Transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  const updateTransaction = (transaction: Transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  const deleteTransaction = (id: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: id });

  const getCustomerBalance = (customerId: string) => {
    return state.transactions
      .filter((t) => t.customerId === customerId)
      .reduce((acc, t) => (t.type === 'due' ? acc + t.amount : acc - t.amount), 0);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getCustomerBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
