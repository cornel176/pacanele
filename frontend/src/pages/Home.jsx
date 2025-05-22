import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "../styles/Home.css";
import Logo from "../assets/images/logo.png";
import SlotImg from "../assets/images/slot-machine.png";
import DiceImg from "../assets/images/dice-roll.png";
import CoinImg from "../assets/images/coin-flip.png";

export default function Home({ balance, setBalance }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const games = [
    { name: "Slot Machine", path: "/slot", image: SlotImg },
    { name: "Dice Roll", path: "/dice", image: DiceImg },
    { name: "Coin Flip", path: "/coin", image: CoinImg },
  ];

  return (
    <div className="home-container">
      {/* Buton Login/Logout */}
      <div className="login-button">
        {isAuthenticated ? (
          <a href="#" onClick={handleLogout}>Logout</a>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>

      {/* Logo */}
      <div className="logo-container">
        <img src={Logo} alt="Casino Logo" className="logo" />
      </div>

      {/* User Info */}
      {isAuthenticated && user && (
        <div style={{ 
          background: '#111', 
          padding: '1rem 2rem', 
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: '0.5rem 0' }}>Welcome, {user.email}</p>
          <p style={{ margin: '0.5rem 0' }}>Balance: ${balance}</p>
        </div>
      )}

      {/* Jocuri */}
      <div className="games-row">
        {games.map((game) => (
          <div
            key={game.name}
            className="game-box"
            onClick={() => navigate(game.path)}
            style={{ cursor: "pointer" }}
          >
            <img src={game.image} alt={game.name} />
            <h3>{game.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
} 