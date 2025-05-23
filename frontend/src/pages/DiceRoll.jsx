import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBalance } from "../context/BalanceContext";
import "../styles/diceroll.css";

const DiceRoll = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(null);
  const [guess, setGuess] = useState("");
  const [wager, setWager] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const { balance, updateBalance } = useBalance();

  const perFace = [
    [-0.1, 0.3, -1], // Face 1
    [-0.1, 0.6, -0.4], // Face 2
    [-0.85, -0.42, 0.73], // Face 3
    [-0.8, 0.3, -0.75], // Face 4
    [0.3, 0.45, 0.9], // Face 5
    [-0.16, 0.6, 0.18], // Face 6
  ];

  const dotsConfig = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 1, 2, 6, 7, 8],
  };

  const renderDots = (num) =>
    [...Array(9)].map((_, i) => (
      <div
        key={i}
        className="dot"
        style={{ visibility: dotsConfig[num].includes(i) ? "visible" : "hidden" }}
      />
    ));

  const rollDice = async () => {
    if (isRolling) return;

    const bet = parseFloat(wager);
    const guessNum = parseInt(guess);

    if (isNaN(bet) || bet <= 0) {
      setResultMsg("Introdu o sumă validă de pariat!");
      return;
    }
    if (bet > balance) {
      setResultMsg("Nu ai destui bani în balanță!");
      return;
    }
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 6) {
      setResultMsg("Alege un număr între 1 și 6!");
      return;
    }

    setIsRolling(true);
    setDiceValue(null);
    setResultMsg("");

    try {
      await updateBalance(-bet);
    } catch (error) {
      setResultMsg("Eroare la actualizarea balanței!");
      setIsRolling(false);
      return;
    }

    const diceElement = document.querySelector(".dice");
    diceElement.classList.add("rolling");

    setTimeout(() => {
      diceElement.classList.remove("rolling");

      const face = Math.floor(Math.random() * 6);
      const [x, y, z] = perFace[face];
      const extraRot = 720;

      diceElement.style.transition = "transform 1s ease-out";
      diceElement.style.transform = `rotate3d(${x}, ${y}, ${z}, ${180 + extraRot}deg)`;

      setDiceValue(face + 1);

      if (face + 1 === guessNum) {
        const won = bet * 4;
        updateBalance(won).then(() => {
          setResultMsg(`Ai ghicit! Ai câștigat $${won.toFixed(2)}!`);
        }).catch(() => {
          setResultMsg("Eroare la actualizarea balanței!");
        });
      } else {
        setResultMsg(`Ai pierdut $${bet.toFixed(2)}. Mai încearcă!`);
      }

      setTimeout(() => setIsRolling(false), 1000);
    }, 2000);
  };

  return (
    <div className="gameWrapper">
      <Link to="/" className="homeBtn">
        Home
      </Link>
      <h1>3D Dice Roll</h1>
      <div className="diceWrap">
        <div className="dice">
          <div className="diceFace front">{renderDots(1)}</div>
          <div className="diceFace up">{renderDots(2)}</div>
          <div className="diceFace left">{renderDots(3)}</div>
          <div className="diceFace right">{renderDots(4)}</div>
          <div className="diceFace bottom">{renderDots(5)}</div>
          <div className="diceFace back">{renderDots(6)}</div>
        </div>
      </div>

      <div className="controller">
        <button onClick={rollDice} disabled={isRolling}>
          {isRolling ? "Rolling..." : "Roll Dice"}
        </button>
      </div>

      {diceValue && <p className="dice-result">Result: {diceValue}</p>}

      <div className="betContainer">
        <label>
          Suma de pariat:{" "}
          <input
            type="number"
            min="1"
            step="any"
            value={wager}
            onChange={(e) => setWager(e.target.value)}
            disabled={isRolling}
          />
        </label>
        <label>
          Alege un număr (1-6):{" "}
          <input
            type="number"
            min="1"
            max="6"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={isRolling}
          />
        </label>
      </div>

      {resultMsg && <p className="resultMsg">{resultMsg}</p>}
    </div>
  );
};

export default DiceRoll; 