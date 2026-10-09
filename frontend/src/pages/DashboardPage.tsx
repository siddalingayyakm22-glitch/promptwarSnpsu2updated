import React, { useState, useEffect } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { DashboardData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AlertMessage } from '../components/AlertMessage';
import { EmptyState } from '../components/EmptyState';
import { RiskBadge } from '../components/RiskBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    api.getDashboard()
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const pieData = data ? [
    { name: 'Safe (0-30)', value: data.summary.safeCount },
    { name: 'Suspicious (31-60)', value: data.summary.suspiciousCount },
    { name: 'High Risk (61-100)', value: data.summary.highRiskCount }
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Security Analytics Dashboard"
        description="Real-time telemetry aggregated strictly from actual local database scan records."
        icon={LayoutDashboard}
        iconColor="var(--color-cyan)"
        action={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchDashboard}
            disabled={loading}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        }
      />

      {loading && <LoadingSkeleton label="Aggregating scan telemetry and system metrics..." lines={3} />}

      {error && <AlertMessage type="error" message={error} />}

      {data && !loading && (
        <>
          {/* Key Metric Counters */}
          <section className="grid-4" aria-label="Summary Statistics">
            <div className="cyber-card">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL SCANS</span>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
                {data.summary.totalScans}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All categories logged</span>
            </div>

            <div className="cyber-card">
              <span style={{ fontSize: '11px', color: 'var(--color-safe)', fontWeight: 700 }}>LOW RISK / SAFE</span>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--color-safe)' }}>
                {data.summary.safeCount}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Benign communications</span>
            </div>

            <div className="cyber-card">
              <span style={{ fontSize: '11px', color: 'var(--color-suspicious)', fontWeight: 700 }}>SUSPICIOUS</span>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--color-suspicious)' }}>
                {data.summary.suspiciousCount}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Needs verification</span>
            </div>

            <div className="cyber-card">
              <span style={{ fontSize: '11px', color: 'var(--color-highrisk)', fontWeight: 700 }}>HIGH RISK THREATS</span>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--color-highrisk)' }}>
                {data.summary.highRiskCount}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Strong warning indicators</span>
            </div>
          </section>

          {/* Charts Row */}
          <div className="grid-2">
            {/* Risk Band Distribution */}
            <section className="cyber-card" aria-label="Risk Band Distribution Chart">
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Risk Band Distribution
              </h2>

              {data.summary.totalScans === 0 ? (
                <EmptyState
                  title="No Scans Yet"
                  description="Run a URL, message, or email scan to populate telemetry charts."
                />
              ) : (
                <div style={{ height: '220px', width: '100%' }} role="img" aria-label={`Risk Distribution: Safe ${data.summary.safeCount}, Suspicious ${data.summary.suspiciousCount}, High Risk ${data.summary.highRiskCount}`}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>🟢 Safe ({data.summary.safeCount})</span>
                    <span>🟡 Suspicious ({data.summary.suspiciousCount})</span>
                    <span>🔴 High Risk ({data.summary.highRiskCount})</span>
                  </div>
                </div>
              )}
            </section>

            {/* Top Threat Categories */}
            <section className="cyber-card" aria-label="Top Threat Categories Chart">
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Top Threat Categories
              </h2>

              {data.topThreats.length === 0 ? (
                <EmptyState
                  title="No Threats Recorded"
                  description="No threat signatures detected in the current dataset."
                />
              ) : (
                <div style={{ height: '220px', width: '100%' }} role="img" aria-label="Top detected threat categories distribution bar chart">
                  <ResponsiveContainer>
                    <BarChart data={data.topThreats}>
                      <XAxis dataKey="type" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          {/* Recent Investigations Table */}
          <section className="cyber-card" aria-labelledby="recent-scans-heading">
            <h2 id="recent-scans-heading" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Recent Investigations
            </h2>

            {data.recentScans.length === 0 ? (
              <EmptyState
                title="No Recent Investigations"
                description="Investigations performed in the scanners will appear in this real-time log."
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <caption className="sr-only">List of recent security investigations</caption>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th scope="col" style={{ padding: '10px' }}>TYPE</th>
                      <th scope="col" style={{ padding: '10px' }}>TARGET (REDACTED)</th>
                      <th scope="col" style={{ padding: '10px' }}>SCORE</th>
                      <th scope="col" style={{ padding: '10px' }}>CLASSIFICATION</th>
                      <th scope="col" style={{ padding: '10px' }}>METHOD</th>
                      <th scope="col" style={{ padding: '10px' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentScans.map(s => (
                      <tr key={s.scanId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{s.scanType}</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.target}</td>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{s.riskScore}/100</td>
                        <td style={{ padding: '10px' }}><RiskBadge classification={s.classification} /></td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{s.detectionMethod}</td>
                        <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                          {new Date(s.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
