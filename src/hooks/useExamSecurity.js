import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom React Hook for Exam Security and Proctoring.
 * Provides protection against copying, tab-switching, right-clicking, devtools,
 * multi-monitor usage, screen sleeping, and page reloading.
 * Tracks candidate violations and calculates an evolving Trust Score.
 * 
 * @param {Object} options Configuration parameters.
 * @param {boolean} options.active True if security checks should be active (e.g. exam started).
 * @param {number} options.maxViolations Max number of violations permitted before locking the exam.
 * @param {number} options.gracePeriodSeconds Seconds allowed to re-enter fullscreen.
 * @param {function} options.onLock Callback triggered when the exam is locked.
 * @param {function} options.onViolation Callback triggered on every registered violation.
 */
export const useExamSecurity = ({
  active = false,
  maxViolations = 5,
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

  // Use refs for value read inside event listeners to avoid closure-stale variables
  const violationsRef = useRef([]);
  const trustScoreRef = useRef(100);
  const lastViolationTimeRef = useRef(Date.now());
  const activeRef = useRef(active);
  const isExamLockedRef = useRef(false);
  const exitCountRef = useRef(0);
  const warningHistoryRef = useRef([]);
  const wasFullscreenRef = useRef(false);
  const lastExitTimeRef = useRef(0);

  const onLockRef = useRef(onLock);
  const onViolationRef = useRef(onViolation);

  // Reset exam security state when starting a new session
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
  }, []);

  // Sync refs with latest state/prop values
  useEffect(() => {
    activeRef.current = active;
    isExamLockedRef.current = isExamLocked;
    onLockRef.current = onLock;
    onViolationRef.current = onViolation;
  }, [active, isExamLocked, onLock, onViolation]);

  /**
   * Helper to trigger fullscreen mode programmatically.
   */
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
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  /**
   * Log a security violation, reduce trust score, and lock exam if thresholds exceeded.
   */
  const triggerViolation = useCallback((type, description, severity = 'Medium') => {
    if (!activeRef.current || isExamLockedRef.current) return;

    const now = Date.now();
    // Prevent duplicate logs of the same type within 2 seconds
    const duplicate = violationsRef.current.find(
      (v) => v.type === type && now - v.timestamp < 2000
    );
    if (duplicate) return;

    const newViolation = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      description,
      severity,
      timestamp: now,
    };

    lastViolationTimeRef.current = now;

    // Severity weights for Trust Score deduction
    let deduction = 15;
    if (severity === 'Low') deduction = 5;
    if (severity === 'High') deduction = 30;

    setViolations((prev) => {
      const updated = [...prev, newViolation];
      violationsRef.current = updated;
      return updated;
    });

    setTrustScore((prev) => {
      const updatedScore = Math.max(0, prev - deduction);
      trustScoreRef.current = updatedScore;
      return updatedScore;
    });

    if (onViolationRef.current) {
      onViolationRef.current(newViolation);
    }
  }, [maxViolations]);

  // 1. Right Click prevention
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation('Right Click Blocked', 'Right-click menu is disabled.', 'Low');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 2. Clipboard Protection (Copy, Cut, Paste)
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleClipboard = (e) => {
      e.preventDefault();
      triggerViolation('Clipboard Blocked', `${e.type.toUpperCase()} operation blocked.`, 'Low');
    };

    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('paste', handleClipboard);

    return () => {
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 3. Developer Tools & Command Keyboard Shortcut Blockers
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleKeyDown = (e) => {
      // F12 key or Escape key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        triggerViolation('Developer Tools', 'F12 key pressed.', 'High');
        return;
      }

      // Inspect Elements or Console (Ctrl+Shift+I / J / C)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Developer Tools', 'Developer tools shortcut pressed.', 'High');
        return;
      }

      // Mac inspect shortcuts (Cmd+Option+I / J / U / C)
      if (e.metaKey && e.altKey && ['I', 'J', 'U', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Developer Tools', 'Mac inspector tools shortcut pressed.', 'High');
        return;
      }

      // View Source (Ctrl+U / Cmd+U)
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        triggerViolation('Developer Tools', 'View source shortcut pressed.', 'High');
        return;
      }

      // Clipboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X)
      if ((e.ctrlKey || e.metaKey) && ['C', 'V', 'X'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Clipboard Blocked', 'Clipboard keyboard shortcut blocked.', 'Low');
        return;
      }

      // Print page (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'P') {
        e.preventDefault();
        triggerViolation('Shortcut Blocked', 'Printing pages is disabled.', 'Low');
        return;
      }

      // Save page (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'S') {
        e.preventDefault();
        triggerViolation('Shortcut Blocked', 'Saving pages is disabled.', 'Low');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active, isExamLocked, triggerViolation]);

  // 4. Tab Switch & Focus Loss Detection
  useEffect(() => {
    if (!active || isExamLocked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerViolation('Tab Switch', 'Switched away from the exam tab.', 'High');
      }
    };

    const handleWindowBlur = () => {
      // Small timeout to avoid triggering blur when entering fullscreen popup/iframe context
      setTimeout(() => {
        if (!document.hasFocus() && activeRef.current && !isExamLockedRef.current) {
          triggerViolation('Window Blur', 'Browser lost focus. Do not navigate outside the exam window.', 'Medium');
        }
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [active, isExamLocked, triggerViolation]);

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
          const nextCount = exitCountRef.current + 1;
          exitCountRef.current = nextCount;
          setFullscreenExitCount(nextCount);

          const isoTimestamp = new Date(now).toISOString();
          const updatedHistory = [...warningHistoryRef.current, isoTimestamp];
          warningHistoryRef.current = updatedHistory;
          setWarningHistory(updatedHistory);

          if (nextCount >= 4) {
            setAutoSubmittedDueToViolations(true);
            setIsExamLocked(true);
            isExamLockedRef.current = true;
            if (onLockRef.current) {
              onLockRef.current('Exited full-screen mode 4 times.');
            }
          } else {
            triggerViolation(
              `Fullscreen Exit`,
              `Exited full-screen mode (Warning ${nextCount} of 3).`,
              nextCount >= 3 ? 'High' : 'Medium'
            );
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
        } catch (err) {
          console.warn('Wake Lock request failed:', err);
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
        wakeLockSentinel.release().catch((e) => console.warn(e));
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
      } catch (err) {
        console.warn('Extended screen placement check not supported/permitted:', err);
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
