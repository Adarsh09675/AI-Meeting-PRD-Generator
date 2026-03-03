import React, { useState } from 'react';
import api from '../services/api';

interface UploadFormProps {
  onTranscriptCreated: (id: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onTranscriptCreated }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/transcripts', { text });
      onTranscriptCreated(res.data._id);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        cols={50}
        placeholder="Paste transcript here"
      />
      <br />
      <button type="submit" disabled={loading || !text.trim()}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
};

export default UploadForm;