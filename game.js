// गेमको डाटा
let boardState = Array(5).fill(null).map(() => Array(5).fill(0));
let currentTurn = 'GOAT';
let goatsLeftToPlace = 20;
let goatsEaten = 0;
let selectedPiece = null;
let myRole = 'GOAT';
let coins = 1500;
let timer = 60;
let timerInterval;

// साउन्ड सिस्टम (Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    if(type === 'move') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'eat') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }
}

function showRoleSelection() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}

function startGame(role) {
    myRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('game-ui').classList.add('flex');
    
    // ४ कुनामा बाघ राख्ने
    boardState[0][0] = 'TIGER'; boardState[0][4] = 'TIGER';
    boardState[4][0] = 'TIGER'; boardState[4][4] = 'TIGER';
    
    updateUI(); renderBoard(); startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timer = 60; document.getElementById('timer-text').innerText = timer + 's';
    timerInterval = setInterval(() => {
        timer--; document.getElementById('timer-text').innerText = timer + 's';
        if(timer <= 0) {
            clearInterval(timerInterval);
            alert(`समय सकियो! ${currentTurn === 'GOAT' ? 'बाघले' : 'बाख्राले'} जित्यो।`);
            location.reload();
        }
    }, 1000);
}

function renderBoard() {
    const grid = document.getElementById('board-grid');
    grid.innerHTML = ''; 
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const node = document.createElement('div');
            node.className = 'node';
            
            if (boardState[r][c] !== 0) {
                const piece = document.createElement('div');
                piece.className = `piece ${boardState[r][c].toLowerCase()}`;
                piece.innerText = boardState[r][c] === 'TIGER' ? '🐅' : '🐐';
                if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) piece.classList.add('selected');
                node.appendChild(piece);
            }
            node.addEventListener('click', () => handleNodeClick(r, c));
            grid.appendChild(node);
        }
    }
}

function handleNodeClick(r, c) {
    const clickedType = boardState[r][c];

    // बाख्रा राख्ने नियम (Phase 1)
    if (currentTurn === 'GOAT' && goatsLeftToPlace > 0) {
        if (clickedType === 0) {
            boardState[r][c] = 'GOAT'; goatsLeftToPlace--;
            playSound('move'); switchTurn();
        }
        return;
    }

    // गोटी छान्ने वा सार्ने
    if (!selectedPiece) {
        if (clickedType === currentTurn) { selectPiece(r, c); }
    } else {
        if (selectedPiece.r === r && selectedPiece.c === c) {
            selectedPiece = null; renderBoard(); // Deselect
        } else if (isValidMove(selectedPiece.r, selectedPiece.c, r, c)) {
            executeMove(selectedPiece.r, selectedPiece.c, r, c);
        } else if (clickedType === currentTurn) {
            selectPiece(r, c); // अर्को आफ्नै गोटी छान्ने
        }
    }
}

function selectPiece(r, c) {
    selectedPiece = { r, c }; renderBoard();
    const grid = document.getElementById('board-grid');
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (isValidMove(r, c, i, j)) {
                grid.children[i * 5 + j].classList.add('valid-move');
            }
        }
    }
}

function isValidMove(r1, c1, r2, c2) {
    if (boardState[r2][c2] !== 0) return false;
    const dr = Math.abs(r2 - r1), dc = Math.abs(c2 - c1);
    
    // नजिकै सार्ने नियम (Straight & Diagonal)
    if (dr <= 1 && dc <= 1) {
        if (dr === 1 && dc === 1) return (r1 + c1) % 2 === 0; // छड्के लाइन छ कि छैन जाँच्ने
        return true;
    }
    // बाघले खाने नियम (Jump)
    if (boardState[r1][c1] === 'TIGER') {
        if ((dr === 2 && dc === 0) || (dc === 2 && dr === 0) || (dr === 2 && dc === 2 && (r1 + c1) % 2 === 0)) {
            return boardState[(r1 + r2) / 2][(c1 + c2) / 2] === 'GOAT';
        }
    }
    return false;
}

function executeMove(r1, c1, r2, c2) {
    const type = boardState[r1][c1];
    boardState[r2][c2] = type; boardState[r1][c1] = 0;

    // बाख्रा खायो कि खाएन जाँच्ने
    if (type === 'TIGER' && (Math.abs(r2 - r1) === 2 || Math.abs(c2 - c1) === 2)) {
        boardState[(r1 + r2) / 2][(c1 + c2) / 2] = 0;
        goatsEaten++; playSound('eat'); showVFX('vfx-blood', '🐐 RIP GOAT');
    } else {
        playSound('move');
    }
    selectedPiece = null;
    if (!checkWin()) switchTurn();
}

function switchTurn() {
    currentTurn = currentTurn === 'GOAT' ? 'TIGER' : 'GOAT';
    updateUI(); renderBoard(); startTimer();
}

function checkWin() {
    if (goatsEaten >= 5) {
        setTimeout(() => { alert('🐅 बाघले जित्यो! (५ बाख्रा खायो)'); coins += 100; location.reload(); }, 300);
        return true;
    }
    let tigerMoves = 0;
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (boardState[r][c] === 'TIGER') {
                for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
                    if (isValidMove(r, c, i, j)) tigerMoves++;
                }
            }
        }
    }
    if (tigerMoves === 0 && goatsLeftToPlace === 0) {
        showVFX('vfx-jail', '🐅 TIGER TRAPPED!');
        setTimeout(() => { alert('🐐 बाख्राले जित्यो! (सबै बाघ थुनिए)'); coins += 150; location.reload(); }, 1000);
        return true;
    }
    return false;
}

function updateUI() {
    const t = document.getElementById('turn-indicator');
    t.innerText = currentTurn === 'GOAT' ? '🐐 GOAT' : '🐅 TIGER';
    t.className = currentTurn === 'GOAT' ? 'font-bold text-blue-600 text-sm' : 'font-bold text-red-600 text-sm';
    document.getElementById('goats-left').innerText = goatsLeftToPlace;
    document.getElementById('goats-eaten').innerText = `${goatsEaten} / 5`;
    document.getElementById('coin-count').innerText = coins;
}

function showVFX(bgClass, text) {
    const vfx = document.getElementById('vfx-layer');
    vfx.className = `absolute inset-0 z-50 flex items-center justify-center text-3xl font-bold transition-opacity duration-300 ${bgClass}`;
    vfx.innerText = text; vfx.style.opacity = '1';
    setTimeout(() => vfx.style.opacity = '0', 1000);
}

function sendChat(msg) {
    const b = document.getElementById('chat-box');
    b.innerText = msg; setTimeout(() => b.innerText = '', 3000);
}

function watchAd() {
    alert("Ad Playing... You earned 50 🪙"); coins += 50; updateUI();
}
