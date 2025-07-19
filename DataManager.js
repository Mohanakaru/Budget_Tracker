import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const DataManager = () => {
  const { transactions, deleteTransaction, addTransaction } = useTransactions();
  const [importStatus, setImportStatus] = useState(null);

  const exportData = () => {
    const data = {
      transactions,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.transactions && Array.isArray(data.transactions)) {
          // Clear existing transactions
          transactions.forEach(t => deleteTransaction(t.id));
          
          // Import new transactions
          data.transactions.forEach(transaction => {
            // Add transaction back (this will trigger save)
            addTransaction(transaction);
          });
          
          setImportStatus({ type: 'success', message: `Successfully imported ${data.transactions.length} transactions` });
        } else {
          setImportStatus({ type: 'error', message: 'Invalid data format' });
        }
      } catch (error) {
        setImportStatus({ type: 'error', message: 'Error parsing file' });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL transactions? This action cannot be undone!')) {
      transactions.forEach(t => deleteTransaction(t.id));
      setImportStatus({ type: 'success', message: 'All data cleared successfully' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
          <p className="text-gray-600 mt-1">Export, import, and manage your transaction data</p>
        </div>
      </div>

      {/* Status Messages */}
      {importStatus && (
        <div className={`p-4 rounded-lg border ${
          importStatus.type === 'success' 
            ? 'bg-success-50 border-success-200' 
            : 'bg-danger-50 border-danger-200'
        }`}>
          <div className="flex items-center space-x-2">
            {importStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-success-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            )}
            <span className={importStatus.type === 'success' ? 'text-success-700' : 'text-danger-700'}>
              {importStatus.message}
            </span>
          </div>
        </div>
      )}

      {/* Data Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          <div className="text-center p-4 bg-success-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-2xl font-bold text-success-600">
              ${transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-danger-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-danger-600">
              ${transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <p className="text-gray-600 mb-4">
          Download all your transaction data as a JSON file. This creates a backup of your data.
        </p>
        <button
          onClick={exportData}
          disabled={transactions.length === 0}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Data ({transactions.length} transactions)</span>
        </button>
      </div>

      {/* Import Data */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h3>
        <p className="text-gray-600 mb-4">
          Import transaction data from a previously exported JSON file. This will replace all existing data.
        </p>
        <div className="space-y-4">
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="text-xs text-gray-500">
            ⚠️ Warning: Importing will replace all existing transactions
          </p>
        </div>
      </div>

      {/* Clear All Data */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear All Data</h3>
        <p className="text-gray-600 mb-4">
          Permanently delete all transactions. Make sure to export your data first if you want to keep a backup.
        </p>
        <button
          onClick={clearAllData}
          disabled={transactions.length === 0}
          className="btn-secondary flex items-center space-x-2 bg-danger-100 text-danger-700 hover:bg-danger-200"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All Data</span>
        </button>
      </div>

      {/* Data Storage Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Storage Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• <strong>Storage Location:</strong> Browser's Local Storage</p>
          <p>• <strong>Data Persistence:</strong> Automatically saved and restored</p>
          <p>• <strong>Privacy:</strong> Data never leaves your device</p>
          <p>• <strong>Backup:</strong> Use export feature to create backups</p>
          <p>• <strong>Browser Support:</strong> Works in all modern browsers</p>
        </div>
      </div>
    </div>
  );
};

export default DataManager; 