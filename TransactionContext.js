import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const TransactionContext = createContext();

const initialState = {
  transactions: [],
  categories: [
    { id: 'food', name: 'Food & Dining', color: '#ef4444', icon: '🍽️' },
    { id: 'transport', name: 'Transportation', color: '#3b82f6', icon: '🚗' },
    { id: 'entertainment', name: 'Entertainment', color: '#8b5cf6', icon: '🎬' },
    { id: 'shopping', name: 'Shopping', color: '#f59e0b', icon: '🛍️' },
    { id: 'health', name: 'Healthcare', color: '#10b981', icon: '🏥' },
    { id: 'education', name: 'Education', color: '#06b6d4', icon: '📚' },
    { id: 'utilities', name: 'Utilities', color: '#84cc16', icon: '⚡' },
    { id: 'income', name: 'Income', color: '#22c55e', icon: '💰' },
    { id: 'other', name: 'Other', color: '#6b7280', icon: '📝' }
  ],
  budgetLimits: {
    food: 500,
    transport: 300,
    entertainment: 200,
    shopping: 400,
    health: 300,
    education: 500,
    utilities: 200,
    other: 300
  }
};

const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case 'SET_BUDGET_LIMIT':
      return {
        ...state,
        budgetLimits: {
          ...state.budgetLimits,
          [action.payload.category]: action.payload.amount
        }
      };
    
    case 'LOAD_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };
    
    default:
      return state;
  }
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: parsed });
        console.log(`Loaded ${parsed.length} transactions from localStorage`);
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('transactions', JSON.stringify(state.transactions));
        setLastSaved(new Date());
        console.log(`Saved ${state.transactions.length} transactions to localStorage`);
      } catch (error) {
        console.error('Error saving transactions to localStorage:', error);
      }
    }
  }, [state.transactions, isLoading]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const deleteTransaction = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const updateTransaction = (transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  const setBudgetLimit = (category, amount) => {
    dispatch({ type: 'SET_BUDGET_LIMIT', payload: { category, amount } });
  };

  const getTransactionsByCategory = (category) => {
    return state.transactions.filter(t => t.category === category);
  };

  const getTotalByCategory = (category) => {
    return state.transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : -t.amount), 0);
  };

  const getTotalIncome = () => {
    return state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getMonthlyTransactions = (month, year) => {
    return state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const value = {
    ...state,
    isLoading,
    lastSaved,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    setBudgetLimit,
    getTransactionsByCategory,
    getTotalByCategory,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getMonthlyTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}; 