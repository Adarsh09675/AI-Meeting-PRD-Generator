import React, { useState, useEffect } from 'react';
import api from '../services/api';

type Stage = 'IDLE' | 'UPLOADING' | 'IMPORTING' | 'CHUNKING' | 'EMBEDDING' | 'UPSERTING' | 'GENERATING' | 'COMPLETED' | 'ERROR';
type SourceType = 'FIREFLIES' | 'VIDEO' | 'PASTE';

const Home: React.FC = () => {
  const [stage, setStage] = useState<Stage>('IDLE');
  const [sourceType, setSourceType] = useState<SourceType>('FIREFLIES');
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [prd, setPrd] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/fireflies/meetings');
      setMeetings(res.data);
    } catch (err: any) {
      console.error('Failed to fetch meeting list', err);
      setError('Backend Connection Failed: Ensure you have run "npm run dev" in the backend folder.');
      setStage('ERROR');
    }
  };

  const handleImport = async (id: string) => {
    setStage('IMPORTING');
    try {
      const res = await api.post('/fireflies/import', { firefliesId: id });
      setTranscriptId(res.data._id);
      setTranscriptText(res.data.originalText);
      setStage('IDLE');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
      setStage('ERROR');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStage('UPLOADING');
    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await api.post('/transcripts/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTranscriptId(res.data._id);
      setTranscriptText(res.data.originalText);
      setStage('IDLE');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
      setStage('ERROR');
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) return;
    setStage('IMPORTING');
    try {
      const res = await api.post('/transcripts', { text: pastedText });
      setTranscriptId(res.data._id);
      setTranscriptText(res.data.originalText);
      setStage('IDLE');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save text');
      setStage('ERROR');
    }
  };

  const startGeneration = async () => {
    if (!transcriptId) return;

    setStage('CHUNKING');
    const stages: Stage[] = ['CHUNKING', 'EMBEDDING', 'UPSERTING', 'GENERATING'];

    try {
      const generatePromise = api.post('/prd', { transcriptId });

      for (let i = 0; i < stages.length; i++) {
        setStage(stages[i]);
        await new Promise(r => setTimeout(r, 1200));
      }

      const res = await generatePromise;
      setPrd(res.data.content);
      setStage('COMPLETED');
    } catch (err: any) {
      setError(err.response?.data?.details || 'Generation failed');
      setStage('ERROR');
    }
  };

  const reset = () => {
    setStage('IDLE');
    setTranscriptId(null);
    setTranscriptText(null);
    setPastedText('');
    setPrd(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '50px',
          border: '1px solid rgba(255, 107, 107, 0.2)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>AI-Powered Documentation</span>
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.75rem', fontWeight: 800 }}>PRD Generator</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          Transform meeting transcripts into structured product requirements
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1fr) 1.3fr', gap: '2rem' }}>
        {/* SECTION 1: SOURCES */}
        <div className="glass-card">
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            borderBottom: '1px solid var(--glass-border)', 
            marginBottom: '1.5rem',
            padding: '0.25rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px'
          }}>
            <button 
              className={`tab-btn ${sourceType === 'FIREFLIES' ? 'active' : ''}`} 
              onClick={() => setSourceType('FIREFLIES')}
              style={{ borderRadius: '10px', flex: 1, textAlign: 'center' }}
            >
              Fireflies
            </button>
            <button 
              className={`tab-btn ${sourceType === 'VIDEO' ? 'active' : ''}`} 
              onClick={() => setSourceType('VIDEO')}
              style={{ borderRadius: '10px', flex: 1, textAlign: 'center' }}
            >
              Video
            </button>
            <button 
              className={`tab-btn ${sourceType === 'PASTE' ? 'active' : ''}`} 
              onClick={() => setSourceType('PASTE')}
              style={{ borderRadius: '10px', flex: 1, textAlign: 'center' }}
            >
              Paste Text
            </button>
          </div>

          {sourceType === 'FIREFLIES' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recorded Meetings</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--secondary)', 
                  background: 'rgba(78, 205, 196, 0.1)', 
                  padding: '0.35rem 0.75rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(78, 205, 196, 0.2)',
                  fontWeight: 500
                }}>
                  {meetings.length} Available
                </span>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)' }}>
                {meetings.length === 0 ? (
                  <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>📭</div>
                    <p style={{ fontSize: '0.9rem' }}>No meetings found in your Fireflies workspace.</p>
                  </div>
                ) : (
                  meetings.map(m => (
                    <div key={m.id} className="meeting-item" style={{
                      padding: '1rem 1.2rem',
                      borderBottom: '1px solid var(--glass-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: m.video_url ? 'var(--warm-gradient)' : 'var(--cool-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                          {m.video_url ? '🎬' : '🎙️'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>{m.title}</div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(m.date).toLocaleDateString()}</span>
                            {m.video_url && <span style={{ fontSize: '0.6rem', color: 'var(--secondary)', border: '1px solid rgba(78, 205, 196, 0.3)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Video</span>}
                          </div>
                        </div>
                      </div>
                      <button
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', boxShadow: 'none', borderRadius: '8px' }}
                        onClick={() => handleImport(m.id)}
                        disabled={stage !== 'IDLE'}
                        className="import-btn"
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                Synced from Fireflies workspace
              </p>
            </div>
          )}

          {sourceType === 'VIDEO' && (
            <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>Upload Video</h3>
              <div className="glass-card" style={{ 
                borderStyle: 'dashed', 
                borderColor: 'rgba(78, 205, 196, 0.3)',
                background: 'rgba(78, 205, 196, 0.05)', 
                cursor: 'pointer',
                padding: '2rem'
              }}>
                <input type="file" accept="video/*" onChange={handleVideoUpload} id="video-upload" style={{ display: 'none' }} />
                <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📁</div>
                  <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.5rem' }}>Drop your video here</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>MP4, MOV, WEBM supported</p>
                </label>
              </div>
            </div>
          )}

          {sourceType === 'PASTE' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h3 style={{ marginBottom: '1rem' }}>Paste Transcript</h3>
              <textarea
                placeholder="Paste your meeting transcript, notes, or discussion content here..."
                rows={10}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                style={{ marginBottom: '1rem', fontSize: '0.9rem' }}
              />
              <button style={{ width: '100%' }} onClick={handlePasteSubmit} disabled={!pastedText.trim() || stage !== 'IDLE'}>
                Save & Continue
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: PROCESS & RESULTS */}
        <div className="glass-card">
          {stage === 'IDLE' && !transcriptId && (
            <div style={{ height: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.6 }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem', 
                animation: 'float 3s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(255, 107, 107, 0.3))'
              }}>🚀</div>
              <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)' }}>Select a source to begin</p>
            </div>
          )}

          {stage !== 'IDLE' && stage !== 'COMPLETED' && stage !== 'ERROR' && (
            <div>
              <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Processing</h2>
              <div className="step-indicator">
                <div className={`step ${stage === 'IMPORTING' || stage === 'UPLOADING' ? 'active' : 'completed'}`}>
                  <div className="circle"></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>Data Ingestion</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Extracting raw text streams</div>
                  </div>
                </div>
                <div className={`step ${stage === 'CHUNKING' ? 'active' : (['EMBEDDING', 'UPSERTING', 'GENERATING'].includes(stage) ? 'completed' : '')}`}>
                  <div className="circle"></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>Context Mapping</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Segmenting transcript into semantic layers</div>
                  </div>
                </div>
                <div className={`step ${stage === 'EMBEDDING' ? 'active' : (['UPSERTING', 'GENERATING'].includes(stage) ? 'completed' : '')}`}>
                  <div className="circle"></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>Vector Projection</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Generating 768-dimension embeddings (Ollama 768d)</div>
                  </div>
                </div>
                <div className={`step ${stage === 'UPSERTING' ? 'active' : (['GENERATING'].includes(stage) ? 'completed' : '')}`}>
                  <div className="circle"></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>Neural Indexing</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Syncing with Pinecone memory cloud</div>
                  </div>
                </div>
                <div className={`step ${stage === 'GENERATING' ? 'active' : ''}`}>
                  <div className="circle"></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>PRD Synthesis</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Constructing document from synthesized context</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transcriptText && stage === 'IDLE' && !prd && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Transcript Preview</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{transcriptText.length} chars</span>
              </div>
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                marginBottom: '1.5rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '1.25rem',
                borderRadius: '16px',
                fontSize: '0.9rem',
                border: '1px solid var(--glass-border)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {transcriptText}
              </div>
              <button onClick={startGeneration} style={{ width: '100%', fontSize: '1.1rem', padding: '1.25rem' }}>
                Generate PRD ✨
              </button>
            </div>
          )}

          {prd && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Generated PRD</h2>
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '8px' }} onClick={() => {
                  navigator.clipboard.writeText(prd);
                  alert('Copied to clipboard!');
                }}>📋 Copy</button>
              </div>
              <pre style={{ height: '450px', fontSize: '0.85rem' }}>{prd}</pre>
              <button onClick={reset} style={{ marginTop: '1.5rem', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>Start New</button>
            </div>
          )}

          {stage === 'ERROR' && (
            <div style={{ textAlign: 'center', padding: '3rem 0', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
              <h2 style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>Something went wrong</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{error}</p>
              <button onClick={reset} style={{ width: '100%' }}>Try Again</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .meeting-item:hover {
          background: rgba(255, 107, 107, 0.05);
        }
        .meeting-item:last-child {
          border-bottom: none;
        }
        .import-btn:hover {
          background: var(--primary) !important;
          color: white !important;
          border-color: var(--primary) !important;
        }
        .import-btn:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default Home;