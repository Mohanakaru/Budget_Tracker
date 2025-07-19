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
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign,
  Calendar,
  PieChart as PieChartIcon
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const AIInsights = () => {
  const { 
    transactions, 
    categories, 
    getTotalByCategory, 
    getTotalIncome, 
    getTotalExpenses,
    getBalance,
    budgetLimits,
    getMonthlyTransactions
  } = useTransactions();
  
  const { insights, recommendations, spendingPatterns, generateForecast } = useAI();
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Generate spending trend data
  const generateTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthTransactions = getMonthlyTransactions(date.getMonth(), date.getFullYear());
      const totalSpending = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({
        month: format(date, 'MMM'),
        spending: totalSpending,
        income: monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
      });
    }
    return months;
  };

  const trendData = generateTrendData();

  // Category spending vs budget
  const budgetComparisonData = categories
    .filter(cat => cat.id !== 'income')
    .map(category => {
      const spent = getTotalByCategory(category.id);
      const budget = budgetLimits[category.id] || 0;
      const percentage = budget > 0 ? (spent / budget * 100) : 0;
      
      return {
        category: category.name,
        spent,
        budget,
        percentage: Math.min(percentage, 100),
        icon: category.icon,
        color: category.color
      };
    })
    .filter(item => item.spent > 0);

  // Spending forecast
  const forecast = generateForecast();

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-600" />;
      case 'success':
        return <TrendingUp className="h-5 w-5 text-success-600" />;
      case 'info':
        return <Lightbulb className="h-5 w-5 text-primary-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-warning-50 border-warning-500';
      case 'success':
        return 'bg-success-50 border-success-500';
      case 'info':
        return 'bg-primary-50 border-primary-500';
      default:
        return 'bg-gray-50 border-gray-500';
    }
  };

  const getRecommendationPriority = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-danger-600 bg-danger-50';
      case 'medium':
        return 'text-warning-600 bg-warning-50';
      case 'low':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-1">Smart analysis of your spending patterns</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Brain className="h-6 w-6 text-primary-600" />
          <span className="text-sm text-gray-600">AI Powered</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                ${getBalance().toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-primary-600">
                {spendingPatterns.savingsRate ? spendingPatterns.savingsRate.toFixed(1) : '0'}%
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                labelStyle={{ color: '#374151' }}
              />
              <Area 
                type="monotone" 
                dataKey="spending" 
                stackId="1"
                stroke="#ef4444" 
                fill="#fecaca" 
                name="Expenses"
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="2"
                stroke="#22c55e" 
                fill="#bbf7d0" 
                name="Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Actual */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
              <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <p className="font-medium text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600">{insight.message}</p>
                      {insight.percentage && (
                        <p className="text-xs text-gray-500 mt-1">
                          {insight.percentage}% of total spending
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Add more transactions to get AI insights!
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Recommendations</h3>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getRecommendationPriority(rec.priority)}`}>
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{rec.message}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRecommendationPriority(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Great job! No immediate recommendations needed.
            </p>
          )}
        </div>
      </div>

      {/* Spending Forecast */}
      {forecast && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Spending Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Next Month Forecast</p>
              <p className="text-2xl font-bold text-primary-600">
                ${forecast.forecast.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <p className={`text-lg font-semibold ${
                forecast.trend === 'increasing' ? 'text-danger-600' : 
                forecast.trend === 'decreasing' ? 'text-success-600' : 'text-gray-600'
              }`}>
                {forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Confidence</p>
              <p className="text-lg font-semibold text-gray-600 capitalize">
                {forecast.confidence}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This forecast is based on your historical spending patterns. 
              Actual spending may vary based on your financial decisions.
            </p>
          </div>
        </div>
      )}

      {/* Spending Patterns Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Patterns Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Current Month Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(spendingPatterns.currentMonth || {}).map(([category, amount]) => {
                const categoryInfo = categories.find(cat => cat.id === category);
                const percentage = spendingPatterns.totalSpending > 0 
                  ? (amount / spendingPatterns.totalSpending * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{categoryInfo?.icon || '📝'}</span>
                      <span className="text-sm font-medium">{categoryInfo?.name || category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Financial Health Score</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Savings Rate</span>
                  <span>{spendingPatterns.savingsRate ? spendingPatterns.savingsRate.toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(spendingPatterns.savingsRate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Adherence</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Spending Consistency</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights; 