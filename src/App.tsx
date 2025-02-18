import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TradingDashboard } from './pages/TradingDashboard';
import { StockAnalysis } from './pages/StockAnalysis';
import { Auth } from './pages/Auth';
import { AuthCallback } from './pages/AuthCallback';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TradingDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/analysis/:symbol"
              element={
                <PrivateRoute>
                  <StockAnalysis />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;