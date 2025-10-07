// index.js - Welcome page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    FitnessApp.init();
    
    // Get DOM elements
    const getStartedBtn = document.getElementById('getStartedBtn');
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close-btn');
    const loginForm = document.getElementById('loginForm');

    // Get Started button - redirect to onboarding
    getStartedBtn.addEventListener('click', function() {
        window.location.href = 'onboarding.html';
    });

    // Login button - show modal
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'flex';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    // Close modal when clicking outside
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = FitnessApp.Form.serializeForm(this);
        const submitBtn = this.querySelector('.submit-btn');
        
        try {
            FitnessApp.UI.showLoading(submitBtn);
            
            // Attempt login
            await FitnessApp.Auth.handleLogin(formData.email, formData.password);
            
            // Get user data to determine redirect
            const user = FitnessApp.Profile.getProfile();
            const redirectUrl = user.isOnboarded ? 'transformation.html' : 'onboarding.html';
            
            // Close modal and redirect
            loginModal.style.display = 'none';
            FitnessApp.UI.showNotification('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
            
        } catch (error) {
            console.error('Login failed:', error);
            // Error is already handled by AuthManager
        } finally {
            FitnessApp.UI.hideLoading(submitBtn);
        }
    });

    // Check if user is already logged in
    if (FitnessApp.Auth.isAuthenticated()) {
        const user = FitnessApp.Profile.getProfile();
        const redirectUrl = user.isOnboarded ? 'transformation.html' : 'onboarding.html';
        
        FitnessApp.UI.showNotification('Welcome back! Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
    }

    // Add some interactive effects
    getStartedBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    getStartedBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });

    console.log('🏠 Index page loaded successfully');
});