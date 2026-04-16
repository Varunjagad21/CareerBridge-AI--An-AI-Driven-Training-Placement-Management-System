// ─────────────────────────────────────────────────────────────
// auth-helper.js  →  put this in your public/js/ folder
// Include it in every HTML page:  <script src="js/auth-helper.js"></script>
// ─────────────────────────────────────────────────────────────

const Auth = {

    // ── Save user after login ──
    save(token, user) {
        localStorage.setItem('token',     token);
        localStorage.setItem('userId',    user.id);
        localStorage.setItem('userName',  user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userRole',  user.role);
    },

    // ── Clear everything on logout ──
    logout() {
        localStorage.clear();
    },

    // ── Get token for API calls ──
    getToken() {
        return localStorage.getItem('token');
    },

    // ── Get current user info ──
    getUser() {
        return {
            id:    localStorage.getItem('userId'),
            name:  localStorage.getItem('userName'),
            email: localStorage.getItem('userEmail'),
            role:  localStorage.getItem('userRole')
        };
    },

    // ── Check if logged in ──
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    // ── Redirect if not logged in (call at top of protected pages) ──
    requireLogin(redirectTo = 'student-login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectTo;
        }
    },

    // ── Redirect if wrong role ──
    requireRole(role, redirectTo = 'student-login.html') {
        const user = this.getUser();
        if (!this.isLoggedIn() || user.role !== role) {
            window.location.href = redirectTo;
        }
    },

    // ── Attach token to every fetch call ──
    // Usage: fetch(url, Auth.headers())
    // Usage: fetch(url, Auth.headers({ method:'POST', body: JSON.stringify(data) }))
    headers(options = {}) {
        return {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
                ...(options.headers || {})
            }
        };
    },

    // ── For FormData (file upload) — don't set Content-Type ──
    headersFormData(options = {}) {
        return {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
                ...(options.headers || {})
            }
        };
    }
};