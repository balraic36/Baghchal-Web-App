let boardState = Array(5).fill(null).map(() => Array(5).fill(0));
let currentTurn = 'GOAT';
let playerRole = null; // What the user chose to play as
let coins = 1500;

function startGame(role) {
    playerRole = role;
    document.getElementById('selection-modal').style.display = 'none';
    
    // Reset Board
    boardState = Array(5).fill(null).map(() => Array(5).fill(0));
    boardState[0][0] = 'TIGER'; boardState[0][4] = 'TIGER';
    boardState[4][0] = 'TIGER'; boardState[4][4] = 'TIGER';
    
    currentTurn = 'GOAT'; 
    initBoard();
    updateUIStrings();
}

function initBoard() {
    const boardEl = document.getElementById('board');
    // Remove old nodes to prevent duplicates
    boardEl.querySelectorAll('.node').forEach(n => n.remove());

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.dataset.row = r;
            node.dataset.col = c;
            
            const pieceType = boardState[r][c];
            if (pieceType) {
                const piece = document.createElement('div');
                piece.className = `piece ${pieceType.toLowerCase()}`;
                piece.innerText = pieceType === 'TIGER' ? '🐅' : '🐐';
                node.appendChild(piece);
            }
            
            // Allow click only if it's the player's turn or playing local
            node.addEventListener('click', () => {
                alert(`Clicked on Row ${r}, Col ${c}`);
                // Future Update: Add movement logic here
            });
            boardEl.appendChild(node);
        }
    }
}

function updateUIStrings() {
    document.getElementById('current-turn').innerText = currentTurn;
    document.getElementById('coin-count').innerText = coins.toLocaleString();
}
