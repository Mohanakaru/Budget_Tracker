import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Mic, 
  Camera, 
  Brain, 
  TrendingUp,
  List,
  Database
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/add', icon: Plus, label: 'Add Transaction' },
    { path: '/transactions', icon: List, label: 'Transactions' },
    { path: '/voice', icon: Mic, label: 'Voice Input' },
    { path: '/scan', icon: Camera, label: 'Scan Bill' },
    { path: '/insights', icon: Brain, label: 'AI Insights' },
    { path: '/data', icon: Database, label: 'Data' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Smart Budget</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 