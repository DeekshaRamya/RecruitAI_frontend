import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../api';

/**
 * useProctorRecorder
 * Manages webcam and screen capture, optional microphone audio capture,
 * canvas composition (PIP), dynamic stream track combination (Video + Audio or Video-Only),
 * MediaRecorder lifecycle, synchronous ref tracking, robust error handling,
 * guaranteed upload to Cloudinary via backend API, and safe teardown.
 */
export const useProctorRecorder = (options = {}) => {
  const { onScreenShareEnded, onRecordingError } = options;

  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [permissionErrorCode, setPermissionErrorCode] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Status: IDLE | PERMISSION_GRANTED | STARTING | RECORDING | UPLOADING | COMPLETED | FAILED
  const [recordingStatus, setRecordingStatus] = useState('IDLE');
  const [recordingId, setRecordingId] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Synchronous Refs to prevent React state closure/timing race conditions
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const durationTimerRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const isCompositingRef = useRef(false);
  const recordingIdRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Helper to select supported MIME type that preserves both video and audio (Opus)
  const getSupportedMimeType = (hasAudio = false) => {
    const mimeTypesWithAudio = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];
    const mimeTypesVideoOnly = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    const listToTest = hasAudio ? mimeTypesWithAudio : mimeTypesVideoOnly;
    for (const type of listToTest) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  };

  /**
   * Stop ALL active screen-sharing, camera, and microphone tracks idempotently
   */
  const stopAllMediaStreams = useCallback(() => {
    console.log('[SCREEN SHARE] Stopping all media & screen tracks');

    isRecordingRef.current = false;

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    isCompositingRef.current = false;

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // 1. Stop all tracks belonging to the screen-sharing MediaStream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        console.log('[SCREEN SHARE] Stopping track:', track.kind, track.readyState);
        try {
          track.stop();
        } catch (e) {
          console.warn('[SCREEN SHARE] Error stopping screen track:', e);
        }
      });
      screenStreamRef.current = null;
    }

    // 2. Stop all tracks belonging to camera MediaStream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => {
        console.log('[MEDIA] Stopping camera track:', track.kind, track.readyState);
        try {
          track.stop();
        } catch (e) {
          console.warn('[MEDIA] Error stopping camera track:', e);
        }
      });
      cameraStreamRef.current = null;
    }

    // 3. Stop all tracks belonging to microphone MediaStream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        console.log('[AUDIO] Stopping mic audio track:', track.kind, track.readyState);
        try {
          track.stop();
        } catch (e) {
          console.warn('[AUDIO] Error stopping mic track:', e);
        }
      });
      micStreamRef.current = null;
    }

    // 4. Clear video element srcObjects
    if (screenVideoRef.current) {
      try {
        screenVideoRef.current.srcObject = null;
      } catch (e) {}
      screenVideoRef.current = null;
    }

    if (cameraVideoRef.current) {
      try {
        cameraVideoRef.current.srcObject = null;
      } catch (e) {}
      cameraVideoRef.current = null;
    }

    setCameraStream(null);
    setScreenStream(null);
    setMicStream(null);
    setIsPermissionGranted(false);

    console.log('[SCREEN SHARE] Cleanup completed');
  }, []);

  const stopAllMediaTracks = stopAllMediaStreams;

  /**
   * Request Camera, Optional Microphone & Screen Sharing Permissions
   */
  const requestPermissions = useCallback(async () => {
    setIsRequestingPermission(true);
    setPermissionError(null);
    setPermissionErrorCode(null);

    // Check browser MediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !navigator.mediaDevices.getDisplayMedia) {
      const err = 'Your browser does not support Camera or Screen capture APIs. Please use a modern version of Chrome, Edge, or Firefox.';
      setPermissionError(err);
      setPermissionErrorCode('UNSUPPORTED');
      setIsRequestingPermission(false);
      return { success: false, error: err };
    }

    try {
      // 1. Acquire Camera stream (MANDATORY for proctoring visual check)
      let camStream = null;
      try {
        camStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        console.log('[MEDIA] Camera stream acquired with optimal constraints');
      } catch (primaryCamErr) {
        console.warn('[MEDIA] Primary camera request failed, trying simple video: true fallback...', primaryCamErr);
        try {
          camStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          console.log('[MEDIA] Camera stream acquired with basic constraints');
        } catch (camErr) {
          console.error('[MEDIA] Camera access error:', camErr);
          let msg = 'Camera access was denied or is unavailable.';
          let code = 'UNKNOWN';

          if (camErr.name === 'NotAllowedError' || camErr.name === 'PermissionDeniedError') {
            msg = 'Camera permission was blocked. Please click the Lock icon next to your address bar, allow Camera access, and try again.';
            code = 'NOT_ALLOWED';
          } else if (camErr.name === 'NotFoundError' || camErr.name === 'DevicesNotFoundError') {
            msg = 'No camera device found. Please ensure your webcam is plugged in and recognized by your system.';
            code = 'NOT_FOUND';
          } else if (camErr.name === 'NotReadableError' || camErr.name === 'TrackStartError') {
            msg = 'Camera is currently in use by another application (e.g. Teams, Zoom). Please close other apps and retry.';
            code = 'IN_USE';
          }

          setPermissionError(msg);
          setPermissionErrorCode(code);
          setIsRequestingPermission(false);
          return { success: false, error: msg, code };
        }
      }

      // 2. Acquire Candidate Microphone stream (OPTIONAL - do NOT fail if missing or denied)
      let audioStream = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        console.log('[AUDIO] Candidate microphone audio stream acquired successfully');
      } catch (micErr) {
        console.warn('[AUDIO] Microphone unavailable. Continuing without audio:', micErr.name, micErr.message);
        audioStream = null;
      }

      // 3. Acquire candidate Screen capture stream (MANDATORY for proctoring integrity)
      let scrStream = null;
      try {
        scrStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        console.log('[SCREEN SHARE] Started');
        scrStream.getVideoTracks().forEach(track => {
          console.log('[SCREEN SHARE] Track active:', track.label, track.readyState);
        });
      } catch (primaryScrErr) {
        console.warn('[SCREEN SHARE] Primary screen share request failed, trying basic displayMedia fallback...', primaryScrErr);
        try {
          scrStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
          });
          console.log('[SCREEN SHARE] Fallback screen share stream acquired');
        } catch (scrErr) {
          // Release camera & mic if screen capture fails or is cancelled
          if (camStream) {
            camStream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
          }
          if (audioStream) {
            audioStream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
          }
          let msg = 'Screen sharing was cancelled or denied. Full screen sharing is required to start the assessment.';
          let code = 'SCREEN_CANCELLED';
          if (scrErr.name === 'NotAllowedError') {
            msg = 'Screen sharing permission was cancelled or denied. Please select your Entire Screen when prompted.';
            code = 'SCREEN_NOT_ALLOWED';
          }
          setPermissionError(msg);
          setPermissionErrorCode(code);
          setIsRequestingPermission(false);
          return { success: false, error: msg, code };
        }
      }

      // Handle screen sharing stopped unexpectedly by user during exam
      const screenTrack = scrStream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.addEventListener('ended', () => {
          console.log('[SCREEN SHARE] User stopped screen sharing');
          if (onScreenShareEnded) {
            onScreenShareEnded();
          }
        });
      }

      cameraStreamRef.current = camStream;
      screenStreamRef.current = scrStream;
      micStreamRef.current = audioStream;

      setCameraStream(camStream);
      setScreenStream(scrStream);
      setMicStream(audioStream);
      setIsPermissionGranted(true);
      setRecordingStatus('PERMISSION_GRANTED');
      setIsRequestingPermission(false);

      return {
        success: true,
        cameraStream: camStream,
        screenStream: scrStream,
        micStream: audioStream
      };
    } catch (err) {
      console.error('[Proctoring] Unexpected permission error:', err);
      let msg = err.message || 'Failed to acquire proctoring permissions.';
      let code = 'UNEXPECTED';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was blocked. Please click the Lock icon next to your address bar, allow Camera access, and try again.';
        code = 'NOT_ALLOWED';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found. Please ensure your webcam is connected.';
        code = 'NOT_FOUND';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is in use by another application (e.g. Teams, Zoom). Please close them and retry.';
        code = 'IN_USE';
      }

      setPermissionError(msg);
      setPermissionErrorCode(code);
      setIsRequestingPermission(false);
      return { success: false, error: msg, code };
    }
  }, [onScreenShareEnded]);

  /**
   * Start Canvas PIP Compositor loop
   */
  const startCompositor = useCallback((camStream, scrStream) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });

    // Hidden video elements to consume media streams for drawing
    const camVideo = document.createElement('video');
    camVideo.srcObject = camStream;
    camVideo.autoplay = true;
    camVideo.muted = true; // Muted to prevent local audio echo loop
    camVideo.playsInline = true;
    camVideo.play().catch(() => {});
    cameraVideoRef.current = camVideo;

    const scrVideo = document.createElement('video');
    scrVideo.srcObject = scrStream;
    scrVideo.autoplay = true;
    scrVideo.muted = true;
    scrVideo.playsInline = true;
    scrVideo.play().catch(() => {});
    screenVideoRef.current = scrVideo;

    isCompositingRef.current = true;

    const render = () => {
      if (!isCompositingRef.current) return;

      // 1. Draw base screen capture
      if (scrVideo.readyState >= 2) {
        ctx.drawImage(scrVideo, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Draw candidate webcam picture-in-picture overlay (bottom-right)
      if (camVideo.readyState >= 2) {
        const overlayWidth = 280;
        const camAspect = (camVideo.videoWidth && camVideo.videoHeight)
          ? camVideo.videoWidth / camVideo.videoHeight
          : (4 / 3);
        const overlayHeight = Math.round(overlayWidth / camAspect);
        const margin = 24;
        const overlayX = canvas.width - overlayWidth - margin;
        const overlayY = canvas.height - overlayHeight - margin;
        const radius = 12;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;

        // Rounded rectangle clip
        ctx.beginPath();
        ctx.moveTo(overlayX + radius, overlayY);
        ctx.lineTo(overlayX + overlayWidth - radius, overlayY);
        ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + radius);
        ctx.lineTo(overlayX + overlayWidth, overlayY + overlayHeight - radius);
        ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX + overlayWidth - radius, overlayY + overlayHeight);
        ctx.lineTo(overlayX + radius, overlayY + overlayHeight);
        ctx.quadraticCurveTo(overlayX, overlayY, overlayX + radius, overlayY);
        ctx.closePath();
        ctx.clip();

        // Draw camera frame
        ctx.drawImage(camVideo, overlayX, overlayY, overlayWidth, overlayHeight);

        // Add subtle overlay border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Candidate camera badge indicator
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(overlayX + 8, overlayY + 8, 92, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(overlayX + 18, overlayY + 19, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Candidate', overlayX + 26, overlayY + 22);
        ctx.restore();
      }

      // Add timestamp watermark in top-left
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.roundRect(16, 16, 160, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`REC  ${new Date().toISOString().substring(11, 19)}`, 38, 32);
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return canvas;
  }, []);

  /**
   * Start Combined Proctoring Recording (Canvas Video + Optional Microphone Audio)
   */
  const startRecording = useCallback(async (params = {}) => {
    const { assignmentId, assessmentId } = params;

    let camStream = cameraStreamRef.current;
    let scrStream = screenStreamRef.current;
    let micStreamLocal = micStreamRef.current;

    // Step 1: Ensure camera and screen streams exist, acquiring if missing
    if (!camStream || !scrStream) {
      console.info('[Proctoring] Camera or screen stream missing in refs, requesting permissions...');
      const res = await requestPermissions();
      if (!res.success) return { success: false, error: res.error };
      camStream = res.cameraStream;
      scrStream = res.screenStream;
      micStreamLocal = res.micStream;
    }

    // Step 2: Attempt optional microphone acquisition if not already present
    if (!micStreamLocal || micStreamLocal.getAudioTracks().length === 0 || micStreamLocal.getAudioTracks()[0].readyState === 'ended') {
      try {
        micStreamLocal = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = micStreamLocal;
        setMicStream(micStreamLocal);
        console.log('[AUDIO] Microphone acquired during startRecording setup');
      } catch (micFallbackErr) {
        console.warn('[AUDIO] Microphone unavailable. Continuing without audio.');
        micStreamLocal = null;
        micStreamRef.current = null;
        setMicStream(null);
      }
    }

    try {
      setRecordingStatus('STARTING');

      // Initialize recording session record on backend
      let backendRecId = null;
      if (assessmentId) {
        try {
          const startRes = await api.post('/api/recordings/start', {
            assessmentId: assessmentId,
            assignmentId: assignmentId || null
          });
          if (startRes.data?.id) {
            backendRecId = startRes.data.id;
            recordingIdRef.current = backendRecId;
            setRecordingId(backendRecId);
            console.info(`[Proctoring] Session pre-initialized with id=${backendRecId}`);
          }
        } catch (apiErr) {
          console.warn('[Proctoring] Could not pre-initialize backend recording record:', apiErr);
        }
      }

      // Step 3: Start canvas compositor for visual PIP layout
      const canvas = startCompositor(camStream, scrStream);
      const canvasStream = canvas.captureStream(30);

      // Step 4: Dynamically construct recording stream (Video + Audio or Video-Only)
      const videoTracks = canvasStream.getVideoTracks();
      const audioTracks = (micStreamLocal && micStreamLocal.getAudioTracks().length > 0)
        ? micStreamLocal.getAudioTracks().filter(t => t.readyState === 'live')
        : [];

      const hasAudio = audioTracks.length > 0;
      const recordingStream = new MediaStream([
        ...videoTracks,
        ...audioTracks
      ]);

      if (hasAudio) {
        console.log('[PROCTOR] Recording mode: VIDEO + MICROPHONE AUDIO');
      } else {
        console.log('[PROCTOR] Recording mode: VIDEO ONLY (microphone unavailable)');
      }

      const mimeType = getSupportedMimeType(hasAudio);
      chunksRef.current = [];

      const recorder = new MediaRecorder(recordingStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 1200000 // 1.2 Mbps efficient quality
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (recErr) => {
        console.error('[Proctoring] MediaRecorder error:', recErr);
        if (onRecordingError) onRecordingError(recErr);
      };

      // Request data in 5-second intervals to maintain stream reliability
      recorder.start(5000);
      mediaRecorderRef.current = recorder;
      isRecordingRef.current = true;
      startTimeRef.current = Date.now();

      // Duration counter timer
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      durationTimerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRecordingDuration(secs);
        }
      }, 1000);

      setRecordingStatus('RECORDING');
      console.info(`[Proctoring] Media recording started successfully. Mode: ${hasAudio ? 'VIDEO + AUDIO' : 'VIDEO ONLY'}, MIME: ${mimeType}`);
      return { success: true, recordingId: backendRecId };
    } catch (err) {
      console.error('[Proctoring] Failed to start recorder:', err);
      isRecordingRef.current = false;
      setRecordingStatus('FAILED');
      return { success: false, error: err.message };
    }
  }, [requestPermissions, startCompositor, onRecordingError]);

  /**
   * Stop Recording and Upload Combined Video (and Audio if present) to Cloudinary via Backend,
   * then completely stop and tear down all screen sharing, camera, and mic streams.
   */
  const stopAndUploadRecording = useCallback(async (params = {}) => {
    const { assignmentId, assessmentId } = params;
    const activeRecId = recordingIdRef.current || recordingId || params.recordingId;

    const recorder = mediaRecorderRef.current;
    const hasRecorder = Boolean(recorder && (recorder.state === 'recording' || recorder.state === 'paused'));

    if (!hasRecorder && !isRecordingRef.current && chunksRef.current.length === 0) {
      console.warn('[Proctoring] No active MediaRecorder instance or chunks to stop.');
      stopAllMediaStreams();
      return { success: false, message: 'No active recording found' };
    }

    console.log('[RECORDING] Stopping recorder...');
    setRecordingStatus('UPLOADING');

    return new Promise((resolve) => {
      const handleUpload = async () => {
        try {
          const hasAudio = Boolean(micStreamRef.current && micStreamRef.current.getAudioTracks().length > 0);
          const mimeType = getSupportedMimeType(hasAudio);
          const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
          const totalDuration = startTimeRef.current
            ? Math.round((Date.now() - startTimeRef.current) / 1000)
            : recordingDuration;

          console.log('Final Blob:', recordedBlob);
          console.log('Blob size:', recordedBlob.size, `(${(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB)`);
          console.log('Blob type:', recordedBlob.type);

          if (recordedBlob.size === 0) {
            console.warn('[Proctoring] Recorded blob is empty.');
            setRecordingStatus('COMPLETED');
            stopAllMediaStreams();
            resolve({ success: false, error: 'Empty recording blob' });
            return;
          }

          // Ensure backend recording session exists
          let targetRecId = activeRecId;
          if (!targetRecId && assessmentId) {
            try {
              const startRes = await api.post('/api/recordings/start', {
                assessmentId: assessmentId,
                assignmentId: assignmentId || null
              });
              targetRecId = startRes.data?.id;
              recordingIdRef.current = targetRecId;
              setRecordingId(targetRecId);
            } catch (err) {
              console.error('[Proctoring] Failed to create recording record before upload:', err);
            }
          }

          if (!targetRecId) {
            console.error('[Proctoring] No target recording ID found.');
            setRecordingStatus('FAILED');
            stopAllMediaStreams();
            resolve({ success: false, error: 'No recording session ID' });
            return;
          }

          // Prepare FormData for upload
          const formData = new FormData();
          formData.append('file', recordedBlob, `proctoring_${targetRecId}.webm`);
          formData.append('duration', totalDuration.toString());
          formData.append('status_str', 'COMPLETED');

          console.info(`[Proctoring] Uploading video to backend endpoint /api/recordings/${targetRecId}/upload...`);

          const uploadRes = await api.post(`/api/recordings/${targetRecId}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 120000 // 2-minute upload timeout
          });

          console.log('[RECORDING] Upload successful:', uploadRes.data);
          setRecordingStatus('COMPLETED');
          
          // Stop all streams only AFTER recording blob is created and upload succeeds
          stopAllMediaStreams();

          resolve({
            success: true,
            recording: uploadRes.data,
            videoUrl: uploadRes.data?.cloudinaryUrl || uploadRes.data?.videoUrl,
            recordingId: targetRecId
          });
        } catch (uploadErr) {
          console.error('[Proctoring] Failed to upload recording:', uploadErr);
          setRecordingStatus('FAILED');
          
          // Always ensure screen share, camera, and mic tracks are stopped even if upload fails
          stopAllMediaStreams();
          
          resolve({
            success: false,
            error: uploadErr.response?.data?.detail || uploadErr.message
          });
        }
      };

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = handleUpload;
        try {
          recorder.stop();
        } catch (stopErr) {
          console.error('[Proctoring] Error stopping recorder, attempting immediate upload:', stopErr);
          handleUpload();
        }
      } else {
        // Recorder already stopped or collected chunks
        handleUpload();
      }
    });
  }, [recordingId, recordingDuration, stopAllMediaStreams]);

  // Synchronous checks
  const isRecordingActive = useCallback(() => {
    return isRecordingRef.current || Boolean(mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording');
  }, []);

  const hasActiveRecorder = useCallback(() => {
    return Boolean(mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') || isRecordingRef.current;
  }, []);

  const hasActiveStreams = useCallback(() => {
    return Boolean(cameraStreamRef.current && screenStreamRef.current);
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAllMediaStreams();
    };
  }, [stopAllMediaStreams]);

  return {
    cameraStream,
    screenStream,
    micStream,
    isPermissionGranted,
    permissionError,
    permissionErrorCode,
    isRequestingPermission,
    recordingStatus,
    recordingId,
    recordingDuration,
    requestPermissions,
    startRecording,
    stopAndUploadRecording,
    stopAllMediaStreams,
    stopAllMediaTracks,
    isRecordingActive,
    hasActiveRecorder,
    hasActiveStreams
  };
};

export default useProctorRecorder;
