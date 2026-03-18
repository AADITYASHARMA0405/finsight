/* ==========================================================================
   Service: Authentication
   Manages JWT local storage and current session state.
   ========================================================================== */

export const auth = {
    /**
     * Get current user profile
     */
    getUser: () => {
        const userData = localStorage.getItem('finsight_user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                return {
                    name: parsed.name,
                    email: parsed.email,
                    role: parsed.role,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name)}&background=0D8ABC&color=fff`
                };
            } catch (e) {
                console.error("Failed parsing user data", e);
            }
        }
        
        // Fallback for edge cases where data is malformed
        return {
            name: 'User', 
            role: 'Analyst',
            avatar: 'https://ui-avatars.com/api/?name=User'
        };
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('finsight_token');
    },

    /**
     * Log user out
     */
    logout: () => {
        localStorage.removeItem('finsight_token');
        localStorage.removeItem('finsight_user');
        window.location.href = 'login.html';
    }
};
