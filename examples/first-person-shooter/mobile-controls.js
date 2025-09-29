/**
 * Mobile Controls for First-Person Shooter
 * Handles touch-based controls for mobile devices
 */

export class MobileControls {
  constructor() {
    this.isMobile = this.detectMobile();
    this.touchControlsEnabled = false;
    this.joystickActive = false;
    this.shootButtonPressed = false;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickHandle = { x: 0, y: 0 };
    this.movementVector = { x: 0, y: 0 };
    this.cameraRotation = { x: 0, y: 0 };
    this.lastTouchPosition = { x: 0, y: 0 };

    if (this.isMobile) {
      this.setupMobileControls();
      this.setupOrientationHandling();
    }
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  setupMobileControls() {
    this.touchControlsEnabled = true;

    // Setup virtual joystick
    this.setupVirtualJoystick();

    // Setup shoot button
    this.setupShootButton();

    // Setup weapon switching
    this.setupWeaponSwitching();

    // Setup touch camera controls
    this.setupTouchCamera();
  }

  setupVirtualJoystick() {
    const joystick = document.getElementById('movement-joystick');
    const handle = joystick.querySelector('.joystick-handle');

    if (!joystick || !handle) return;

    let joystickRect = joystick.getBoundingClientRect();
    this.joystickCenter.x = joystickRect.left + joystickRect.width / 2;
    this.joystickCenter.y = joystickRect.top + joystickRect.height / 2;

    const updateJoystickCenter = () => {
      joystickRect = joystick.getBoundingClientRect();
      this.joystickCenter.x = joystickRect.left + joystickRect.width / 2;
      this.joystickCenter.y = joystickRect.top + joystickRect.height / 2;
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      this.joystickActive = true;
      updateJoystickCenter();
      this.updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY, handle);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (this.joystickActive) {
        this.updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY, handle);
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      this.joystickActive = false;
      this.movementVector.x = 0;
      this.movementVector.y = 0;

      // Reset handle position
      handle.style.transform = 'translate(-50%, -50%)';
    };

    joystick.addEventListener('touchstart', handleTouchStart, { passive: false });
    joystick.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystick.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Update joystick center on resize
    window.addEventListener('resize', updateJoystickCenter);
  }

  updateJoystickPosition(clientX, clientY, handle) {
    const deltaX = clientX - this.joystickCenter.x;
    const deltaY = clientY - this.joystickCenter.y;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 40; // Maximum handle movement in pixels

    // Clamp to circle
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    // Calculate normalized movement vector
    this.movementVector.x = (deltaX / maxDistance) * (clampedDistance / maxDistance);
    this.movementVector.y = (deltaY / maxDistance) * (clampedDistance / maxDistance);

    // Update handle position
    const handleX = Math.cos(angle) * clampedDistance;
    const handleY = Math.sin(angle) * clampedDistance;
    handle.style.transform = `translate(${handleX - 20}px, ${handleY - 20}px)`;
  }

  setupShootButton() {
    const shootButton = document.getElementById('shoot-button');
    if (!shootButton) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      this.shootButtonPressed = true;
      shootButton.classList.add('active');
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      this.shootButtonPressed = false;
      shootButton.classList.remove('active');
    };

    shootButton.addEventListener('touchstart', handleTouchStart, { passive: false });
    shootButton.addEventListener('touchend', handleTouchEnd, { passive: false });
    shootButton.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  }

  setupWeaponSwitching() {
    const weaponButtons = document.querySelectorAll('.weapon-button');
    if (!weaponButtons.length) return;

    weaponButtons.forEach(button => {
      const handleTouchStart = (e) => {
        e.preventDefault();
        const weaponIndex = parseInt(button.dataset.weapon);

        // Update active button
        weaponButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Trigger weapon switch (will be handled by game logic)
        this.onWeaponSwitch?.(weaponIndex);
      };

      button.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
  }

  setupTouchCamera() {
    const canvas = document.getElementById('ecs-canvas');
    if (!canvas) return;

    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchActive = false;

    const handleTouchStart = (e) => {
      // Only handle camera if not touching UI elements
      if (e.target.closest('#mobile-controls')) return;

      e.preventDefault();
      touchActive = true;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchActive || e.target.closest('#mobile-controls')) return;

      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastTouchX;
      const deltaY = e.touches[0].clientY - lastTouchY;

      // Update camera rotation
      this.cameraRotation.x += deltaX * 0.002;
      this.cameraRotation.y += deltaY * 0.002;

      // Clamp vertical rotation
      this.cameraRotation.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraRotation.y));

      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      touchActive = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  setupOrientationHandling() {
    const orientationWarning = document.getElementById('orientation-warning');

    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;

      if (orientationWarning) {
        if (isLandscape) {
          orientationWarning.classList.remove('show');
        } else {
          orientationWarning.classList.add('show');
        }
      }
    };

    // Check orientation on load and resize
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    });
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
}
