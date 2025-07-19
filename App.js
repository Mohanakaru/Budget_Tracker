import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import VoiceInput from './components/VoiceInput';
import OCRScanner from './components/OCRScanner';
import AIInsights from './components/AIInsights';
import DataManager from './components/DataManager';
import Navigation from './components/Navigation';
import { TransactionProvider } from './context/TransactionContext';
import { AIProvider } from './context/AIContext';

function App() {
  return (
    <TransactionProvider>
      <AIProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddTransaction />} />
                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/voice" element={<VoiceInput />} />
                <Route path="/scan" element={<OCRScanner />} />
                <Route path="/insights" element={<AIInsights />} />
                <Route path="/data" element={<DataManager />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AIProvider>
    </TransactionProvider>
  );
}

export default App; 