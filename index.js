document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const modal = document.getElementById('modal');
    const resultMessage = document.getElementById('result-message');
    const restartButton = document.getElementById('restart-button');
    const size = 8;
    let pieces = [];
    let selectedPiece = null;
    let turn = 'red';

    const createBoard = () => {
        board.innerHTML = '';
        pieces = [];
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if ((row + col) % 2 === 0) {
                    cell.classList.add('white');
                } else {
                    cell.classList.add('black');
                    if (row < 3) {
                        const piece = createPiece('green', row, col);
                        cell.appendChild(piece);
                        pieces.push(piece);
                    } else if (row > 4) {
                        const piece = createPiece('red', row, col);
                        cell.appendChild(piece);
                        pieces.push(piece);
                    }
                }
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
            }
        }
        attachCellEvents();
    };

    const createPiece = (color, row, col) => {
        const piece = document.createElement('div');
        piece.classList.add('piece', color);
        piece.dataset.row = row;
        piece.dataset.col = col;
        if (color === 'red') {
            piece.addEventListener('click', () => selectPiece(piece));
        }
        return piece;
    };

    const selectPiece = (piece) => {
        if (piece.classList.contains(turn)) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
            }
            piece.classList.add('selected');
            selectedPiece = piece;
        }
    };

    const movePiece = (targetCell) => {
        const row = parseInt(targetCell.dataset.row);
        const col = parseInt(targetCell.dataset.col);
        if (selectedPiece && targetCell.classList.contains('black') && !targetCell.hasChildNodes()) {
            const selectedRow = parseInt(selectedPiece.dataset.row);
            const selectedCol = parseInt(selectedPiece.dataset.col);
            const rowDiff = Math.abs(selectedRow - row);
            const colDiff = Math.abs(selectedCol - col);

            if ((rowDiff === 1 && colDiff === 1) || (rowDiff === 2 && colDiff === 2 && canCapture(selectedRow, selectedCol, row, col))) {
                targetCell.appendChild(selectedPiece);
                selectedPiece.dataset.row = row;
                selectedPiece.dataset.col = col;
                if (rowDiff === 2 && colDiff === 2) {
                    capturePiece(selectedRow, selectedCol, row, col);
                }
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
                turn = 'green';
                checkVictory();
                if (turn === 'green') {
                    setTimeout(moveGreenPiece, 500);
                }
            }
        }
    };

    const canCapture = (startRow, startCol, endRow, endCol) => {
        const middleRow = (startRow + endRow) / 2;
        const middleCol = (startCol + endCol) / 2;
        const middleCell = getCell(middleRow, middleCol);
        return middleCell && middleCell.hasChildNodes() && middleCell.firstChild.classList.contains(turn === 'red' ? 'green' : 'red');
    };

    const capturePiece = (startRow, startCol, endRow, endCol) => {
        const middleRow = (startRow + endRow) / 2;
        const middleCol = (startCol + endCol) / 2;
        const middleCell = getCell(middleRow, middleCol);
        if (middleCell && middleCell.hasChildNodes()) {
            const capturedPiece = middleCell.firstChild;
            middleCell.removeChild(capturedPiece);
            const index = pieces.indexOf(capturedPiece);
            if (index > -1) {
                pieces.splice(index, 1);
            }
        }
    };

    const moveGreenPiece = () => {
        const greenPieces = pieces.filter(piece => piece.classList.contains('green'));
        let moved = false;

        for (const piece of greenPieces) {
            const currentRow = parseInt(piece.dataset.row);
            const currentCol = parseInt(piece.dataset.col);
            const directions = [
                { row: 1, col: 1 },
                { row: 1, col: -1 },
                { row: 2, col: 2 },
                { row: 2, col: -2 }
            ];
            for (const dir of directions) {
                const newRow = currentRow + dir.row;
                const newCol = currentCol + dir.col;
                if (isValidMove(newRow, newCol) && (!moved || canCapture(currentRow, currentCol, newRow, newCol))) {
                    const targetCell = getCell(newRow, newCol);
                    targetCell.appendChild(piece);
                    piece.dataset.row = newRow;
                    piece.dataset.col = newCol;
                    if (Math.abs(dir.row) === 2) {
                        capturePiece(currentRow, currentCol, newRow, newCol);
                    }
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }

        turn = 'red';
        checkVictory();
    };

    const isValidMove = (row, col) => {
        if (row < 0 || row >= size || col < 0 || col >= size) {
            return false;
        }
        const targetCell = getCell(row, col);
        return targetCell && targetCell.classList.contains('black') && !targetCell.hasChildNodes();
    };

    const getCell = (row, col) => {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    };

    const checkVictory = () => {
        const redPieces = pieces.filter(piece => piece.classList.contains('red'));
        const greenPieces = pieces.filter(piece => piece.classList.contains('green'));

        if (greenPieces.length === 0) {
            showModal('Você venceu!');
        } else if (redPieces.length === 0) {
            showModal('Você perdeu!');
        }
    };

    const showModal = (message) => {
        resultMessage.textContent = message;
        modal.style.display = 'flex';
    };

    const hideModal = () => {
        modal.style.display = 'none';
        createBoard();
        turn = 'red';
    };

    const attachCellEvents = () => {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', () => movePiece(cell));
        });
    };

    restartButton.addEventListener('click', hideModal);

    createBoard();
});
