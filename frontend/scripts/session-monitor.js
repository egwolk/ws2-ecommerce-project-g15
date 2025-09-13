(function() {
    if (document.body.classList.contains('authenticated-page')) {
        const SESSION_CHECK_INTERVAL = 600000; 
        
        function checkSession() {
            fetch('/api/check-session')
                .then(response => response.json())
                .then(data => {
                    if (data.expired) {
                        window.location.href = '/users/login?message=expired';
                    }
                })
                .catch(err => console.error('Session check failed:', err));
        }
        
        // Initial check
        setTimeout(checkSession, 1000);
        
        // Periodic check
        setInterval(checkSession, SESSION_CHECK_INTERVAL);
    }
})();