const people = [
    { name: 'Քրիստափոր Միքայէլեան', image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Db_1a_Chrisdapr1.jpg' },
    { name: 'Սիմոն Զաւարեան', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Zavarian.JPG' },
    { name: 'Ստեփան Զօրեան', image: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Stepan_Zorian-1.png' },
    
];

let currentLevel = 0;

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
    document.getElementById('level').textContent = `${currentLevel + 1} / 3`;
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

function checkGuess() {
    const guess = document.getElementById('guess-input').value.trim().toLowerCase();
    const correctName = people[currentLevel].name.toLowerCase();

    if (guess === correctName) {
        const nextLevel = currentLevel + 1;
        document.getElementById('message').textContent = 'Ճիշտ է';

        if (nextLevel >= people.length) {
            wait(2000).then(() => {
                currentLevel = nextLevel;
                loadLevel();
            });
            return;
        }

        const nextImageSrc = people[nextLevel].image;
        const preloadPromise = preloadImage(nextImageSrc).catch(() => null);
        const delayPromise = wait(2000);

        Promise.all([preloadPromise, delayPromise]).then(() => {
            currentLevel = nextLevel;
            loadLevel();
        });
    } else {
        document.getElementById('message').textContent = 'Սխալ է';
    }
}

document.getElementById('submit-btn').addEventListener('click', checkGuess);

document.getElementById('guess-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

loadLevel();
