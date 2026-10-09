import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, AlertTriangle, Activity, Database, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { DashboardData } from '../types';
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
        setError(err.message || 'Failed to fetch dashboard metrics.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <LayoutDashboard size={24} color="var(--color-cyan)" />
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Security Analytics Dashboard</h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Real-time telemetry aggregated strictly from actual local database scan records.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchDashboard} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="grid-3">
          <div className="cyber-card skeleton" style={{ height: '100px' }} />
          <div className="cyber-card skeleton" style={{ height: '100px' }} />
          <div className="cyber-card skeleton" style={{ height: '100px' }} />
        </div>
      )}

      {error && (
        <div className="cyber-card" style={{ borderColor: 'var(--color-highrisk)', color: 'var(--color-highrisk)' }}>
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Key Metric Counters */}
          <div className="grid-4">
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
          </div>

          {/* Charts Row */}
          <div className="grid-2">
            {/* Risk Band Distribution */}
            <div className="cyber-card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Risk Band Distribution
              </h3>

              {data.summary.totalScans === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No scans performed yet. Run a URL or Message scan to populate analytics.
                </div>
              ) : (
                <div style={{ height: '220px', width: '100%' }}>
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
                        {pieData.map((entry, index) => (
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
            </div>

            {/* Top Threat Categories */}
            <div className="cyber-card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Top Threat Categories
              </h3>

              {data.topThreats.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No threats identified in current dataset.
                </div>
              ) : (
                <div style={{ height: '220px', width: '100%' }}>
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
            </div>
          </div>

          {/* Recent Investigations Table */}
          <div className="cyber-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Recent Investigations
            </h3>

            {data.recentScans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                No recent scan investigations on record.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px' }}>TYPE</th>
                      <th style={{ padding: '10px' }}>TARGET (REDACTED)</th>
                      <th style={{ padding: '10px' }}>SCORE</th>
                      <th style={{ padding: '10px' }}>CLASSIFICATION</th>
                      <th style={{ padding: '10px' }}>METHOD</th>
                      <th style={{ padding: '10px' }}>DATE</th>
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
          </div>
        </>
      )}
    </div>
  );
};
