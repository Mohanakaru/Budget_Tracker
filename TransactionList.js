import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Trash2, Edit, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const TransactionList = () => {
  const { transactions, categories, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📝';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#6b7280';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Other';
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      deleteTransaction(transactionId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">View and manage all your transactions</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            Total: {transactions.length} transactions
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterType('all');
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="p-3 rounded-lg text-xl"
                    style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                  >
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{getCategoryName(transaction.category)}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {transactions.length === 0 
                ? "No transactions yet. Add your first transaction to get started!"
                : "No transactions match your search criteria."
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-success-600">
                ${filteredTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-danger-600">
                ${filteredTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList; 