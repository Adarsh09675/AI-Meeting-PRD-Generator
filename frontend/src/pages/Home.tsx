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
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>AI PRD ARCHITECT</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Transform raw conversations into precision documentation</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: '3rem' }}>
        {/* SECTION 1: SOURCES */}
        <div className="glass-card">
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
            <button className={`tab-btn ${sourceType === 'FIREFLIES' ? 'active' : ''}`} onClick={() => setSourceType('FIREFLIES')}>Fireflies</button>
            <button className={`tab-btn ${sourceType === 'VIDEO' ? 'active' : ''}`} onClick={() => setSourceType('VIDEO')}>Video</button>
            <button className={`tab-btn ${sourceType === 'PASTE' ? 'active' : ''}`} onClick={() => setSourceType('PASTE')}>Paste Text</button>
          </div>

          {sourceType === 'FIREFLIES' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Recorded Assets</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  {meetings.length} Ready for Processing
                </span>
              </div>
              <div style={{ maxHeight: '420px', overflowY: 'auto', borderRadius: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)' }}>
                {meetings.length === 0 ? (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🌖</div>
                    <p>No recorded meetings found in your workspace.</p>
                  </div>
                ) : (
                  meetings.map(m => (
                    <div key={m.id} className="meeting-item" style={{
                      padding: '1.2rem',
                      borderBottom: '1px solid var(--glass-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '12px',
                          background: 'var(--accent-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                          {m.video_url ? '🎬' : '🎙️'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '2px' }}>{m.title}</div>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(m.date).toLocaleDateString()}</span>
                            {m.video_url && <span style={{ fontSize: '0.65rem', color: '#00f2ff', border: '1px solid #00f2ff55', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>HD Video</span>}
                          </div>
                        </div>
                      </div>
                      <button
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                        onClick={() => handleImport(m.id)}
                        disabled={stage !== 'IDLE'}
                        className="import-btn"
                      >
                        SELECT
                      </button>
                    </div>
                  ))
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1.5rem', fontStyle: 'italic' }}>
                Synced directly from your Fireflies Cloud workspace
              </p>
            </div>
          )}

          {sourceType === 'VIDEO' && (
            <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', padding: '1rem 0' }}>
              <h3>Upload Video Asset</h3>
              <div className="glass-card" style={{ borderStyle: 'dashed', background: 'rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                <input type="file" accept="video/*" onChange={handleVideoUpload} id="video-upload" style={{ display: 'none' }} />
                <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'block', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎞️</div>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>Drag & drop your recording here</p>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Supports MP4, MOV, WEBM</p>
                </label>
              </div>
            </div>
          )}

          {sourceType === 'PASTE' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h3>Paste Transcript Content</h3>
              <textarea
                placeholder="Paste meeting notes, transcript text or discussion logs here..."
                rows={12}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                style={{ marginBottom: '1.5rem' }}
              />
              <button style={{ width: '100%' }} onClick={handlePasteSubmit} disabled={!pastedText.trim() || stage !== 'IDLE'}>Save & Continue</button>
            </div>
          )}
        </div>

        {/* SECTION 2: PROCESS & RESULTS */}
        <div className="glass-card">
          {stage === 'IDLE' && !transcriptId && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>⚡</div>
              <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>Waiting for input data...</p>
            </div>
          )}

          {stage !== 'IDLE' && stage !== 'COMPLETED' && stage !== 'ERROR' && (
            <div>
              <h2 style={{ marginBottom: '2.5rem' }}>Processing Data Pulse</h2>
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
              <h2 style={{ marginBottom: '1.5rem' }}>Dataset Ready</h2>
              <div style={{
                maxHeight: '250px',
                overflowY: 'auto',
                marginBottom: '2.5rem',
                background: 'rgba(0,0,0,0.4)',
                padding: '1.5rem',
                borderRadius: '20px',
                fontSize: '1rem',
                border: '1px solid var(--glass-border)',
                whiteSpace: 'pre-wrap'
              }}>
                {transcriptText}
              </div>
              <button onClick={startGeneration} style={{ width: '100%', fontSize: '1.3rem', padding: '1.5rem' }}>
                🚀 CONSTRUCT PRD
              </button>
            </div>
          )}

          {prd && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Engineered Output</h2>
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => {
                  navigator.clipboard.writeText(prd);
                  alert('Copied to clipboard!');
                }}>Copy Raw</button>
              </div>
              <pre style={{ height: '550px' }}>{prd}</pre>
              <button onClick={reset} style={{ marginTop: '2rem', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>Restart Terminal</button>
            </div>
          )}

          {stage === 'ERROR' && (
            <div style={{ textAlign: 'center', padding: '3rem 0', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ color: '#ff4d4d' }}>System Failure</h2>
              <p style={{ marginBottom: '2rem', opacity: 0.8 }}>{error}</p>
              <button onClick={reset} style={{ width: '100%' }}>Reboot Process</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(15deg); }
          50% { transform: translateY(-20px) rotate(-15deg); }
          100% { transform: translateY(0px) rotate(15deg); }
        }
        .meeting-item:hover {
          background: rgba(255,255,255,0.03);
        }
        .import-btn:hover {
          background: var(--primary) !important;
          color: black !important;
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;