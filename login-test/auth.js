// Supabase Configuration
// REPLACE THESE WITH YOUR OWN SUPABASE PROJECT DETAILS
const SUPABASE_URL = 'https://knacmotvgkssgnjrpamh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYWNtb3R2Z2tzc2duanJwYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzMxODUsImV4cCI6MjA5MzA0OTE4NX0.AJO277T-JoGWkhG4OIHOzpC0sbZagiHTtUQQuulPfaU';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const profileSection = document.getElementById('profile-section');
const messageBox = document.getElementById('message');

// Forms
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Toggle Links
const goToSignup = document.getElementById('go-to-signup');
const goToLogin = document.getElementById('go-to-login');

// Profile Info
const userEmailDisplay = document.getElementById('user-email');
const userInitials = document.getElementById('user-initials');
const logoutBtn = document.getElementById('logout-btn');

/**
 * Utility: Show Message
 */
function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = type;
    messageBox.style.display = 'block';
    
    // Auto-hide after 5 seconds if it's a success message
    if (type === 'success') {
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
}

/**
 * Switch between Login and Sign Up forms
 */
goToSignup.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
    messageBox.style.display = 'none';
});

goToLogin.addEventListener('click', () => {
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    messageBox.style.display = 'none';
});

/**
 * Handle Sign Up
 */
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const submitBtn = document.getElementById('signup-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin + window.location.pathname
        }
    });

    if (error) {
        showMessage(error.message, 'error');
    } else {
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            showMessage('User already exists. Please login instead.', 'error');
        } else {
            showMessage('Success! Check your email for a confirmation link.', 'success');
            signupForm.reset();
        }
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
});

/**
 * Handle Login
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        showMessage(error.message, 'error');
    } else {
        // Redirect to dashboard on success
        window.location.href = 'dashboard.html';
        loginForm.reset();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
});

/**
 * Handle Logout
 */
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) showMessage(error.message, 'error');
});

/**
 * Auth State Change Listener
 * Handles UI updates when user logs in or out
 */
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        // Logged In - Redirect to dashboard if we are on the login page
        // (Optional: you can keep them on index.html if you prefer the profile view there)
        // For now, let's just show the profile section as before but add the dashboard link
        loginSection.classList.add('hidden');
        signupSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
        
        const email = session.user.email;
        userEmailDisplay.textContent = email;
        userInitials.textContent = email.charAt(0).toUpperCase();
        messageBox.style.display = 'none';
    } else {
        // Logged Out
        profileSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        signupSection.classList.add('hidden');
    }
});
