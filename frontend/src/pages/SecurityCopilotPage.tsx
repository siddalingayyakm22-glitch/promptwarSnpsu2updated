import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, ShieldCheck, AlertCircle, Sparkles, User, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  'Someone asked me for an OTP. What should I do?',
  'What should I do after clicking a suspicious link?',
  'How do I verify a bank SMS about account suspension?',
  'How can I recognize a fake Telegram job offer?',
  'What is QR phishing (quishing)?',
  'Could an urgent phone call be an AI voice clone?'
];

export const SecurityCopilotPage: React.FC = () => {
  const location = useLocation();
  const initialPrefill = location.state?.prefill?.message || '';

  const [input, setInput] = useState(initialPrefill);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am **CyberShield Copilot**, your defensive cybersecurity assistant.\n\nAsk me about suspicious links, unverified bank alerts, OTP fraud, or immediate emergency containment steps. What can I help investigate today?`,
      source: 'DEFENSIVE_SYSTEM',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chat(textToSend);
      const assistantMsg: ChatMessage = {
        id: 'asst_' + Date.now(),
        sender: 'assistant',
        text: res.reply,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: `⚠️ Error contacting Copilot engine: ${err.message || 'Service unavailable'}. Please verify backend status.`,
        source: 'ERROR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Bot size={24} color="var(--color-cyan)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>AI Security Copilot</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Conversational digital safety advisor. Built with strict prompt-injection defenses and zero credential collection.
        </p>
      </div>

      {/* Chat Messages Container */}
      <div
        className="cyber-card"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        {messages.map(m => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid var(--color-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} color="var(--color-cyan)" />
                </div>
              )}

              <div>
                <div
                  style={{
                    backgroundColor: isUser ? 'var(--color-blue)' : 'var(--bg-input)',
                    color: '#ffffff',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span>{m.timestamp}</span>
                  {m.source && (
                    <span>• {m.source.replace('_', ' ')}</span>
                  )}
                </div>
              </div>

              {isUser && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <User size={18} color="var(--text-secondary)" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }} />
            <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: 'var(--radius-md)' }} />
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
            onClick={() => handleSend(q)}
          >
            <Sparkles size={12} color="var(--color-cyan)" /> {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="cyber-input"
          placeholder="Ask Copilot a cybersecurity or incident question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          <Send size={16} /> Send
        </button>
      </div>
    </div>
  );
};
