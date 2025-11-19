document.addEventListener('DOMContentLoaded', function() {
    // Define all possible form configurations
    const formConfigs = [
        {
            // Register form
            passwordInput: 'password',
            confirmInput: 'confirmPassword',
            passwordMsg: 'password-strength-msg',
            confirmMsg: 'confirm-password-msg'
        },
        {
            // Admin create form
            passwordInput: 'password',
            confirmInput: 'confirmPassword',
            passwordMsg: 'admin-password-strength-msg',
            confirmMsg: 'admin-confirm-password-msg'
        },
        {
            // Edit profile form
            passwordInput: 'password',
            confirmInput: 'confirmPassword',
            passwordMsg: 'profile-password-strength-msg',
            confirmMsg: 'profile-confirm-password-msg'
        },
        {
            // Reset password form
            passwordInput: 'password',
            confirmInput: 'confirm',
            passwordMsg: 'reset-password-strength-msg',
            confirmMsg: 'reset-confirm-password-msg'
        }
    ];

    // Initialize validation for each form that exists on the current page
    formConfigs.forEach(config => {
        const passwordInput = document.getElementById(config.passwordInput);
        const confirmPasswordInput = document.getElementById(config.confirmInput);
        const passwordMsg = document.getElementById(config.passwordMsg);
        const confirmMsg = document.getElementById(config.confirmMsg);

        if (passwordInput && passwordMsg) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                
                if (password.length === 0) {
                    passwordMsg.classList.remove('show', 'weak', 'medium', 'strong');
                    return;
                }

                passwordMsg.classList.add('show');
                
                // Calculate password strength
                const strength = calculatePasswordStrength(password);
                
                // Remove all strength classes
                passwordMsg.classList.remove('weak', 'medium', 'strong');
                
                // Update message and class based on strength
                let message = '';
                switch (strength.level) {
                    case 'weak':
                        message = strength.missing.length > 0 
                            ? `WEAK - NEEDS: ${strength.missing.join(', ')}`
                            : 'WEAK';
                        passwordMsg.classList.add('weak');
                        break;
                    case 'medium':
                        message = strength.missing.length > 0 
                            ? `MEDIUM - NEEDS: ${strength.missing.join(', ')}`
                            : 'MEDIUM';
                        passwordMsg.classList.add('medium');
                        break;
                    case 'strong':
                        message = 'STRONG';
                        passwordMsg.classList.add('strong');
                        break;
                    default:
                        message = 'WEAK - NEEDS: 8+ characters, lowercase, uppercase, number, special character';
                        passwordMsg.classList.add('weak');
                }
                
                passwordMsg.textContent = message;
                
                // Also check confirm password if it has value
                if (confirmPasswordInput && confirmPasswordInput.value) {
                    checkPasswordMatch(passwordInput, confirmPasswordInput, confirmMsg);
                }
            });
        }

        if (confirmPasswordInput && confirmMsg) {
            confirmPasswordInput.addEventListener('input', function() {
                if (this.value.length === 0) {
                    confirmMsg.classList.remove('show', 'match', 'no-match');
                    return;
                }

                checkPasswordMatch(passwordInput, confirmPasswordInput, confirmMsg);
            });
        }
    });

    function calculatePasswordStrength(password) {
        let score = 0;
        let firstMissing = null;
        
        // Length check (highest priority)
        if (password.length < 8) {
            if (!firstMissing) firstMissing = '8+ characters';
        } else {
            score++;
            if (password.length >= 12) score++;
        }
        
        // Character type checks (in order of priority)
        if (!/[a-z]/.test(password)) {
            if (!firstMissing) firstMissing = 'lowercase letter';
        } else {
            score++;
        }
        
        if (!/[A-Z]/.test(password)) {
            if (!firstMissing) firstMissing = 'uppercase letter';
        } else {
            score++;
        }
        
        if (!/\d/.test(password)) {
            if (!firstMissing) firstMissing = 'number';
        } else {
            score++;
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            if (!firstMissing) firstMissing = 'special character';
        } else {
            score++;
        }
        
        // Return strength level with only the first missing criterion
        // Only strong if ALL criteria are met (no missing requirements)
        if (firstMissing) {
            if (score <= 2) {
                return { level: 'weak', missing: [firstMissing] };
            } else {
                return { level: 'medium', missing: [firstMissing] };
            }
        } else {
            return { level: 'strong', missing: [] };
        }
    }

    function checkPasswordMatch(passwordInput, confirmPasswordInput, confirmMsg) {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        confirmMsg.classList.add('show');
        confirmMsg.classList.remove('match', 'no-match');
        
        if (password === confirmPassword) {
            confirmMsg.textContent = 'MATCH';
            confirmMsg.classList.add('match');
        } else {
            confirmMsg.textContent = 'NOT MATCH';
            confirmMsg.classList.add('no-match');
        }
    }
});

// Password toggle function
function togglePassword(inputId, toggleElement) {
    try {
        console.debug('togglePassword called with', inputId, toggleElement);
    } catch (e) {}
    // Try to find the input by id, then by name, then as a nearby input
    let passwordInput = document.getElementById(inputId) || document.querySelector(`input[name="${inputId}"]`);

    if (!passwordInput && toggleElement) {
        // Look for an input inside the same password-container or parent element
        const container = toggleElement.closest('.password-container') || toggleElement.parentElement;
        if (container) {
            passwordInput = container.querySelector('input[type="password"], input[type="text"]');
        }
    }

    if (!passwordInput) return; // nothing to toggle

    // Normalize toggleElement and eyeIcon
    if (!toggleElement && passwordInput.parentElement) {
        toggleElement = passwordInput.parentElement.querySelector('.password-toggle');
    }

    let eyeIcon = toggleElement ? toggleElement.querySelector('.eye-icon') : null;
    if (!eyeIcon) {
        // Fallback: try to find any .eye-icon next to the input
        eyeIcon = passwordInput.parentElement ? passwordInput.parentElement.querySelector('.eye-icon') : null;
    }

    if (toggleElement) toggleElement.style.cursor = 'pointer';

    if (passwordInput.type === 'password') {
        try { console.debug('current type=password, switching to text'); } catch (e) {}
        passwordInput.type = 'text';
        if (eyeIcon) {
            eyeIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
                    <path d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM176.9 111.1c32.1-18.9 69.2-31.1 111.1-31.1 65.2 0 118.8 29.6 159.9 67.7 38.5 35.7 65.1 78.3 78.6 108.3-13.6 30-40.2 72.5-78.6 108.3-3.1 2.8-6.2 5.6-9.4 8.4L393.8 328c14-20.5 22.2-45.3 22.2-72 0-70.7-57.3-128-128-128-26.7 0-51.5 8.2-72 22.2l-39.1-39.1zm182 182l-108-108c11.1-5.8 23.7-9.1 37.1-9.1 44.2 0 80 35.8 80 80 0 13.4-3.3 26-9.1 37.1zM103.4 173.2l-34-34c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6L352.2 422c-20 6.4-41.4 10-64.2 10-65.2 0-118.8-29.6-159.9-67.7-38.5-35.7-65.1-78.3-78.6-108.3 10.4-23.1 28.6-53.6 54-82.8z"/>
                </svg>
            `;
        }
    } else {
        try { console.debug('current type=text, switching to password'); } catch (e) {}
        passwordInput.type = 'password';
        if (eyeIcon) {
            eyeIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
                    <path d="M288 80C222.8 80 169.2 109.6 128.1 147.7 89.6 183.5 63 226 49.4 256 63 286 89.6 328.5 128.1 364.3 169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256 513 226 486.4 183.5 447.9 147.7 406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1 3.3 7.9 3.3 16.7 0 24.6-14.9 35.7-46.2 87.7-93 131.1-47.1 43.7-111.8 80.6-192.6 80.6S142.5 443.2 95.4 399.4c-46.8-43.5-78.1-95.4-93-131.1-3.3-7.9-3.3-16.7 0-24.6 14.9-35.7 46.2-87.7 93-131.1zM288 336c44.2 0 80-35.8 80-80 0-29.6-16.1-55.5-40-69.3-1.4 59.7-49.6 107.9-109.3 109.3 13.8 23.9 39.7 40 69.3 40zm-79.6-88.4c2.5 .3 5 .4 7.6 .4 35.3 0 64-28.7 64-64 0-2.6-.2-5.1-.4-7.6-37.4 3.9-67.2 33.7-71.1 71.1zm45.6-115c10.8-3 22.2-4.5 33.9-4.5 8.8 0 17.5 .9 25.8 2.6 .3 .1 .5 .1 .8 .2 57.9 12.2 101.4 63.7 101.4 125.2 0 70.7-57.3 128-128 128-61.6 0-113-43.5-125.2-101.4-1.8-8.6-2.8-17.5-2.8-26.6 0-11 1.4-21.8 4-32 .2-.7 .3-1.3 .5-1.9 11.9-43.4 46.1-77.6 89.5-89.5z"/>
                </svg>
            `;
        }
    }
}

// Attach event listeners to .password-toggle as a CSP-safe fallback
document.addEventListener('DOMContentLoaded', function attachToggleListeners() {
    try {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach(t => {
            // Avoid attaching duplicate listeners
            if (t._pwToggleAttached) return;
            t.addEventListener('click', function (e) {
                // Prevent any default bubbling
                e.preventDefault();
                const target = t.getAttribute('data-target') || t.dataset.target;
                togglePassword(target, t);
            });
            t._pwToggleAttached = true;
        });
    } catch (err) {
        console.error('Failed to attach password toggle listeners', err);
    }
});

// Manual Turnstile rendering: prevent auto verification until user clicks
document.addEventListener('DOMContentLoaded', function attachTurnstileHandlers() {
    try {
        const widgets = document.querySelectorAll('.cf-turnstile[data-sitekey-value]');
        widgets.forEach(widget => {
            const sitekey = widget.getAttribute('data-sitekey-value');
            // Replace the div content with a verify button and a host for the widget
            widget.innerHTML = '';
            const verifyBtn = document.createElement('button');
            verifyBtn.type = 'button';
            verifyBtn.className = 'turnstile-show-btn';
            verifyBtn.textContent = 'Click to verify';
            widget.appendChild(verifyBtn);

            const host = document.createElement('div');
            host.className = 'turnstile-host';
            widget.appendChild(host);

            let rendered = false;

            verifyBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (rendered) return;
                if (!window.turnstile || typeof window.turnstile.render !== 'function') {
                    console.warn('Turnstile library not loaded yet. Try again in a moment.');
                    return;
                }

                const widgetId = turnstile.render(host, {
                    sitekey: sitekey,
                    callback: function (token) {
                        // Place token into a hidden input inside the same form
                        const form = widget.closest('form');
                        if (!form) return;
                        let input = form.querySelector('input[name="cf-turnstile-response"]');
                        if (!input) {
                            input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = 'cf-turnstile-response';
                            form.appendChild(input);
                        }
                        input.value = token;
                        verifyBtn.textContent = 'Verified';
                        verifyBtn.disabled = true;
                    }
                });
                rendered = true;
            });
        });
    } catch (err) {
        console.error('Error setting up manual Turnstile handlers', err);
    }
});