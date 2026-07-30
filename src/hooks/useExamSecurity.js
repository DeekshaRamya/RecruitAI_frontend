import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';

/**
 * Custom React Hook for Exam Security and Proctoring.
 * Provides protection against copying, tab-switching, right-clicking, devtools,
 * multi-monitor usage, screen sleeping, and page reloading.
 * Tracks candidate violations, logs real-time audit entries to the backend,
 * and enforces configurable warning thresholds.
 */
export const useExamSecurity = ({
  active = false,
  assignmentId = null,
  questionNumber = 1,
  remainingTime = '',
  _maxViolations = 3,
  maxWarnings = 3,
  gracePeriodSeconds = 10,
  onLock = null,
  onViolation = null,
}) => {
  const [violations, setViolations] = useState([]);
  const [trustScore, setTrustScore] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenGraceActive, setIsFullscreenGraceActive] = useState(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState(gracePeriodSeconds);
  const [isExamLocked, setIsExamLocked] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [warningHistory, setWarningHistory] = useState([]);
  const [autoSubmittedDueToViolations, setAutoSubmittedDueToViolations] = useState(false);

  // Refs for closure-safe event listeners
  const violationsRef = useRef([]);
  const trustScoreRef = useRef(100);
  const lastViolationTimeRef = useRef(Date.now());
  const activeRef = useRef(active);
  const isExamLockedRef = useRef(false);
  const exitCountRef = useRef(0);
  const warningHistoryRef = useRef([]);
  const wasFullscreenRef = useRef(false);
  const lastExitTimeRef = useRef(0);
  const assignmentIdRef = useRef(assignmentId);
  const questionNumberRef = useRef(questionNumber);
  const remainingTimeRef = useRef(remainingTime);
  const maxWarningsRef = useRef(maxWarnings);

  const lastTabSwitchTimeRef = useRef(0);
  const lastWindowBlurTimeRef = useRef(0);
  const lastEscTimeRef = useRef(0);

  const onLockRef = useRef(onLock);
  const onViolationRef = useRef(onViolation);

  // Sync refs
  useEffect(() => {
    activeRef.current = active;
    isExamLockedRef.current = isExamLocked;
    onLockRef.current = onLock;
    onViolationRef.current = onViolation;
    assignmentIdRef.current = assignmentId;
    questionNumberRef.current = questionNumber;
    remainingTimeRef.current = remainingTime;
    maxWarningsRef.current = maxWarnings;
  }, [active, isExamLocked, onLock, onViolation, assignmentId, questionNumber, remainingTime, maxWarnings]);

  const resetExamSecurity = useCallback(() => {
    setViolations([]);
    violationsRef.current = [];
    setTrustScore(100);
    trustScoreRef.current = 100;
    setIsExamLocked(false);
    isExamLockedRef.current = false;
    setFullscreenExitCount(0);
    exitCountRef.current = 0;
    setWarningHistory([]);
    warningHistoryRef.current = [];
    setAutoSubmittedDueToViolations(false);
    wasFullscreenRef.current = false;
    lastExitTimeRef.current = 0;
    setIsFullscreenGraceActive(false);
    lastTabSwitchTimeRef.current = 0;
    lastWindowBlurTimeRef.current = 0;
    lastEscTimeRef.current = 0;
  }, []);

  const requestFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch {
      // Ignore fullscreen failure
    }
  }, []);

  // Post Activity Log to Backend API
  const sendActivityLogToBackend = useCallback(async (activityType, warningCount, details) => {
    if (!assignmentIdRef.current) return;
    try {
      await api.post('/api/assessment/activity-log', {
        assignmentId: assignmentIdRef.current,
        activityType,
        warningCount: warningCount || exitCountRef.current || 0,
        questionNumber: questionNumberRef.current || 1,
        remainingTime: String(remainingTimeRef.current || ''),
        browserInfo: navigator.userAgent,
        details: details || ''
      });
    } catch {
      // Handle silently
    }
  }, []);

  // Helper to increment warning counter for proctor security violations
  const incrementWarningAndCheckLock = useCallback((reason) => {
    const nextCount = exitCountRef.current + 1;
    exitCountRef.current = nextCount;
    setFullscreenExitCount(nextCount);

    const isoTimestamp = new Date().toISOString();
    const updatedHistory = [...warningHistoryRef.current, isoTimestamp];
    warningHistoryRef.current = updatedHistory;
    setWarningHistory(updatedHistory);

    const maxLimit = (maxWarningsRef.current || 3) + 1;
    if (nextCount >= maxLimit) {
      setAutoSubmittedDueToViolations(true);
      setIsExamLocked(true);
      isExamLockedRef.current = true;
      if (onLockRef.current) {
        onLockRef.current(reason || 'Maximum security violations reached.');
      }
    }
    return nextCount;
  }, []);

  /**
   * Primary Violation & Activity Logger
   */
  const triggerViolation = useCallback((type, description, severity = 'Medium', activityType = null, isWarningViolation = false) => {
    if (!activeRef.current || isExamLockedRef.current) return;

    const now = Date.now();

    // Map standardized activity types for backend logging
    const mappedType = activityType || (
      type.includes('Right Click') ? 'RIGHT_CLICK' :
      type.includes('Copy') ? 'COPY_ATTEMPT' :
      type.includes('Paste') ? 'PASTE_ATTEMPT' :
      type.includes('Cut') ? 'CUT_ATTEMPT' :
      type.includes('Developer') ? 'DEVTOOLS_ATTEMPT' :
      type.includes('Tab Switch') ? 'TAB_SWITCH' :
      type.includes('Window Blur') ? 'WINDOW_BLUR' :
      type.includes('Window Focus') ? 'WINDOW_FOCUS' :
      type.includes('Escape') || type.includes('ESC') ? 'ESC_KEY' :
      type.includes('Fullscreen') ? 'FULLSCREEN_EXIT' : 'OTHER_VIOLATION'
    );

    // Prevent duplicate warning events (fullscreen exit, esc key, tab switch, blur) within 1500ms
    const isWarningType = isWarningViolation || ['TAB_SWITCH', 'WINDOW_BLUR', 'ESC_KEY', 'FULLSCREEN_EXIT'].includes(mappedType);
    const duplicate = violationsRef.current.find((v) => {
      if (now - v.timestamp >= 1500) return false;
      if (isWarningType && ['TAB_SWITCH', 'WINDOW_BLUR', 'ESC_KEY', 'FULLSCREEN_EXIT'].includes(v.activityType)) {
        return true;
      }
      return v.activityType === mappedType || v.type === type;
    });
    if (duplicate) return;

    let currentWarnCount = exitCountRef.current;
    if (isWarningType) {
      currentWarnCount = incrementWarningAndCheckLock(`${type}: ${description}`);
    }

    const newViolation = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      activityType: mappedType,
      description,
      severity,
      timestamp: now,
      warningCount: currentWarnCount
    };

    lastViolationTimeRef.current = now;

    // Synchronously update ref so rapid browser event callbacks (keydown -> fullscreenchange) recognize duplicate
    const updatedViolations = [...violationsRef.current, newViolation];
    violationsRef.current = updatedViolations;

    let deduction = 15;
    if (severity === 'Low') deduction = 5;
    if (severity === 'High') deduction = 30;

    setViolations(updatedViolations);

    setTrustScore((prev) => {
      const updatedScore = Math.max(0, prev - deduction);
      trustScoreRef.current = updatedScore;
      return updatedScore;
    });

    sendActivityLogToBackend(mappedType, currentWarnCount, description);

    if (onViolationRef.current) {
      onViolationRef.current(newViolation);
    }
  }, [sendActivityLogToBackend, incrementWarningAndCheckLock]);

  // 1. Right Click prevention
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation('Right Click Blocked', 'Right-click context menu attempt.', 'Low', 'RIGHT_CLICK');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 2. Clipboard Protection (Copy, Cut, Paste)
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleCopy = (e) => {
      e.preventDefault();
      triggerViolation('Copy Blocked', 'Copy operation attempt.', 'Low', 'COPY_ATTEMPT');
    };
    const handlePaste = (e) => {
      e.preventDefault();
      triggerViolation('Paste Blocked', 'Paste operation attempt.', 'Low', 'PASTE_ATTEMPT');
    };
    const handleCut = (e) => {
      e.preventDefault();
      triggerViolation('Cut Blocked', 'Cut operation attempt.', 'Low', 'CUT_ATTEMPT');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 3. DevTools & Keyboard Shortcuts (Escape, F12, Ctrl+Shift+I/J/C, Ctrl+U)
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleKeyDown = (e) => {
      // Escape Key
      if (e.key === 'Escape' || e.keyCode === 27) {
        const now = Date.now();
        if (now - lastEscTimeRef.current < 1000) return;
        lastEscTimeRef.current = now;
        triggerViolation('ESC Key Pressed', 'Escape key pressed.', 'Medium', 'ESC_KEY', true);
        return;
      }

      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        triggerViolation('Developer Tools', 'F12 key pressed.', 'High', 'DEVTOOLS_ATTEMPT');
        return;
      }

      // Inspect Elements or Console (Ctrl+Shift+I / J / C)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Developer Tools', 'Developer tools shortcut pressed.', 'High', 'DEVTOOLS_ATTEMPT');
        return;
      }

      // Mac inspect shortcuts (Cmd+Option+I / J / U / C)
      if (e.metaKey && e.altKey && ['I', 'J', 'U', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Developer Tools', 'Mac inspector tools shortcut pressed.', 'High', 'DEVTOOLS_ATTEMPT');
        return;
      }

      // View Source (Ctrl+U / Cmd+U)
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        triggerViolation('Developer Tools', 'View source shortcut pressed.', 'High', 'DEVTOOLS_ATTEMPT');
        return;
      }

      // Selection & Clipboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && ['C', 'V', 'X', 'A'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        const key = e.key.toUpperCase();
        const act = key === 'C' ? 'COPY_ATTEMPT' : (key === 'V' ? 'PASTE_ATTEMPT' : (key === 'X' ? 'CUT_ATTEMPT' : 'SELECT_ALL_ATTEMPT'));
        triggerViolation('Selection Blocked', `Keyboard shortcut Ctrl+${key} blocked.`, 'Low', act);
        return;
      }

      // Print / Save page (Ctrl+P / Ctrl+S)
      if ((e.ctrlKey || e.metaKey) && ['P', 'S'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Shortcut Blocked', `Page shortcut Ctrl+${e.key.toUpperCase()} disabled.`, 'Low');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 4. Tab Switch & Focus Loss / Gain Detection
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const now = Date.now();
        if (now - lastTabSwitchTimeRef.current < 1000) return;
        lastTabSwitchTimeRef.current = now;

        // Force exit fullscreen to trigger warning overlay immediately
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen().catch(() => {});
        }

        triggerViolation('Tab Switch', 'Switched away from assessment tab.', 'High', 'TAB_SWITCH', true);
      } else if (document.visibilityState === 'visible') {
        sendActivityLogToBackend('WINDOW_FOCUS', exitCountRef.current, 'Returned to assessment tab.');
      }
    };

    const handleWindowBlur = () => {
      setTimeout(() => {
        const now = Date.now();
        // Skip WINDOW_BLUR if tab switch happened within 800ms or document is hidden
        if (document.visibilityState === 'hidden' || (now - lastTabSwitchTimeRef.current < 800)) {
          return;
        }

        if (!document.hasFocus() && activeRef.current && !isExamLockedRef.current) {
          if (now - lastWindowBlurTimeRef.current < 1000) return;
          lastWindowBlurTimeRef.current = now;

          // Force exit fullscreen to trigger warning overlay immediately
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen().catch(() => {});
          }

          triggerViolation('Window Blur', 'Browser lost focus.', 'Medium', 'WINDOW_BLUR', true);
        }
      }, 150);
    };

    const handleWindowFocus = () => {
      sendActivityLogToBackend('WINDOW_FOCUS', exitCountRef.current, 'Browser gained focus.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [active, isExamLocked, triggerViolation, sendActivityLogToBackend]);

  // 5. Back Button and Popstate Blocking
  useEffect(() => {
    if (!active || isExamLocked) return;

    // Push state to override standard browser back history
    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      triggerViolation('Navigation Attempt', 'Browser navigation blocked.', 'Low');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 6. Prevent Refresh / Close Tab Alert
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleBeforeUnload = (e) => {
      const message = 'Exam in progress. Leaving this page will submit your exam with current progress.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [active, isExamLocked]);

  // 7. Fullscreen Change Monitoring and Grace Period countdown
  useEffect(() => {
    if (!active || isExamLocked) return;

    const checkFullscreenState = () => {
      const isCurrentlyFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFull);

      // Track transition from fullscreen to non-fullscreen
      if (wasFullscreenRef.current && !isCurrentlyFull) {
        const now = Date.now();
        // Prevent duplicate events within 1500ms
        if (now - lastExitTimeRef.current > 1500) {
          lastExitTimeRef.current = now;
          triggerViolation(
            `Fullscreen Exit`,
            `Exited full-screen mode.`,
            'Medium',
            'FULLSCREEN_EXIT',
            true
          );
          const nextCount = exitCountRef.current;
          if (nextCount < 4) {
            setIsFullscreenGraceActive(true);
            setGraceSecondsLeft(gracePeriodSeconds);
          }
        }
      } else if (isCurrentlyFull) {
        setIsFullscreenGraceActive(false);
      }

      wasFullscreenRef.current = isCurrentlyFull;
    };

    document.addEventListener('fullscreenchange', checkFullscreenState);
    document.addEventListener('webkitfullscreenchange', checkFullscreenState);
    document.addEventListener('mozfullscreenchange', checkFullscreenState);
    document.addEventListener('MSFullscreenChange', checkFullscreenState);

    // Initial Check
    const initialFull = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    setIsFullscreen(initialFull);
    wasFullscreenRef.current = initialFull;

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreenState);
      document.removeEventListener('webkitfullscreenchange', checkFullscreenState);
      document.removeEventListener('mozfullscreenchange', checkFullscreenState);
      document.removeEventListener('MSFullscreenChange', checkFullscreenState);
    };
  }, [active, isExamLocked, gracePeriodSeconds, triggerViolation]);

  // Countdown timer for Fullscreen Grace Period
  useEffect(() => {
    if (!isFullscreenGraceActive || isExamLocked) return;

    const interval = setInterval(() => {
      setGraceSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFullscreenGraceActive, isExamLocked]);

  // 8. Wake Lock API (Prevent Screen Sleep)
  useEffect(() => {
    if (!active || isExamLocked) return;

    let wakeLockSentinel = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        } catch {
          // Ignore wake lock failure
        }
      }
    };

    requestWakeLock();

    // Re-acquire Wake Lock when window regains visibility
    const handleVisibilityForWakeLock = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityForWakeLock);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityForWakeLock);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [active, isExamLocked]);

  // 9. Dual Monitor & Resize/DevTools sizing detection
  useEffect(() => {
    if (!active || isExamLocked) return;

    const checkScreens = async () => {
      try {
        // Modern Window Management API check
        if (window.screen && typeof window.screen.isExtended !== 'undefined') {
          if (window.screen.isExtended) {
            triggerViolation('Dual Monitor', 'Multiple monitors detected. Please disconnect external screens.', 'High');
          }
        }
      } catch {
        // Ignore screen check unsupported error
      }
    };

    checkScreens();

    if (window.screen) {
      window.screen.addEventListener('change', checkScreens);
    }

    const handleResize = () => {
      // Span check (browser window wider than screen width indicates spanning multiple displays)
      if (window.innerWidth > window.screen.availWidth) {
        triggerViolation('Dual Monitor', 'Display spans multiple monitors.', 'High');
      }

      // Check for devtools docking based on size discrepancies
      const devtoolsOpenThreshold = 160;
      const widthDev = window.outerWidth - window.innerWidth > devtoolsOpenThreshold;
      const heightDev = window.outerHeight - window.innerHeight > devtoolsOpenThreshold;
      if (widthDev || heightDev) {
        triggerViolation('Developer Tools', 'Developer tools window docking detected.', 'High');
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (window.screen) {
        window.screen.removeEventListener('change', checkScreens);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 10. Multi-touch and Touch Gesture prevention
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleTouchStart = (e) => {
      // Block multi-touch zoom and swipes (more than 1 finger touch)
      if (e.touches.length > 1) {
        e.preventDefault();
        triggerViolation('Gesture Blocked', 'Multi-touch gesture blocked.', 'Low');
      }
    };

    const handleGestureStart = (e) => {
      e.preventDefault();
      triggerViolation('Gesture Blocked', 'Pinch-to-zoom and gestures are blocked.', 'Low');
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('gesturestart', handleGestureStart, { passive: false });
    window.addEventListener('gesturechange', handleGestureStart, { passive: false });
    window.addEventListener('gestureend', handleGestureStart, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('gesturestart', handleGestureStart);
      window.removeEventListener('gesturechange', handleGestureStart);
      window.removeEventListener('gestureend', handleGestureStart);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 11. Trust Score Recovery system
  // If candidate commits no violations for 45s, restore 5 points of trust score every 25s up to 90%
  useEffect(() => {
    if (!active || isExamLocked) return;

    const recoveryInterval = setInterval(() => {
      const timeSinceLastViolation = Date.now() - lastViolationTimeRef.current;
      if (timeSinceLastViolation >= 45000) {
        setTrustScore((prev) => {
          if (prev < 90) {
            const nextScore = Math.min(90, prev + 5);
            trustScoreRef.current = nextScore;
            return nextScore;
          }
          return prev;
        });
      }
    }, 25000); // Trigger check every 25s

    return () => clearInterval(recoveryInterval);
  }, [active, isExamLocked]);

  return {
    violations,
    trustScore,
    isFullscreen,
    isFullscreenGraceActive,
    graceSecondsLeft,
    isExamLocked,
    fullscreenExitCount,
    warningHistory,
    autoSubmittedDueToViolations,
    resetExamSecurity,
    requestFullscreen,
    triggerViolation,
  };
};
