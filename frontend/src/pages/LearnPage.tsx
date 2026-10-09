import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, CheckCircle, XCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { api } from '../services/api';

export const LearnPage: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'modules' | 'quiz'>('modules');

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getEducation()
      .then(res => setModules(res.modules || []))
      .catch(() => {});

    api.getQuiz()
      .then(res => setQuizQuestions(res.questions || []))
      .catch(() => {});
  }, []);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      alert('Please answer all quiz questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitQuiz(selectedAnswers);
      setQuizResult(res);
    } catch (err: any) {
      alert('Quiz submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BookOpen size={24} color="var(--color-cyan)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Learn Cyber Safety & Scam Awareness</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Practical knowledge cards and interactive tests to help you identify deceptive tactics in everyday digital interactions.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          className={`btn ${activeTab === 'modules' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('modules')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <BookOpen size={15} /> Educational Modules
        </button>
        <button
          className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quiz')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <HelpCircle size={15} /> Interactive Scam Quiz
        </button>
      </div>

      {/* TAB 1: Educational Articles */}
      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modules.map(mod => (
            <div key={mod.id} className="cyber-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{mod.title}</h3>
                <span className="badge badge-info" style={{ fontSize: '10px' }}>{mod.category}</span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                {mod.summary}
              </p>

              <div className="grid-2">
                <div style={{ padding: '14px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-highrisk)', marginBottom: '8px' }}>
                    🚩 Common Warning Signs
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {mod.signs.map((sign: string, idx: number) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-safe)', marginBottom: '8px' }}>
                    🛡️ How to Verify & Protect
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {mod.prevention.map((prev: string, idx: number) => (
                      <li key={idx}>{prev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {quizResult && (
            <div
              className="cyber-card"
              style={{
                backgroundColor: quizResult.percentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: quizResult.percentage >= 75 ? 'var(--color-safe)' : 'var(--color-suspicious)'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
                {quizResult.percentage >= 75 ? '🎉 Excellent Cyber Defense Skills!' : '📚 Review Recommended Actions Below'}
              </h3>
              <p style={{ fontSize: '14px' }}>
                You scored <strong>{quizResult.score} / {quizResult.total}</strong> ({quizResult.percentage}%).
              </p>
              <button className="btn btn-secondary" onClick={handleResetQuiz} style={{ marginTop: '12px', fontSize: '12px' }}>
                Retake Quiz
              </button>
            </div>
          )}

          {quizQuestions.map((q, idx) => {
            const feedback = quizResult?.feedback?.find((f: any) => f.questionId === q.id);
            return (
              <div key={q.id} className="cyber-card">
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                  {idx + 1}. {q.question}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt: string, optIdx: number) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    let optionStyle: React.CSSProperties = {
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-input)',
                      cursor: quizResult ? 'default' : 'pointer',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    };

                    if (isSelected && !quizResult) {
                      optionStyle.borderColor = 'var(--color-cyan)';
                      optionStyle.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                    }

                    if (feedback) {
                      if (optIdx === feedback.correctAnswer) {
                        optionStyle.borderColor = 'var(--color-safe)';
                        optionStyle.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                      } else if (isSelected && !feedback.isCorrect) {
                        optionStyle.borderColor = 'var(--color-highrisk)';
                        optionStyle.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        style={optionStyle}
                        onClick={() => !quizResult && handleSelectOption(q.id, optIdx)}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {feedback && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      fontSize: '12px'
                    }}
                  >
                    <strong style={{ color: feedback.isCorrect ? 'var(--color-safe)' : 'var(--color-highrisk)' }}>
                      {feedback.isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}
                    </strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{feedback.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}

          {!quizResult && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={handleQuizSubmit}
                disabled={submitting}
              >
                Submit Quiz Answers
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
