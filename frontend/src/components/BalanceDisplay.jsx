import React from 'react';
import { useBalance } from '../context/BalanceContext';
import '../styles/BalanceDisplay.css';

const BalanceDisplay = () => {
  const { balance } = useBalance();

  return (
    <div className="balance-display">
      <span className="balance-label">Balance:</span>
      <span className="balance-amount">${balance.toFixed(2)}</span>
    </div>
  );
};

export default BalanceDisplay; 