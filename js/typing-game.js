document.addEventListener("DOMContentLoaded", () => {
    const wordsContainer = document.getElementById("words-container");
    const wordsDisplay = document.getElementById("words-display");
    const focusOverlay = document.getElementById("focus-overlay");
    const timeDisplay = document.getElementById("time-display");
    const wpmDisplay = document.getElementById("wpm-display");
    const accuracyDisplay = document.getElementById("accuracy-display");
    const keyboardContainer = document.getElementById("keyboard-container");

    let isPlaying = false;
    let isGameOver = false;
    let timer = 30;
    let timerInterval = null;

    let currentWords = [];
    let currentWordIndex = 0;
    let currentLetterIndex = 0;

    let totalKeystrokes = 0;
    let correctKeystrokes = 0;

    let audioContext;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    const keyboardLayout = [
        ['է', 'թ', 'փ', 'ձ', 'ջ', 'ր', 'չ', 'ճ', 'ժ', 'ծ'],
        ['ք', 'ո', 'ե', 'ռ', 'տ', 'ը', 'ւ', 'ի', 'օ', 'պ'],
        ['ա', 'ս', 'դ', 'ֆ', 'գ', 'հ', 'յ', 'կ', 'լ'],
        ['զ', 'խ', 'ց', 'վ', 'բ', 'ն', 'մ', 'շ', 'ղ', '⌫'],
        ['SPACE', '↻']
    ];

    function initKeyboard() {
        keyboardContainer.innerHTML = '';
        for (let row of keyboardLayout) {
            let keyboardRow = document.createElement("div");
            keyboardRow.className = "keyboard-row";

            for (let key of row) {
                let button = document.createElement("button");
                button.textContent = key === 'SPACE' ? '␣' : key;
                button.setAttribute("data-key", key);

                if (key === 'SPACE') {
                    button.classList.add("wide-button");
                    button.style.flex = "1";
                } else if (key === '⌫' || key === '↻') {
                    button.classList.add("wide-button");
                    if (key === '↻') {
                        button.style.flex = "0.2";
                    }
                }

                button.addEventListener("mousedown", (e) => {
                    e.preventDefault(); // Prevent losing focus on words container
                    if (key === '↻') {
                        resetGame();
                    } else {
                        handleInput(key);
                    }
                });
                keyboardRow.appendChild(button);
            }
            keyboardContainer.appendChild(keyboardRow);
        }
    }

    function generateWords() {
        currentWords = [];
        // Use typingWords from words.js if available, else fallback
        const wordPool = (typeof typingWords !== 'undefined' && typingWords.length > 0) ? typingWords : targetWords;

        for (let i = 0; i < 50; i++) {
            const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)].toLowerCase();
            currentWords.push(randomWord);
        }
    }

    function renderWords() {
        wordsDisplay.innerHTML = '';
        currentWords.forEach((word, wIndex) => {
            const wordEl = document.createElement("div");
            wordEl.className = "word";
            wordEl.id = `word-${wIndex}`;

            for (let lIndex = 0; lIndex < word.length; lIndex++) {
                const letterEl = document.createElement("span");
                letterEl.className = "letter";
                letterEl.textContent = word[lIndex];
                letterEl.id = `letter-${wIndex}-${lIndex}`;
                wordEl.appendChild(letterEl);
            }
            wordsDisplay.appendChild(wordEl);
        });

        updateActiveLetter();
    }

    function updateActiveLetter() {
        // Remove active class from all
        document.querySelectorAll('.letter.active, .word.active').forEach(el => {
            el.classList.remove('active');
        });

        if (currentWordIndex < currentWords.length) {
            const wordEl = document.getElementById(`word-${currentWordIndex}`);
            if (wordEl) {
                wordEl.classList.add('active');

                // Scroll if needed
                const containerRect = wordsContainer.getBoundingClientRect();
                const wordRect = wordEl.getBoundingClientRect();
                if (wordRect.bottom > containerRect.bottom || wordRect.top < containerRect.top) {
                    wordsDisplay.style.transform = `translateY(-${wordEl.offsetTop - 20}px)`;
                }

                if (currentLetterIndex < currentWords[currentWordIndex].length) {
                    const letterEl = document.getElementById(`letter-${currentWordIndex}-${currentLetterIndex}`);
                    if (letterEl) letterEl.classList.add('active');
                } else {
                    // Active state at the end of word (waiting for space)
                    wordEl.classList.add('waiting-space');
                }
            }
        }
    }

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        isGameOver = false;
        focusOverlay.classList.add('hidden');

        timerInterval = setInterval(() => {
            timer--;
            timeDisplay.textContent = timer;

            // Real-time WPM update
            calculateStats();

            if (timer <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        isPlaying = false;
        isGameOver = true;
        clearInterval(timerInterval);
        calculateStats();
        focusOverlay.textContent = "Ժամանակը սպառուեցաւ";
        focusOverlay.classList.remove('hidden');
    }

    function calculateStats() {
        const timeElapsed = 30 - timer;
        const minutes = timeElapsed > 0 ? timeElapsed / 60 : 0;

        // Standard WPM: 5 characters = 1 word
        const wpm = minutes > 0 ? Math.round((correctKeystrokes / 5) / minutes) : 0;
        wpmDisplay.textContent = wpm;

        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
        accuracyDisplay.textContent = `${accuracy}%`;
    }

    function resetGame() {
        clearInterval(timerInterval);
        isPlaying = false;
        isGameOver = false;
        timer = 30;
        currentWordIndex = 0;
        currentLetterIndex = 0;
        totalKeystrokes = 0;
        correctKeystrokes = 0;

        timeDisplay.textContent = timer;
        wpmDisplay.textContent = "0";
        accuracyDisplay.textContent = "100%";
        wordsDisplay.style.transform = "translateY(0)";

        focusOverlay.textContent = "Սեղմէ հոս կամ սկսիր տպել";
        focusOverlay.classList.remove('hidden');

        generateWords();
        renderWords();
    }

    function animateVirtualKey(key) {
        const buttons = document.querySelectorAll(".keyboard-row button");
        for (let btn of buttons) {
            if (btn.getAttribute("data-key") === key) {
                btn.classList.add("pressed");
                setTimeout(() => btn.classList.remove("pressed"), 100);
                break;
            }
        }
    }

    function playClickSound() {
        if (!audioContext) initAudio();
        
        // Typewriter mechanical click (white noise burst through a bandpass filter)
        const bufferSize = audioContext.sampleRate * 0.04; // 40ms buffer
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2500; // Crisp high-mid frequency
        filter.Q.value = 0.5;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
        
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        noiseSource.start();
    }

    function handleInput(key) {
        if (isGameOver) return;
        if (!isPlaying) startGame();

        playClickSound();
        animateVirtualKey(key);

        if (key === '⌫' || key === 'Backspace') {
            if (currentLetterIndex > 0) {
                currentLetterIndex--;
                const letterEl = document.getElementById(`letter-${currentWordIndex}-${currentLetterIndex}`);
                if (letterEl) {
                    letterEl.classList.remove('correct', 'incorrect');
                }
                updateActiveLetter();
            } else if (currentWordIndex > 0) {
                // Optional: Allow going back to previous word if it has mistakes
                // For simplicity, we just stay at 0
            }
            return;
        }

        if (key === 'SPACE' || key === ' ') {
            if (currentWordIndex < currentWords.length - 1) {
                // Move to next word
                const currentWordEl = document.getElementById(`word-${currentWordIndex}`);
                currentWordEl.classList.remove('waiting-space');

                // Mark remaining letters as incorrect
                const targetWord = currentWords[currentWordIndex];
                for (let i = currentLetterIndex; i < targetWord.length; i++) {
                    const letterEl = document.getElementById(`letter-${currentWordIndex}-${i}`);
                    if (letterEl) letterEl.classList.add('incorrect');
                }

                currentWordIndex++;
                currentLetterIndex = 0;
                updateActiveLetter();
            }
            return;
        }

        const targetWord = currentWords[currentWordIndex];
        if (currentLetterIndex < targetWord.length) {
            totalKeystrokes++;
            const letterEl = document.getElementById(`letter-${currentWordIndex}-${currentLetterIndex}`);

            if (key === targetWord[currentLetterIndex]) {
                letterEl.classList.add('correct');
                correctKeystrokes++;
            } else {
                letterEl.classList.add('incorrect');
            }

            currentLetterIndex++;
            updateActiveLetter();
        }
    }

    // Physical keyboard listener
    document.addEventListener("keydown", (e) => {
        // Ignore modifiers
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Prevent default scrolling for spacebar
        if (e.key === " " && document.activeElement === document.body) {
            e.preventDefault();
        }

        let keyToProcess = e.key;

        if (e.key.length === 1) {
            // Ensure lower case for comparison
            keyToProcess = e.key.toLowerCase();
        }

        if (keyToProcess === " " || keyToProcess === "Backspace" || keyToProcess.length === 1) {
            handleInput(keyToProcess);
        }
    });

    wordsContainer.addEventListener("click", () => {
        if (!isPlaying && !isGameOver) {
            startGame();
        } else if (isGameOver) {
            resetGame();
        }
    });

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    initKeyboard();
    resetGame();
});
