const people = [
    { name: 'Քրիստափոր Միքայէլեան', image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Db_1a_Chrisdapr1.jpg' },
    { name: 'Սիմոն Զաւարեան', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Zavarian.JPG' },
    { name: 'Ստեփան Զօրեան', image: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Stepan_Zorian-1.png' },
    { name: 'Յարութ Բանոյեան', image: 'pics/faces/Բանոյեան-01.jpg' },
    { name: 'Ս', image: 'pics/img.png' }
    
];

let currentLevel = 0;
let capsLock = false;

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image failed to load'));
        image.src = src;
    });
}

function loadLevel() {
    if (currentLevel >= people.length) {
        document.getElementById('message').textContent = 'Անցար բոլոր մակարդակները';
        document.getElementById('guess-input').disabled = true;
        document.getElementById('submit-btn').disabled = true;
        return;
    }

    const person = people[currentLevel];
    document.getElementById('level').textContent = `${currentLevel + 1} / ${people.length}`;
    document.getElementById('guess-input').value = '';
    document.getElementById('message').textContent = 'Loading image...';

    preloadImage(person.image)
        .then((image) => {
            document.getElementById('person-image').src = image.src;
            document.getElementById('message').textContent = '';
        })
        .catch(() => {
            document.getElementById('person-image').src = person.image;
            document.getElementById('message').textContent = 'Unable to load image. Please try again.';
        });
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaultPlaceholder = 'Գրէ՜ անունը';

function checkGuess() {
    const guessInput = document.getElementById('guess-input');
    const guess = guessInput.value.trim().toLowerCase();
    const correctName = people[currentLevel].name.toLowerCase();

    if (guess === correctName) {
        const nextLevel = currentLevel + 1;
        guessInput.value = '';
        guessInput.placeholder = 'Ճիշտ է';
        document.getElementById('message').textContent = '';

        const nextImageSrc = people[nextLevel] ? people[nextLevel].image : null;
        const preloadPromise = nextImageSrc ? preloadImage(nextImageSrc).catch(() => null) : Promise.resolve(null);

        Promise.all([preloadPromise, wait(2000)]).then(() => {
            guessInput.placeholder = defaultPlaceholder;
            currentLevel = nextLevel;
            loadLevel();
        });
    } else {
        guessInput.value = '';
        guessInput.placeholder = 'Սխալ է';
        document.getElementById('message').textContent = '';

        wait(2000).then(() => {
            guessInput.placeholder = defaultPlaceholder;
        });
    }
}

document.getElementById('submit-btn').addEventListener('click', checkGuess);

document.getElementById('guess-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

loadLevel();

// Armenian Keyboard Functionality
const guessInput = document.getElementById('guess-input');
const keyboard = document.getElementById('keyboard');

keyboard.addEventListener('click', (e) => {
    const key = e.target.dataset.key;
    if (!key) {
        return;
    }
    handleKeyPress(key);
});

function updateKeyboardCaps() {
    document.querySelectorAll('.key[data-key]').forEach((button) => {
        const key = button.dataset.key;
        if (key === 'caps' || key === 'backspace' || key === 'space') {
            return;
        }
        button.textContent = capsLock ? key.toUpperCase() : key.toLowerCase();
    });

    const capsButton = document.querySelector('.key[data-key="caps"]');
    if (capsButton) {
        capsButton.classList.toggle('active', capsLock);
    }
}

function handleKeyPress(key) {
    switch (key) {
        case 'caps':
            capsLock = !capsLock;
            updateKeyboardCaps();
            break;
        case 'backspace':
            guessInput.value = guessInput.value.slice(0, -1);
            break;
        case 'space':
            guessInput.value += ' ';
            break;
        case 'enter':
            checkGuess();
            break;
        default:
            guessInput.value += capsLock ? key.toUpperCase() : key;
            break;
    }
}

// Disable native keyboard entirely by using readonly and inputmode="none" on the input
guessInput.addEventListener('focus', (e) => {
    e.target.blur();
});

updateKeyboardCaps();

// Visual feedback for key presses
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('mousedown', () => {
        key.style.transform = 'scale(0.95)';
    });

    key.addEventListener('mouseup', () => {
        key.style.transform = 'scale(1)';
    });

    key.addEventListener('mouseleave', () => {
        key.style.transform = 'scale(1)';
    });
});
