import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import api from '../api';

/**
 * Custom React Hook: useCameraProctor
 * 
 * Provides real-time camera monitoring with MediaPipe Face Landmarker.
 * Strictly operates ONLY if `enabled` is true.
 * If `enabled` is false, camera is never requested and MediaPipe is never initialized.
 * 
 * Features:
 * - Real-time Face Presence Detection (FACE_NOT_DETECTED, MULTIPLE_FACES)
 * - Head Pose Estimation (HEAD_TURNED_LEFT, HEAD_TURNED_RIGHT, HEAD_LOOKING_UP, HEAD_LOOKING_DOWN)
 * - Eye Gaze Tracking using iris landmarks (EYES_LOOKING_LEFT, EYES_LOOKING_RIGHT, EYES_LOOKING_UP, EYES_LOOKING_DOWN)
 * - 3-second continuous violation threshold (brief blinks/glances < 3s ignored)
 * - Camera frame screenshot capture on confirmed violation
 * - Cooldown control to prevent screenshot bursts
 * - Zero continuous video recording, zero MediaRecorder, zero Cloudinary
 */
export const useCameraProctor = ({
  enabled = false,
  assignmentId = null,
  assessmentId = null,
  violationThresholdSeconds = 3,
  cooldownSeconds = 6,
  onViolation = null,
}) => {
  // Public state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('IDLE'); // IDLE, OK, LOOKING_AWAY, VIOLATION
  const [activeViolationType, setActiveViolationType] = useState(null);
  const [violationElapsed, setViolationElapsed] = useState(0);
  const [violationsList, setViolationsList] = useState([]);

  // Internal refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);

  const violationStartRef = useRef(null);
  const currentViolationTypeRef = useRef(null);
  const lastCapturedTimeRef = useRef({});

  const enabledRef = useRef(enabled);
  const assignmentIdRef = useRef(assignmentId);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    enabledRef.current = enabled;
    assignmentIdRef.current = assignmentId;
    onViolationRef.current = onViolation;
  }, [enabled, assignmentId, onViolation]);

  /**
   * Helper: Capture camera frame to base64 JPEG
   */
  const captureScreenshot = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      console.warn('[CameraProctor] Screenshot failed: video element not available.');
      return null;
    }
    if (video.readyState < 2) {
      console.warn('[CameraProctor] Screenshot note: video readyState is', video.readyState);
    }
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const w = Math.max(video.videoWidth || 0, 640);
      const h = Math.max(video.videoHeight || 0, 480);

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      // Mirror the frame horizontally so it looks natural like the webcam preview
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      console.log(`[CameraProctor] Screenshot captured: true, length: ${dataUrl.length}, dims: ${w}x${h}`);
      return dataUrl;
    } catch (err) {
      console.error('[CameraProctor] Screenshot capture error:', err);
      return null;
    }
  }, []);

  /**
   * Dispatch violation event to backend and local state
   */
  const recordViolationEvent = useCallback(async (violationType, durationSec) => {
    const now = Date.now();
    const lastTime = lastCapturedTimeRef.current[violationType] || 0;
    const cooldownMs = (cooldownSeconds || 6) * 1000;

    // Enforce cooldown per violation type
    if (now - lastTime < cooldownMs) {
      return;
    }
    lastCapturedTimeRef.current[violationType] = now;

    const screenshotData = captureScreenshot();
    console.log(`[CameraProctor] Violation recorded: ${violationType} (${durationSec.toFixed(1)}s), screenshot captured: ${Boolean(screenshotData)}`);

    const violationEvent = {
      assessmentId: assessmentId || null,
      candidateId: null,
      assignmentId: assignmentIdRef.current,
      violationType,
      timestamp: new Date().toISOString(),
      duration: parseFloat(durationSec.toFixed(1)),
      screenshotUrl: screenshotData || null,
    };

    setViolationsList(prev => [violationEvent, ...prev.slice(0, 49)]);
    setCurrentStatus('VIOLATION');
    setTimeout(() => {
      setCurrentStatus(prev => (prev === 'VIOLATION' ? 'OK' : prev));
    }, 2500);

    if (onViolationRef.current) {
      onViolationRef.current(violationEvent);
    }

    // Post to backend activity-log endpoint
    if (assignmentIdRef.current) {
      try {
        const payload = {
          assignmentId: assignmentIdRef.current,
          activityType: violationType,
          warningCount: 0,
          duration: parseFloat(durationSec.toFixed(1)),
          screenshot: screenshotData,
          details: `Camera proctoring violation: ${violationType} sustained for ${durationSec.toFixed(1)} seconds.`,
        };
        console.log('[CameraProctor] Sending activity-log to backend with payload length:', JSON.stringify(payload).length);
        const resp = await api.post('/api/assessment/activity-log', payload);
        console.log('[CameraProctor] Backend activity-log saved successfully:', resp.data);
      } catch (postErr) {
        console.error('[CameraProctor] Failed to log proctoring activity to backend:', postErr);
      }
    }
  }, [assessmentId, captureScreenshot, cooldownSeconds]);

  /**
   * Analyze landmark geometry for Head Pose & Eye Gaze
   */
  const evaluateLandmarks = (landmarksList) => {
    if (!landmarksList || landmarksList.length === 0) {
      return 'FACE_NOT_DETECTED';
    }

    if (landmarksList.length > 1) {
      return 'MULTIPLE_FACES';
    }

    const landmarks = landmarksList[0];

    // Key points
    // 1: Nose tip, 234: Right cheek edge (in mirrored frame, left cheek), 454: Left cheek edge
    // 10: Forehead / top, 152: Chin bottom
    const nose = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const forehead = landmarks[10];
    const chin = landmarks[152];

    if (!nose || !leftCheek || !rightCheek || !forehead || !chin) {
      return null;
    }

    // 1. Head Yaw (Turned Left / Right)
    const distToLeft = Math.hypot(nose.x - leftCheek.x, nose.y - leftCheek.y);
    const distToRight = Math.hypot(nose.x - rightCheek.x, nose.y - rightCheek.y);
    const yawRatio = distToLeft / (distToRight + 0.00001);

    // Note: Video is mirrored for candidate display
    if (yawRatio < 0.42) {
      return 'HEAD_TURNED_LEFT';
    }
    if (yawRatio > 2.38) {
      return 'HEAD_TURNED_RIGHT';
    }

    // 2. Head Pitch (Looking Up / Down)
    const distToUpper = Math.hypot(forehead.x - nose.x, forehead.y - nose.y);
    const distToLower = Math.hypot(nose.x - chin.x, nose.y - chin.y);
    const pitchRatio = distToUpper / (distToLower + 0.00001);

    if (pitchRatio < 0.42) {
      return 'HEAD_LOOKING_DOWN';
    }
    if (pitchRatio > 2.30) {
      return 'HEAD_LOOKING_UP';
    }

    // 3. Eye Gaze (Iris Landmark Positioning)
    // Left Iris: 468, Inner Corner: 133, Outer Corner: 33, Top Lid: 159, Bottom Lid: 145
    // Right Iris: 473, Inner Corner: 362, Outer Corner: 263, Top Lid: 386, Bottom Lid: 374
    const leftIris = landmarks[468];
    const rightIris = landmarks[473];

    const leftOuter = landmarks[33];
    const leftInner = landmarks[133];
    const leftTop = landmarks[159];
    const leftBottom = landmarks[145];

    const rightOuter = landmarks[263];
    const rightInner = landmarks[362];
    const rightTop = landmarks[386];
    const rightBottom = landmarks[374];

    if (leftIris && rightIris && leftOuter && leftInner && rightOuter && rightInner) {
      const leftEyeWidth = Math.abs(leftInner.x - leftOuter.x);
      const rightEyeWidth = Math.abs(rightInner.x - rightOuter.x);

      if (leftEyeWidth > 0.015 && rightEyeWidth > 0.015) {
        // Horizontal relative position (0.0 = one corner, 1.0 = opposite corner)
        const leftH = (leftIris.x - Math.min(leftOuter.x, leftInner.x)) / leftEyeWidth;
        const rightH = (rightIris.x - Math.min(rightOuter.x, rightInner.x)) / rightEyeWidth;
        const avgH = (leftH + rightH) / 2;

        if (avgH < 0.22) {
          return 'EYES_LOOKING_LEFT';
        }
        if (avgH > 0.78) {
          return 'EYES_LOOKING_RIGHT';
        }
      }

      if (leftTop && leftBottom && rightTop && rightBottom) {
        const leftEyeHeight = Math.abs(leftBottom.y - leftTop.y);
        const rightEyeHeight = Math.abs(rightBottom.y - rightTop.y);

        if (leftEyeHeight > 0.01 && rightEyeHeight > 0.01) {
          const leftV = (leftIris.y - Math.min(leftTop.y, leftBottom.y)) / leftEyeHeight;
          const rightV = (rightIris.y - Math.min(rightTop.y, rightBottom.y)) / rightEyeHeight;
          const avgV = (leftV + rightV) / 2;

          if (avgV < 0.16) {
            return 'EYES_LOOKING_UP';
          }
          if (avgV > 0.84) {
            return 'EYES_LOOKING_DOWN';
          }
        }
      }
    }

    return null; // All normal, focused on screen
  };

  /**
   * Main Processing Loop
   */
  const processCameraFrame = useCallback(() => {
    if (!enabledRef.current || !videoRef.current || !landmarkerRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(processCameraFrame);
      return;
    }

    const now = performance.now();
    try {
      const results = landmarkerRef.current.detectForVideo(video, now);
      const instantViolation = evaluateLandmarks(results.faceLandmarks);

      const thresholdMs = (violationThresholdSeconds || 3) * 1000;

      if (instantViolation) {
        if (currentViolationTypeRef.current === instantViolation && violationStartRef.current) {
          const elapsed = Date.now() - violationStartRef.current;
          setViolationElapsed(parseFloat((elapsed / 1000).toFixed(1)));
          setCurrentStatus('LOOKING_AWAY');
          setActiveViolationType(instantViolation);

          // Threshold reached!
          if (elapsed >= thresholdMs) {
            recordViolationEvent(instantViolation, elapsed / 1000);
            // Reset timer after violation recorded so subsequent count restarts
            violationStartRef.current = Date.now();
          }
        } else {
          // Started a new potential violation streak
          currentViolationTypeRef.current = instantViolation;
          violationStartRef.current = Date.now();
          setActiveViolationType(instantViolation);
          setViolationElapsed(0.1);
        }
      } else {
        // Candidate looking toward screen: clear pending violation
        if (currentViolationTypeRef.current) {
          currentViolationTypeRef.current = null;
          violationStartRef.current = null;
          setActiveViolationType(null);
          setViolationElapsed(0);
          setCurrentStatus('OK');
        }
      }
    } catch (detectErr) {
      // Avoid spamming frame errors
    }

    animationFrameRef.current = requestAnimationFrame(processCameraFrame);
  }, [recordViolationEvent, violationThresholdSeconds]);

  /**
   * Initialize MediaPipe & Webcam when enabled
   */
  useEffect(() => {
    if (!enabled) {
      // If camera monitoring is disabled, ensure no webcam or model is active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsCameraActive(false);
      setIsModelLoading(false);
      setCurrentStatus('IDLE');
      return;
    }

    let isMounted = true;

    const setupCameraAndModel = async () => {
      setIsModelLoading(true);
      setCameraError(null);

      try {
        // 1. Initialize MediaPipe Face Landmarker
        // First try local wasm and model files, fallback to Google CDN
        let filesetResolver;
        try {
          filesetResolver = await FilesetResolver.forVisionTasks('/wasm');
        } catch {
          filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
          );
        }

        const modelAssetPath = '/models/face_landmarker.task';
        let faceLandmarker;
        try {
          faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: modelAssetPath,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 2,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });
        } catch {
          // Fallback to Google CDN model
          faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 2,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });
        }

        if (!isMounted) return;
        landmarkerRef.current = faceLandmarker;
        setIsModelLoading(false);

        // 2. Request camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false, // Strictly video only, no audio recording
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsCameraActive(true);
        setCurrentStatus('OK');

        // 3. Start evaluation loop
        animationFrameRef.current = requestAnimationFrame(processCameraFrame);
      } catch (err) {
        console.error('[CameraProctor] Initialization error:', err);
        if (isMounted) {
          setCameraError(err.message || 'Camera permission denied or unavailable');
          setIsModelLoading(false);
          setIsCameraActive(false);
        }
      }
    };

    setupCameraAndModel();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (landmarkerRef.current) {
        try { landmarkerRef.current.close(); } catch { }
        landmarkerRef.current = null;
      }
    };
  }, [enabled, processCameraFrame]);

  return {
    isCameraActive,
    isModelLoading,
    cameraError,
    currentStatus,
    activeViolationType,
    violationElapsed,
    violationsList,
    videoRef,
    captureScreenshot,
  };
};

export default useCameraProctor;
