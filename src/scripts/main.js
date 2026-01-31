const Gameboard = (function () {
  let boardState = Array(9).fill(null);

  const getBoardState = () => [...boardState];
  const setCell = (index, value) => {
    if (index < 0 || index > 8) return false;
    if (boardState[index]) return false;
    if (value !== 'X' && value !== 'O') return false;

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

  const newGame = (player1Name, player2Name) => {
    player1 = createPlayer(player1Name, 'X');
    player2 = createPlayer(player2Name, 'O');
    currentPlayer = player1;
    winner = null;
    isGameOver = false;
    Gameboard.resetBoardState();
  };

  const rematch = () => {
    if (!player1 || !player2) return;

    currentPlayer = player1;
    winner = null;
    isGameOver = false;
    Gameboard.resetBoardState();
  };

  const play = (index) => {
    if (!currentPlayer || isGameOver) return;

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

  const getCurrentPlayer = () => {
    if (!currentPlayer) return null;
    return {
      name: currentPlayer.name,
      symbol: currentPlayer.getSymbol(),
    };
  };

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
  const boardEl = document.querySelector('.board');
  const boardCellsEl = document.querySelectorAll('.board-cell');
  const startGameBtn = document.querySelector('#start-game-btn');
  const rematchBtn = document.querySelector('#rematch-btn');
  const playerDialog = document.querySelector('#player-dialog');
  const playerForm = document.querySelector('#player-form');
  const cancelBtn = document.querySelector('#cancel-btn');
  const player1Score = document.querySelector('#player1-score');
  const player2Score = document.querySelector('#player2-score');
  const player1Display = document.querySelector('#player1-display');
  const player2Display = document.querySelector('#player2-display');
  const player1Points = document.querySelector('#player1-points');
  const player2Points = document.querySelector('#player2-points');
  const textInfo = document.querySelector('#text-info');

  const renderCells = () => {
    const boardState = Gameboard.getBoardState();
    const { isGameOver } = GameController.getGameStatus();

    boardCellsEl.forEach((cell, index) => {
      cell.textContent = boardState[index];
      cell.disabled = boardState[index] !== null || isGameOver;
    });
  };

  const renderGameState = () => {
    const [player1, player2] = GameController.getPlayersInfo();
    const currentPlayer = GameController.getCurrentPlayer();
    const { isGameOver, winner } = GameController.getGameStatus();

    rematchBtn.disabled = !isGameOver;

    if (!currentPlayer) {
      player1Score.classList.remove('active');
      player2Score.classList.remove('active');
    } else if (currentPlayer.name === player1.name) {
      player1Score.classList.add('active');
      player2Score.classList.remove('active');
    } else {
      player2Score.classList.add('active');
      player1Score.classList.remove('active');
    }

    player1Display.textContent = `${player1.name} (X)`;
    player2Display.textContent = `${player2.name} (O)`;

    player1Points.textContent = player1.score;
    player2Points.textContent = player2.score;

    if (!currentPlayer) {
      textInfo.textContent = 'Please start the game';
    } else if (winner) {
      textInfo.textContent = `${winner.name} (${winner.symbol}) wins the game! 🎉`;
    } else if (isGameOver) {
      textInfo.textContent = "It's a draw!";
    } else {
      textInfo.textContent = `${currentPlayer.name} (${currentPlayer.symbol}) Turn`;
    }
  };

  const render = () => {
    renderCells();
    renderGameState();
  };

  const handleCellClick = (e) => {
    if (!e.target.matches('.board-cell')) return;
    if (!GameController.getCurrentPlayer()) return;

    const cellIndex = Number(e.target.dataset.cellIndex);

    GameController.play(cellIndex);
    render();
  };

  const handleRematchClick = () => {
    GameController.rematch();
    rematchBtn.disabled = true;
    render();
  };

  const handlePlayerFormSubmit = (e) => {
    e.preventDefault();

    const player1Name =
      document.querySelector('#player1-name').value.trim() || 'Player 1';
    const player2Name =
      document.querySelector('#player2-name').value.trim() || 'Player 2';

    GameController.newGame(player1Name, player2Name);
    playerForm.reset();
    playerDialog.close();
    render();
  };

  boardEl.addEventListener('click', handleCellClick);
  startGameBtn.addEventListener('click', (e) => {
    playerDialog.showModal();
  });

  rematchBtn.addEventListener('click', handleRematchClick);

  cancelBtn.addEventListener('click', () => {
    playerForm.reset();
    playerDialog.close();
  });

  playerForm.addEventListener('submit', handlePlayerFormSubmit);
})();
