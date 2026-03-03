import client from '../utils/ollamaClient';

export const generatePRD = async (context: string): Promise<string> => {

  const prompt = `
You are a senior Product Manager.

Your task is to convert the transcript into a concise Product Requirement Document.

CRITICAL RULES (MUST FOLLOW):

- Follow the format EXACTLY as given
- Keep wording concise and professional
- DO NOT paraphrase feature names — copy exact feature name from transcript
- DO NOT add extra explanation
- DO NOT add extra sections
- Use exact deadline date if present
- If deadline missing, write "Not specified"
- Always include Owner as "Development Team"

--------------------------------

Product Requirement Document (PRD)

Feature Name:
Copy exact feature name from transcript.

Objective:
One concise sentence.

Description:
Maximum 2 concise sentences.

Functional Requirements:

- Clear requirement
- Clear requirement
- Clear requirement

Deadline:
Exact date from transcript or Not specified

Priority:
High / Medium / Low

Owner:
Development Team

--------------------------------

Transcript:
${context}

`;

  try {

    // Recommended model (if installed): llama3:8b
    const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

    const resp = await client.post('/api/chat', {

      model,

      messages: [

        {
          role: 'system',
          content: 'You generate strict, concise, enterprise Product Requirement Documents.'
        },

        {
          role: 'user',
          content: prompt
        }

      ],

      stream: false,

      options: {

        temperature: 0.0,     // ZERO for maximum accuracy
        num_predict: 500,     // prevent verbosity
        top_p: 0.9

      }

    });

    return resp.data.message?.content?.trim() || '';

  } catch (err: any) {

    console.error("PRD generation failed:", err?.response?.data || err.message);

    return "PRD generation failed";

  }

};