/* ==========================================================================
   Service: Mock API
   Simulates asynchronous network requests with artificial latency.
   ========================================================================== */

const DELAY = 800; // Simulated network latency in ms

// ==========================================================================
// Authentication Helper
// ==========================================================================
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('finsight_token');
    
    // Ensure headers object exists
    if (!options.headers) {
        options.headers = {};
    }
    
    // Attach JWT if available
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, options);

    // If unauthorized, token is either invalid or expired
    if (response.status === 401) {
        localStorage.removeItem('finsight_token');
        localStorage.removeItem('finsight_user');
        window.location.href = 'login.html';
        throw new Error('Session Expired');
    }

    return response;
}

export const api = {
    /**
     * Fetch KPI Data for the Dashboard Overview
     */
    getOverviewKPIs: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/dashboard/kpis');
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching KPIs", e);
            return null;
        }
    },

    /**
     * Fetch Revenue Chart Data
     */
    getRevenueChartData: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/dashboard/revenue');
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching revenue chart data", e);
            return null;
        }
    },

    /**
     * Fetch Recent Transactions (simplified version for overview)
     */
    getRecentTransactions: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/dashboard/transactions');
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching recent transactions", e);
            return [];
        }
    },

    /**
     * Fetch Full Ledger Transactions (for the dedicated transactions page)
     */
    getFullTransactions: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/transactions/full');
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching full transactions", e);
            return [];
        }
    },

    getCustomers: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/customers');
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching customers", e);
            return [];
        }
    },

    getDocuments: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/documents');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            // Format data slightly to match what UI expects
            return data.map(d => ({
                id: d.id,
                name: d.name,
                type: d.type,
                size: d.size,
                status: d.status,
                date: d.uploadDate,
                anomalies: d.anomalies,
                severity: d.threatLevel,
                summary: "Scanned document."
            }));
        } catch (e) {
            console.error("Failed fetching documents", e);
            return [];
        }
    },

    getDocumentDetails: async (id) => {
        try {
            const res = await fetchWithAuth(`http://localhost:3000/api/documents/${id}/details`);
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching doc details", e);
            return {
                id: id,
                name: "Document Data Unavailable",
                metrics: [],
                anomalies: []
            };
        }
    },

    askAI: async (query, docId) => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/ai/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, docId })
            });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            return data.answer;
        } catch (e) {
            console.error("Failed AI Query", e);
            return "Unable to connect to intelligence server. Please try again later.";
        }
    },

    getAuditLogs: async () => {
        try {
            const res = await fetchWithAuth('http://localhost:3000/api/audit-logs');
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Failed fetching audit logs", e);
            return [];
        }
    }
};
