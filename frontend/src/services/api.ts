import { ScanResult, DashboardData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const json = await response.json().catch(() => ({ success: false, error: 'Invalid JSON response from server' }));

  if (!response.ok || json.success === false) {
    throw new Error(json.error || `Request failed with HTTP ${response.status}`);
  }

  return json.data as T;
}

export const api = {
  // Scanners
  analyzeUrl: (url: string) => request<ScanResult>('/analyze/url', {
    method: 'POST',
    body: JSON.stringify({ url })
  }),

  analyzeMessage: (message: string) => request<ScanResult>('/analyze/message', {
    method: 'POST',
    body: JSON.stringify({ message })
  }),

  analyzeEmail: (data: {
    sender?: string;
    displayName?: string;
    replyTo?: string;
    subject?: string;
    body?: string;
    links?: string[];
    rawHeaders?: string;
  }) => request<ScanResult>('/analyze/email', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  analyzeQR: (data: { rawText?: string; base64Image?: string }) => request<ScanResult>('/analyze/qr', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  analyzeAttachment: (data: { filename: string; mimeType?: string; fileSize?: number }) => request<ScanResult>('/analyze/attachment', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Copilot Chat
  chat: (message: string) => request<{ reply: string; source: string; timestamp: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  }),

  // Dashboard & Analytics
  getDashboard: () => request<DashboardData>('/dashboard'),
  getAnalytics: () => request<any>('/analytics'),
  getThreats: () => request<any>('/threats'),

  // History & Reports
  getHistory: (params: { page?: number; limit?: number; scanType?: string; classification?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.scanType) query.append('scanType', params.scanType);
    if (params.classification) query.append('classification', params.classification);
    return request<{ scans: ScanResult[]; pagination: any }>(`/history?${query.toString()}`);
  },

  getHistoryById: (id: string) => request<ScanResult>(`/history/${id}`),
  deleteHistoryById: (id: string) => request<{ message: string }>(`/history/${id}`, { method: 'DELETE' }),
  clearAllHistory: () => request<{ message: string }>('/history', { method: 'DELETE' }),
  exportReport: (scanId?: string) => request<{ reportId: string; markdown: string; exportedAt: string }>('/reports/export', {
    method: 'POST',
    body: JSON.stringify({ scanId })
  }),

  // Education
  getEducation: () => request<{ modules: any[]; totalModules: number }>('/education'),
  getQuiz: () => request<{ questions: any[] }>('/education/quiz'),
  submitQuiz: (answers: Record<string, number>) => request<{ score: number; total: number; percentage: number; feedback: any[] }>('/education/quiz', {
    method: 'POST',
    body: JSON.stringify({ answers })
  }),

  // System Health
  getHealth: () => request<any>('/health/ready')
};
