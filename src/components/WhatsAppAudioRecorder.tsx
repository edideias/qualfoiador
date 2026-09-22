import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Trash2, Send, Loader2, AlertCircle, Volume2 } from 'lucide-react';
import { RobustAudioRecorder, AudioCaptureResult } from '../services/robustAudioRecorder';
import { transcribeAudioBlob } from '../services/audioTranscriptionService';

// Fallback SpeechRecognition types
interface SpeechRecognitionResultLike {
  [index: number]: { transcript: string };
  isFinal?: boolean;
}
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: SpeechRecognitionResultLike;
    length: number;
  };
}

interface WhatsAppAudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onCancel?: () => void;
  autoSendOnStop?: boolean;
  accentColor?: string;
  placeholderText?: string;
  className?: string;
  compact?: boolean;
}

export const WhatsAppAudioRecorder: React.FC<WhatsAppAudioRecorderProps> = ({
  onTranscriptionComplete,
  onCancel,
  autoSendOnStop = false,
  accentColor = '#a855f7',
  placeholderText = 'Pressione para falar a sua dor...',
  className = '',
  compact = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([30, 65, 45, 80, 50, 70, 35, 90, 40, 75, 55, 30]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const recorderRef = useRef<RobustAudioRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanupAudio = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecording(false);
    setRecordDuration(0);
  }, []);

  // Web Speech API for real-time live preview & immediate instant transcript fallback
  const setupSpeechRecognition = () => {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          const trimmed = currentTranscript.trim();
          if (trimmed) {
            setLiveTranscript(trimmed);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition aviso:', e?.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition não iniciado:', err);
      }
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não tem suporte para gravação de áudio.');
      }

      const recorder = new RobustAudioRecorder();
      recorderRef.current = recorder;
      const stream = await recorder.start();

      // Audio waveform visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateWaveform = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            
            const bars: number[] = [];
            const step = Math.floor(dataArray.length / 12);
            for (let i = 0; i < 12; i++) {
              const val = dataArray[i * step] || 20;
              bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
            }
            setAudioLevels(bars);
            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          updateWaveform();
        }
      } catch {
        // visualizer fallback
      }

      setIsRecording(true);
      setupSpeechRecognition();

      // Timer
      setRecordDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err);
      let userFriendly = 'Não foi possível acessar o microfone. Verifique as permissões de áudio do seu dispositivo.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userFriendly = 'Permissão de microfone negada. Clique no cadeado na barra de endereços para permitir o acesso ao microfone.';
      }
      setErrorMessage(userFriendly);
      cleanupAudio();
    }
  };

  const cancelRecording = () => {
    cleanupAudio();
    setLiveTranscript('');
    if (onCancel) onCancel();
  };

  const stopAndTranscribe = async () => {
    if (!isRecording && !recorderRef.current) return;

    setIsProcessing(true);
    const recognitionText = liveTranscript.trim();

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const rec = recorderRef.current;
    if (rec) {
      try {
        const captureResult: AudioCaptureResult = await rec.stop();
        recorderRef.current = null;
        cleanupAudio();

        let finalTranscribed = '';

        // Try AI server transcription with Gemini
        try {
          const serverResult = await transcribeAudioBlob(captureResult.blob, captureResult.mimeType);
          if (serverResult && serverResult.text && serverResult.text.trim()) {
            finalTranscribed = serverResult.text.trim();
          }
        } catch (serverErr: any) {
          console.warn('Erro na transcrição server-side:', serverErr?.message || serverErr);
        }

        // If server transcription was empty or failed, use real-time speech recognition text
        if (!finalTranscribed && recognitionText) {
          finalTranscribed = recognitionText;
        }

        if (finalTranscribed) {
          onTranscriptionComplete(finalTranscribed);
          setErrorMessage(null);
        } else {
          // If neither returned words
          setErrorMessage('Não conseguimos ouvir claramente a sua fala. Toque no microfone e fale um pouco mais perto.');
        }
      } catch (err: any) {
        console.error('Erro na captura de áudio:', err);
        // If we captured recognition text before error, still succeed!
        if (recognitionText) {
          onTranscriptionComplete(recognitionText);
          cleanupAudio();
          setErrorMessage(null);
        } else {
          setErrorMessage(err.message || 'Erro ao processar a gravação de áudio.');
          cleanupAudio();
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      cleanupAudio();
      setIsProcessing(false);
      if (recognitionText) {
        onTranscriptionComplete(recognitionText);
      }
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return (
    <div className={`relative ${className}`}>
      {/* RECORDING STATE (WhatsApp Full Bar Overlay) */}
      {isRecording ? (
        <div
          id="whatsapp-audio-recording-active"
          className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 bg-neutral-950 text-white rounded-2xl shadow-xl border border-purple-500/40 animate-in fade-in duration-200"
        >
          {/* Left: Blinking Red Mic & Live Timer */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-red-100">
              {formatTime(recordDuration)}
            </span>
          </div>

          {/* Center: Live Sound Waves & Speech Preview */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-2 min-w-0">
            {/* Animated Sound Bars */}
            <div className="flex items-center justify-center gap-1 h-5 w-full max-w-[160px]">
              {audioLevels.map((level, idx) => (
                <div
                  key={idx}
                  style={{
                    height: `${Math.max(15, level)}%`,
                    backgroundColor: idx % 2 === 0 ? '#c084fc' : '#a855f7',
                  }}
                  className="w-1 rounded-full transition-all duration-75"
                />
              ))}
            </div>

            {/* Live Text Caption */}
            {liveTranscript ? (
              <p className="text-[11px] text-purple-200 truncate max-w-full italic mt-0.5 animate-pulse">
                "{liveTranscript}"
              </p>
            ) : (
              <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                Gravando... Toque no botão verde ou enviar para concluir
              </p>
            )}
          </div>

          {/* Right Actions: Cancel (Trash) & Send (Send button) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-cancel-audio-record"
              type="button"
              onClick={cancelRecording}
              title="Cancelar gravação"
              className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="btn-send-audio-record"
              type="button"
              onClick={stopAndTranscribe}
              title="Finalizar gravação e enviar"
              style={{ backgroundColor: accentColor }}
              className="p-2.5 rounded-xl text-white hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isProcessing ? (
        /* PROCESSING / TRANSCRIBING STATE */
        <div
          id="whatsapp-audio-processing"
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-neutral-900 text-white rounded-2xl shadow-lg border border-purple-500/40 animate-pulse"
        >
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
            Transcrevendo seu áudio com inteligência artificial...
          </span>
        </div>
      ) : (
        /* IDLE STATE: WhatsApp Green / Neon Purple Mic Button */
        <div className="flex items-center w-full">
          <button
            id="btn-whatsapp-mic-trigger"
            type="button"
            onClick={startRecording}
            title="Gravar áudio com a sua dor (estilo WhatsApp)"
            style={{
              backgroundColor: compact ? '#18181b' : accentColor,
            }}
            className={`group relative flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              compact
                ? 'p-2.5 rounded-xl hover:bg-neutral-800 border border-neutral-700/60'
                : 'w-full px-4 py-3 rounded-2xl gap-2 font-extrabold text-xs sm:text-sm hover:opacity-95 shadow-purple-500/20'
            }`}
          >
            <Mic className={`${compact ? 'w-4 h-4 text-purple-400' : 'w-4 h-4 text-white'} group-hover:scale-110 transition-transform`} />
            {!compact && <span>Gravar áudio da sua dor (toque para falar)</span>}
          </button>
        </div>
      )}

      {/* Error notification banner with retry */}
      {errorMessage && (
        <div className="absolute top-full left-0 right-0 mt-2 z-30 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 shadow-md animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="flex-1 leading-snug">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 font-bold px-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
