const Gameboard = (function () {
  let boardState = Array(9).fill(null);

  const getBoardState = () => [...boardState];
  const setCell = (index, value) => {
    if (index < 0 || index > 8 || boardState[index]) return false;
    boardState[index] = value;
    return true;
  };
  const resetBoardState = () => {
    boardState = Array(9).fill(null);
  };

  return { getBoardState, setCell, resetBoardState };
})();

function createPlayer(name, symbol) {
  let score = 0;

  const getSymbol = () => symbol;
  const getScore = () => score;
  const addScore = () => {
    score += 1;
  };

  return { name, getSymbol, getScore, addScore };
}

const GameController = (function () {
  let player1;
  let player2;
  let currentPlayer;
  let winner;
  let isGameOver;

  const WIN_CONDITIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const newGame = () => {
    player1 = createPlayer('Alpha', 'X');
    player2 = createPlayer('Beta', 'O');
    currentPlayer = player1;
    winner = null;
    isGameOver = false;
    Gameboard.resetBoardState();
  };

  const rematch = () => {
    currentPlayer = player1;
    winner = null;
    isGameOver = false;
    Gameboard.resetBoardState();
  };

  const play = (index) => {
    if (isGameOver) return;

    if (!Gameboard.setCell(index, currentPlayer.getSymbol())) return;
    checkGameStatus();

    if (!isGameOver) {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
    }
  };

  const checkGameStatus = () => {
    const boardState = Gameboard.getBoardState();
    const winningLine = WIN_CONDITIONS.find(
      ([a, b, c]) =>
        boardState[a] &&
        boardState[a] === boardState[b] &&
        boardState[b] === boardState[c],
    );

    if (winningLine) {
      const [a] = winningLine;
      winner = boardState[a] === player1.getSymbol() ? player1 : player2;
      winner.addScore();
      isGameOver = true;
      return;
    }

    if (!boardState.includes(null)) {
      isGameOver = true;
    }
  };

  const getPlayersInfo = () => [
    {
      name: player1.name,
      symbol: player1.getSymbol(),
      score: player1.getScore(),
    },
    {
      name: player2.name,
      symbol: player2.getSymbol(),
      score: player2.getScore(),
    },
  ];

  const getCurrentPlayer = () => ({
    name: currentPlayer.name,
    symbol: currentPlayer.getSymbol(),
  });

  const getGameStatus = () => ({
    isGameOver,
    winner: winner ? { name: winner.name, symbol: winner.getSymbol() } : null,
  });

  return {
    newGame,
    rematch,
    play,
    getPlayersInfo,
    getCurrentPlayer,
    getGameStatus,
  };
})();

const DisplayController = (function () {
  const boardCellsEl = document.querySelectorAll('.board-cell');

  const renderCells = () => {
    const boardState = Gameboard.getBoardState();

    boardCellsEl.forEach((cell, index) => {
      cell.textContent = boardState[index];
    });
  };

  return { renderCells };
})();
