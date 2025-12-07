import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types';

interface VoiceAssistantProps {
  lang: Language;
  onVoiceInput: (text: string) => void;
  lastResponse?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ lang, onVoiceInput, lastResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const t = {
    listening: { ko: '듣는 중...', en: 'Listening...' },
    speak: { ko: '말하기', en: 'Speak' },
    stop: { ko: '중지', en: 'Stop' },
    notSupported: { ko: '음성 기능이 지원되지 않습니다', en: 'Voice not supported' },
    tapToSpeak: { ko: '탭하여 말하기', en: 'Tap to speak' },
    speaking: { ko: '말하는 중...', en: 'Speaking...' }
  };

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      // Initialize Speech Recognition
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = lang === 'ko' ? 'ko-KR' : 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          onVoiceInput(transcriptText);
          setTranscript('');
          setIsListening(false);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      setSynthesis(speechSynthesis);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (synthesis) {
        synthesis.cancel();
      }
    };
  }, [lang]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
      recognition.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (synthesis && text) {
      // Cancel any ongoing speech
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-speak last response
  useEffect(() => {
    if (lastResponse && synthesis && !isSpeaking) {
      // Auto-speak is disabled by default, user can click to hear
    }
  }, [lastResponse]);

  if (!isSupported) {
    return (
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-300">{t.notSupported[lang]}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Voice Input Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white shadow-lg`}
        title={isListening ? t.stop[lang] : t.tapToSpeak[lang]}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Voice Output Button */}
      {lastResponse && (
        <button
          onClick={isSpeaking ? stopSpeaking : () => speak(lastResponse)}
          className={`p-3 rounded-full transition-all ${
            isSpeaking
              ? 'bg-green-500 hover:bg-green-600 animate-pulse'
              : 'bg-slate-500 hover:bg-slate-600'
          } text-white shadow-lg`}
          title={isSpeaking ? t.stop[lang] : t.speak[lang]}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Transcript Display */}
      {(isListening || transcript) && (
        <div className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {transcript || t.listening[lang]}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
