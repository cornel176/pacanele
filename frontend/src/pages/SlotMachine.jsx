import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SlotMachine.css";

import cherry from "../assets/images/slot-symbols/cherry.png";
import lemon from "../assets/images/slot-symbols/lemon.png";
import orange from "../assets/images/slot-symbols/orange.png";
import grape from "../assets/images/slot-symbols/grape.png";
import watermelon from "../assets/images/slot-symbols/watermelon.png";
import seven from "../assets/images/slot-symbols/seven.png";
import money from "../assets/images/slot-symbols/money.png";
import bell from "../assets/images/slot-symbols/bell.png";

const symbols = [cherry, lemon, orange, grape, watermelon, seven, money, bell];
const WIN_REWARD_MULTIPLIER = 4;

const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const checkWin = (grid) => {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return lines.some(line => line.every(i => grid[i] === grid[line[0]]));
};

const SlotMachine = ({ balance, setBalance }) => {
  const navigate = useNavigate();

  const [grid, setGrid] = useState(Array(9).fill(null).map(() => getRandomSymbol()));
  const [isSpinning, setIsSpinning] = useState(false);
  const [win, setWin] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [message, setMessage] = useState("");
  const [betAmount, setBetAmount] = useState("");

  const spin = () => {
    if (isSpinning) return;

    const bet = parseInt(betAmount, 10);
    if (isNaN(bet) || bet <= 0) {
      setMessage("Introduce o sumă validă pentru pariu!");
      return;
    }
    if (balance < bet) {
      setMessage("Fonduri insuficiente pentru această sumă!");
      return;
    }

    setMessage("");
    setIsSpinning(true);
    setWin(false);
    setLeverPulled(true);
    setBalance(prev => prev - bet);

    const spinDuration = 2500;
    const startTime = Date.now();

    let animationFrameId;
    let frameCount = 0;

    const spinStep = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= spinDuration) {
        animationFrameId && cancelAnimationFrame(animationFrameId);

        const finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
        setGrid(finalGrid);
        setIsSpinning(false);
        setLeverPulled(false);

        const didWin = checkWin(finalGrid);
        setWin(didWin);

        if (didWin) {
          const reward = bet * WIN_REWARD_MULTIPLIER;
          setBalance(prev => prev + reward);
          setMessage(`YOU WIN! Ai câștigat ${reward} lei!`);
        } else {
          setMessage("Mai încearcă!");
        }

        setTimeout(() => setMessage(""), 3000);
        return;
      }

      frameCount++;

      if (frameCount % 5 === 0) {
        setGrid(prevGrid => {
          const matrix = [
            [prevGrid[0], prevGrid[1], prevGrid[2]],
            [prevGrid[3], prevGrid[4], prevGrid[5]],
            [prevGrid[6], prevGrid[7], prevGrid[8]],
          ];

          for(let col=0; col<3; col++) {
            const colSymbols = [matrix[0][col], matrix[1][col], matrix[2][col]];
            const shifted = colSymbols.slice(1).concat(getRandomSymbol());
            matrix[0][col] = shifted[0];
            matrix[1][col] = shifted[1];
            matrix[2][col] = shifted[2];
          }

          return [
            matrix[0][0], matrix[0][1], matrix[0][2],
            matrix[1][0], matrix[1][1], matrix[1][2],
            matrix[2][0], matrix[2][1], matrix[2][2]
          ];
        });
      }

      animationFrameId = requestAnimationFrame(spinStep);
    };

    spinStep();
  };

  const columns = [0,1,2].map(colIndex => [
    grid[colIndex], grid[colIndex+3], grid[colIndex+6]
  ]);

  return (
    <div className="slot-container" style={{ position: "relative" }}>
      <button
        onClick={() => navigate("/")}
        aria-label="Go to homepage"
        className="slot-home-btn"
      >
        Home
      </button>

      <div
        className="slot-lever-container"
        onClick={spin}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") spin(); }}
        aria-pressed={leverPulled}
        aria-label="Pull lever to spin slot machine"
      >
        <div className={`slot-lever ${leverPulled ? "pulled" : ""}`}>
          <div className="slot-lever-ball"></div>
        </div>
      </div>

      <div className="slot-machine-frame">
        <h1 className="slot-title">🎰 Slot Machine</h1>
        <div className="slot-grid">
          {columns.map((col, i) => (
            <div className="slot-column" key={i}>
              {col.map((symbol, idx) => (
                <div
                  key={idx}
                  className={`slot-symbol ${symbol === orange ? "orange" : ""} ${win ? "win" : ""}`}
                >
                  <img src={symbol} alt="slot symbol" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <label htmlFor="betAmount" style={{ marginRight: "0.5rem", fontWeight: "bold" }}>
            Suma pariată:
          </label>
          <input
            id="betAmount"
            type="number"
            min="1"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={isSpinning}
            style={{ width: "100px", padding: "0.3rem", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {message && <div className={`win-message ${win ? "win" : ""}`}>{message}</div>}
      </div>
    </div>
  );
};

export default SlotMachine; 