import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAI } from '../context/AIContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Mic,
  Camera,
  Trash2,
  Save,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { 
    transactions, 
    categories, 
    getTotalIncome, 
    getTotalExpenses, 
    getBalance,
    getTotalByCategory,
    budgetLimits,
    deleteTransaction,
    isLoading,
    lastSaved
  } = useTransactions();
  
  const { insights, recommendations } = useAI();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Prepare chart data
  const chartData = categories
    .filter(cat => cat.id !== 'income')
    .map(category => {
      const total = getTotalByCategory(category.id);
      const limit = budgetLimits[category.id] || 0;
      const percentage = limit > 0 ? (total / limit * 100) : 0;
      
      return {
        name: category.name,
        amount: total,
        limit,
        percentage: Math.min(percentage, 100),
        color: category.color,
        icon: category.icon
      };
    })
    .filter(item => item.amount > 0);

  const pieData = chartData.map(item => ({
    name: item.name,
    value: item.amount,
    color: item.color
  }));

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📝';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your finances and get AI insights</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Link to="/add" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Link>
          {lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span>Last saved: {format(lastSaved, 'HH:mm:ss')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-success-600">
                ${getTotalIncome().toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-danger-600">
                ${getTotalExpenses().toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-danger-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                ${getBalance().toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.type === 'warning'
                        ? 'bg-warning-50 border-warning-500'
                        : insight.type === 'success'
                        ? 'bg-success-50 border-success-500'
                        : 'bg-primary-50 border-primary-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        insight.type === 'warning'
                          ? 'text-warning-600'
                          : insight.type === 'success'
                          ? 'text-success-600'
                          : 'text-primary-600'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{insight.title}</p>
                        <p className="text-sm text-gray-600">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Add some transactions to get AI insights!
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/voice"
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <div className="p-2 bg-primary-100 rounded-lg">
                <Mic className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Voice Input</p>
                <p className="text-sm text-gray-600">Add transactions by voice</p>
              </div>
            </Link>

            <Link
              to="/scan"
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <div className="p-2 bg-primary-100 rounded-lg">
                <Camera className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Scan Bill</p>
                <p className="text-sm text-gray-600">Extract data from receipts</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-lg text-lg"
                    style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                  >
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{transaction.category}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        deleteTransaction(transaction.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No transactions yet. Add your first transaction to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 