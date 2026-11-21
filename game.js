/**
 * VOCAB ARCADE - MASTER GAME ENGINE
 * Handles:
 * - State Management & LocalStorage Persistence
 * - Circular Letter Wheel with Real-Time SVG Pointer/Touch Connect Line
 * - Crossword Grid Logic & Tile Unlocking
 * - Sleek Auto-Closing TTS Pop-up & Pronunciation Practice
 * - Power-Ups (Magic Wand, Bomb, Magnifier, Shuffle)
 * - Bonus Words Jar (+5 Gems)
 * - Speed Run Mode (60s Arcade)
 * - Mini-Game: Tebak Gambar (Visual Word Guessing)
 * - Daily Vocabulary Quiz
 * - Customization: Profile, Avatars, Theme Shop, Background Archive
 * - 3-Tier Prestigious Certificates with Fireworks Celebration
 * - Ambient Particle System
 */

(function () {
    'use strict';

    // ==========================================
    // 1. STATE & STORAGE MANAGEMENT
    // ==========================================
    const STORAGE_KEY = 'VOCAB_ARCADE_PROGRESS_V1';

    const defaultState = {
        playerName: 'Cendekia',
        avatar: '🧑‍💻',
        title: 'Penjelajah Kata',
        gems: 100,
        wordsFoundTotal: 0,
        bonusWordsFound: [],
        idCompletedLevels: [],
        enCompletedLevels: [],
        currentIdLevel: 1,
        currentEnLevel: 1,
        unlockedThemes: ['theme-neon'],
        activeTheme: 'theme-neon',
        unlockedBackgrounds: [1],
        activeBgStyle: null,
        boosters: { wand: 2, bomb: 1, magnifier: 3 },
        speedrunHighScore: 0,
        tebakGambarIndex: 0,
        lastOnlineClaim: Date.now() - 600000 // Ready to claim initially
    };

    let state = Object.assign({}, defaultState);

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state = Object.assign({}, defaultState, parsed);
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            updateHeaderUI();
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    // ==========================================
    // 2. RUNTIME ACTIVE VARIABLES
    // ==========================================
    let currentLanguage = 'id'; // 'id' or 'en'
    let currentLevelNumber = 1;
    let activeLevelData = null;
    let revealedWords = new Set();
    let selectedLetters = [];
    let isConnecting = false;
    let letterNodes = []; // Coordinates for SVG lines
    let activePopupTimeout = null;
    let speedrunTimerInterval = null;
    let speedrunTimeLeft = 60;
    let speedrunScore = 0;
    let speedrunGems = 0;
    let activeQuizIndex = 0;

    // DOM Elements Cache
    const views = {
        lobby: document.getElementById('view-lobby'),
        selector: document.getElementById('view-selector'),
        game: document.getElementById('view-game'),
        speedrun: document.getElementById('view-speedrun'),
        tebakGambar: document.getElementById('view-tebak-gambar'),
        dailyQuiz: document.getElementById('view-daily-quiz'),
        shop: document.getElementById('view-shop'),
        archive: document.getElementById('view-archive'),
        certificates: document.getElementById('view-certificates')
    };

    // ==========================================
    // 3. AMBIENT PARTICLE BACKGROUND CANVAS
    // ==========================================
    function initAmbientParticles() {
        const canvas = document.getElementById('bg-particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const count = Math.min(45, Math.floor(width / 30));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                color: i % 2 === 0 ? 'rgba(0, 242, 254, ' : 'rgba(255, 0, 127, '
            });
        }

        function render() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.5)';
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(render);
        }
        render();
    }

    // ==========================================
    // 4. FIREWORKS CELEBRATION CANVAS
    // ==========================================
    let fireworksAnimFrame = null;
    function triggerFireworks() {
        const canvas = document.getElementById('fireworks-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;
        Sound.playGrandFanfare();

        const fireworkParticles = [];
        const colors = ['#00f2fe', '#ff007f', '#ffd700', '#00ff88', '#ffffff', '#e056fd'];

        for (let i = 0; i < 180; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            fireworkParticles.push({
                x: width / 2 + (Math.random() - 0.5) * 200,
                y: height / 2.5 + (Math.random() - 0.5) * 150,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2
            });
        }

        cancelAnimationFrame(fireworksAnimFrame);
        function loop() {
            ctx.clearRect(0, 0, width, height);
            let alive = false;
            for (let i = 0; i < fireworkParticles.length; i++) {
                const p = fireworkParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // gravity
                p.alpha -= p.decay;

                if (p.alpha > 0) {
                    alive = true;
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            if (alive) {
                fireworksAnimFrame = requestAnimationFrame(loop);
            } else {
                ctx.clearRect(0, 0, width, height);
            }
        }
        loop();
    }

    // ==========================================
    // 5. VIEW NAVIGATION & TOP UI UPDATES
    // ==========================================
    function switchView(viewKey) {
        Sound.playSelect();
        Object.keys(views).forEach(key => {
            if (views[key]) {
                views[key].classList.remove('active');
            }
        });
        if (views[viewKey]) {
            views[viewKey].classList.add('active');
        }
        updateHeaderUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateHeaderUI() {
        document.getElementById('header-gems-count').textContent = state.gems;
        document.getElementById('header-avatar-icon').textContent = state.avatar;
        document.getElementById('header-profile-name').textContent = state.playerName;
        document.getElementById('header-profile-title').textContent = state.title;

        // Lobby Stats
        const statWords = document.getElementById('lobby-stat-words');
        const statIdLvl = document.getElementById('lobby-stat-id-lvl');
        const statEnLvl = document.getElementById('lobby-stat-en-lvl');
        const statTotal = document.getElementById('lobby-stat-total-solved');

        if (statWords) statWords.textContent = state.wordsFoundTotal;
        if (statIdLvl) statIdLvl.textContent = `${state.idCompletedLevels.length} / 100`;
        if (statEnLvl) statEnLvl.textContent = `${state.enCompletedLevels.length} / 100`;
        if (statTotal) {
            const pct = Math.round(((state.idCompletedLevels.length + state.enCompletedLevels.length) / 200) * 100);
            statTotal.textContent = `${pct}%`;
        }

        // Apply Active Theme
        document.body.className = state.activeTheme || 'theme-neon';
        if (state.activeBgStyle) {
            document.body.style.background = state.activeBgStyle;
        } else {
            document.body.style.background = '';
        }
    }

    // ==========================================
    // 6. ONLINE TIME REWARD CHEST SYSTEM
    // ==========================================
    function initOnlineRewardTimer() {
        const timerDisplay = document.getElementById('chest-timer-display');
        const claimBtn = document.getElementById('btn-claim-chest');
        const claimInterval = 300; // 5 minutes interval for testing and rapid reward loop

        function checkChest() {
            const elapsed = Math.floor((Date.now() - state.lastOnlineClaim) / 1000);
            const remaining = Math.max(0, claimInterval - elapsed);

            if (remaining === 0) {
                timerDisplay.textContent = 'SIAP KLAIM!';
                timerDisplay.style.color = 'var(--neon-green)';
                claimBtn.disabled = false;
                claimBtn.textContent = 'Klaim +30 💎';
            } else {
                const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
                const secs = String(remaining % 60).padStart(2, '0');
                timerDisplay.textContent = `${mins}:${secs}`;
                timerDisplay.style.color = 'var(--neon-gold)';
                claimBtn.disabled = true;
                claimBtn.textContent = 'Menunggu...';
            }
        }

        claimBtn.addEventListener('click', () => {
            state.gems += 30;
            state.lastOnlineClaim = Date.now();
            Sound.playGemCollect();
            saveState();
            checkChest();
            alert('🎉 Selamat! Kamu mendapatkan +30 Gems dari Peti Hadiah Online!');
        });

        setInterval(checkChest, 1000);
        checkChest();
    }

    // ==========================================
    // 7. LEVEL SELECTOR ENGINE
    // ==========================================
    function renderLevelSelector() {
        const container = document.getElementById('level-grid-container');
        container.innerHTML = '';
        const completedList = currentLanguage === 'id' ? state.idCompletedLevels : state.enCompletedLevels;
        const totalLevels = 100;

        for (let i = 1; i <= totalLevels; i++) {
            const tile = document.createElement('div');
            tile.className = 'level-tile';
            tile.textContent = i;

            const isDone = completedList.includes(i);
            const isUnlocked = i === 1 || completedList.includes(i - 1) || isDone;

            if (isDone) {
                tile.classList.add('completed');
            } else if (!isUnlocked) {
                tile.classList.add('locked');
            } else {
                tile.classList.add('current');
            }

            tile.addEventListener('click', () => {
                if (!isUnlocked) {
                    Sound.playError();
                    alert(`Level ${i} masih terkunci! Selesaikan level sebelumnya terlebih dahulu.`);
                    return;
                }
                loadLevel(currentLanguage, i);
            });

            container.appendChild(tile);
        }
    }

    // ==========================================
    // 8. WORD CONNECT GAMEPLAY CORE
    // ==========================================
    function loadLevel(lang, lvl) {
        currentLanguage = lang;
        currentLevelNumber = lvl;
        activeLevelData = GAME_LEVELS[lang][lvl - 1];
        revealedWords.clear();

        // Update UI Info
        document.getElementById('game-active-level-label').textContent = `LEVEL ${lvl}`;
        document.getElementById('game-active-lang-label').textContent = lang === 'id' ? 'Bahasa Indonesia (KBBI)' : 'English (Oxford)';
        document.getElementById('game-gems-count').textContent = state.gems;
        document.getElementById('bonus-jar-count').textContent = `${state.bonusWordsFound.length} Kata`;

        renderCrosswordBoard();
        renderLetterWheel();
        switchView('game');
    }

    function renderCrosswordBoard() {
        const board = document.getElementById('crossword-board');
        board.innerHTML = '';

        activeLevelData.targets.forEach((word) => {
            const row = document.createElement('div');
            row.className = 'word-row';
            row.dataset.word = word;

            for (let i = 0; i < word.length; i++) {
                const tile = document.createElement('div');
                tile.className = 'word-tile';
                tile.dataset.char = word[i];
                tile.dataset.index = i;

                if (revealedWords.has(word)) {
                    tile.textContent = word[i];
                    tile.classList.add('revealed');
                } else {
                    tile.textContent = '';
                }

                // Re-play practice click handler!
                tile.addEventListener('click', () => {
                    if (tile.classList.contains('revealed')) {
                        Sound.speak(word, currentLanguage);
                        showTTSPopup(word, activeLevelData.definitions[word] || 'Kosa kata tersimpan.');
                    }
                });

                row.appendChild(tile);
            }
            board.appendChild(row);
        });
    }

    function renderLetterWheel() {
        const wrapper = document.getElementById('wheel-wrapper');
        const svg = document.getElementById('wheel-svg');
        const letters = activeLevelData.letters;

        // Clear existing letter buttons
        wrapper.querySelectorAll('.wheel-letter-btn').forEach(b => b.remove());
        svg.innerHTML = '';
        selectedLetters = [];
        letterNodes = [];

        const radius = 95; // px from center
        const centerX = 135;
        const centerY = 135;
        const total = letters.length;

        letters.forEach((letter, index) => {
            const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const btn = document.createElement('div');
            btn.className = 'wheel-letter-btn';
            btn.textContent = letter;
            btn.style.left = `${x - 24}px`;
            btn.style.top = `${y - 24}px`;
            btn.dataset.index = index;
            btn.dataset.letter = letter;

            letterNodes.push({ index, letter, x, y, element: btn });
            wrapper.appendChild(btn);
        });

        setupWheelTouchEvents(wrapper, svg);
    }

    // Letter Wheel Touch & Pointer Drag Mechanics
    function setupWheelTouchEvents(wrapper, svg) {
        function getPointerPos(e) {
            const rect = wrapper.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function checkNodeHit(pos) {
            return letterNodes.find(node => {
                const dx = pos.x - node.x;
                const dy = pos.y - node.y;
                return Math.sqrt(dx * dx + dy * dy) < 28;
            });
        }

        function redrawLines(currentPos) {
            svg.innerHTML = '';
            if (selectedLetters.length === 0) return;

            // Draw lines between selected nodes
            for (let i = 0; i < selectedLetters.length - 1; i++) {
                const n1 = selectedLetters[i];
                const n2 = selectedLetters[i + 1];
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', n1.x);
                line.setAttribute('y1', n1.y);
                line.setAttribute('x2', n2.x);
                line.setAttribute('y2', n2.y);
                line.setAttribute('stroke', '#00f2fe');
                line.setAttribute('stroke-width', '5');
                line.setAttribute('stroke-linecap', 'round');
                svg.appendChild(line);
            }

            // Draw line to pointer
            if (currentPos && selectedLetters.length > 0) {
                const last = selectedLetters[selectedLetters.length - 1];
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', last.x);
                line.setAttribute('y1', last.y);
                line.setAttribute('x2', currentPos.x);
                line.setAttribute('y2', currentPos.y);
                line.setAttribute('stroke', 'rgba(255, 0, 127, 0.7)');
                line.setAttribute('stroke-width', '4');
                line.setAttribute('stroke-linecap', 'round');
                svg.appendChild(line);
            }
        }

        function updateSpellingPreview() {
            const preview = document.getElementById('current-word-preview');
            const word = selectedLetters.map(n => n.letter).join('');
            preview.textContent = word || '- - -';
        }

        // Pointer Down
        const startHandler = (e) => {
            isConnecting = true;
            selectedLetters = [];
            const pos = getPointerPos(e);
            const hit = checkNodeHit(pos);
            if (hit) {
                selectedLetters.push(hit);
                hit.element.classList.add('active');
                Sound.playLetterConnect(0);
            }
            redrawLines(pos);
            updateSpellingPreview();
        };

        // Pointer Move
        const moveHandler = (e) => {
            if (!isConnecting) return;
            const pos = getPointerPos(e);
            const hit = checkNodeHit(pos);
            if (hit && !selectedLetters.includes(hit)) {
                selectedLetters.push(hit);
                hit.element.classList.add('active');
                Sound.playLetterConnect(selectedLetters.length - 1);
            }
            redrawLines(pos);
            updateSpellingPreview();
        };

        // Pointer Up
        const endHandler = () => {
            if (!isConnecting) return;
            isConnecting = false;
            svg.innerHTML = '';
            letterNodes.forEach(n => n.element.classList.remove('active'));

            const formedWord = selectedLetters.map(n => n.letter).join('');
            selectedLetters = [];
            updateSpellingPreview();

            if (formedWord.length >= 2) {
                validateFormedWord(formedWord);
            }
        };

        wrapper.onpointerdown = startHandler;
        window.onpointermove = moveHandler;
        window.onpointerup = endHandler;
    }

    // Word Validation, Bonus Jar, and Level Clear Trigger
    function validateFormedWord(word) {
        if (!activeLevelData) return;

        // 1. Grid Target Word Match
        if (activeLevelData.targets.includes(word)) {
            if (revealedWords.has(word)) {
                Sound.playSelect();
                showTTSPopup(word, 'Kata ini sudah kamu tebak sebelumnya!');
                return;
            }

            // Word Solved!
            revealedWords.add(word);
            state.wordsFoundTotal++;
            state.gems += 10;
            Sound.playWordSuccess();

            // Reveal tiles on board
            const row = document.querySelector(`.word-row[data-word="${word}"]`);
            if (row) {
                row.querySelectorAll('.word-tile').forEach((tile, idx) => {
                    tile.textContent = word[idx];
                    tile.classList.add('revealed');
                });
            }

            // Trigger Sleek TTS Popup
            const definition = activeLevelData.definitions[word] || 'Kosa kata resmi terverifikasi.';
            Sound.speak(word, currentLanguage);
            showTTSPopup(word, definition);

            saveState();

            // Check if Level is Complete
            if (revealedWords.size === activeLevelData.targets.length) {
                handleLevelClear();
            }
            return;
        }

        // 2. Bonus Word Match
        if (activeLevelData.bonus && activeLevelData.bonus.includes(word)) {
            if (state.bonusWordsFound.includes(word)) {
                Sound.playSelect();
                showTTSPopup(word, 'Kata bonus ini sudah masuk ke dalam toples.');
                return;
            }

            state.bonusWordsFound.push(word);
            state.wordsFoundTotal++;
            state.gems += 5;
            Sound.playBonusWord();
            document.getElementById('bonus-jar-count').textContent = `${state.bonusWordsFound.length} Kata`;
            showTTSPopup(word, `🌟 KATA BONUS! +5 Gems ditambahkan ke toples!`);
            saveState();
            return;
        }

        // 3. Invalid Word
        Sound.playError();
        const preview = document.getElementById('current-word-preview');
        preview.textContent = '❌ ' + word;
        setTimeout(() => {
            if (preview.textContent.startsWith('❌')) preview.textContent = '- - -';
        }, 800);
    }

    function handleLevelClear() {
        Sound.playLevelClear();
        state.gems += 25; // Level completion reward

        const completedList = currentLanguage === 'id' ? state.idCompletedLevels : state.enCompletedLevels;
        if (!completedList.includes(currentLevelNumber)) {
            completedList.push(currentLevelNumber);
        }

        // Check Milestone Background Unlocks (e.g. 10, 20, 34, 50, 75, 100)
        const milestone = BG_ARCHIVE_MILESTONES.find(m => m.level === currentLevelNumber);
        if (milestone && !state.unlockedBackgrounds.includes(milestone.level)) {
            state.unlockedBackgrounds.push(milestone.level);
            alert(`🎉 MILESTONE TERCAPAI! Latar baru "${milestone.title}" telah terbuka di Galeri Latar!`);
        }

        saveState();

        // Check 3-Tier Certificates
        checkCertificateThresholds();

        setTimeout(() => {
            if (currentLevelNumber < 100) {
                if (confirm(`🎉 LEVEL ${currentLevelNumber} SELESAI!\nKamu mendapatkan +25 💎!\nLanjut ke Level ${currentLevelNumber + 1}?`)) {
                    loadLevel(currentLanguage, currentLevelNumber + 1);
                } else {
                    switchView('selector');
                    renderLevelSelector();
                }
            } else {
                triggerFireworks();
                alert(`🏆 LUAR BIASA! Kamu telah menamatkan seluruh 100 Level ${currentLanguage === 'id' ? 'Bahasa Indonesia' : 'English'}! Buka menu Sertifikat untuk melihat prestasimu!`);
                switchView('certificates');
                renderCertificate(currentLanguage === 'id' ? 'id' : 'en');
            }
        }, 1200);
    }

    // ==========================================
    // 9. SLEEK AUTO-CLOSING TTS POPUP
    // ==========================================
    function showTTSPopup(word, definition) {
        const popup = document.getElementById('tts-popup');
        const wordEl = document.getElementById('popup-word-text');
        const defEl = document.getElementById('popup-def-text');
        const progressEl = document.getElementById('popup-progress');

        wordEl.textContent = word;
        defEl.textContent = definition;

        popup.classList.add('show');

        // Progress bar animation for 2.5s auto-close
        progressEl.style.transition = 'none';
        progressEl.style.transform = 'scaleX(1)';
        setTimeout(() => {
            progressEl.style.transition = 'transform 2.5s linear';
            progressEl.style.transform = 'scaleX(0)';
        }, 20);

        clearTimeout(activePopupTimeout);
        activePopupTimeout = setTimeout(() => {
            popup.classList.remove('show');
        }, 2600);

        // Replay audio button
        document.getElementById('btn-popup-audio').onclick = () => {
            Sound.speak(word, currentLanguage);
        };

        // Close button
        document.getElementById('btn-popup-close').onclick = () => {
            clearTimeout(activePopupTimeout);
            popup.classList.remove('show');
        };
    }

    // ==========================================
    // 10. POWER-UPS & BOOSTERS
    // ==========================================
    function initBoosters() {
        // Magic Wand: Reveals 1 random unrevealed letter in grid
        document.getElementById('btn-booster-wand').addEventListener('click', () => {
            if (state.gems < 40) {
                Sound.playError();
                alert('Gems tidak cukup! Butuh 40 💎.');
                return;
            }
            const unrevealedTiles = Array.from(document.querySelectorAll('.word-tile:not(.revealed)'));
            if (unrevealedTiles.length === 0) {
                alert('Semua huruf sudah terbuka!');
                return;
            }
            state.gems -= 40;
            Sound.playGemCollect();
            const targetTile = unrevealedTiles[Math.floor(Math.random() * unrevealedTiles.length)];
            targetTile.textContent = targetTile.dataset.char;
            targetTile.classList.add('revealed');
            saveState();
        });

        // Bomb: Reveals 3 random letters in grid
        document.getElementById('btn-booster-bomb').addEventListener('click', () => {
            if (state.gems < 75) {
                Sound.playError();
                alert('Gems tidak cukup! Butuh 75 💎.');
                return;
            }
            const unrevealedTiles = Array.from(document.querySelectorAll('.word-tile:not(.revealed)'));
            if (unrevealedTiles.length === 0) {
                alert('Semua huruf sudah terbuka!');
                return;
            }
            state.gems -= 75;
            Sound.playGemCollect();
            for (let i = 0; i < 3 && unrevealedTiles.length > 0; i++) {
                const idx = Math.floor(Math.random() * unrevealedTiles.length);
                const tile = unrevealedTiles.splice(idx, 1)[0];
                tile.textContent = tile.dataset.char;
                tile.classList.add('revealed');
            }
            saveState();
        });

        // Magnifier: Reveals first missing tile of the first unsolved word
        document.getElementById('btn-booster-magnifier').addEventListener('click', () => {
            if (state.gems < 30) {
                Sound.playError();
                alert('Gems tidak cukup! Butuh 30 💎.');
                return;
            }
            const firstUnrevealed = document.querySelector('.word-tile:not(.revealed)');
            if (!firstUnrevealed) {
                alert('Semua huruf sudah terbuka!');
                return;
            }
            state.gems -= 30;
            Sound.playGemCollect();
            firstUnrevealed.textContent = firstUnrevealed.dataset.char;
            firstUnrevealed.classList.add('revealed');
            saveState();
        });

        // Shuffle Wheel Letters
        document.getElementById('btn-shuffle-wheel').addEventListener('click', () => {
            if (!activeLevelData) return;
            Sound.playSelect();
            activeLevelData.letters.sort(() => Math.random() - 0.5);
            renderLetterWheel();
        });
    }

    // ==========================================
    // 11. SPEED RUN MODE (60s ARCADE)
    // ==========================================
    function startSpeedRunMode() {
        speedrunTimeLeft = 60;
        speedrunScore = 0;
        speedrunGems = 0;
        switchView('speedrun');

        const timerFill = document.getElementById('speedrun-timer-fill');
        const timerDisplay = document.getElementById('speedrun-time-display');
        const scoreDisplay = document.getElementById('speedrun-score-display');
        const gemsDisplay = document.getElementById('speedrun-gems-earned');

        timerFill.style.width = '100%';
        timerDisplay.textContent = '60s';
        scoreDisplay.textContent = '0';
        gemsDisplay.textContent = '+0 💎';

        loadSpeedRunLevel();

        clearInterval(speedrunTimerInterval);
        speedrunTimerInterval = setInterval(() => {
            speedrunTimeLeft--;
            timerDisplay.textContent = `${speedrunTimeLeft}s`;
            timerFill.style.width = `${(speedrunTimeLeft / 60) * 100}%`;

            if (speedrunTimeLeft <= 0) {
                clearInterval(speedrunTimerInterval);
                endSpeedRun();
            }
        }, 1000);
    }

    function loadSpeedRunLevel() {
        const sampleSeed = RAW_ID_LEVEL_SEEDS[Math.floor(Math.random() * RAW_ID_LEVEL_SEEDS.length)];
        activeLevelData = {
            targets: sampleSeed.targets,
            letters: sampleSeed.letters.split(""),
            definitions: sampleSeed.defs || {}
        };
        revealedWords.clear();

        const board = document.getElementById('speedrun-board');
        board.innerHTML = '';
        activeLevelData.targets.forEach((word) => {
            const row = document.createElement('div');
            row.className = 'word-row';
            row.dataset.word = word;
            for (let i = 0; i < word.length; i++) {
                const tile = document.createElement('div');
                tile.className = 'word-tile';
                tile.dataset.char = word[i];
                row.appendChild(tile);
            }
            board.appendChild(row);
        });

        // Render speed run wheel
        const wrapper = document.getElementById('speedrun-wheel-wrapper');
        const svg = document.getElementById('speedrun-wheel-svg');
        wrapper.querySelectorAll('.wheel-letter-btn').forEach(b => b.remove());
        svg.innerHTML = '';

        const radius = 95;
        const total = activeLevelData.letters.length;
        letterNodes = [];

        activeLevelData.letters.forEach((l, idx) => {
            const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
            const x = 135 + radius * Math.cos(angle);
            const y = 135 + radius * Math.sin(angle);
            const btn = document.createElement('div');
            btn.className = 'wheel-letter-btn';
            btn.textContent = l;
            btn.style.left = `${x - 24}px`;
            btn.style.top = `${y - 24}px`;
            letterNodes.push({ index: idx, letter: l, x, y, element: btn });
            wrapper.appendChild(btn);
        });

        setupWheelTouchEvents(wrapper, svg);
    }

    function endSpeedRun() {
        Sound.playLevelClear();
        state.gems += speedrunGems;
        if (speedrunScore > state.speedrunHighScore) {
            state.speedrunHighScore = speedrunScore;
        }
        saveState();
        alert(`⏱️ SPEED RUN BERAKHIR!\nSkor Akhir: ${speedrunScore}\nBonus Gems Didapat: +${speedrunGems} 💎`);
        switchView('lobby');
    }

    // ==========================================
    // 12. MINI-GAME: TEBAK GAMBAR
    // ==========================================
    function loadTebakGambar() {
        const currentData = TEBAK_GAMBAR_DATA[state.tebakGambarIndex % TEBAK_GAMBAR_DATA.length];
        document.getElementById('tebak-svg-wrapper').innerHTML = currentData.svg;
        document.getElementById('tebak-clue-text').textContent = currentData.question;
        document.getElementById('tebak-hint-letters').textContent = currentData.hint;
        const input = document.getElementById('tebak-user-input');
        input.value = '';
        input.focus();
        switchView('tebakGambar');
    }

    function initTebakGambar() {
        document.getElementById('btn-submit-tebak').addEventListener('click', () => {
            const currentData = TEBAK_GAMBAR_DATA[state.tebakGambarIndex % TEBAK_GAMBAR_DATA.length];
            const val = document.getElementById('tebak-user-input').value.trim().toUpperCase();

            if (val === currentData.answer) {
                Sound.playWordSuccess();
                state.gems += 20;
                state.tebakGambarIndex++;
                Sound.speak(currentData.answer, 'id');
                saveState();
                alert(`🎉 BENAR SEKALI! Jawabannya adalah "${currentData.answer}".\nKamu mendapatkan +20 💎!`);
                loadTebakGambar();
            } else {
                Sound.playError();
                alert('Jawaban belum tepat, ayo coba lagi!');
            }
        });

        document.getElementById('btn-tebak-hint').addEventListener('click', () => {
            if (state.gems < 15) {
                alert('Gems tidak cukup untuk membuka petunjuk! (Butuh 15 💎)');
                return;
            }
            state.gems -= 15;
            Sound.playGemCollect();
            const currentData = TEBAK_GAMBAR_DATA[state.tebakGambarIndex % TEBAK_GAMBAR_DATA.length];
            document.getElementById('tebak-hint-letters').textContent = currentData.answer.split('').join(' ');
            saveState();
        });

        document.getElementById('btn-tebak-skip').addEventListener('click', () => {
            state.tebakGambarIndex++;
            saveState();
            loadTebakGambar();
        });
    }

    // ==========================================
    // 13. DAILY VOCAB QUIZ
    // ==========================================
    function loadDailyQuiz() {
        const q = DAILY_QUIZ_POOL[activeQuizIndex % DAILY_QUIZ_POOL.length];
        document.getElementById('daily-quiz-question').textContent = q.question;
        const optionsBox = document.getElementById('daily-quiz-options');
        const feedback = document.getElementById('daily-quiz-feedback');
        const nextBtn = document.getElementById('btn-next-quiz');

        optionsBox.innerHTML = '';
        feedback.style.display = 'none';
        nextBtn.style.display = 'none';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-secondary';
            btn.style.textAlign = 'left';
            btn.style.padding = '12px 18px';
            btn.textContent = `${['A', 'B', 'C', 'D'][idx]}. ${opt}`;

            btn.addEventListener('click', () => {
                optionsBox.querySelectorAll('button').forEach(b => b.disabled = true);
                if (idx === q.correct) {
                    Sound.playWordSuccess();
                    state.gems += 15;
                    saveState();
                    btn.style.background = 'var(--neon-green)';
                    btn.style.color = '#000';
                    feedback.style.display = 'block';
                    feedback.style.background = 'rgba(0, 255, 136, 0.2)';
                    feedback.style.border = '1px solid var(--neon-green)';
                    feedback.textContent = `✅ BENAR! (+15 💎)\n${q.explanation}`;
                } else {
                    Sound.playError();
                    btn.style.background = '#e74c3c';
                    feedback.style.display = 'block';
                    feedback.style.background = 'rgba(231, 76, 60, 0.2)';
                    feedback.style.border = '1px solid #e74c3c';
                    feedback.textContent = `❌ Belum tepat.\n${q.explanation}`;
                }
                nextBtn.style.display = 'block';
            });

            optionsBox.appendChild(btn);
        });

        nextBtn.onclick = () => {
            activeQuizIndex++;
            loadDailyQuiz();
        };

        switchView('dailyQuiz');
    }

    // ==========================================
    // 14. THEME SHOP & CATALOG
    // ==========================================
    function renderShop(type = 'themes') {
        const container = document.getElementById('catalog-container');
        container.innerHTML = '';

        if (type === 'themes') {
            THEME_CATALOG.forEach(theme => {
                const card = document.createElement('div');
                card.className = 'catalog-card glass-panel';
                const isOwned = state.unlockedThemes.includes(theme.id);
                const isActive = state.activeTheme === theme.id;

                card.innerHTML = `
                    <div>
                        <div class="theme-preview-box" style="background: ${theme.previewColor}"></div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 4px;">${theme.name}</h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary);">${theme.desc}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <span style="font-weight: 800; color: var(--neon-gold);">${isOwned ? 'Sudah Milik' : `${theme.cost} 💎`}</span>
                        <button class="btn-primary" data-theme-id="${theme.id}">
                            ${isActive ? 'Sedang Dipakai' : isOwned ? 'Gunakan' : 'Beli'}
                        </button>
                    </div>
                `;

                const btn = card.querySelector('button');
                btn.addEventListener('click', () => {
                    if (isOwned) {
                        state.activeTheme = theme.id;
                        state.activeBgStyle = null;
                        saveState();
                        renderShop('themes');
                    } else {
                        if (state.gems < theme.cost) {
                            Sound.playError();
                            alert('Gems tidak cukup!');
                            return;
                        }
                        state.gems -= theme.cost;
                        state.unlockedThemes.push(theme.id);
                        state.activeTheme = theme.id;
                        state.activeBgStyle = null;
                        Sound.playGemCollect();
                        saveState();
                        alert(`🎉 Tema "${theme.name}" berhasil dibeli dan diterapkan!`);
                        renderShop('themes');
                    }
                });

                container.appendChild(card);
            });
        } else {
            // Boosters catalog
            BOOSTERS_CATALOG.forEach(b => {
                const card = document.createElement('div');
                card.className = 'catalog-card glass-panel';
                card.innerHTML = `
                    <div>
                        <div style="font-size: 2.8rem; text-align: center; margin-bottom: 8px;">${b.icon}</div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 4px;">${b.name}</h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary);">${b.desc}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <span style="font-weight: 800; color: var(--neon-gold);">${b.cost} 💎</span>
                        <button class="btn-primary">Isi Daya</button>
                    </div>
                `;
                card.querySelector('button').addEventListener('click', () => {
                    if (state.gems < b.cost) {
                        Sound.playError();
                        alert('Gems tidak cukup!');
                        return;
                    }
                    state.gems -= b.cost;
                    Sound.playGemCollect();
                    saveState();
                    alert(`🎉 ${b.name} berhasil diisi daya!`);
                });
                container.appendChild(card);
            });
        }
    }

    // ==========================================
    // 15. BACKGROUND ARCHIVE GALLERY
    // ==========================================
    function renderBackgroundArchive() {
        const container = document.getElementById('archive-grid-container');
        container.innerHTML = '';

        BG_ARCHIVE_MILESTONES.forEach(bg => {
            const card = document.createElement('div');
            card.className = 'archive-card glass-panel';
            const isUnlocked = state.unlockedBackgrounds.includes(bg.level);
            const isActive = state.activeBgStyle === bg.bgStyle;

            card.innerHTML = `
                <div class="archive-thumb ${isActive ? 'active-bg' : ''}" style="background: ${bg.bgStyle}">
                    <span style="font-size: 2rem;">${isUnlocked ? '🌌' : '🔒'}</span>
                </div>
                <div>
                    <h4 style="font-size: 1rem; color: ${bg.accent}; margin-bottom: 4px;">${bg.title}</h4>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${bg.desc}</p>
                </div>
                <button class="btn-secondary" style="margin-top: 6px;" ${!isUnlocked ? 'disabled' : ''}>
                    ${isActive ? '✓ Aktif' : isUnlocked ? 'Terapkan Latar' : `Kunci (Level ${bg.level})`}
                </button>
            `;

            if (isUnlocked) {
                card.querySelector('button').addEventListener('click', () => {
                    state.activeBgStyle = bg.bgStyle;
                    Sound.playSelect();
                    saveState();
                    renderBackgroundArchive();
                    alert(`Latar "${bg.title}" berhasil diterapkan ke arena permainan!`);
                });
            }

            container.appendChild(card);
        });
    }

    // ==========================================
    // 16. 3-TIER PRESTIGIOUS CERTIFICATES & REWARDS
    // ==========================================
    function checkCertificateThresholds() {
        const idDone = state.idCompletedLevels.length >= 100;
        const enDone = state.enCompletedLevels.length >= 100;

        if (idDone && enDone) {
            state.title = 'Master Vocab Arcade';
        } else if (idDone) {
            state.title = 'Penjelajah Kata Nusantara';
        } else if (enDone) {
            state.title = 'Word Explorer';
        }
        saveState();
    }

    function renderCertificate(tier = 'id') {
        const card = document.getElementById('certificate-display-card');
        const idDone = state.idCompletedLevels.length >= 100;
        const enDone = state.enCompletedLevels.length >= 100;

        if (tier === 'id') {
            card.innerHTML = `
                <div class="cert-ornament">🇮🇩 ⚜️ 🇮🇩</div>
                <h3 class="cert-title">SERTIFIKAT CENDEKIA BAHASA INDONESIA</h3>
                <div class="cert-subtitle">Diberikan secara resmi dan terhormat kepada:</div>
                <div class="cert-recipient">${state.playerName}</div>
                <p class="cert-text">
                    Atas ketekunan luar biasa menyelesaikan 100 Tingkatan Teka-Teki Kosa Kata Bahasa Indonesia (KBBI Codex), 
                    membuktikan kecintaan mendalam pada bahasa persatuan serta dinobatkan bergelar kehormatan:
                </p>
                <div style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--neon-cyan); margin-bottom: 16px;">
                    "PENJELAJAH KATA NUSANTARA"
                </div>
                <div class="cert-seal">${idDone ? '🏅' : '🔒'}</div>
                <div style="font-weight: 700; color: ${idDone ? 'var(--neon-green)' : '#888'};">
                    ${idDone ? 'STATUS: RESMI TERVERIFIKASI' : `PROGRES: ${state.idCompletedLevels.length} / 100 LEVEL`}
                </div>
            `;
        } else if (tier === 'en') {
            card.innerHTML = `
                <div class="cert-ornament">🇬🇧 🌐 🇬🇧</div>
                <h3 class="cert-title">CERTIFICATE OF ENGLISH PROFICIENCY</h3>
                <div class="cert-subtitle">This certificate is proudly conferred upon:</div>
                <div class="cert-recipient">${state.playerName}</div>
                <p class="cert-text">
                    For extraordinary mastery in discovering, pronouncing, and solving all 100 Levels of Oxford & Cambridge vocabulary puzzles,
                    duly recognized and decorated with the international distinction:
                </p>
                <div style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--neon-pink); margin-bottom: 16px;">
                    "HONORARY WORD EXPLORER"
                </div>
                <div class="cert-seal">${enDone ? '🎖️' : '🔒'}</div>
                <div style="font-weight: 700; color: ${enDone ? 'var(--neon-green)' : '#888'};">
                    ${enDone ? 'STATUS: OFFICIAL PROFICIENCY CONFIRMED' : `PROGRESS: ${state.enCompletedLevels.length} / 100 LEVELS`}
                </div>
            `;
        } else {
            // Tier 3 Grand Finale Trophy
            const allDone = idDone && enDone;
            card.innerHTML = `
                <div class="cert-ornament">👑 ⚡ 👑</div>
                <h3 class="cert-title" style="color: var(--neon-gold);">GRAND FINALE TROPHY & MASTER DWIBHASA</h3>
                <div class="cert-subtitle">Penganugerahan Tertinggi Puncak Jagat Aksara:</div>
                <div class="cert-recipient">${state.playerName}</div>
                <p class="cert-text">
                    Pencapaian legendaris menaklukkan total 200 Tingkatan Kosa Kata Lintas Dwibahasa. 
                    Membuka gerbang kearifan tanpa batas sebagai Penyelamat & Penguasa Tertinggi:
                </p>
                <div style="font-family: var(--font-heading); font-size: 1.7rem; color: var(--neon-gold); margin-bottom: 16px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);">
                    "MASTER VOCAB ARCADE"
                </div>
                <div class="cert-seal">${allDone ? '🏆' : '🔒'}</div>
                <div style="font-weight: 700; color: ${allDone ? 'var(--neon-gold)' : '#888'};">
                    ${allDone ? 'STATUS: MAHA KARYA JUARA SEJATI' : `TOTAL PROGRES: ${state.idCompletedLevels.length + state.enCompletedLevels.length} / 200 LEVEL`}
                </div>
            `;
            if (allDone) triggerFireworks();
        }
    }

    // ==========================================
    // 17. PROFILE & AVATAR MODAL
    // ==========================================
    function initProfileModal() {
        const modal = document.getElementById('modal-profile');
        const openBtn = document.getElementById('btn-open-profile');
        const closeBtn = document.getElementById('btn-close-profile-modal');
        const nameInput = document.getElementById('profile-name-input');
        const avatarGrid = document.getElementById('avatar-selection-grid');
        const saveBtn = document.getElementById('btn-save-profile');
        let chosenAvatar = state.avatar;

        openBtn.addEventListener('click', () => {
            nameInput.value = state.playerName;
            chosenAvatar = state.avatar;
            avatarGrid.innerHTML = '';

            AVATAR_LIST.forEach(av => {
                const item = document.createElement('div');
                item.className = `avatar-choice ${chosenAvatar === av.icon ? 'selected' : ''}`;
                item.textContent = av.icon;
                item.addEventListener('click', () => {
                    avatarGrid.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
                    item.classList.add('selected');
                    chosenAvatar = av.icon;
                });
                avatarGrid.appendChild(item);
            });

            modal.classList.add('open');
        });

        closeBtn.addEventListener('click', () => modal.classList.remove('open'));

        saveBtn.addEventListener('click', () => {
            const newName = nameInput.value.trim();
            if (newName) state.playerName = newName;
            state.avatar = chosenAvatar;
            saveState();
            modal.classList.remove('open');
        });

        document.getElementById('btn-reset-data').addEventListener('click', () => {
            if (confirm('PERINGATAN: Apakah kamu yakin ingin mereset seluruh progres permainan?')) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        });
    }

    // ==========================================
    // 18. INITIALIZATION & EVENT WIRING
    // ==========================================
    function init() {
        loadState();
        initAmbientParticles();
        initOnlineRewardTimer();
        initBoosters();
        initProfileModal();
        initTebakGambar();

        // Sound Toggle
        const soundBtn = document.getElementById('btn-toggle-sound');
        soundBtn.addEventListener('click', () => {
            const isMuted = Sound.toggleMute();
            soundBtn.textContent = isMuted ? '🔇' : '🔊';
        });

        // Lobby Navigation
        document.getElementById('btn-home-logo').addEventListener('click', () => switchView('lobby'));
        document.getElementById('nav-btn-play').addEventListener('click', () => {
            renderLevelSelector();
            switchView('selector');
        });
        document.getElementById('nav-btn-speedrun').addEventListener('click', startSpeedRunMode);
        document.getElementById('nav-btn-tebak-gambar').addEventListener('click', loadTebakGambar);
        document.getElementById('nav-btn-daily-quiz').addEventListener('click', loadDailyQuiz);
        document.getElementById('nav-btn-shop').addEventListener('click', () => {
            renderShop('themes');
            switchView('shop');
        });
        document.getElementById('nav-btn-archive').addEventListener('click', () => {
            renderBackgroundArchive();
            switchView('archive');
        });
        document.getElementById('nav-btn-certificates').addEventListener('click', () => {
            renderCertificate('id');
            switchView('certificates');
        });

        // Back Buttons
        document.getElementById('btn-back-from-selector').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-game').addEventListener('click', () => {
            if (confirm('Kembali ke Menu Utama? Progres level akan tersimpan.')) {
                switchView('lobby');
            }
        });
        document.getElementById('btn-back-from-speedrun').addEventListener('click', () => {
            clearInterval(speedrunTimerInterval);
            switchView('lobby');
        });
        document.getElementById('btn-back-from-tebak').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-quiz').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-shop').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-archive').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-cert').addEventListener('click', () => switchView('lobby'));

        // Language Tabs in Selector
        document.getElementById('tab-lang-id').addEventListener('click', () => {
            document.getElementById('tab-lang-id').classList.add('active');
            document.getElementById('tab-lang-en').classList.remove('active');
            currentLanguage = 'id';
            renderLevelSelector();
        });
        document.getElementById('tab-lang-en').addEventListener('click', () => {
            document.getElementById('tab-lang-en').classList.add('active');
            document.getElementById('tab-lang-id').classList.remove('active');
            currentLanguage = 'en';
            renderLevelSelector();
        });

        // Shop Tabs
        document.getElementById('tab-shop-themes').addEventListener('click', () => {
            document.getElementById('tab-shop-themes').classList.add('active');
            document.getElementById('tab-shop-boosters').classList.remove('active');
            renderShop('themes');
        });
        document.getElementById('tab-shop-boosters').addEventListener('click', () => {
            document.getElementById('tab-shop-boosters').classList.add('active');
            document.getElementById('tab-shop-themes').classList.remove('active');
            renderShop('boosters');
        });

        // Certificate Tabs
        document.getElementById('btn-show-cert-id').addEventListener('click', (e) => {
            document.querySelectorAll('#view-certificates .lang-tab').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCertificate('id');
        });
        document.getElementById('btn-show-cert-en').addEventListener('click', (e) => {
            document.querySelectorAll('#view-certificates .lang-tab').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCertificate('en');
        });
        document.getElementById('btn-show-cert-grand').addEventListener('click', (e) => {
            document.querySelectorAll('#view-certificates .lang-tab').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCertificate('grand');
        });

        // First render
        updateHeaderUI();
    }

    // Boot on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
