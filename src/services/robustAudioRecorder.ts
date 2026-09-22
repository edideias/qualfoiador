// Robust audio recorder helper
// Supports MediaRecorder and fallback AudioContext/WAV recording

export interface AudioCaptureResult {
  blob: Blob;
  mimeType: string;
}

export class RobustAudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private pcmBuffers: Float32Array[] = [];
  private pcmLength = 0;
  private sampleRate = 44100;

  async start(): Promise<MediaStream> {
    this.chunks = [];
    this.pcmBuffers = [];
    this.pcmLength = 0;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.stream = stream;

    // Determine supported mime types for MediaRecorder
    let chosenMime = '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
    ];

    for (const c of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
        chosenMime = c;
        break;
      }
    }

    if (typeof MediaRecorder !== 'undefined') {
      try {
        const options = chosenMime ? { mimeType: chosenMime } : undefined;
        const mr = new MediaRecorder(stream, options);
        this.mediaRecorder = mr;
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.chunks.push(e.data);
          }
        };
        mr.start(150);
      } catch (mrErr) {
        console.warn('MediaRecorder falhou ao iniciar, usando fallback PCM/WAV:', mrErr);
        this.mediaRecorder = null;
      }
    }

    // Also record raw PCM as parallel rock-solid guarantee (wav format)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        this.audioContext = ctx;
        this.sampleRate = ctx.sampleRate;
        const source = ctx.createMediaStreamSource(stream);
        // buffer size 4096, 1 input channel, 1 output channel
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        this.scriptProcessor = processor;
        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const copy = new Float32Array(input.length);
          copy.set(input);
          this.pcmBuffers.push(copy);
          this.pcmLength += copy.length;
        };
        source.connect(processor);
        processor.connect(ctx.destination);
      }
    } catch (ctxErr) {
      console.warn('AudioContext PCM recording not available:', ctxErr);
    }

    return stream;
  }

  async stop(): Promise<AudioCaptureResult> {
    // 1. Try stopping MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      const mr = this.mediaRecorder;
      const mrPromise = new Promise<Blob>((resolve) => {
        mr.onstop = () => {
          const type = mr.mimeType || 'audio/webm';
          resolve(new Blob(this.chunks, { type }));
        };
        mr.stop();
      });

      const blob = await mrPromise;
      this.cleanup();

      if (blob && blob.size > 500) {
        return {
          blob,
          mimeType: blob.type || 'audio/webm',
        };
      }
    }

    // 2. Fallback to WAV from PCM buffers if MediaRecorder was empty or missing
    if (this.pcmLength > 0 && this.pcmBuffers.length > 0) {
      const wavBlob = this.encodeWAV(this.pcmBuffers, this.pcmLength, this.sampleRate);
      this.cleanup();
      return {
        blob: wavBlob,
        mimeType: 'audio/wav',
      };
    }

    this.cleanup();
    throw new Error('Nenhum dado de áudio foi gravado. Tente falar um pouco mais alto ou por mais tempo.');
  }

  cancel() {
    this.cleanup();
  }

  private cleanup() {
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch {
        // ignore
      }
      this.scriptProcessor = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
    this.pcmBuffers = [];
    this.pcmLength = 0;
  }

  private encodeWAV(buffers: Float32Array[], totalLength: number, sampleRate: number): Blob {
    // Merge all buffers
    const pcm = new Float32Array(totalLength);
    let offset = 0;
    for (const b of buffers) {
      pcm.set(b, offset);
      offset += b.length;
    }

    // Downsample if high sample rate, or encode 16-bit mono WAV directly
    const buffer = new ArrayBuffer(44 + totalLength * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // file length minus RIFF header
    view.setUint32(4, 36 + totalLength * 2, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw PCM)
    view.setUint16(20, 1, true);
    // channel count (mono = 1)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * 1 channel * 2 bytes)
    view.setUint32(28, sampleRate * 2, true);
    // block align (1 channel * 2 bytes)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, totalLength * 2, true);

    // Write PCM samples
    let index = 44;
    for (let i = 0; i < totalLength; i++) {
      const s = Math.max(-1, Math.min(1, pcm[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
