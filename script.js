import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "tictactoe-c96fd.firebaseapp.com",
  databaseURL: "https://tictactoe-c96fd-default-rtdb.firebaseio.com",
  projectId: "tictactoe-c96fd",
  storageBucket: "tictactoe-c96fd.appspot.com",
  messagingSenderId: "265575902183",
  appId: "1:265575902183:web:09c142b9558f98d1572b42",
  measurementId: "G-ETN5WPZM3T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const gameRef = ref(db, "games/tictac-tictactoe");

let player = "";
let gameState = {
  board: Array(9).fill(""),
  currentPlayer: "X",
  winner: null
};

function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.textContent = gameState.board[index];
    cell.classList.remove("disabled");
    if (gameState.board[index] !== "" || gameState.winner) {
      cell.classList.add("disabled");
    }
  });
}

function handleClick(index) {
  if (player !== gameState.currentPlayer || gameState.board[index] || gameState.winner) return;
  gameState.board[index] = player;
  gameState.currentPlayer = player === "X" ? "O" : "X";
  gameState.winner = checkWinner(gameState.board);
  set(gameRef, gameState);
}

function checkWinner(board) {
  const combos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of combos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.includes("") ? null : "Draw";
}

onValue(gameRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    gameState = data;
    renderBoard();
    const status = document.getElementById("status");
    if (gameState.winner) {
      status.textContent = gameState.winner === "Draw"
        ? "It's a draw!" : `Player ${gameState.winner} wins!`;
    } else {
      status.textContent = `Player ${gameState.currentPlayer}'s turn`;
    }
  }
});

function assignPlayer() {
  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      player = "X";
      gameState.currentPlayer = "X";
      set(gameRef, gameState);
    } else {
      const xCount = data.board.filter(c => c === "X").length;
      const oCount = data.board.filter(c => c === "O").length;
      player = xCount <= oCount ? "X" : "O";
    }
    document.getElementById("player").textContent = `You are: ${player}`;
  }, { onlyOnce: true });
}

function resetGame() {
  gameState = {
    board: Array(9).fill(""),
    currentPlayer: "X",
    winner: null
  };
  set(gameRef, gameState);
}

document.addEventListener("DOMContentLoaded", () => {
  assignPlayer();
  document.querySelectorAll(".cell").forEach((cell, index) => {
    cell.addEventListener("click", () => handleClick(index));
  });
  document.getElementById("reset").addEventListener("click", resetGame);
});