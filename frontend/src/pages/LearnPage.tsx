import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import type { EducationModule, QuizQuestion, QuizResult } from '../types';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const LearnPage: React.FC = () => {
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [activeTab, setActiveTab] = useState<'modules' | 'quiz'>('modules');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getEducation().then(res => setModules(res.modules || [])),
      api.getQuiz().then(res => setQuizQuestions(res.questions || []))
    ])
      .catch(() => setError('Failed to load educational resources.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      setError('Please answer all quiz questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitQuiz(selectedAnswers);
      setQuizResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Quiz submission failed';
      setError('Quiz submission error: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Learn Cyber Safety & Scam Awareness"
        description="Practical knowledge cards and interactive tests to help you identify deceptive tactics in everyday digital interactions."
        icon={BookOpen}
        iconColor="var(--color-cyan)"
      />

      {/* Tabs */}
      <nav aria-label="Education Sections" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'modules' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('modules')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
          aria-pressed={activeTab === 'modules'}
        >
          <BookOpen size={15} aria-hidden="true" />
          <span>Educational Modules</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quiz')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
          aria-pressed={activeTab === 'quiz'}
        >
          <HelpCircle size={15} aria-hidden="true" />
          <span>Interactive Scam Quiz</span>
        </button>
      </nav>

      {error && <AlertMessage type="warning" message={error} />}

      {loading && <LoadingSkeleton label="Loading cybersecurity modules..." lines={2} />}

      {/* TAB 1: Educational Articles */}
      {!loading && activeTab === 'modules' && (
        <section aria-label="Educational Guides" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modules.map(mod => (
            <article key={mod.id} className="cyber-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{mod.title}</h2>
                <span className="badge badge-info" style={{ fontSize: '10px' }}>{mod.category}</span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                {mod.summary}
              </p>

              <div className="grid-2">
                <div style={{ padding: '14px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-highrisk)', marginBottom: '8px' }}>
                    🚩 Common Warning Signs
                  </h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {mod.signs.map((sign: string, idx: number) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-safe)', marginBottom: '8px' }}>
                    🛡️ How to Verify & Protect
                  </h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {mod.prevention.map((prev: string, idx: number) => (
                      <li key={idx}>{prev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* TAB 2: Interactive Quiz */}
      {!loading && activeTab === 'quiz' && (
        <section aria-label="Scam Awareness Quiz" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {quizResult && (
            <div
              className="cyber-card"
              role="status"
              aria-live="polite"
              style={{
                backgroundColor: quizResult.percentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: quizResult.percentage >= 75 ? 'var(--color-safe)' : 'var(--color-suspicious)'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
                {quizResult.percentage >= 75 ? '🎉 Excellent Cyber Defense Skills!' : '📚 Review Recommended Actions Below'}
              </h2>
              <p style={{ fontSize: '14px' }}>
                You scored <strong>{quizResult.score} / {quizResult.total}</strong> ({quizResult.percentage}%).
              </p>
              <button type="button" className="btn btn-secondary" onClick={handleResetQuiz} style={{ marginTop: '12px', fontSize: '12px' }}>
                Retake Quiz
              </button>
            </div>
          )}

          {quizQuestions.map((q, idx) => {
            const feedback = quizResult?.feedback?.find(f => f.questionId === q.id);
            return (
              <div key={q.id} className="cyber-card" role="group" aria-labelledby={`question-${q.id}`}>
                <h3 id={`question-${q.id}`} style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                  {idx + 1}. {q.question}
                </h3>

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
                        onKeyDown={e => {
                          if (!quizResult && (e.key === ' ' || e.key === 'Enter')) {
                            e.preventDefault();
                            handleSelectOption(q.id, optIdx);
                          }
                        }}
                        tabIndex={quizResult ? -1 : 0}
                        role="radio"
                        aria-checked={isSelected}
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
                type="button"
                className="btn btn-primary"
                onClick={handleQuizSubmit}
                disabled={submitting}
                aria-label="Submit Quiz Answers"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz Answers'}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
