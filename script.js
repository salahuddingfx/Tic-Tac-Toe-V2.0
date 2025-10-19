// Enhanced Tic Tac Toe Game with AI Opponent
        class TicTacToe {
            constructor() {
                this.board = Array(9).fill('');
                this.currentPlayer = 'X';
                this.gameActive = false;
                this.gameStarted = false;
                this.gameMode = 'human'; // 'human' or 'ai'
                this.aiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
                this.isAiTurn = false;
                
                this.cells = document.querySelectorAll('.game-cell');
                this.statusElement = document.getElementById('gameStatus');
                this.timerElement = document.getElementById('gameTimer');
                this.startGameButton = document.getElementById('startGameBtn');
                this.newGameButton = document.getElementById('newGameBtn');
                this.resetScoresButton = document.getElementById('resetScoresBtn');
                
                this.scores = { X: 0, O: 0, ties: 0 };
                this.gameStartTime = null;
                this.gameTimer = null;
                this.gameTime = 0;
                
                this.init();
            }

            init() {
                this.cells.forEach(cell => {
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                });
                
                this.startGameButton.addEventListener('click', () => this.startGame());
                this.newGameButton.addEventListener('click', () => this.newGame());
                this.resetScoresButton.addEventListener('click', () => this.resetAllScores());
                
                // Game mode selection
                document.getElementById('humanVsHumanBtn').addEventListener('click', () => this.setGameMode('human'));
                document.getElementById('humanVsAiBtn').addEventListener('click', () => this.setGameMode('ai'));
                
                // AI difficulty selection
                document.querySelectorAll('.difficulty-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.setAiDifficulty(e.target.dataset.difficulty));
                });
                
                this.updateScoreDisplay();
                this.updateTimerDisplay();
                this.updatePlayerLabels();
            }

            setGameMode(mode) {
                this.gameMode = mode;
                
                // Update button states
                document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
                if (mode === 'human') {
                    document.getElementById('humanVsHumanBtn').classList.add('active');
                    document.getElementById('aiDifficultySelection').style.display = 'none';
                } else {
                    document.getElementById('humanVsAiBtn').classList.add('active');
                    document.getElementById('aiDifficultySelection').style.display = 'block';
                }
                
                this.updatePlayerLabels();
                this.resetGame();
            }

            setAiDifficulty(difficulty) {
                this.aiDifficulty = difficulty;
                
                // Update button states
                document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
            }

            updatePlayerLabels() {
                const playerXLabel = document.getElementById('playerXLabel');
                const playerOLabel = document.getElementById('playerOLabel');
                
                if (this.gameMode === 'ai') {
                    playerXLabel.textContent = 'Human (X)';
                    playerOLabel.textContent = 'AI (O)';
                } else {
                    playerXLabel.textContent = 'Player X';
                    playerOLabel.textContent = 'Player O';
                }
            }

            startTimer() {
                this.gameStartTime = Date.now();
                this.gameTime = 0;
                this.gameTimer = setInterval(() => {
                    if (this.gameActive) {
                        this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
                        this.updateTimerDisplay();
                    }
                }, 1000);
            }

            stopTimer() {
                if (this.gameTimer) {
                    clearInterval(this.gameTimer);
                    this.gameTimer = null;
                }
            }

            updateTimerDisplay() {
                const minutes = Math.floor(this.gameTime / 60);
                const seconds = this.gameTime % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                this.timerElement.innerHTML = `<i class="fas fa-clock"></i> Time: ${timeString}`;
            }

            startGame() {
                this.gameActive = true;
                this.gameStarted = true;
                this.currentPlayer = 'X';
                this.isAiTurn = false;
                
                if (this.gameMode === 'ai') {
                    this.statusElement.textContent = `Your Turn (X)`;
                } else {
                    this.statusElement.textContent = `Player ${this.currentPlayer}'s Turn`;
                }
                
                this.startTimer();
                this.startGameButton.disabled = true;
                this.startGameButton.style.opacity = '0.6';
            }

            async handleCellClick(e) {
                const index = parseInt(e.target.dataset.index);
                
                if (this.board[index] !== '' || !this.gameActive || !this.gameStarted || this.isAiTurn) return;
                
                this.makeMove(index, this.currentPlayer);
                
                if (this.checkGameEnd()) return;
                
                // Switch player
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                
                // If it's AI mode and now it's O's turn (AI's turn)
                if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
                    this.isAiTurn = true;
                    this.statusElement.textContent = '🤖 AI is thinking...';
                    
                    // Add thinking animation to a random cell
                    this.addThinkingAnimation();
                    
                    // AI makes move after delay
                    setTimeout(() => {
                        this.makeAiMove();
                        this.removeThinkingAnimation();
                        
                        if (!this.checkGameEnd()) {
                            this.currentPlayer = 'X';
                            this.isAiTurn = false;
                            this.statusElement.textContent = 'Your Turn (X)';
                        }
                    }, 1000 + Math.random() * 1500); // Random delay between 1-2.5 seconds
                } else if (this.gameMode === 'human') {
                    this.statusElement.textContent = `Player ${this.currentPlayer}'s Turn`;
                }
            }

            makeMove(index, player) {
                this.board[index] = player;
                this.cells[index].textContent = player;
                this.cells[index].classList.add(player.toLowerCase());
            }

            addThinkingAnimation() {
                const emptyCells = this.board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
                if (emptyCells.length > 0) {
                    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    this.cells[randomIndex].classList.add('ai-thinking');
                }
            }

            removeThinkingAnimation() {
                this.cells.forEach(cell => cell.classList.remove('ai-thinking'));
            }

            makeAiMove() {
                let move;
                
                switch (this.aiDifficulty) {
                    case 'easy':
                        // 30% chance of making a good move, 70% random
                        move = Math.random() < 0.3 ? this.getBestMove() : this.getRandomMove();
                        break;
                    case 'medium':
                        // 80% chance of making the best move, 20% random for unpredictability
                        move = Math.random() < 0.8 ? this.getBestMove() : this.getRandomMove();
                        break;
                    case 'hard':
                        // Always makes the perfect move using minimax
                        move = this.getBestMove();
                        break;
                    default:
                        move = this.getRandomMove();
                }
                
                if (move !== -1) {
                    this.makeMove(move, 'O');
                }
            }

            getRandomMove() {
                const emptyCells = this.board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
                return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : -1;
            }

            getBestMove() {
                // Use minimax algorithm for perfect play
                return this.minimax(this.board, 'O').index;
            }

            minimax(board, player) {
                const availableSpots = board.map((spot, index) => spot === '' ? index : null).filter(val => val !== null);
                
                // Check for terminal states
                const humanWin = this.checkWinnerForBoard(board, 'X');
                const aiWin = this.checkWinnerForBoard(board, 'O');
                
                if (humanWin) return { score: -10 };
                if (aiWin) return { score: 10 };
                if (availableSpots.length === 0) return { score: 0 };
                
                const moves = [];
                
                for (let i = 0; i < availableSpots.length; i++) {
                    const move = {};
                    move.index = availableSpots[i];
                    board[availableSpots[i]] = player;
                    
                    if (player === 'O') {
                        const result = this.minimax(board, 'X');
                        move.score = result.score;
                    } else {
                        const result = this.minimax(board, 'O');
                        move.score = result.score;
                    }
                    
                    board[availableSpots[i]] = '';
                    moves.push(move);
                }
                
                let bestMove;
                if (player === 'O') {
                    let bestScore = -10000;
                    for (let i = 0; i < moves.length; i++) {
                        if (moves[i].score > bestScore) {
                            bestScore = moves[i].score;
                            bestMove = i;
                        }
                    }
                } else {
                    let bestScore = 10000;
                    for (let i = 0; i < moves.length; i++) {
                        if (moves[i].score < bestScore) {
                            bestScore = moves[i].score;
                            bestMove = i;
                        }
                    }
                }
                
                return moves[bestMove];
            }

            checkWinnerForBoard(board, player) {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];

                return winPatterns.some(pattern => {
                    const [a, b, c] = pattern;
                    return board[a] === player && board[b] === player && board[c] === player;
                });
            }

            checkGameEnd() {
                if (this.checkWinner()) {
                    this.scores[this.currentPlayer]++;
                    
                    let winMessage;
                    if (this.gameMode === 'ai') {
                        winMessage = this.currentPlayer === 'X' ? 
                            `🎉 You Win! (${this.formatTime(this.gameTime)})` : 
                            `🤖 AI Wins! (${this.formatTime(this.gameTime)})`;
                    } else {
                        winMessage = `🎉 Player ${this.currentPlayer} Wins! (${this.formatTime(this.gameTime)})`;
                    }
                    
                    this.statusElement.innerHTML = winMessage;
                    this.gameActive = false;
                    this.stopTimer();
                    this.highlightWinningCells();
                    this.disableCells();
                    this.updateScoreDisplay();
                    this.enableStartButton();
                    return true;
                } else if (this.board.every(cell => cell !== '')) {
                    this.scores.ties++;
                    this.statusElement.innerHTML = `🤝 It's a Tie! (${this.formatTime(this.gameTime)})`;
                    this.gameActive = false;
                    this.stopTimer();
                    this.disableCells();
                    this.updateScoreDisplay();
                    this.enableStartButton();
                    return true;
                }
                return false;
            }

            enableStartButton() {
                this.startGameButton.disabled = false;
                this.startGameButton.style.opacity = '1';
            }

            formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }

            checkWinner() {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];

                this.winningPattern = winPatterns.find(pattern => {
                    const [a, b, c] = pattern;
                    return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
                });

                return this.winningPattern;
            }

            highlightWinningCells() {
                if (this.winningPattern) {
                    this.winningPattern.forEach(index => {
                        this.cells[index].classList.add('winning');
                    });
                }
            }

            updateScoreDisplay() {
                document.getElementById('scoreX').textContent = this.scores.X;
                document.getElementById('scoreO').textContent = this.scores.O;
                document.getElementById('scoreTies').textContent = this.scores.ties;
            }

            resetGame() {
                this.stopTimer();
                this.board = Array(9).fill('');
                this.currentPlayer = 'X';
                this.gameActive = false;
                this.gameStarted = false;
                this.isAiTurn = false;
                this.statusElement.innerHTML = '🎮 Choose game mode and click "Start Game"!';
                this.winningPattern = null;
                this.gameTime = 0;
                this.updateTimerDisplay();
                
                this.cells.forEach(cell => {
                    cell.textContent = '';
                    cell.classList.remove('x', 'o', 'winning', 'ai-thinking');
                    cell.disabled = false;
                    cell.style.cursor = 'pointer';
                });
                
                this.enableStartButton();
            }

            newGame() {
                this.resetGame();
                this.startGame();
            }

            disableCells() {
                this.cells.forEach(cell => {
                    cell.disabled = true;
                    cell.style.cursor = 'not-allowed';
                });
            }

            resetAllScores() {
                // Create custom confirmation dialog
                const confirmReset = () => {
                    const modal = document.createElement('div');
                    modal.style.cssText = `
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.8); display: flex; align-items: center;
                        justify-content: center; z-index: 10001; padding: 20px;
                    `;
                    
                    const content = document.createElement('div');
                    content.style.cssText = `
                        background: white; border-radius: 20px; padding: 30px;
                        text-align: center; max-width: 400px; width: 100%;
                    `;
                    
                    content.innerHTML = `
                        <h3 style="margin-bottom: 15px; color: #333;">Reset All Scores?</h3>
                        <p style="margin-bottom: 25px; color: #666;">This will reset all player scores to zero.</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button id="confirmYes" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 15px; cursor: pointer; font-weight: bold;">Yes, Reset</button>
                            <button id="confirmNo" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 15px; cursor: pointer; font-weight: bold;">Cancel</button>
                        </div>
                    `;
                    
                    modal.appendChild(content);
                    document.body.appendChild(modal);
                    
                    document.getElementById('confirmYes').onclick = () => {
                        this.scores = { X: 0, O: 0, ties: 0 };
                        this.updateScoreDisplay();
                        this.resetGame();
                        document.body.removeChild(modal);
                    };
                    
                    document.getElementById('confirmNo').onclick = () => {
                        document.body.removeChild(modal);
                    };
                    
                    modal.onclick = (e) => {
                        if (e.target === modal) {
                            document.body.removeChild(modal);
                        }
                    };
                };
                
                confirmReset();
            }
        }

        // Element SDK Configuration
        const defaultConfig = {
            game_title: "🎮 Ultimate Tic Tac Toe",
            developer_name: "Salah Uddin Kader",
            primary_color: "#667eea",
            secondary_color: "#764ba2",
            font_family: "Segoe UI",
            font_size: 16
        };

        async function render(config) {
            // Update text content
            const gameTitle = document.getElementById('gameTitle');
            if (gameTitle) {
                gameTitle.textContent = config.game_title || defaultConfig.game_title;
            }
            
            const developerName = document.getElementById('developerName');
            if (developerName) {
                developerName.textContent = config.developer_name || defaultConfig.developer_name;
            }
            
            const modalDeveloperName = document.getElementById('modalDeveloperName');
            if (modalDeveloperName) {
                modalDeveloperName.textContent = config.developer_name || defaultConfig.developer_name;
            }

            // Apply colors
            const primaryColor = config.primary_color || defaultConfig.primary_color;
            const secondaryColor = config.secondary_color || defaultConfig.secondary_color;
            
            // Update background gradient
            document.body.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
            
            // Update control buttons gradient
            const controlBtns = document.querySelectorAll('.control-btn:not(.reset-scores)');
            controlBtns.forEach(btn => {
                btn.style.background = `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`;
            });

            // Update mode buttons
            const activeModeBtn = document.querySelector('.mode-btn.active');
            if (activeModeBtn) {
                activeModeBtn.style.background = `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`;
            }

            const activeDifficultyBtn = document.querySelector('.difficulty-btn.active');
            if (activeDifficultyBtn) {
                activeDifficultyBtn.style.background = `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`;
            }

            // Apply font
            const customFont = config.font_family || defaultConfig.font_family;
            const baseFontStack = 'Tahoma, Geneva, Verdana, sans-serif';
            document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;

            // Apply font size
            const baseSize = config.font_size || defaultConfig.font_size;
            document.body.style.fontSize = `${baseSize}px`;
            
            const gameTitle2 = document.querySelector('.game-title');
            if (gameTitle2) {
                gameTitle2.style.fontSize = `${baseSize * 1.875}px`;
            }
            
            const gameSubtitle = document.querySelector('.game-subtitle');
            if (gameSubtitle) {
                gameSubtitle.style.fontSize = `${baseSize * 1.125}px`;
            }
            
            const gameStatus = document.querySelector('.game-status');
            if (gameStatus) {
                gameStatus.style.fontSize = `${baseSize * 1.25}px`;
            }
        }

        function mapToCapabilities(config) {
            return {
                recolorables: [
                    {
                        get: () => config.primary_color || defaultConfig.primary_color,
                        set: (value) => {
                            config.primary_color = value;
                            window.elementSdk.setConfig({ primary_color: value });
                        }
                    },
                    {
                        get: () => config.secondary_color || defaultConfig.secondary_color,
                        set: (value) => {
                            config.secondary_color = value;
                            window.elementSdk.setConfig({ secondary_color: value });
                        }
                    }
                ],
                borderables: [],
                fontEditable: {
                    get: () => config.font_family || defaultConfig.font_family,
                    set: (value) => {
                        config.font_family = value;
                        window.elementSdk.setConfig({ font_family: value });
                    }
                },
                fontSizeable: {
                    get: () => config.font_size || defaultConfig.font_size,
                    set: (value) => {
                        config.font_size = value;
                        window.elementSdk.setConfig({ font_size: value });
                    }
                }
            };
        }

        function mapToEditPanelValues(config) {
            return new Map([
                ["game_title", config.game_title || defaultConfig.game_title],
                ["developer_name", config.developer_name || defaultConfig.developer_name]
            ]);
        }

        // Modal functionality
        function initModal() {
            const developerBtn = document.getElementById('developerBtn');
            const socialModal = document.getElementById('socialModal');
            const closeModal = document.getElementById('closeModal');

            developerBtn.addEventListener('click', () => {
                socialModal.classList.add('show');
            });

            closeModal.addEventListener('click', () => {
                socialModal.classList.remove('show');
            });

            socialModal.addEventListener('click', (e) => {
                if (e.target === socialModal) {
                    socialModal.classList.remove('show');
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && socialModal.classList.contains('show')) {
                    socialModal.classList.remove('show');
                }
            });
        }

        // Initialize everything when page loads
        window.addEventListener('load', () => {
            // Initialize game
            new TicTacToe();
            
            // Initialize modal
            initModal();
        });

        // Initialize Element SDK
        if (window.elementSdk) {
            window.elementSdk.init({
                defaultConfig,
                render,
                mapToCapabilities,
                mapToEditPanelValues
            });
        }

        (function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'990cb3f296b525b1',t:'MTc2MDgzOTQ0Ny4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();