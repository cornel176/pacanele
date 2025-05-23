import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { BalanceProvider } from './context/BalanceContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import CoinFlip from './pages/CoinFlip';
import DiceRoll from './pages/DiceRoll';
import SlotMachine from './pages/SlotMachine';
import Admin from './pages/Admin';
import BalanceDisplay from './components/BalanceDisplay';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <>
      <BalanceDisplay />
      {children}
    </>
  ) : <Navigate to="/login" />;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.is_admin ? (
    <>
      <BalanceDisplay />
      {children}
    </>
  ) : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <BalanceProvider>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/slot" element={
            <ProtectedRoute>
              <SlotMachine />
            </ProtectedRoute>
          } />
          <Route path="/dice" element={
            <ProtectedRoute>
              <DiceRoll />
            </ProtectedRoute>
          } />
          <Route path="/coin" element={
            <ProtectedRoute>
              <CoinFlip />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </BalanceProvider>
    </BrowserRouter>
  );
}

export default App;
