document.addEventListener('DOMContentLoaded', () => {
    console.log('DevOps E2E Application Loaded');

    const statusEndpoint = '/api/status';
    const metricsEndpoint = '/api/metrics';

    async function updateStatus() {
        try {
            const response = await fetch(statusEndpoint);
            const data = await response.json();
            console.log('Application Status:', data);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    }

    if (window.location.pathname === '/') {
        updateStatus();
        setInterval(updateStatus, 30000);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === window.location.pathname) {
            link.classList.add('active');
        }
    });

    window.addEventListener('online', () => {
        console.log('Connection restored');
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        alertDiv.innerHTML = 'Connection restored';
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    });

    window.addEventListener('offline', () => {
        console.log('Connection lost');
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        alertDiv.innerHTML = 'Connection lost. Some features may be unavailable.';
        document.body.appendChild(alertDiv);
    });
});