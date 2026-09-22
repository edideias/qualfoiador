export interface AudioTranscriptionResult {
  text: string;
  confidence?: number;
  modelUsed?: string;
}

export async function transcribeAudioBlob(blob: Blob, mimeTypeOverride?: string): Promise<AudioTranscriptionResult> {
  const mimeType = mimeTypeOverride || blob.type || 'audio/webm';
  
  // Convert blob to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Falha ao processar dados de áudio.'));
    reader.readAsDataURL(blob);
  });

  const response = await fetch('/api/transcribe-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioData: base64Data,
      mimeType,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || 'Não foi possível transcrever o áudio.');
  }

  const data = await response.json();
  return data;
}

export async function refineLiveTranscript(rawText: string): Promise<string> {
  const clean = rawText.trim();
  if (!clean) return '';

  try {
    const response = await fetch('/api/refine-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: clean }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.refinedText && typeof data.refinedText === 'string') {
        return data.refinedText.trim();
      }
    }
  } catch (err) {
    console.warn('Não foi possível refinar transcrição com IA:', err);
  }

  return clean;
}

