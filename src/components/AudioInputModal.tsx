import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Check,
  RotateCcw,
  Volume2,
  AlertCircle,
  Sparkles,
  Upload,
  X,
  Keyboard,
  Radio,
} from 'lucide-react';
import { transcribeAudioBlob, refineLiveTranscript } from '../services/audioTranscriptionService';
import { MascotImage } from './mascot/MascotImage';
import { useTheme } from '../modules/theme/ThemeContext';
import { getThemeVisibility } from '../modules/theme/types';

interface AudioInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (text: string) => void;
  title?: string;
  subtitle?: string;
  initialText?: string;
}

export const AudioInputModal: React.FC<AudioInputModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
  title = 'Falar por Áudio',
  subtitle = 'Grave sua voz ou envie um áudio. Mostramos as palavras ao vivo e refinamos em português correto.',
  initialText = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveFinalText, setLiveFinalText] = useState('');
  const [liveInterimText, setLiveInterimText] = useState('');
  const [transcribedText, setTranscribedText] = useState(initialText);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);

  const { effectiveTheme } = useTheme();
  const visibility = getThemeVisibility(effectiveTheme);

  // References for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setTranscribedText(initialText || '');
      setLiveFinalText('');
      setLiveInterimText('');
      setErrorMessage(null);
      setStatusMessage('Pronto para falar. Toque no botão grande do microfone abaixo.');
      setRecordSeconds(0);
      setIsPolishing(false);
    } else {
      stopAll();
    }
  }, [isOpen, initialText]);

  const stopAll = useCallback(() => {
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Clean on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start live speech recognition with real-time interim & final captioning
  const initSpeechRecognition = () => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const sr = new SpeechRecognition();
        sr.continuous = true;
        sr.interimResults = true;
        sr.lang = 'pt-BR';
        sr.maxAlternatives = 1;

        let accumulatedFinal = '';

        sr.onresult = (evt: any) => {
          let interim = '';
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            const transcript = evt.results[i][0].transcript;
            if (evt.results[i].isFinal) {
              accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcript.trim();
            } else {
              interim += transcript;
            }
          }

          setLiveFinalText(accumulatedFinal);
          setLiveInterimText(interim);

          const fullCurrent = (accumulatedFinal + (interim ? ' ' + interim : '')).trim();
          if (fullCurrent) {
            setTranscribedText(fullCurrent);
            setStatusMessage('Capturando sua fala ao vivo...');
          }
        };

        sr.onerror = (e: any) => {
          console.warn('Reconhecimento de fala local aviso:', e?.error);
        };

        sr.onend = () => {
          // If still recording, restart recognition to keep streaming
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              sr.start();
            } catch {
              // ignore
            }
          }
        };

        sr.start();
        speechRecognitionRef.current = sr;
      } catch (err) {
        console.warn('SpeechRecognition não pôde ser iniciado:', err);
      }
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordSeconds(0);
    setLiveFinalText('');
    setLiveInterimText('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador sem suporte a gravação direta de microfone.');
      }

      setStatusMessage('Solicitando permissão do microfone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Real-time audio waveform/volume analyzer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const draw = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(draw);
          };
          draw();
        }
      } catch {
        // Continue if visualizer fails
      }

      // Pick supported mime type
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        '',
      ];
      let chosenMime = '';
      for (const m of candidates) {
        if (!m || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m))) {
          chosenMime = m;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(200);
      setIsRecording(true);
      setStatusMessage('Ouvindo... As palavras faladas aparecem ao vivo abaixo.');

      // Start live speech recognition in parallel
      initSpeechRecognition();

      // Timer
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err);
      let msg = 'Não foi possível acessar seu microfone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permissão de microfone negada. Clique no ícone de cadeado do navegador para permitir o microfone ou envie um arquivo de áudio abaixo.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      stopAll();
    }
  };

  // Stop Recording and Process Audio with Brazilian Portuguese Grammar Polishing
  const stopRecordingAndTranscribe = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    setIsProcessing(true);
    setStatusMessage('Revisando transcrição em Português do Brasil correto com IA...');

    const mr = mediaRecorderRef.current;
    const currentSpeechText = transcribedText.trim();

    // Stop recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mr && mr.state !== 'inactive') {
      const finishPromise = new Promise<Blob>((resolve) => {
        mr.onstop = () => {
          const type = mr.mimeType || 'audio/webm';
          resolve(new Blob(audioChunksRef.current, { type }));
        };
        mr.stop();
      });

      try {
        const audioBlob = await finishPromise;
        stopAll();

        // 1. First priority: Transcribe via server multimodal AI with Brazilian Portuguese rules
        if (audioBlob.size > 200) {
          try {
            const result = await transcribeAudioBlob(audioBlob);
            if (result && result.text && result.text.trim()) {
              setTranscribedText(result.text.trim());
              setLiveFinalText(result.text.trim());
              setLiveInterimText('');
              setStatusMessage('Transcrição refinada em português brasileiro com sucesso!');
              setErrorMessage(null);
              setIsProcessing(false);
              return;
            }
          } catch (aiErr: any) {
            console.warn('Transcrição multimodal no servidor encontrou aviso:', aiErr?.message || aiErr);
          }
        }

        // 2. Second priority: If audio server failed, refine live recognized text via AI
        if (currentSpeechText) {
          setIsPolishing(true);
          try {
            const polished = await refineLiveTranscript(currentSpeechText);
            setTranscribedText(polished);
            setLiveFinalText(polished);
            setLiveInterimText('');
            setStatusMessage('Texto revisado e formatado em português correto.');
          } catch {
            setTranscribedText(currentSpeechText);
            setStatusMessage('Transcrição capturada em tempo real.');
          } finally {
            setIsPolishing(false);
          }
          setErrorMessage(null);
        } else {
          setErrorMessage('Não captamos nenhuma fala clara. Tente falar mais próximo ao microfone ou digite no campo abaixo.');
        }
      } catch (e: any) {
        console.error('Falha ao processar áudio:', e);
        if (currentSpeechText) {
          setTranscribedText(currentSpeechText);
        } else {
          setErrorMessage('Não foi possível processar o áudio gravado.');
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      stopAll();
      setIsProcessing(false);
    }
  };

  // Handle direct file upload (.mp3, .m4a, .wav, .ogg, .webm)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(`Enviando "${file.name}" para transcrição com IA...`);

    try {
      const result = await transcribeAudioBlob(file, file.type);
      if (result && result.text && result.text.trim()) {
        setTranscribedText(result.text.trim());
        setLiveFinalText(result.text.trim());
        setLiveInterimText('');
        setStatusMessage('Arquivo de áudio transcrito com sucesso em português brasileiro!');
      } else {
        setErrorMessage('Nenhum texto claro foi identificado no arquivo enviado.');
      }
    } catch (err: any) {
      console.error('Falha no upload de áudio:', err);
      setErrorMessage(err.message || 'Falha ao processar o arquivo de áudio.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApply = () => {
    const finalClean = transcribedText.trim();
    if (!finalClean) {
      setErrorMessage('Nenhum texto foi gerado. Fale pelo microfone ou digite no campo antes de aplicar.');
      return;
    }
    onApplyText(finalClean);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="audio-input-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="audio-input-modal-card"
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 text-neutral-900 dark:text-stone-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            {visibility.showMascotAudioModal !== false && visibility.showMascotsGlobal !== false && (
              <MascotImage
                characterKey="listeningAudio"
                size="sm"
                borderStyle="glow"
                floatingAnimation={true}
                className="shrink-0"
                alt="Mascote Ouvindo"
              />
            )}
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-sm shrink-0">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-neutral-950 dark:text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-stone-400 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            id="btn-close-audio-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 dark:text-stone-500 hover:text-neutral-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Audio Recording Action */}
        <div className="bg-neutral-50 dark:bg-stone-850 border border-neutral-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 mb-4 text-center">
          {isRecording ? (
            /* RECORDING STATE */
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>AO VIVO ({formatTime(recordSeconds)})</span>
              </div>

              {/* Pulsing Visualizer Circle */}
              <div className="flex justify-center items-center py-2">
                <div
                  style={{
                    transform: `scale(${1 + (audioLevel / 100) * 0.35})`,
                  }}
                  className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform duration-75 cursor-pointer"
                  onClick={stopRecordingAndTranscribe}
                  title="Clique para finalizar gravação e revisar texto"
                >
                  <Square className="w-8 h-8 fill-current" />
                </div>
              </div>

              {/* Live Speech Feedback Stream */}
              <div className="bg-white/90 rounded-xl p-3 border border-red-200/80 text-left min-h-[56px] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Ouvindo em tempo real:</span>
                </div>
                <p className="text-sm font-medium text-neutral-800 leading-snug break-words">
                  <span>{liveFinalText}</span>
                  {liveInterimText && (
                    <span className="text-purple-600 italic ml-1 underline decoration-purple-300">
                      {liveInterimText}
                    </span>
                  )}
                  {!liveFinalText && !liveInterimText && (
                    <span className="text-neutral-400 italic">Pode falar normalmente... As palavras aparecem aqui.</span>
                  )}
                </p>
              </div>

              <button
                id="btn-stop-audio-recording"
                type="button"
                onClick={stopRecordingAndTranscribe}
                className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current text-red-400" />
                <span>Finalizar e Transcrever em Português Correto</span>
              </button>
            </div>
          ) : isProcessing ? (
            /* PROCESSING STATE */
            <div className="py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto animate-spin">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-neutral-900">
                Ajustando gramática e ortografia do português com IA...
              </p>
              <p className="text-xs text-neutral-500">
                Formatando pontuações, acentuações e termos clínicos com clareza.
              </p>
            </div>
          ) : (
            /* IDLE STATE: BIG MIC BUTTON */
            <div className="space-y-3">
              <div className="flex justify-center items-center py-1">
                <button
                  id="btn-trigger-voice-record-main"
                  type="button"
                  onClick={startRecording}
                  className="group w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  title="Toque para começar a falar"
                >
                  <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-neutral-900">
                  Toque no microfone para falar ao vivo
                </p>
                <p className="text-xs text-neutral-500">
                  Você vê o texto em tempo real enquanto fala e recebe a transcrição revisada.
                </p>
              </div>

              {/* Upload alternative */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  id="btn-upload-audio-file"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ou selecione áudio do WhatsApp / celular</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {statusMessage && !errorMessage && (
          <p className="text-xs text-neutral-500 italic mb-2 text-center flex items-center justify-center gap-1">
            <span>{statusMessage}</span>
          </p>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Editable Transcript Area */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-600 dark:text-stone-300">
            <label htmlFor="audio-transcribed-textarea" className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-neutral-400 dark:text-stone-500" />
              <span>Texto transcrito e revisado (você pode editar):</span>
            </label>
            {transcribedText && (
              <button
                type="button"
                onClick={() => {
                  setTranscribedText('');
                  setLiveFinalText('');
                  setLiveInterimText('');
                }}
                className="text-neutral-400 dark:text-stone-500 hover:text-neutral-700 dark:hover:text-stone-200 font-medium cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
          <textarea
            id="audio-transcribed-textarea"
            rows={4}
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            placeholder="O que você falar aparecerá aqui ao vivo. Ao finalizar, aplicamos a ortografia e pontuação correta do Português do Brasil..."
            className="w-full p-3.5 text-sm text-neutral-900 dark:text-stone-100 bg-neutral-50 dark:bg-stone-800 rounded-xl border border-neutral-300 dark:border-stone-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-cancel-audio-modal"
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 dark:border-stone-700 text-neutral-700 dark:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            id="btn-apply-audio-transcription"
            type="button"
            onClick={handleApply}
            disabled={!transcribedText.trim() || isProcessing}
            className="flex-[2] py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Usar este relato</span>
          </button>
        </div>
      </div>
    </div>
  );
};
