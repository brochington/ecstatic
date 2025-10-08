/**
 * Mobile Controls for First-Person Shooter
 * Handles touch-based controls for mobile devices
 */

export class MobileControls {
  constructor() {
    this.isMobile = this.detectMobile();
    this.touchControlsEnabled = false;
    this.movementJoystickActive = false;
    this.cameraJoystickActive = false;
    this.shootButtonPressed = false;
    this.movementJoystickCenter = { x: 0, y: 0 };
    this.cameraJoystickCenter = { x: 0, y: 0 };
    this.movementVector = { x: 0, y: 0 };
    this.cameraRotation = { x: 0, y: 0 };
    this.lastTouchPosition = { x: 0, y: 0 };

    // Track which touch belongs to which joystick
    this.movementTouchId = null;
    this.cameraTouchId = null;

    // Performance optimization for mobile
    this.isLowPerformanceMode = this.isMobile;

    if (this.isMobile) {
      // Delay setup to ensure DOM is ready
      setTimeout(() => {
        this.setupMobileControls();
        this.setupOrientationHandling();
      }, 100);
    }
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  setupMobileControls() {
    this.touchControlsEnabled = true;

    // Setup movement joystick (left)
    this.setupMovementJoystick();

    // Setup camera joystick (right) - camera control only
    this.setupCameraJoystick();

    // Setup weapon cycle button
    this.setupWeaponCycleButton();

    // Setup separate fire button
    this.setupFireButton();
  }

  setupMovementJoystick() {
    const joystick = document.getElementById('movement-joystick');
    const handle = joystick.querySelector('.joystick-handle');

    if (!joystick || !handle) return;

    let joystickRect = joystick.getBoundingClientRect();
    this.movementJoystickCenter.x = joystickRect.left + joystickRect.width / 2;
    this.movementJoystickCenter.y = joystickRect.top + joystickRect.height / 2;

    const updateJoystickCenter = () => {
      joystickRect = joystick.getBoundingClientRect();
      this.movementJoystickCenter.x =
        joystickRect.left + joystickRect.width / 2;
      this.movementJoystickCenter.y =
        joystickRect.top + joystickRect.height / 2;
    };

    const handleTouchStart = e => {
      e.preventDefault();

      // Find the touch that started on this joystick
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = joystick.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          this.movementTouchId = touch.identifier;
          this.movementJoystickActive = true;
          updateJoystickCenter();
          this.updateMovementJoystickPosition(
            touch.clientX,
            touch.clientY,
            handle
          );
          break;
        }
      }
    };

    const handleTouchMove = e => {
      e.preventDefault();
      if (this.movementJoystickActive && this.movementTouchId !== null) {
        // Find our touch
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          if (touch.identifier === this.movementTouchId) {
            this.updateMovementJoystickPosition(
              touch.clientX,
              touch.clientY,
              handle
            );
            break;
          }
        }
      }
    };

    const handleTouchEnd = e => {
      e.preventDefault();

      // Check if our touch ended
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.movementTouchId) {
          this.movementJoystickActive = false;
          this.movementTouchId = null;
          this.movementVector.x = 0;
          this.movementVector.y = 0;

          // Reset handle position
          handle.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    };

    joystick.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    joystick.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystick.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Update joystick center on resize
    window.addEventListener('resize', updateJoystickCenter);
  }

  setupCameraJoystick() {
    const joystick = document.getElementById('camera-joystick');
    const handle = joystick.querySelector('.joystick-handle');

    if (!joystick || !handle) return;

    let joystickRect = joystick.getBoundingClientRect();
    this.cameraJoystickCenter.x = joystickRect.left + joystickRect.width / 2;
    this.cameraJoystickCenter.y = joystickRect.top + joystickRect.height / 2;

    const updateJoystickCenter = () => {
      joystickRect = joystick.getBoundingClientRect();
      this.cameraJoystickCenter.x = joystickRect.left + joystickRect.width / 2;
      this.cameraJoystickCenter.y = joystickRect.top + joystickRect.height / 2;
    };

    const handleTouchStart = e => {
      e.preventDefault();

      // Find the touch that started on this joystick
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = joystick.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          this.cameraTouchId = touch.identifier;
          this.cameraJoystickActive = true;
          updateJoystickCenter();
          this.updateCameraJoystickPosition(
            touch.clientX,
            touch.clientY,
            handle
          );
          break;
        }
      }
    };

    const handleTouchMove = e => {
      e.preventDefault();
      if (this.cameraJoystickActive && this.cameraTouchId !== null) {
        // Find our touch
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          if (touch.identifier === this.cameraTouchId) {
            this.updateCameraJoystickPosition(
              touch.clientX,
              touch.clientY,
              handle
            );
            break;
          }
        }
      }
    };

    const handleTouchEnd = e => {
      e.preventDefault();

      // Check if our touch ended
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.cameraTouchId) {
          this.cameraJoystickActive = false;
          this.cameraTouchId = null;
          this.cameraRotation.x = 0;
          this.cameraRotation.y = 0;

          // Reset handle position
          handle.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    };

    joystick.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    joystick.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystick.addEventListener('touchend', handleTouchEnd, { passive: false });
    joystick.addEventListener('touchcancel', handleTouchEnd, {
      passive: false,
    });

    // Update joystick center on resize
    window.addEventListener('resize', updateJoystickCenter);
  }

  updateMovementJoystickPosition(clientX, clientY, handle) {
    const deltaX = clientX - this.movementJoystickCenter.x;
    const deltaY = clientY - this.movementJoystickCenter.y;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 40; // Maximum handle movement in pixels

    // Clamp to circle
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    // Calculate normalized movement vector
    this.movementVector.x =
      (deltaX / maxDistance) * (clampedDistance / maxDistance);
    this.movementVector.y =
      (deltaY / maxDistance) * (clampedDistance / maxDistance);

    // Update handle position
    const handleX = Math.cos(angle) * clampedDistance;
    const handleY = Math.sin(angle) * clampedDistance;
    handle.style.transform = `translate(${handleX - 20}px, ${handleY - 20}px)`;
  }

  updateCameraJoystickPosition(clientX, clientY, handle) {
    const deltaX = clientX - this.cameraJoystickCenter.x;
    const deltaY = clientY - this.cameraJoystickCenter.y;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 40; // Maximum handle movement in pixels

    // Clamp to circle
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    // Calculate normalized camera rotation vector (left/right reversed, up/down normal)
    this.cameraRotation.x =
      -(deltaX / maxDistance) * (clampedDistance / maxDistance) * 0.02;
    this.cameraRotation.y =
      (deltaY / maxDistance) * (clampedDistance / maxDistance) * 0.02;

    // Update handle position
    const handleX = Math.cos(angle) * clampedDistance;
    const handleY = Math.sin(angle) * clampedDistance;
    handle.style.transform = `translate(${handleX - 20}px, ${handleY - 20}px)`;
  }

  setupWeaponCycleButton() {
    const cycleButton = document.getElementById('weapon-cycle-button');
    if (!cycleButton) return;

    const handleTouchStart = e => {
      e.preventDefault();

      // Trigger weapon cycle (will be handled by game logic)
      this.onWeaponSwitch?.(-1); // -1 indicates cycle to next weapon
    };

    cycleButton.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
  }

  setupFireButton() {
    const fireButton = document.getElementById('fire-button');
    if (!fireButton) return;

    const handleTouchStart = e => {
      e.preventDefault();
      this.shootButtonPressed = true;
      fireButton.classList.add('active');
    };

    const handleTouchEnd = e => {
      e.preventDefault();
      this.shootButtonPressed = false;
      fireButton.classList.remove('active');
    };

    fireButton.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    fireButton.addEventListener('touchend', handleTouchEnd, { passive: false });
    fireButton.addEventListener('touchcancel', handleTouchEnd, {
      passive: false,
    });
  }

  setupOrientationHandling() {
    const orientationWarning = document.getElementById('orientation-warning');

    const checkOrientation = () => {
      // More reliable orientation detection
      const isLandscape =
        window.innerWidth > window.innerHeight ||
        window.orientation === 90 ||
        window.orientation === -90 ||
        screen.orientation?.angle === 90 ||
        screen.orientation?.angle === 270;

      // Only show warning if we're clearly in portrait AND on a small screen
      const shouldShowWarning =
        !isLandscape &&
        window.innerWidth <= 896 &&
        window.innerHeight > window.innerWidth;

      if (orientationWarning) {
        if (shouldShowWarning) {
          orientationWarning.classList.add('show');
        } else {
          orientationWarning.classList.remove('show');
          // Re-setup controls when entering landscape or on mobile
          if (!this.touchControlsEnabled) {
            this.setupMobileControls();
          }
        }
      }
    };

    // Check orientation on load
    setTimeout(checkOrientation, 100);

    // Check orientation on resize
    window.addEventListener('resize', () => {
      setTimeout(checkOrientation, 100);
    });

    // Check orientation on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 300); // Longer delay for iOS
    });

    // Also listen for screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        setTimeout(checkOrientation, 300);
      });
    }
  }

  updateWeaponButtons(currentWeaponIndex) {
    if (!this.isMobile) return;

    const weaponButtons = document.querySelectorAll('.weapon-button');
    weaponButtons.forEach((button, index) => {
      if (index === currentWeaponIndex) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  getMovementVector() {
    return { ...this.movementVector };
  }

  getCameraRotation() {
    return { ...this.cameraRotation };
  }

  isShooting() {
    return this.shootButtonPressed;
  }

  // Callback for weapon switching
  onWeaponSwitch = null;

  // Debug method for testing
  debug() {
    // eslint-disable-next-line no-console
    console.log('MobileControls Debug:', {
      isMobile: this.isMobile,
      touchControlsEnabled: this.touchControlsEnabled,
      joystickActive: this.joystickActive,
      shootButtonPressed: this.shootButtonPressed,
      movementVector: this.movementVector,
      cameraRotation: this.cameraRotation,
    });
  }
}
