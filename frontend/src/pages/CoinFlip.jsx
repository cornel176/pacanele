import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cbackground from "../assets/images/cbackground.png";
import "../styles/coinflip.css";

export default function CoinFlip() {
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [userChoice, setUserChoice] = useState(null);
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(1000);
  const coinRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundImage = `url(${cbackground})`;
    document.body.style.backgroundSize = "contain";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundColor = "#1a1a1a";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  const flipCoin = () => {
    if (isFlipping || balance < betAmount || !userChoice) return;

    setIsFlipping(true);
    setResult(null);
    setBalance(prev => prev - betAmount);

    if (coinRef.current) {
      coinRef.current.classList.remove("flip-animation-heads", "flip-animation-tails");
    }

    setTimeout(() => {
      const randomResult = Math.random() < 0.5 ? "heads" : "tails";
      setResult(randomResult);

      if (coinRef.current) {
        coinRef.current.classList.add(
          randomResult === "heads" ? "flip-animation-heads" : "flip-animation-tails"
        );
      }

      setTimeout(() => {
        if (randomResult === userChoice) {
          const winAmount = betAmount * 1.8;
          setBalance(prev => prev + winAmount);
          setHistory(prev =>
            [...prev, { bet: betAmount, result: "win", amount: winAmount }].slice(-5)
          );
        } else {
          setHistory(prev =>
            [...prev, { bet: betAmount, result: "lose", amount: 0 }].slice(-5)
          );
        }
        setIsFlipping(false);
      }, 2000);
    }, 10);
  };

  return (
    <div className="coinflip-container">
      <button className="btn-home" onClick={() => navigate("/")}>
        Home
      </button>

      <div className="game-panel">
        <h1>Coin Flip Game</h1>

        <div className="balance-section">
          <h2>Balance: ${balance.toFixed(2)}</h2>
        </div>

        <div className="bet-controls">
          <label>
            Bet Amount:{" "}
            <input
              type="number"
              value={betAmount}
              onChange={(e) =>
                setBetAmount(
                  Math.max(1, Math.min(balance, Number(e.target.value)))
                )
              }
              min="1"
              max={balance}
              disabled={isFlipping}
            />
          </label>
        </div>

        <div className="coin-choice">
          <button
            className={`choice-btn ${userChoice === "heads" ? "active" : ""}`}
            onClick={() => setUserChoice("heads")}
            disabled={isFlipping}
          >
            Heads
          </button>
          <button
            className={`choice-btn ${userChoice === "tails" ? "active" : ""}`}
            onClick={() => setUserChoice("tails")}
            disabled={isFlipping}
          >
            Tails
          </button>
        </div>

        <button
          className="flip-btn"
          onClick={flipCoin}
          disabled={isFlipping || !userChoice || balance < betAmount}
        >
          {isFlipping ? "Flipping..." : "Flip Coin"}
        </button>
      </div>

      <div id="coin" ref={coinRef}>
        <div className="side-a"></div>
        <div className="side-b"></div>
      </div>

      {result && !isFlipping && (
        <div className="result">
          <h3>Result: {result}</h3>
          {userChoice === result ? (
            <p className="win-message">You won ${(betAmount * 1.8).toFixed(2)}!</p>
          ) : (
            <p className="lose-message">You lost ${betAmount.toFixed(2)}</p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="history-panel">
          <h3>History (last 5):</h3>
          <div className="history-list">
            {history
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className={`history-item ${item.result}`}
                >
                  {item.result === "win"
                    ? `+ $${item.amount.toFixed(2)}`
                    : `- $${item.bet.toFixed(2)}`}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 