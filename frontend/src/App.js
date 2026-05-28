import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Home from './pages/Home';
import RewriteCV from './pages/RewriteCV';
import CheckoutPage from './pages/CheckoutPage';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import './styles/global.css';

const queryClient = new QueryClient();

function App() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rewrite" element={token ? <RewriteCV /> : <Navigate to="/" />} />
          <Route path="/checkout" element={token ? <CheckoutPage /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={userRole === 'admin' || userRole === 'owner' ? <Admin /> : <Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
