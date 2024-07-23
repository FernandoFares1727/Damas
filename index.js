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
            piece.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPiece(piece);
            });
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
        if (!selectedPiece) return;

        const targetRow = parseInt(targetCell.dataset.row);
        const targetCol = parseInt(targetCell.dataset.col);
        const startRow = parseInt(selectedPiece.dataset.row);
        const startCol = parseInt(selectedPiece.dataset.col);

        if (!targetCell.classList.contains('black') || targetCell.hasChildNodes()) return;

        const rowDiff = Math.abs(targetRow - startRow);
        const colDiff = Math.abs(targetCol - startCol);

        if (isValidMove(startRow, startCol, targetRow, targetCol, rowDiff, colDiff)) {
            if (rowDiff === 2 && colDiff === 2) {
                capturePiece(startRow, startCol, targetRow, targetCol);
            }

            // Move the piece
            targetCell.appendChild(selectedPiece);
            selectedPiece.dataset.row = targetRow;
            selectedPiece.dataset.col = targetCol;
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            turn = 'green';
            checkVictory();
            if (turn === 'green') {
                setTimeout(moveGreenPiece, 500);
            }
        }
    };

    const isValidMove = (startRow, startCol, targetRow, targetCol, rowDiff, colDiff) => {
        const targetCell = getCell(targetRow, targetCol);
        if (!targetCell) return false;

        const isEmpty = !targetCell.hasChildNodes();
        const isForwardMove = (turn === 'red' && targetRow < startRow) ||
                              (turn === 'green' && targetRow > startRow);

        if (rowDiff === 1 && colDiff === 1) {
            return isEmpty && isForwardMove;
        }

        if (rowDiff === 2 && colDiff === 2) {
            return canCapture(startRow, startCol, targetRow, targetCol);
        }

        return false;
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
                if (isValidMove(currentRow, currentCol, newRow, newCol, Math.abs(dir.row), Math.abs(dir.col))) {
                    const targetCell = getCell(newRow, newCol);
                    if (targetCell) {
                        if (targetCell.hasChildNodes()) continue; // Skip if target cell is not empty
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
            }
            if (moved) break;
        }

        turn = 'red';
        checkVictory();
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
