import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QrCode, Search, Upload, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { EvidencePanel } from '../components/EvidencePanel';
import { RecommendationsBox } from '../components/RecommendationsBox';
import { ReportExportModal } from '../components/ReportExportModal';

export const QRCodeScannerPage: React.FC = () => {
  const location = useLocation();
  const prefill = location.state?.prefill?.rawText || '';

  const [rawText, setRawText] = useState(prefill);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image exceeds 5MB size limit.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBase64Image(reader.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async (overrideText?: string) => {
    const textToAnalyze = overrideText || rawText;
    if (!textToAnalyze.trim() && !base64Image) {
      setError('Please upload a QR image or enter decoded QR text to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeQR({
        rawText: textToAnalyze.trim() || undefined,
        base64Image: base64Image || undefined
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete QR analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    try {
      const rep = await api.exportReport(result.scanId);
      setReportMarkdown(rep.markdown);
      setIsReportOpen(true);
    } catch (err: any) {
      alert('Could not generate export report: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <QrCode size={24} color="var(--color-safe)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>QR Code Phishing (Quishing) Scanner</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Inspects concealed destinations inside QR codes before you scan them on your phone. Prevents accidental redirects to credential harvesters or fraudulent UPI payment requests.
        </p>
      </div>

      <div className="cyber-card">
        <div className="grid-2" style={{ gap: '20px', marginBottom: '16px' }}>
          {/* Method A: Image Upload */}
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-input)' }}>
            <Upload size={32} color="var(--color-cyan)" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Upload QR Code Image</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              PNG, JPG, or WebP up to 5MB
            </p>
            <input
              type="file"
              id="qr-file-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="qr-file-input" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              Select File
            </label>
            {fileName && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-cyan)' }}>
                Loaded: {fileName}
              </div>
            )}
          </div>

          {/* Method B: Direct Payload String */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Or Enter Encoded QR String Directly:
            </label>
            <textarea
              className="cyber-input"
              style={{ minHeight: '90px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              placeholder="e.g. http://netflix-suspended-reactivate.info/update or upi://pay?pa=scammer@upi&am=5000"
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Presets:</span>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              onClick={() => {
                const s = 'http://netflix-suspended-reactivate-payment.info/update?user=confirm';
                setRawText(s);
                handleScan(s);
              }}
            >
              Phishing URL QR
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              onClick={() => {
                const s = 'upi://pay?pa=fakemerchant99@okaxis&pn=BonusReward&am=1500&cu=INR';
                setRawText(s);
                handleScan(s);
              }}
            >
              Fake UPI Debit Intent QR
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => handleScan()} disabled={loading}>
            <Search size={16} /> Decode & Inspect
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', color: 'var(--color-highrisk)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '70px', width: '100%' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
        </div>
      )}

      {result && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>DECODED PAYLOAD DESTINATION</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--color-cyan)', wordBreak: 'break-all' }}>
                {result.decodedPayload || result.redactedInput}
              </div>
            </div>

            <button className="btn btn-secondary" onClick={handleExport} style={{ fontSize: '12px' }}>
              <FileText size={14} /> Export Redacted Report
            </button>
          </div>

          <RiskScoreMeter
            score={result.riskScore}
            classification={result.classification}
            modelProbability={result.modelProbability}
            confidence={result.confidence}
            detectionMethod={result.detectionMethod}
          />

          <EvidencePanel
            indicators={result.indicators}
            limitations={result.limitations}
          />

          <RecommendationsBox
            recommendations={result.recommendations}
          />
        </div>
      )}

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
      />
    </div>
  );
};
