const body = document.body;
const darkModeToggle = document.getElementById('dark-mode-toggle');

function setDarkMode(enabled) {
    body.classList.toggle('dark-mode', enabled);
    darkModeToggle.textContent = enabled ? '☀️' : '🌙';
    localStorage.setItem('darkMode', enabled);
}

const savedDarkMode = localStorage.getItem('darkMode') === 'true';
setDarkMode(savedDarkMode);

darkModeToggle.addEventListener('click', () => {
    setDarkMode(!body.classList.contains('dark-mode'));
});
