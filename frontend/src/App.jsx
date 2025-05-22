import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import CoinFlip from './pages/CoinFlip';
import DiceRoll from './pages/DiceRoll';
import SlotMachine from './pages/SlotMachine';
import { useState } from 'react';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [balance, setBalance] = useState(1000);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home balance={balance} setBalance={setBalance} />
            </ProtectedRoute>
          } />
          <Route path="/slot" element={
            <ProtectedRoute>
              <SlotMachine balance={balance} setBalance={setBalance} />
            </ProtectedRoute>
          } />
          <Route path="/dice" element={
            <ProtectedRoute>
              <DiceRoll balance={balance} setBalance={setBalance} />
            </ProtectedRoute>
          } />
          <Route path="/coin" element={
            <ProtectedRoute>
              <CoinFlip balance={balance} setBalance={setBalance} />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
