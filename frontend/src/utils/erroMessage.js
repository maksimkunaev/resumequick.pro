// Initialize AWN notifier with consistent settings
function getNotifier() {
    if (typeof window !== 'undefined' && window.AWN) {
        return new window.AWN({
            position: 'top-right',
            durations: {
                alert: 5000,    // Error messages
                success: 3000,  // Success messages
                info: 4000      // Info messages
            },
            icons: {
                enabled: true
            },
            animationDuration: 300
        });
    }
    return null;
}

export function showError(message) {
    const notifier = getNotifier();
    if (notifier) {
        notifier.alert(String(message));
    } else {
        // Fallback to alert if AWN is not available
        alert(String(message));
    }
}

export function showSuccess(message) {
    const notifier = getNotifier();
    if (notifier) {
        notifier.success(String(message));
    } else {
        // Fallback - could use console.log or alert
        console.log('Success:', message);
    }
}

export function showInfo(message) {
    const notifier = getNotifier();
    if (notifier) {
        notifier.info(String(message));
    } else {
        // Fallback - could use console.log or alert
        console.log('Info:', message);
    }
}
