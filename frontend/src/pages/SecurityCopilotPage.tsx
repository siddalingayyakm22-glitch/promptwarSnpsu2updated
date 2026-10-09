import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Service unavailable';
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: `⚠️ Error contacting Copilot engine: ${msg}. Please verify backend status.`,
        source: 'ERROR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '16px' }}>
      <PageHeader
        title="AI Security Copilot"
        description="Conversational digital safety advisor. Built with strict prompt-injection defenses and zero credential collection."
        icon={Bot}
        iconColor="var(--color-cyan)"
      />

      {error && <AlertMessage type="warning" message={`Notice: ${error}`} />}

      {/* Chat Messages Container */}
      <section
        className="cyber-card"
        aria-label="Conversation Log"
        aria-live="polite"
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
                  aria-hidden="true"
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
                  <time>{m.timestamp}</time>
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
                  aria-hidden="true"
                >
                  <User size={18} color="var(--text-secondary)" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }} aria-busy="true" aria-label="Copilot is generating guidance...">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }} />
            <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: 'var(--radius-md)' }} />
          </div>
        )}
      </section>

      {/* Suggested Questions Pills */}
      <nav aria-label="Suggested Security Questions" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
            onClick={() => handleSend(q)}
          >
            <Sparkles size={12} color="var(--color-cyan)" aria-hidden="true" />
            <span>{q}</span>
          </button>
        ))}
      </nav>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <label htmlFor="copilot-input" className="sr-only">Ask Security Copilot a question</label>
        <input
          id="copilot-input"
          type="text"
          className="cyber-input"
          placeholder="Ask Copilot a cybersecurity or incident question..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          aria-label="Send message to Copilot"
        >
          <Send size={16} aria-hidden="true" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
