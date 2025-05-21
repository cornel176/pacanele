import { useState } from "react";
import { Link } from "react-router-dom";
import "../style/home.css";
import Logo from "../assets/images/logo.png";
import SlotImg from "../assets/images/slot-machine.png";
import DiceImg from "../assets/images/dice-roll.png";
import CoinImg from "../assets/images/coin-flip.png";


export default function Home() {
  const [money, setMoney] = useState(1000);

  const games = [
    { name: "Slot Machine", path: "/slot", image: SlotImg },
    { name: "Dice Roll", path: "/dice", image: DiceImg },
    { name: "Coin Flip", path: "/coin", image: CoinImg },
  ];

  return (
    <div className="home-container">
      {/* Buton Login */}
      <div className="login-button">
        <Link to="/login">Login</Link>
      </div>

      {/* Logo */}
      <div className="logo-container">
        <img src={Logo} alt="Casino Logo" className="logo" />
      </div>

      {/* Jocuri */}
      <div className="games-row">
        {games.map((game) => (
          <Link
            to={game.path}
            key={game.name}
            className="game-box"
            aria-label={`Joacă ${game.name}`}
          >
            <img src={game.image} alt={game.name} />
            <h3>{game.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
