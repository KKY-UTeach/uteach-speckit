const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api/v1`;

export interface DocumentContext {
  name: string;
  content: string;
}

export const summarizeTranscript = async (
  transcript: string, 
  format: string = 'summary',
  supportingDocs?: DocumentContext[]
): Promise<{ markdown: string }> => {
  const response = await fetch(`${API_BASE_URL}/llm/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      transcript, 
      format, 
      supporting_docs: supportingDocs 
    }),
  });

  if (!response.ok) {
    throw new Error('Summarization failed');
  }

  return await response.json();
};

export const exportToPdf = async (markdown: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown }),
  });

  if (!response.ok) {
    throw new Error('PDF export failed');
  }

  return await response.blob();
};
