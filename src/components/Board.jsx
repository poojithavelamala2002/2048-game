import React, { useState, useEffect } from "react";
import Tile from "./Tile";
import { initBoard, spawnRandomTile, moveLeft, moveRight, moveUp, moveDown } from "../logic/game";

function Board() {
  const size = 4;

  const [board, setBoard] = useState(() => initBoard(size));
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing");

  const checkWin = (b) => {
    for (let r = 0; r < b.length; r++) {
      for (let c = 0; c < b[r].length; c++) {
        if (b[r][c] >= 2048) return true;
      }
    }
    return false;
  };

  const canMove = (b) => {
    const N = b.length;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (b[r][c] === 0) return true;
        if (c + 1 < N && b[r][c] === b[r][c + 1]) return true;
        if (r + 1 < N && b[r][c] === b[r + 1][c]) return true;
      }
    }
    return false;
  };

  const restartGame = () => {
    setBoard(initBoard(size));
    setScore(0);
    setStatus("playing");
  };

  function handleMove(direction) {
    if (status !== "playing") return;

    let result;
    if (direction === "left") result = moveLeft(board);
    if (direction === "right") result = moveRight(board);
    if (direction === "up") result = moveUp(board);
    if (direction === "down") result = moveDown(board);

    if (!result) return;

    if (result.moved) {
      const afterSpawn = spawnRandomTile(result.board);
      setBoard(afterSpawn);

      if (result.scoreGain) setScore((s) => s + result.scoreGain);

      if (checkWin(afterSpawn)) {
        setStatus("won");
        return;
      }

      if (!canMove(afterSpawn)) {
        setStatus("lost");
      }
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, status]);

  const boardContainerStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${size}, 80px)`,
    gap: 10,
    padding: 10,
    backgroundColor: "#bbada0",
    borderRadius: 8,
  };

  const gridStyle = {
  display: "grid",
  gridTemplateColumns: `repeat(${size}, 80px)`,
  gap: 10,
};


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#faf8ef",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 20,
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ margin: 0, color: "#776e65" }}>2048</h1>

        <div
          style={{
            backgroundColor: "#bbada0",
            padding: "10px 15px",
            borderRadius: 5,
            textAlign: "center",
            color: "#f9f6f2",
            fontWeight: "bold",
          }}
        >
          <div style={{ fontSize: 12 }}>Score</div>
          <div style={{ fontSize: 18 }}>{score}</div>
        </div>

        <button
          onClick={restartGame}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            border: "none",
            borderRadius: 5,
            backgroundColor: "#8f7a66",
            color: "#f9f6f2",
            fontWeight: "bold",
          }}
        >
          Restart
        </button>
      </div>

      {/* Status messages */}
      {status === "won" && (
        <div style={{ marginBottom: 10, color: "#2e7d32", fontWeight: "bold" }}>
          You Win! 🎉
        </div>
      )}
      {status === "lost" && (
        <div style={{ marginBottom: 10, color: "#c62828", fontWeight: "bold" }}>
          Game Over 😞
        </div>
      )}

      {/* Board */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
  <div style={boardContainerStyle}>
    <div style={gridStyle}>
      {board.flat().map((cell, idx) => (
        <Tile key={idx} value={cell} />
      ))}
    </div>
  </div>
</div>


      {/* Instructions */}
      <div
        style={{
          marginTop: 15,
          color: "#776e65",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        Use arrow keys to move tiles. Merge identical tiles to increase score.
      </div>
    </div>
  );
}

export default Board;
