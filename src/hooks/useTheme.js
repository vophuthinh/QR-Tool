import { useState, useEffect } from 'react';

/**
 * Get initial theme from localStorage, default to 'light'
 */
function getInitialTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        // Mặc định là 'light' thay vì theo system preference
        return 'light';
    } catch {
        return 'light';
    }
}

/**
 * Theme hook with persistent storage (independent of privacy mode)
 * Theme is ALWAYS saved to localStorage for better UX
 * @returns {[string, Function, boolean]} [theme, setTheme, isDark]
 */
export function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark');

        // Always save theme (privacy-independent)
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Failed to save theme:', error);
        }
    }, [theme]);

    const isDark = theme === 'dark';

    return [theme, setTheme, isDark];
}
