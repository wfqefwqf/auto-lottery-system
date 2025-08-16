import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LotteryMain from './components/LotteryMain';
import AdminPanel from './components/AdminPanel';
import './styles/fluent.css';

type AppView = 'lottery' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('lottery');

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'lottery' ? (
        <LotteryMain onNavigateToAdmin={() => setCurrentView('admin')} />
      ) : (
        <AdminPanel onNavigateBack={() => setCurrentView('lottery')} />
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Segoe UI, system-ui, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;