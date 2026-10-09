import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { HomePage } from './pages/HomePage';
import { URLScannerPage } from './pages/URLScannerPage';
import { MessageDetectorPage } from './pages/MessageDetectorPage';
import { EmailAnalyzerPage } from './pages/EmailAnalyzerPage';
import { QRCodeScannerPage } from './pages/QRCodeScannerPage';
import { SecurityCopilotPage } from './pages/SecurityCopilotPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { LearnPage } from './pages/LearnPage';
import { IncidentResponsePage } from './pages/IncidentResponsePage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';
import { AboutMethodologyPage } from './pages/AboutMethodologyPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <main id="main-content" className="page-wrapper" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan-url" element={<URLScannerPage />} />
              <Route path="/scan-message" element={<MessageDetectorPage />} />
              <Route path="/scan-email" element={<EmailAnalyzerPage />} />
              <Route path="/scan-qr" element={<QRCodeScannerPage />} />
              <Route path="/copilot" element={<SecurityCopilotPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/threats" element={<ThreatIntelPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/incident-response" element={<IncidentResponsePage />} />
              <Route path="/privacy" element={<PrivacySettingsPage />} />
              <Route path="/about" element={<AboutMethodologyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
