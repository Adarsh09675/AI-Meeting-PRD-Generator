import firefliesClient from '../utils/firefliesClient';

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: number;
  sentences?: {
    text: string;
    speaker_name?: string;
  }[];
  transcript_url?: string;
}

export const fetchRecentTranscripts = async (limit = 20): Promise<FirefliesTranscript[]> => {
  const query = `
    query GetTranscripts($limit: Int) {
      transcripts(limit: $limit) {
        id
        title
        date
        transcript_url
        video_url
        audio_url
      }
    }
  `;

  try {
    const response = await firefliesClient.post('', {
      query,
      variables: { limit },
    });

    if (response.data.errors) {
      console.error('Fireflies API Errors:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.transcripts;
  } catch (error: any) {
    console.error('Error fetching Fireflies transcripts:', error.message);
    throw error;
  }
};

export const fetchTranscriptDetails = async (transcriptId: string): Promise<string> => {
  const query = `
    query GetTranscript($transcriptId: String!) {
      transcript(id: $transcriptId) {
        id
        sentences {
          text
          speaker_name
        }
      }
    }
  `;

  try {
    const response = await firefliesClient.post('', {
      query,
      variables: { transcriptId },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const transcript = response.data.data.transcript;
    if (!transcript || !transcript.sentences) {
      return '';
    }

    return transcript.sentences
      .map((s: any) => `${s.speaker_name || 'Unknown'}: ${s.text}`)
      .join('\n');
  } catch (error: any) {
    console.error('Error fetching transcript details:', error.message);
    throw error;
  }
};
