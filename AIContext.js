import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTransactions } from './TransactionContext';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const { transactions, budgetLimits, getTotalByCategory } = useTransactions();
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [spendingPatterns, setSpendingPatterns] = useState({});

  // Analyze spending patterns and generate insights
  const analyzeSpendingPatterns = () => {
    if (transactions.length === 0) return;

    const patterns = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Get current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Analyze category spending
    const categorySpending = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'expense') {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    // Generate insights
    const newInsights = [];
    const newRecommendations = [];

    // Budget overspending alerts
    Object.entries(categorySpending).forEach(([category, amount]) => {
      const limit = budgetLimits[category];
      if (limit && amount > limit) {
        const overspendPercentage = ((amount - limit) / limit * 100).toFixed(1);
        newInsights.push({
          type: 'warning',
          title: 'Budget Overspending',
          message: `You've exceeded your ${category} budget by ${overspendPercentage}%`,
          category,
          amount,
          limit
        });

        newRecommendations.push({
          type: 'reduce',
          category,
          message: `Consider reducing ${category} expenses by $${(amount - limit).toFixed(2)} to stay within budget`,
          priority: 'high'
        });
      }
    });

    // Spending trend analysis
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const lastMonthSpending = {};
    lastMonthTransactions.forEach(t => {
      if (t.type === 'expense') {
        lastMonthSpending[t.category] = (lastMonthSpending[t.category] || 0) + t.amount;
      }
    });

    // Compare with previous month
    Object.entries(categorySpending).forEach(([category, currentAmount]) => {
      const lastAmount = lastMonthSpending[category] || 0;
      const change = currentAmount - lastAmount;
      const changePercentage = lastAmount > 0 ? (change / lastAmount * 100) : 0;

      if (changePercentage > 20) {
        newInsights.push({
          type: 'info',
          title: 'Spending Increase',
          message: `${category} spending increased by ${changePercentage.toFixed(1)}% compared to last month`,
          category,
          change: changePercentage
        });
      } else if (changePercentage < -20) {
        newInsights.push({
          type: 'success',
          title: 'Spending Decrease',
          message: `${category} spending decreased by ${Math.abs(changePercentage).toFixed(1)}% compared to last month`,
          category,
          change: changePercentage
        });
      }
    });

    // High spending alerts
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    Object.entries(categorySpending).forEach(([category, amount]) => {
      const percentage = (amount / totalSpending * 100).toFixed(1);
      if (percentage > 30) {
        newInsights.push({
          type: 'warning',
          title: 'High Category Spending',
          message: `${category} accounts for ${percentage}% of your total spending this month`,
          category,
          percentage: parseFloat(percentage)
        });
      }
    });

    // Savings recommendations
    const totalIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome * 100) : 0;
    
    if (savingsRate < 20) {
      newRecommendations.push({
        type: 'save',
        message: 'Consider increasing your savings rate. Aim for at least 20% of your income.',
        priority: 'medium'
      });
    }

    // Category-specific recommendations
    if (categorySpending.food > 600) {
      newRecommendations.push({
        type: 'reduce',
        category: 'food',
        message: 'Try meal planning and cooking at home to reduce food expenses',
        priority: 'medium'
      });
    }

    if (categorySpending.entertainment > 300) {
      newRecommendations.push({
        type: 'reduce',
        category: 'entertainment',
        message: 'Look for free or low-cost entertainment options',
        priority: 'low'
      });
    }

    setInsights(newInsights);
    setRecommendations(newRecommendations);
    setSpendingPatterns({
      currentMonth: categorySpending,
      lastMonth: lastMonthSpending,
      totalSpending,
      totalIncome,
      savingsRate
    });
  };

  // Generate AI-powered spending forecast
  const generateForecast = () => {
    if (transactions.length < 10) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get last 3 months of data
    const historicalData = [];
    for (let i = 2; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const monthSpending = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      historicalData.push(monthSpending);
    }

    // Simple moving average forecast
    const average = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    const trend = (historicalData[2] - historicalData[0]) / 2;
    
    return {
      forecast: Math.max(0, average + trend),
      confidence: historicalData.length >= 3 ? 'medium' : 'low',
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
    };
  };

  useEffect(() => {
    analyzeSpendingPatterns();
  }, [transactions, budgetLimits]);

  const value = {
    insights,
    recommendations,
    spendingPatterns,
    generateForecast,
    analyzeSpendingPatterns
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}; 