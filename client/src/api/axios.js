import axios from 'axios';
import * as mockData from './mockData';

// FLAG TO ENABLE MOCK MODE (Can be toggled via UI)
const USE_MOCK = localStorage.getItem('use_mock') === 'true';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Helper to get request data safely
const getReqData = (data) => {
    if (!data) return {};
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    }
    return data;
};

// Mock Interceptor
api.interceptors.request.use(async (config) => {
    if (!USE_MOCK) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }

    // MOCK LOGIC
    console.log(`[MOCK API] ${config.method.toUpperCase()} ${config.url}`);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Handle Auth Me
    if (config.url === '/auth/me') {
        const user = JSON.parse(localStorage.getItem('mock_user'));
        if (!user) throw { response: { status: 401, data: { error: 'Unauthorized' } } };
        return Promise.reject({ mockResponse: { data: user } });
    }

    // Handle Login
    if (config.url === '/auth/login') {
        const { email } = getReqData(config.data);
        const user = mockData.getMockUser(email);
        if (user) {
            localStorage.setItem('mock_user', JSON.stringify(user));
            return Promise.reject({ mockResponse: { data: { token: 'mock-token', user } } });
        }
        return Promise.reject({ mockResponse: { status: 401, data: { error: 'Invalid credentials' } } });
    }

    // Handle Get Leads
    if (config.url === '/leads' && config.method === 'get') {
        return Promise.reject({ mockResponse: { data: mockData.getMockLeadsList() } });
    }

    // Handle Create Lead
    if (config.url === '/leads' && config.method === 'post') {
        const { title, details } = getReqData(config.data);
        const userStr = localStorage.getItem('mock_user');
        const user = userStr ? JSON.parse(userStr) : { id: 'm1', name: 'Admin' };
        const newLead = {
            id: 'l' + Date.now(),
            title,
            current_step: details ? 2 : 1,
            status: 'In_Progress',
            created_by: user.id,
            creator: { name: user.name },
            LeadData: details ? [{ id: 'ld' + Date.now(), step_number: 1, status: 'Approved', data: details, createdAt: new Date().toISOString() }] : [],
            createdAt: new Date().toISOString()
        };
        mockData.saveMockLead(newLead);
        return Promise.reject({ mockResponse: { data: newLead } });
    }

    // Handle Get Lead By ID
    if (config.url.startsWith('/leads/') && config.method === 'get') {
        const id = config.url.split('/')[2];
        const lead = mockData.getMockLeads().find(l => l.id === id);
        if (lead) return Promise.reject({ mockResponse: { data: lead } });
        throw { response: { status: 404, data: { error: 'Not found' } } };
    }

    // Handle Step Submission
    if (config.url.includes('/step/') && config.method === 'post') {
        const parts = config.url.split('/');
        const id = parts[2];
        const step = parseInt(parts[4]);
        const { data, action, remarks } = getReqData(config.data);
        const userStr = localStorage.getItem('mock_user');
        const user = userStr ? JSON.parse(userStr) : { id: 'm1' };

        const leads = mockData.getMockLeads();
        const lead = leads.find(l => l.id === id);

        if (action === 'reject') {
            if (step > 1) lead.current_step -= 1;
        } else {
            if (step < 11) lead.current_step += 1;
            else lead.status = 'Approved';
        }

        lead.LeadData.push({
            id: 'ld' + Date.now(),
            step_number: step,
            status: action === 'reject' ? 'Rejected' : 'Approved',
            data,
            remarks,
            submitted_by: user.id,
            createdAt: new Date().toISOString()
        });

        mockData.saveMockLead(lead);
        return Promise.reject({ mockResponse: { data: { message: 'Success', lead } } });
    }

    return config;
}, (error) => Promise.reject(error));

// Add response interceptor to handle mock responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.mockResponse) {
            // If it's a mock response with data but no status, treat as Success
            if (error.mockResponse.data && !error.mockResponse.status) {
                return Promise.resolve(error.mockResponse);
            }
            // If it's a mock response with a status (like 401), treat as Error
            if (error.mockResponse.status) {
                return Promise.reject({
                    response: {
                        status: error.mockResponse.status,
                        data: error.mockResponse.data
                    }
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
