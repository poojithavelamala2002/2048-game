// src/logic/game.js
// Pure game logic for 2048: moves, merging, and spawning tiles.
// No side-effects, no in-place mutations. Always returns new boards.

/**
 * Create a deep copy of a board (array of arrays).
 * We use map + slice to copy rows so original board is untouched.
 */
export function copyBoard(board) {
  return board.map(row => row.slice());
}

/**
 * Returns an array of [r, c] coordinates for empty cells (value === 0).
 */
export function getEmptyCells(board) {
  const empties = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  return empties;
}

/**
 * Random tile value: 90% -> 2, 10% -> 4
 * Accepts rng for deterministic testing (default Math.random).
 */
export function randomTileValue(rng = Math.random) {
  return rng() < 0.9 ? 2 : 4;
}

/**
 * Spawn a random tile (2 or 4) on the given board.
 * Returns a NEW board (does not mutate input).
 * If no empty cell, returns the original board unchanged.
 */
export function spawnRandomTile(board, rng = Math.random) {
  const empties = getEmptyCells(board);
  if (empties.length === 0) return board; // nothing to spawn

  const idx = Math.floor(rng() * empties.length);
  const [r, c] = empties[idx];

  const newBoard = copyBoard(board);
  newBoard[r][c] = randomTileValue(rng);
  return newBoard;
}

/**
 * Helper: compress a line (remove zeros)
 * Example: [2,0,2,4] -> [2,2,4]
 */
function compress(line) {
  return line.filter(v => v !== 0);
}

/**
 * Merge a single line (left-oriented).
 * Returns:
 *  - newLine: merged line padded with zeros to original length
 *  - scoreGain: sum of produced merged values (for score)
 *
 * Rules:
 *  - Slide non-zero values to the left (compress)
 *  - Merge adjacent equal tiles (left-to-right) and skip merged tile
 *  - Each tile can merge at most once per move
 */
export function mergeLine(line) {
  const N = line.length;
  const squeezed = compress(line);
  const merged = [];
  let scoreGain = 0;
  let i = 0;

  while (i < squeezed.length) {
    if (i + 1 < squeezed.length && squeezed[i] === squeezed[i + 1]) {
      // Merge pair
      const newVal = squeezed[i] * 2;
      merged.push(newVal);
      scoreGain += newVal;
      i += 2; // skip the next tile because it's merged
    } else {
      // No merge, just push this tile
      merged.push(squeezed[i]);
      i += 1;
    }
  }

  // Pad with zeros to restore length
  while (merged.length < N) merged.push(0);

  return { newLine: merged, scoreGain };
}

/**
 * Helper: reverse each row of a board (used for right moves).
 * Returns a new board.
 */
function reverseBoardRows(board) {
  return board.map(row => {
    const newRow = row.slice();
    newRow.reverse();
    return newRow;
  });
}

/**
 * Helper: transpose board (rows <-> columns).
 * Returns a new board.
 */
function transpose(board) {
  const N = board.length;
  const newBoard = createEmptyBoard(N);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      newBoard[c][r] = board[r][c];
    }
  }
  return newBoard;
}

/**
 * Create an empty NxN board filled with zeros
 */
export function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/**
 * Compare two boards for equality (used to detect if move changed board)
 */
export function boardsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

/**
 * Core move operation for left direction.
 * - Applies mergeLine to each row (left-oriented)
 * - Returns { board: newBoard, moved: boolean, scoreGain: number }
 *
 * Important: does not spawn a random tile. Caller should spawn if moved=true.
 */
export function moveLeft(board) {
  const N = board.length;
  const newBoard = copyBoard(board);
  let totalScoreGain = 0;

  for (let r = 0; r < N; r++) {
    const row = board[r].slice();
    const { newLine, scoreGain } = mergeLine(row);
    newBoard[r] = newLine;
    totalScoreGain += scoreGain;
  }

  const moved = !boardsEqual(board, newBoard);
  return { board: newBoard, moved, scoreGain: totalScoreGain };
}

/**
 * Move right:
 * - Reverse rows, apply mergeLine (left logic), then reverse rows back.
 */
export function moveRight(board) {
  // Reverse rows, move left, then reverse back
  const reversed = reverseBoardRows(board);
  const { board: movedBoard, moved, scoreGain } = moveLeft(reversed);
  const restored = reverseBoardRows(movedBoard);
  return { board: restored, moved, scoreGain };
}

/**
 * Move up:
 * - Transpose (so columns become rows), move left, transpose back.
 */
export function moveUp(board) {
  const transposed = transpose(board);
  const { board: movedBoard, moved, scoreGain } = moveLeft(transposed);
  const restored = transpose(movedBoard);
  return { board: restored, moved, scoreGain };
}

/**
 * Move down:
 * - Transpose, reverse rows -> use right logic, then restore
 * Simpler: transpose -> moveRight -> transpose back
 */
export function moveDown(board) {
  const transposed = transpose(board);
  const { board: movedBoard, moved, scoreGain } = moveRight(transposed);
  const restored = transpose(movedBoard);
  return { board: restored, moved, scoreGain };
}


export function initBoard(size = 4) {
  let board = createEmptyBoard(size);
  board = spawnRandomTile(board);
  board = spawnRandomTile(board);
  return board;
}