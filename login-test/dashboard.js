// Supabase Configuration
const SUPABASE_URL = 'https://knacmotvgkssgnjrpamh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYWNtb3R2Z2tzc2duanJwYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzMxODUsImV4cCI6MjA5MzA0OTE4NX0.AJO277T-JoGWkhG4OIHOzpC0sbZagiHTtUQQuulPfaU';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const userEmailDisplay = document.getElementById('user-email');
const userInitials = document.getElementById('user-initials');
const logoutBtn = document.getElementById('logout-btn');
const loadingOverlay = document.getElementById('loading-overlay');

/**
 * Check if user is authenticated
 */
async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error || !session) {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
    } else {
        // User is authenticated, update UI
        const email = session.user.email;
        userEmailDisplay.textContent = email;
        userInitials.textContent = email.charAt(0).toUpperCase();
        
        // Hide loading overlay with a slight delay for smooth transition
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }, 500);
    }
}

/**
 * Handle Logout
 */
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    } else {
        alert(error.message);
    }
});

// Run auth check on load
checkAuth();

// Listen for auth changes (e.g. if session expires)
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
    }
});
