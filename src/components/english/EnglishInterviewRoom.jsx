import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Clock,
  Sparkles,
  AlertTriangle,
  Bot,
  User,
  CheckCircle,
  MessageSquare,
  Keyboard,
  AudioWaveform,
  Check
} from 'lucide-react';
import api from '../../api';

export const EnglishInterviewRoom = ({
  candidate,
  interviewData,
  onCompleteInterview,
  showToast
}) => {
  // Session time remaining (30 minutes = 1800s)
  const [timeLeft, setTimeLeft] = useState(() => interviewData?.time_left ?? 1800);
  const [conversations, setConversations] = useState(() => interviewData?.conversations || []);
  const [currentQuestion, setCurrentQuestion] = useState(
    () => interviewData?.current_question?.ai_question || interviewData?.ai_question || "Could you please introduce yourself and tell me about your background?"
  );
  const [questionNumber, setQuestionNumber] = useState(
    () => interviewData?.question_number || (interviewData?.conversations?.length ? interviewData.conversations.length : 1)
  );

  // Streaming text animation state
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [isQuestionStreaming, setIsQuestionStreaming] = useState(false);

  // Interaction modes: Speech or Text
  const [isTextMode, setIsTextMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Audio / Speech recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio elements & speech recognition refs
  const audioPlayerRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const currentSpeechRef = useRef('');
  const animFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Stream text letter-by-letter or word-by-word
  const streamQuestionText = useCallback((fullText) => {
    if (!fullText || typeof fullText !== 'string') return;
    setIsQuestionStreaming(true);
    setDisplayedQuestion('');
    
    let currentIdx = 0;
    const words = (fullText || '').split(' ');
    
    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        setDisplayedQuestion(words.slice(0, currentIdx + 1).join(' '));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsQuestionStreaming(false);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Sync incoming interviewData updates
  useEffect(() => {
    if (interviewData) {
      if (interviewData.current_question?.ai_question) {
        setCurrentQuestion(interviewData.current_question.ai_question);
      } else if (interviewData.ai_question) {
        setCurrentQuestion(interviewData.ai_question);
      }
      if (interviewData.time_left !== undefined) {
        setTimeLeft(interviewData.time_left);
      }
      if (interviewData.question_number !== undefined) {
        setQuestionNumber(interviewData.question_number);
      }
      if (interviewData.conversations) {
        setConversations(interviewData.conversations);
      }
    }
  }, [interviewData]);

  // Trigger streaming when currentQuestion changes
  useEffect(() => {
    if (currentQuestion) {
      streamQuestionText(currentQuestion);
    }
  }, [currentQuestion, streamQuestionText]);

  // High-Quality Web Speech Synthesis
  const speakWithSynthesis = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => 
        (v.lang === 'en-US' || v.lang.startsWith('en')) && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Guy') || v.name.includes('Jenny') || v.name.includes('David') || v.name.includes('Zira'))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setAiIsSpeaking(true);
      };
      utterance.onend = () => {
        setAiIsSpeaking(false);
      };
      utterance.onerror = () => {
        setAiIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
      setAiIsSpeaking(false);
    }
  }, [isMuted]);

  // Unified AI Speech Engine (Base64 audio + SpeechSynthesis fallback)
  const speakQuestion = useCallback((text, audioBase64) => {
    if (isMuted || !text) return;

    if (audioBase64) {
      try {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audioPlayerRef.current = audio;
        setAiIsSpeaking(true);

        audio.onended = () => {
          setAiIsSpeaking(false);
        };
        audio.onerror = () => {
          setAiIsSpeaking(false);
          speakWithSynthesis(text);
        };
        audio.play().catch((err) => {
          console.warn("Audio autoplay blocked, using SpeechSynthesis:", err);
          speakWithSynthesis(text);
        });
        return;
      } catch (e) {
        console.warn("Base64 Audio error:", e);
      }
    }

    // Direct natural speech synthesis
    speakWithSynthesis(text);
  }, [isMuted, speakWithSynthesis]);

  // Automatically speak question aloud when currentQuestion changes
  useEffect(() => {
    if (currentQuestion && !isMuted) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion, interviewData?.audio_base64);
      }, 500);
      return () => {
        clearTimeout(timer);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [currentQuestion, isMuted, speakQuestion, interviewData?.audio_base64]);

  // 30-minute Session Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAutoTimeout = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    showToast("30 minutes session reached. Finalizing English Assessment...");
    try {
      const res = await api.post('/api/english-assessment/complete', { voice_used: true });
      if (onCompleteInterview) {
        onCompleteInterview(res.data);
      }
    } catch (err) {
      console.error("Auto timeout completion failed:", err);
    }
  }, [onCompleteInterview, showToast]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Web Speech Recognition for Real-time STT
  const startSpeechRecognition = useCallback(() => {
    if (isTextMode || isSubmitting) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in browser; falling back to typed mode.");
      setIsTextMode(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const combined = (final || interim).trim();
        if (combined) {
          currentSpeechRef.current = combined;
          setTypedAnswer(combined);

          // Reset silence timer for auto submit
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            if (currentSpeechRef.current.trim().length > 10 && !isSubmittingRef.current) {
              handleSubmitAnswer(currentSpeechRef.current);
            }
          }, 3500);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Failed to initialize SpeechRecognition:", e);
    }
  }, [isTextMode, isSubmitting]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsRecording(false);
  }, []);

  // Submit candidate response
  const handleSubmitAnswer = async (manualText) => {
    const answerToSubmit = (manualText || typedAnswer || currentSpeechRef.current || "").trim();
    if (!answerToSubmit || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setIsAiProcessing(true);
    stopSpeechRecognition();

    // Update conversation log locally
    const newEntry = {
      question_number: questionNumber,
      ai_question: currentQuestion,
      candidate_answer: answerToSubmit,
      timestamp: new Date().toISOString()
    };
    setConversations((prev) => [...prev, newEntry]);
    setTypedAnswer('');
    currentSpeechRef.current = '';

    try {
      const res = await api.post('/api/english-assessment/respond', {
        answer: answerToSubmit,
        voice_used: !isTextMode
      });

      if (res.data.status === 'COMPLETED') {
        showToast("English Assessment complete! Generating your comprehensive evaluation report...");
        if (onCompleteInterview) {
          onCompleteInterview(res.data);
        }
        return;
      }

      // Next question returned
      if (res.data.ai_question) {
        setQuestionNumber(res.data.question_number || questionNumber + 1);
        setCurrentQuestion(res.data.ai_question);
        speakQuestion(res.data.ai_question, res.data.audio_base64);
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
      showToast(err.response?.data?.detail || "Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsAiProcessing(false);
      isSubmittingRef.current = false;
    }
  };

  const handleManualComplete = async () => {
    if (window.confirm("Are you sure you want to finish and submit your English Assessment?")) {
      setIsSubmitting(true);
      isSubmittingRef.current = true;
      try {
        const res = await api.post('/api/english-assessment/complete', { voice_used: !isTextMode });
        if (onCompleteInterview) {
          onCompleteInterview(res.data);
        }
      } catch (err) {
        console.error("Complete error:", err);
        showToast("Failed to complete assessment.");
      } finally {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/40">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-outfit">
              <span>AI English Interview</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Question {questionNumber} of 8
              </span>
            </h3>
            <p className="text-xs text-slate-500">Live AI Communication & Fluency Assessment</p>
          </div>
        </div>

        {/* 30-Min Session Timer */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${
            timeLeft < 300
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Time Left:</span>
            <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
              {formatTimer(timeLeft)}
            </span>
          </div>

          <button
            onClick={handleManualComplete}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Finish Interview
          </button>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active AI Interviewer Stage */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Question Card */}
          <motion.div
            key={questionNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  AI Interviewer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakQuestion(currentQuestion)}
                  title="Listen to AI Voice Again"
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200/60"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Listen Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
                </button>
              </div>
            </div>

            {/* Question Text with Streaming */}
            <div className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed font-outfit min-h-[72px]">
              {displayedQuestion}
              {isQuestionStreaming && (
                <span className="inline-block w-2 h-5 bg-indigo-600 dark:bg-indigo-400 ml-1.5 animate-pulse align-middle" />
              )}
            </div>

            {/* AI Speaking Indicator */}
            {aiIsSpeaking && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/40 w-fit">
                <AudioWaveform className="w-4 h-4 animate-bounce" />
                <span>AI is speaking...</span>
              </div>
            )}
          </motion.div>

          {/* Candidate Response Workspace */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Answer
                </span>
              </div>

              {/* Mode switch: Mic vs Text */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => {
                    setIsTextMode(false);
                    startSpeechRecognition();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    !isTextMode
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Speech Mode</span>
                </button>
                <button
                  onClick={() => {
                    setIsTextMode(true);
                    stopSpeechRecognition();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isTextMode
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Text Mode</span>
                </button>
              </div>
            </div>

            {/* Interactive Speech or Text Area */}
            {!isTextMode ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (isRecording) {
                        stopSpeechRecognition();
                      } else {
                        startSpeechRecognition();
                      }
                    }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 scale-105 ring-8 ring-rose-500/20'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30 hover:scale-105'
                    }`}
                  >
                    {isRecording ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isRecording ? "Listening to your answer..." : "Click microphone to start speaking"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Speak clearly in English. When you pause for a few seconds, your answer is automatically captured.
                  </p>
                </div>

                {/* Transcribed preview */}
                {typedAnswer && (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs font-mono text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto">
                    <span className="text-slate-400 block mb-1 font-sans font-bold">Transcribed response:</span>
                    {typedAnswer}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type your response in English..."
                  rows={4}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-inter"
                />
              </div>
            )}

            {/* Submit Action Button */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                {isAiProcessing ? "AI is analyzing your response and preparing the next question..." : ""}
              </span>

              <button
                disabled={isSubmitting || !typedAnswer.trim()}
                onClick={() => handleSubmitAnswer(typedAnswer)}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Next Question</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Interview Progress & History Log */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Interview Log</span>
            </h4>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Answer Question 1 to start your conversational log.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {conversations.map((conv, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                      <span>Q{conv.question_number}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2">
                      {conv.ai_question}
                    </p>
                    {conv.candidate_answer && (
                      <p className="text-slate-500 dark:text-slate-400 border-l-2 border-indigo-500 pl-2 italic line-clamp-2">
                        {conv.candidate_answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnglishInterviewRoom;