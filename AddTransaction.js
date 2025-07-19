import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';

const AddTransaction = () => {
  const { categories, addTransaction } = useTransactions();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      addTransaction(transaction);
      navigate('/');
    }
  };

  const expenseCategories = categories.filter(cat => cat.id !== 'income');
  const incomeCategories = categories.filter(cat => cat.id === 'income');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Transaction</h1>
          <p className="text-gray-600 mt-1">Record your income or expense</p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={handleInputChange}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Expense</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={handleInputChange}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Income</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter transaction description"
              className={`input-field ${errors.description ? 'border-danger-500' : ''}`}
            />
            {errors.description && (
              <p className="text-danger-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`input-field pl-10 ${errors.amount ? 'border-danger-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-danger-600 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`input-field ${errors.category ? 'border-danger-500' : ''}`}
            >
              {formData.type === 'expense' ? (
                expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))
              ) : (
                incomeCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))
              )}
            </select>
            {errors.category && (
              <p className="text-danger-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2 flex-1 justify-center"
            >
              <Save className="h-4 w-4" />
              <span>Save Transaction</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Category Icons Preview */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
            <div
              key={category.id}
              className={`p-4 rounded-lg border-2 transition-colors duration-200 cursor-pointer ${
                formData.category === category.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <p className="font-medium text-gray-900">{category.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddTransaction; 