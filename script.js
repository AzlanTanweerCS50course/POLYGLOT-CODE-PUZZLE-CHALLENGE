// --- State Variables ---
let state = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 represents the empty space
const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let moves = 0;
let isSolving = false;

const boardEl = document.getElementById("board");
const moveCountEl = document.getElementById("move-count");
const statusTextEl = document.getElementById("status-text");
const shuffleBtn = document.getElementById("shuffle-btn");
const solveBtn = document.getElementById("solve-btn");

// --- Initialization ---
function renderBoard() {
  boardEl.innerHTML = "";
  state.forEach((value, index) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (value === 0) {
      tile.classList.add("empty");
    } else {
      tile.textContent = value;
      tile.addEventListener("click", () => handleTileClick(index));
    }
    boardEl.appendChild(tile);
  });
}

// --- Player Move Logic ---
function handleTileClick(index) {
  if (isSolving) return;
  const emptyIndex = state.indexOf(0);
  if (isAdjacent(index, emptyIndex)) {
    swap(index, emptyIndex);
    moves++;
    moveCountEl.textContent = moves;
    renderBoard();
    checkWin();
  }
}

function isAdjacent(idx1, idx2) {
  const row1 = Math.floor(idx1 / 3), col1 = idx1 % 3;
  const row2 = Math.floor(idx2 / 3), col2 = idx2 % 3;
  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

function swap(i, j) {
  [state[i], state[j]] = [state[j], state[i]];
}

function checkWin() {
  if (state.every((val, i) => val === goalState[i])) {
    statusTextEl.textContent = " HURRAY PUZZLE_RESOLVED 🤖";
    statusTextEl.style.color = "#10b981"; // Success Green
  }
}

// --- Shuffle Function ---
function shuffleBoard() {
  moves = 0;
  moveCountEl.textContent = moves;
  statusTextEl.textContent = "SESSION_ACTIVE";
  statusTextEl.style.color = "#38bdf8"; // Tech Cyan
  
  for (let i = 0; i < 30; i++) {
    const emptyIndex = state.indexOf(0);
    const validMoves = getNeighbors(emptyIndex);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    swap(emptyIndex, randomMove);
  }
  renderBoard();
}

shuffleBtn.addEventListener("click", shuffleBoard);

function getNeighbors(index) {
  const neighbors = [];
  const row = Math.floor(index / 3);
  const col = index % 3;

  if (row > 0) neighbors.push(index - 3); // Up
  if (row < 2) neighbors.push(index + 3); // Down
  if (col > 0) neighbors.push(index - 1); // Left
  if (col < 2) neighbors.push(index + 1); // Right
  return neighbors;
}

// --- AI Solver: A* Algorithm ---
solveBtn.addEventListener("click", async () => {
  if (isSolving) return;
  isSolving = true;
  shuffleBtn.disabled = true;
  solveBtn.disabled = true;
  statusTextEl.textContent = "EXECUTING_CALC 🧠";

  const path = solveAStar(state);
  
  if (path) {
    statusTextEl.textContent = "EXECUTING_SEQ ⚙️";
    for (const nextState of path) {
      state = nextState;
      moves++;
      moveCountEl.textContent = moves;
      renderBoard();
      await new Promise(res => setTimeout(res, 250)); // Animation delay
    }
    checkWin();
  }
  
  isSolving = false;
  shuffleBtn.disabled = false;
  solveBtn.disabled = false;
});

// Manhattan Distance Heuristic
function getHeuristic(board) {
  let distance = 0;
  for (let i = 0; i < 9; i++) {
    const val = board[i];
    if (val !== 0) {
      const targetRow = Math.floor((val - 1) / 3);
      const targetCol = (val - 1) % 3;
      const currentRow = Math.floor(i / 3);
      const currentCol = i % 3;
      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }
  }
  return distance;
}

// A* Search Implementation
function solveAStar(initialState) {
  const startKey = initialState.join(",");
  const openSet = [{ board: initialState, path: [], g: 0, f: getHeuristic(initialState) }];
  const closedSet = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const currentKey = current.board.join(",");

    if (currentKey === goalState.join(",")) {
      return current.path;
    }

    closedSet.add(currentKey);

    const emptyIdx = current.board.indexOf(0);
    const neighbors = getNeighbors(emptyIdx);

    for (const nextIdx of neighbors) {
      const nextBoard = [...current.board];
      [nextBoard[emptyIdx], nextBoard[nextIdx]] = [nextBoard[nextIdx], nextBoard[emptyIdx]];
      const nextKey = nextBoard.join(",");

      if (closedSet.has(nextKey)) continue;

      const g = current.g + 1;
      const h = getHeuristic(nextBoard);
      const f = g + h;

      openSet.push({ board: nextBoard, path: [...current.path, nextBoard], g, f });
    }
  }
  return null;
}

// --- Start Game with Shuffled Board ---
shuffleBoard();