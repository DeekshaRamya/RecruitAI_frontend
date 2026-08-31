import React, { useState } from 'react';
import { 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  Eye, 
  Shield, 
  CheckCircle, 
  Minimize2, 
  Maximize2,
  Lock
} from 'lucide-react';

/**
 * CameraProctorOverlay Component
 * 
 * Renders:
 * 1. Pinned picture-in-picture camera preview for the candidate
 * 2. Real-time proctoring status indicator (Focused, Looking Away timer, Violation)
 * 3. Transparent candidate privacy disclosure & permission prompt
 */
export const CameraProctorOverlay = ({
  proctorState,
  onGrantPermission = null,
}) => {
  const {
    isCameraActive = false,
    isModelLoading = false,
    cameraError = null,
    currentStatus = 'IDLE',
    activeViolationType = null,
    violationElapsed = 0,
    videoRef,
  } = proctorState || {};

  const [isMinimized, setIsMinimized] = useState(false);

  const formatViolationName = (type) => {
    if (!type) return '';
    switch (type) {
      case 'FACE_NOT_DETECTED': return 'Face Not Visible';
      case 'MULTIPLE_FACES': return 'Multiple Faces Detected';
      case 'HEAD_TURNED_LEFT': return 'Head Turned Left';
      case 'HEAD_TURNED_RIGHT': return 'Head Turned Right';
      case 'HEAD_LOOKING_UP': return 'Looking Upward';
      case 'HEAD_LOOKING_DOWN': return 'Looking Downward';
      case 'EYES_LOOKING_LEFT': return 'Eyes Looking Left';
      case 'EYES_LOOKING_RIGHT': return 'Eyes Looking Right';
      case 'EYES_LOOKING_UP': return 'Eyes Looking Up';
      case 'EYES_LOOKING_DOWN': return 'Eyes Looking Down';
      default: return type.replace(/_/g, ' ');
    }
  };

  return (
    <>
      {/* Permission & Disclosure Banner (if camera error or permission denied) */}
      {cameraError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="bg-rose-950/90 border border-rose-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-rose-100 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <CameraOff size={20} />
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-extrabold text-sm text-rose-300">Camera Access Required</span>
              <p className="text-rose-200/80 leading-relaxed">
                {cameraError}. Camera monitoring is enabled for this assessment. Please grant browser camera permission to comply with proctoring rules.
              </p>
              {onGrantPermission && (
                <button
                  type="button"
                  onClick={onGrantPermission}
                  className="mt-2 self-start px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Retry Camera
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Picture-in-Picture Camera Preview */}
      <div 
        className={`fixed bottom-5 right-5 z-40 transition-all duration-300 select-none ${
          isMinimized ? 'w-44' : 'w-64 sm:w-72'
        }`}
      >
        <div className={`relative rounded-2xl overflow-hidden shadow-2xl border backdrop-blur-md transition-all ${
          currentStatus === 'VIOLATION'
            ? 'border-rose-500/80 ring-4 ring-rose-500/30 bg-rose-950/80'
            : currentStatus === 'LOOKING_AWAY'
            ? 'border-amber-500/80 ring-2 ring-amber-500/30 bg-amber-950/80'
            : 'border-slate-800/80 ring-1 ring-white/10 bg-slate-950/85'
        }`}>
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-white/5 text-[11px] font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                isCameraActive 
                  ? currentStatus === 'LOOKING_AWAY' 
                    ? 'bg-amber-400 animate-ping' 
                    : currentStatus === 'VIOLATION'
                    ? 'bg-rose-500 animate-pulse'
                    : 'bg-emerald-400'
                  : 'bg-slate-500'
              }`} />
              <span className="font-outfit uppercase tracking-wider text-[10px] text-slate-300">
                {isModelLoading ? 'AI Proctor Loading...' : isCameraActive ? 'AI Proctor Active' : 'Proctor Standing By'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(prev => !prev)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title={isMinimized ? 'Expand Preview' : 'Minimize Preview'}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
          </div>

          {/* Video Container */}
          <div className={`relative bg-black transition-all ${isMinimized ? 'h-28' : 'h-44 sm:h-48'}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Model Loading State */}
            {isModelLoading && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-indigo-300">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-semibold text-slate-300">Initializing MediaPipe...</span>
              </div>
            )}

            {/* Privacy Watermark Badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] text-slate-300 font-mono flex items-center gap-1">
              <Shield size={10} className="text-emerald-400" />
              <span>Face & Eye Monitored</span>
            </div>

            {/* Inactive or Error Overlay */}
            {!isCameraActive && !isModelLoading && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 text-center text-slate-400">
                <CameraOff size={24} className="text-slate-500 mb-1" />
                <span className="text-xs font-bold text-slate-300">Camera Inactive</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Awaiting video stream</span>
              </div>
            )}

            {/* Looking Away Alert Banner */}
            {currentStatus === 'LOOKING_AWAY' && activeViolationType && (
              <div className="absolute top-2 inset-x-2 bg-amber-500/90 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-between shadow-lg backdrop-blur-xs animate-bounce">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-slate-950" />
                  <span>{formatViolationName(activeViolationType)}</span>
                </div>
                <span className="font-mono bg-black/20 px-1 rounded text-[9px]">
                  {violationElapsed}s / 3.0s
                </span>
              </div>
            )}

            {/* Violation Confirmed Alert Banner */}
            {currentStatus === 'VIOLATION' && (
              <div className="absolute inset-x-2 top-2 bg-rose-600/95 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-between shadow-lg backdrop-blur-xs">
                <div className="flex items-center gap-1.5">
                  <Camera size={12} />
                  <span>Violation Logged</span>
                </div>
                <span className="text-[9px] font-mono">Snapshot Taken</span>
              </div>
            )}
          </div>

          {/* Footer Info Ribbon */}
          <div className="px-3 py-1.5 bg-slate-950 text-[9px] text-slate-400 flex items-center justify-between border-t border-white/5">
            <span className="flex items-center gap-1">
              <Eye size={10} className="text-indigo-400" />
              <span>Gaze Tracking</span>
            </span>
            <span className="text-slate-500">Continuous 3s limit</span>
          </div>

        </div>
      </div>
    </>
  );
};

export default CameraProctorOverlay;
