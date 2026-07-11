let boardState = [];
let currentTurn = 'GOAT';
let goatsLeftToPlace = 20;
let goatsEaten = 0;
let selectedPiece = null;

function showRoleSelection() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}

function startGame(role) {
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    
    // Create 5x5 board data structure
    boardState = Array(5).fill(null).map(() => Array(5).fill(0));
    
    // Place 4 tigers in the corners
    boardState[0][0] = 'TIGER'; 
    boardState[0][4] = 'TIGER';
    boardState[4][0] = 'TIGER'; 
    boardState[4][4] = 'TIGER';
    
    currentTurn = 'GOAT';
    goatsLeftToPlace = 20;
    goatsEaten = 0;
    selectedPiece = null;

    updateUI();
    renderBoard();
}

function backToMenu() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function renderBoard() {
    const gridEl = document.getElementById('board-grid');
    gridEl.innerHTML = ''; 

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.dataset.row = r;
            node.dataset.col = c;
            
            const pieceType = boardState[r][c];
            if (pieceType !== 0) {
                const piece = document.createElement('div');
                piece.className = `piece ${pieceType.toLowerCase()}`;
                piece.innerText = pieceType === 'TIGER' ? '🐅' : '🐐';
                
                if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                    piece.classList.add('selected');
                }
                node.appendChild(piece);
            }
            
            node.addEventListener('click', () => handleNodeClick(r, c));
            gridEl.appendChild(node);
        }
    }
}

function handleNodeClick(r, c) {
    const clickedType = boardState[r][c];

    // PHASE 1: Placement of Goats
    if (currentTurn === 'GOAT' && goatsLeftToPlace > 0) {
        if (clickedType === 0) {
            boardState[r][c] = 'GOAT';
            goatsLeftToPlace--;
            switchTurn();
        }
        return;
    }

    // PHASE 2: Selection of Piece
    if (!selectedPiece) {
        if (clickedType === currentTurn) {
            selectedPiece = { r, c };
            renderBoard();
            showValidMoves(r, c);
        }
        return;
    }

    // PHASE 3: Movement or Deselection
    if (selectedPiece.r === r && selectedPiece.c === c) {
        selectedPiece = null; // Deselect if clicked twice
        renderBoard();
        return;
    }

    if (isValidMove(selectedPiece.r, selectedPiece.c, r, c)) {
        executeMove(selectedPiece.r, selectedPiece.c, r, c);
    } else if (clickedType === currentTurn) {
        // Change selection to another own piece
        selectedPiece = { r, c };
        renderBoard();
        showValidMoves(r, c);
    }
}

function showValidMoves(r, c) {
    const gridEl = document.getElementById('board-grid');
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (isValidMove(r, c, i, j)) {
                const nodeIndex = i * 5 + j;
                gridEl.children[nodeIndex].classList.add('valid-move');
            }
        }
    }
}

function isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r2 - r1);
    const dc = Math.abs(c2 - c1);
    if (dr > 1 || dc > 1) return false;
    
    // Diagonal logic based on standard Baghchal lines
    if (dr === 1 && dc === 1) {
        return (r1 + c1) % 2 === 0;
    }
    return true; // Straight move
}

function isValidMove(r1, c1, r2, c2) {
    if (boardState[r2][c2] !== 0) return false; // Target must be empty
    
    if (isAdjacent(r1, c1, r2, c2)) return true; // Normal adjacent move

    // Tiger jumping logic
    if (boardState[r1][c1] === 'TIGER') {
        const dr = r2 - r1;
        const dc = c2 - c1;
        
        // Straight jump
        if (Math.abs(dr) === 2 && dc === 0) {
            return boardState[r1 + dr/2][c1] === 'GOAT';
        }
        if (Math.abs(dc) === 2 && dr === 0) {
            return boardState[r1][c1 + dc/2] === 'GOAT';
        }
        // Diagonal jump
        if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
            if ((r1 + c1) % 2 === 0) {
                return boardState[r1 + dr/2][c1 + dc/2] === 'GOAT';
            }
        }
    }
    return false;
}

function executeMove(r1, c1, r2, c2) {
    const type = boardState[r1][c1];
    boardState[r2][c2] = type; // Move piece
    boardState[r1][c1] = 0; // Empty old spot

    // Check if a goat was eaten
    if (type === 'TIGER' && (Math.abs(r2 - r1) === 2 || Math.abs(c2 - c1) === 2)) {
        boardState[(r1 + r2) / 2][(c1 + c2) / 2] = 0; // Remove goat
        goatsEaten++;
    }

    selectedPiece = null;
    
    if (!checkWinConditions()) {
        switchTurn();
    }
}

function switchTurn() {
    currentTurn = currentTurn === 'GOAT' ? 'TIGER' : 'GOAT';
    updateUI();
    renderBoard();
}

function updateUI() {
    const turnEl = document.getElementById('turn-indicator');
    if (currentTurn === 'GOAT') {
        turnEl.innerText = '🐐 GOAT';
        turnEl.className = 'font-bold text-blue-600 text-base';
    } else {
        turnEl.innerText = '🐅 TIGER';
        turnEl.className = 'font-bold text-red-600 text-base';
    }
    document.getElementById('goats-left').innerText = goatsLeftToPlace;
    document.getElementById('goats-eaten').innerText = `${goatsEaten} / 5`;
}

function checkWinConditions() {
    if (goatsEaten >= 5) {
        renderBoard(); // Render final move before alert
        setTimeout(() => {
            alert('🐅 बाघले जित्यो! (Tigers Win - 5 Goats Eaten)');
            backToMenu();
        }, 200);
        return true;
    }

    // Check if tigers can move
    let tigerMoves = 0;
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (boardState[r][c] === 'TIGER') {
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 5; j++) {
                        if (isValidMove(r, c, i, j)) tigerMoves++;
                    }
                }
            }
        }
    }

    // Goats win if tigers have 0 moves and all goats are placed
    if (tigerMoves === 0 && goatsLeftToPlace === 0) {
        renderBoard();
        setTimeout(() => {
            alert('🐐 बाख्राले जित्यो! (Goats Win - All Tigers Trapped)');
            backToMenu();
        }, 200);
        return true;
    }

    return false;
}
