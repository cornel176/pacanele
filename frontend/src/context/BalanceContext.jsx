import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BalanceContext = createContext();

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch initial balance when user logs in
      fetch('/api/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.user) {
            setBalance(data.user.balance);
          }
        })
        .catch(err => {
          console.error('Error fetching balance:', err);
          // Set a default balance if fetch fails
          setBalance(0);
        });
    }
  }, [user]);

  const updateBalance = async (amount) => {
    try {
      const response = await fetch('/api/update-balance', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBalance(data.newBalance);
      return data.newBalance;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  return (
    <BalanceContext.Provider value={{ balance, setBalance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}; 