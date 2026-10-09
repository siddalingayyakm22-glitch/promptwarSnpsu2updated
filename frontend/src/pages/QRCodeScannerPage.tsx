import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QrCode, Search, Upload, FileText } from 'lucide-react';
import { api } from '../services/api';
import type { ScanResult } from '../types';
import { PageHeader } from '../components/PageHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AlertMessage } from '../components/AlertMessage';
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete QR analysis.';
      setError(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report export failed';
      setError('Could not generate export report: ' + msg);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="QR Code Phishing (Quishing) Scanner"
        description="Inspects concealed destinations inside QR codes before you scan them on your phone. Prevents accidental redirects to credential harvesters or fraudulent UPI payment requests."
        icon={QrCode}
        iconColor="var(--color-safe)"
      />

      <section className="cyber-card" aria-labelledby="qr-form-heading">
        <h2 id="qr-form-heading" className="sr-only">QR Code Inspection Form</h2>
        <div className="grid-2" style={{ gap: '20px', marginBottom: '16px' }}>
          {/* Method A: Image Upload */}
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-input)' }}>
            <Upload size={32} color="var(--color-cyan)" style={{ margin: '0 auto 10px auto' }} aria-hidden="true" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Upload QR Code Image</h3>
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
            <label htmlFor="qr-raw-text" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Or Enter Encoded QR String Directly:
            </label>
            <textarea
              id="qr-raw-text"
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
              type="button"
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
              type="button"
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

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleScan()}
            disabled={loading}
            aria-label="Decode and Inspect QR Code"
          >
            <Search size={16} aria-hidden="true" />
            <span>{loading ? 'Decoding...' : 'Decode & Inspect'}</span>
          </button>
        </div>

        {error && <AlertMessage type="error" message={error} />}
      </section>

      {loading && <LoadingSkeleton label="Decoding image buffer & verifying embedded targets..." />}

      {result && !loading && (
        <section aria-label="QR Analysis Results" aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>DECODED PAYLOAD DESTINATION</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--color-cyan)', wordBreak: 'break-all' }}>
                {result.decodedPayload || result.redactedInput}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExport}
              style={{ fontSize: '12px' }}
              aria-label="Export Redacted Report"
            >
              <FileText size={14} aria-hidden="true" />
              <span>Export Redacted Report</span>
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
        </section>
      )}

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
      />
    </div>
  );
};
