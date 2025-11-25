import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*                                 RESOURCES                                  */
/* -------------------------------------------------------------------------- */

export class ThreeScene {
  constructor() {
    this.scene = new THREE.Scene();

    // 1. Detect Mobile for Graphics Settings
    // We check userAgent or screen width to catch mobile devices
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 896;

    // 2. Reduce Draw Distance on Mobile
    // Mobile devices don't need to render as far, saving vertex processing
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      isMobile ? 300 : 1000 // Reduced from 1000 to 300 on mobile
    );

    // 3. Renderer Optimization
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('ecs-canvas'),
      // Disable Antialiasing on mobile: High DPI screens (Retina) naturally mask jagged edges
      // Enabling AA on mobile is extremely expensive for very little visual gain
      antialias: !isMobile,
      powerPreference: 'high-performance',
      // precision: isMobile ? "mediump" : "highp" // Optional: mediump can be faster but might cause z-fighting
    });

    // 4. Cap Pixel Ratio (Crucial for iPhones)
    // iPhone Retinas have a DPR of 3. Rendering at 3x resolution kills performance (9x pixels!).
    // Capping at 1.5x or 2x looks nearly identical but runs 2-3x faster.
    const maxPixelRatio = isMobile
      ? Math.min(window.devicePixelRatio, 1.5)
      : window.devicePixelRatio;
    this.renderer.setPixelRatio(maxPixelRatio);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setScissorTest(false);

    // Minimap Camera (Top-down Orthographic)
    this.minimapCamera = new THREE.OrthographicCamera(
      -200,
      200,
      200,
      -200,
      1,
      1000
    );
    this.minimapCamera.position.set(0, 100, 0);
    this.minimapCamera.lookAt(0, 0, 0);
    this.minimapCamera.layers.enableAll();

    this.groundClippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Create a more natural sky gradient background
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // 5. Lighting Optimization
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6);
    hemiLight.layers.enable(1); // Enable for minimap
    this.scene.add(hemiLight);

    // Extra ambient light specifically for the minimap
    const minimapAmbientLight = new THREE.AmbientLight(0xffffff, 5);
    minimapAmbientLight.layers.set(1);
    this.scene.add(minimapAmbientLight);

    // Sun-like directional light
    const dirLight = new THREE.DirectionalLight(0xfff8dc, 1.0);
    dirLight.position.set(50, 100, 50);

    // 6. Disable Shadows on Mobile
    // Shadow maps require rendering the scene an extra time. Disabling them doubles available geometry budget.
    if (!isMobile) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 500;
      dirLight.shadow.camera.left = -400;
      dirLight.shadow.camera.right = 400;
      dirLight.shadow.camera.top = 400;
      dirLight.shadow.camera.bottom = -400;
    }

    dirLight.layers.enable(1); // Enable for minimap
    this.scene.add(dirLight);

    // Add atmospheric fog
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, isMobile ? 300 : 800); // Match fog to camera far plane
  }

  bakeStaticMinimap() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Resize renderer for high-res bake
    this.renderer.setSize(1024, 1024);

    // 2. Configure Minimap Camera to see only Layer 1 (where we put static objects)
    this.minimapCamera.layers.set(1);

    // 3. Render static scene to the main canvas
    const oldClearColor = this.renderer.getClearColor(new THREE.Color());
    const oldClearAlpha = this.renderer.getClearAlpha();

    // Use a semi-transparent background or specific color
    this.renderer.setClearColor(0x000000, 0); 

    this.renderer.clear();
    this.renderer.render(this.scene, this.minimapCamera);

    // 4. Capture image and set as background
    const dataURL = this.renderer.domElement.toDataURL();
    const minimapDiv = document.getElementById('minimap');
    if (minimapDiv) {
        minimapDiv.style.backgroundImage = `url(${dataURL})`;
        minimapDiv.style.backgroundSize = 'cover';
        minimapDiv.style.backgroundPosition = 'center';
        minimapDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent backing
    }

    // 5. Restore renderer state
    this.renderer.setClearColor(oldClearColor, oldClearAlpha);
    this.renderer.setSize(width, height); // Restore original size
    this.minimapCamera.layers.enableAll();
  }
}

export class AssetLibrary {
  constructor() {
    this.geometries = {};
    this.materials = {};
    this.groundClippingPlane = null;
  }

  init(groundClippingPlane) {
    this.groundClippingPlane = groundClippingPlane.clone
      ? groundClippingPlane.clone()
      : groundClippingPlane;

    // --- Geometries ---
    // Bullets
    this.geometries.bulletDesktop = new THREE.SphereGeometry(0.2, 8, 8);
    this.geometries.bulletMobile = new THREE.SphereGeometry(0.15, 4, 4);

    this.geometries.shotgunPelletDesktop = new THREE.SphereGeometry(0.12, 6, 6);
    this.geometries.shotgunPelletMobile = new THREE.SphereGeometry(0.08, 3, 3);

    this.geometries.tankBullet = new THREE.SphereGeometry(0.25, 8, 8);
    this.geometries.sniperBullet = new THREE.CylinderGeometry(
      0.05,
      0.05,
      0.5,
      6
    );

    // Rockets
    this.geometries.rocketDesktop = new THREE.CylinderGeometry(
      0.15,
      0.25,
      1.0,
      8
    );
    this.geometries.rocketMobile = new THREE.CylinderGeometry(
      0.12,
      0.2,
      0.8,
      6
    );

    // Flames
    this.geometries.flame = new THREE.SphereGeometry(0.12, 4, 4);

    // Muzzle Flash
    this.geometries.muzzleFlashDesktop = new THREE.SphereGeometry(1, 6, 6);
    this.geometries.muzzleFlashMobile = new THREE.SphereGeometry(1, 3, 3);

    // Particles
    this.geometries.explosionParticle = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.geometries.rocketExplosionParticle = new THREE.SphereGeometry(
      0.1,
      6,
      6
    );

    // Enemies - Reduced geometry complexity
    this.geometries.scout = new THREE.OctahedronGeometry(0.4, 0);
    this.geometries.tank = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    this.geometries.sniper = new THREE.CylinderGeometry(0.4, 0.6, 2, 8);
    this.geometries.enemy = new THREE.IcosahedronGeometry(0.8, 0);

    // Pickups
    this.geometries.healthPack = new THREE.SphereGeometry(0.4, 16, 12);
    this.geometries.armorPickup = new THREE.OctahedronGeometry(0.5, 0);
    this.geometries.collectable = new THREE.OctahedronGeometry(1, 0);
    this.geometries.arrow = new THREE.ConeGeometry(0.1, 0.5, 6);

    // Weapon Pickups
    this.geometries.pickupShotgun = new THREE.BoxGeometry(1.2, 0.4, 0.3);
    this.geometries.pickupShotgunShell = new THREE.CylinderGeometry(
      0.08,
      0.08,
      0.3,
      6
    );
    this.geometries.pickupMachineGun = new THREE.CylinderGeometry(
      0.2,
      0.2,
      1.2,
      8
    );
    this.geometries.pickupMachineGunBullet = new THREE.CylinderGeometry(
      0.05,
      0.05,
      0.25,
      6
    );
    this.geometries.pickupRocket = new THREE.ConeGeometry(0.4, 1.5, 8);
    this.geometries.pickupRocketFin = new THREE.BoxGeometry(0.1, 0.3, 0.05);
    this.geometries.pickupFlamethrower = new THREE.CylinderGeometry(
      0.25,
      0.35,
      1.0,
      8
    );
    this.geometries.pickupFlamethrowerFlame = new THREE.ConeGeometry(
      0.1,
      0.4,
      6
    );

    // --- Materials ---
    // Same as before...
    this.materials.bulletPlayer = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2,
    });
    this.materials.bulletEnemy = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 2,
    });
    this.materials.bulletBasicPlayer = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    });
    this.materials.bulletBasicEnemy = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
    });

    this.materials.shotgunPellet = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0x442200,
      emissiveIntensity: 1.5,
    });
    this.materials.shotgunPelletBasic = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });

    this.materials.tankBullet = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: 0x441100,
      emissiveIntensity: 2.5,
    });

    this.materials.sniperBullet = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x004400,
      emissiveIntensity: 1.5,
    });

    this.materials.rocket = new THREE.MeshPhongMaterial({
      color: 0x444444,
      emissive: 0x220000,
      emissiveIntensity: 0.8,
    });
    this.materials.rocketBasic = new THREE.MeshBasicMaterial({
      color: 0x444444,
    });

    this.materials.flame = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8,
    });

    this.materials.flashYellow = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8,
    });
    this.materials.flashOrange = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.8,
    });
    this.materials.flashCyan = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    this.materials.flashRed = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.8,
    });

    this.materials.flashYellowMobile = this.materials.flashYellow.clone();
    this.materials.flashYellowMobile.opacity = 0.6;
    this.materials.flashOrangeMobile = this.materials.flashOrange.clone();
    this.materials.flashOrangeMobile.opacity = 0.6;
    this.materials.flashCyanMobile = this.materials.flashCyan.clone();
    this.materials.flashCyanMobile.opacity = 0.6;
    this.materials.flashRedMobile = this.materials.flashRed.clone();
    this.materials.flashRedMobile.opacity = 0.6;

    this.materials.explosionOrange = new THREE.MeshBasicMaterial({
      color: 0xff6600,
    });

    this.materials.scout = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      emissive: 0x002244,
      emissiveIntensity: 0.3,
    });
    this.materials.tank = new THREE.MeshPhongMaterial({
      color: 0x666666,
      emissive: 0x222222,
      emissiveIntensity: 0.2,
    });
    this.materials.sniper = new THREE.MeshPhongMaterial({
      color: 0x008800,
      emissive: 0x002200,
      emissiveIntensity: 0.4,
    });
    this.materials.enemy = new THREE.MeshPhongMaterial({
      color: 0x8b0000,
      emissive: 0x330000,
      emissiveIntensity: 0.2,
    });

    this.materials.healthPack = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x004422,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    });
    this.materials.armorPickup = new THREE.MeshPhongMaterial({
      color: 0x4444ff,
      emissive: 0x111122,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    });
    this.materials.collectable = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0x444400,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    this.materials.arrow = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0x444400,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    this.materials.arrowArmor = new THREE.MeshPhongMaterial({
      color: 0x4444ff,
      emissive: 0x111122,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    });

    this.materials.pickupShotgun = new THREE.MeshPhongMaterial({
      color: 0x8b4513,
      emissive: 0x331100,
      emissiveIntensity: 0.4,
    });
    this.materials.pickupShotgunShell = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0x442200,
      emissiveIntensity: 0.6,
    });
    this.materials.pickupMachineGun = new THREE.MeshPhongMaterial({
      color: 0xc0c0c0,
      emissive: 0x404040,
      emissiveIntensity: 0.5,
    });
    this.materials.pickupMachineGunBullet = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0x444400,
      emissiveIntensity: 0.8,
    });
    this.materials.pickupRocket = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0x880000,
      emissiveIntensity: 0.6,
    });
    this.materials.pickupRocketFin = new THREE.MeshPhongMaterial({
      color: 0x444444,
      emissive: 0x222222,
      emissiveIntensity: 0.3,
    });
    this.materials.pickupFlamethrower = new THREE.MeshPhongMaterial({
      color: 0x0088ff,
      emissive: 0x004488,
      emissiveIntensity: 0.7,
    });
    this.materials.pickupFlamethrowerFlame = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8,
    });
  }

  getExplosionMaterial(color) {
    if (!this.materials[`explosion_${color}`]) {
      this.materials[`explosion_${color}`] = new THREE.MeshBasicMaterial({
        color,
      });
    }
    return this.materials[`explosion_${color}`];
  }
}

export class Controls {
  constructor(camera, canvas) {
    this.pointerLock = new PointerLockControls(camera, canvas);
  }
}

export class InputState {
  forward = false;
  backward = false;
  left = false;
  right = false;
  shoot = false;
  shootReleased = true;
}

export class GameConfig {
  maxEnemies = 50;
  enemySpawnRate = 20;
  healthPackSpawnRate = 300;
  weaponPickupSpawnRate = 900;
}

export class Weapon {
  constructor(type, name, damage, fireRate, ammo = Infinity) {
    this.type = type;
    this.name = name;
    this.damage = damage;
    this.fireRate = fireRate;
    this.ammo = ammo;
    this.maxAmmo = ammo;
    this.lastFired = 0;
  }
}

export class QueryCache {
  constructor() {
    this.projectiles = null;
    this.allEnemies = null;
    this.obstacles = null;
    this.healthPacks = null;
    this.weaponPickups = null;
    this.armorPickups = null;
    this.collectables = null;
    this.enemiesWithAI = null;
    this.armorRegenPlayers = null;
    this.weaponPickupArrows = null;
    this.damageIndicators = null;
  }
}

export class WeaponSystem {
  constructor(isMobile = false) {
    const mobileMultiplier = isMobile ? 1.5 : 1;

    this.weapons = [
      new Weapon('pistol', 'Pistol', 15, Math.round(0 * mobileMultiplier)),
      new Weapon(
        'shotgun',
        'Shotgun',
        8,
        Math.round(45 * mobileMultiplier),
        30
      ),
      new Weapon(
        'machinegun',
        'Machine Gun',
        6,
        Math.round(8 * mobileMultiplier),
        100
      ),
      new Weapon(
        'rocket',
        'Rocket Launcher',
        100,
        Math.round(120 * mobileMultiplier),
        5
      ),
      new Weapon(
        'flamethrower',
        'Flamethrower',
        3,
        Math.round(3 * mobileMultiplier),
        200
      ),
    ];
    this.currentWeaponIndex = 0;
    this.switchCooldown = 30;
    this.lastSwitch = 0;
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length && this.lastSwitch <= 0) {
      this.currentWeaponIndex = index;
      this.lastSwitch = this.switchCooldown;
      return true;
    }
    return false;
  }

  nextWeapon() {
    this.switchWeapon((this.currentWeaponIndex + 1) % this.weapons.length);
  }

  previousWeapon() {
    this.switchWeapon(
      (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length
    );
  }

  canFire() {
    const weapon = this.getCurrentWeapon();
    return weapon.lastFired <= 0 && weapon.ammo > 0;
  }

  fire() {
    const weapon = this.getCurrentWeapon();
    if (this.canFire()) {
      weapon.lastFired = weapon.fireRate;
      if (weapon.ammo !== Infinity) {
        weapon.ammo--;
      }
      return true;
    }
    return false;
  }

  update() {
    this.weapons.forEach(weapon => {
      if (weapon.lastFired > 0) weapon.lastFired--;
    });
    if (this.lastSwitch > 0) this.lastSwitch--;
  }
}

// import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
// import * as THREE from 'three';

// /* -------------------------------------------------------------------------- */
// /*                                 RESOURCES                                  */
// /* -------------------------------------------------------------------------- */

// export class ThreeScene {
//   constructor() {
//     this.scene = new THREE.Scene();
//     this.camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     this.renderer = new THREE.WebGLRenderer({
//       canvas: document.getElementById('ecs-canvas'),
//       antialias: true,
//     });
//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//     this.renderer.setScissorTest(false);

//     // Minimap Camera (Top-down Orthographic)
//     // Set an initial size (will be updated in system)
//     this.minimapCamera = new THREE.OrthographicCamera(-200, 200, 200, -200, 1, 1000);
//     this.minimapCamera.position.set(0, 100, 0);
//     this.minimapCamera.lookAt(0, 0, 0);
//     this.minimapCamera.layers.enableAll();

//     // Disable clipping for now to avoid rendering issues
//     // this.renderer.localClippingEnabled = true;
//     this.groundClippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

//     // Create a more natural sky gradient background
//     this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

//     // Improved lighting for outdoor scene
//     const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6); // Sky blue to brown
//     hemiLight.layers.enable(1); // Enable for minimap
//     this.scene.add(hemiLight);

//     // Extra ambient light specifically for the minimap to brighten the terrain
//     const minimapAmbientLight = new THREE.AmbientLight(0xffffff, 5);
//     minimapAmbientLight.layers.set(1); // Only visible to minimap camera (Layer 1)
//     this.scene.add(minimapAmbientLight);

//     // Sun-like directional light
//     const dirLight = new THREE.DirectionalLight(0xfff8dc, 1.0); // Warm sunlight color
//     dirLight.position.set(50, 100, 50);
//     dirLight.castShadow = true;
//     dirLight.shadow.mapSize.width = 2048;
//     dirLight.shadow.mapSize.height = 2048;
//     dirLight.shadow.camera.near = 0.5;
//     dirLight.shadow.camera.far = 500;
//     dirLight.shadow.camera.left = -400;
//     dirLight.shadow.camera.right = 400;
//     dirLight.shadow.camera.top = 400;
//     dirLight.shadow.camera.bottom = -400;
//     dirLight.layers.enable(1); // Enable for minimap
//     this.scene.add(dirLight);

//     // Add atmospheric fog
//     this.scene.fog = new THREE.Fog(0x87ceeb, 50, 800);

//     // --- Minimap Caching Setup ---
//     // Create a render target to cache the static terrain
//     this.minimapRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
//       minFilter: THREE.LinearFilter,
//       magFilter: THREE.LinearFilter,
//       format: THREE.RGBAFormat,
//     });

//     // Create a separate scene to display the cached minimap texture
//     this.minimapDisplayScene = new THREE.Scene();
//     // Orthographic camera for the quad (normalized coordinates -0.5 to 0.5)
//     this.minimapDisplayCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);

//     // Create a quad to display the texture
//     // We flip Y because render targets are sometimes inverted depending on UVs/GL convention
//     // But typically PlaneGeometry UVs (0,0 bottom-left) match.
//     // However, in top-down view, -Z is North (Up on screen).
//     const planeGeo = new THREE.PlaneGeometry(1, 1);
//     const planeMat = new THREE.MeshBasicMaterial({
//       map: this.minimapRenderTarget.texture,
//       fog: false
//     });
//     this.minimapQuad = new THREE.Mesh(planeGeo, planeMat);
//     this.minimapDisplayScene.add(this.minimapQuad);
//   }

//   bakeStaticMinimap() {
//     // 1. Configure Minimap Camera to see only Layer 1 (where we will put static objects)
//     // Layer 0 is default. We want to bake objects that are on Layer 1.
//     // If objects are on both 0 and 1, they will be seen.
//     // If dynamic objects are ONLY on 0, they won't be seen.
//     this.minimapCamera.layers.set(1);

//     // 2. Render static scene to the render target
//     const oldClearColor = this.renderer.getClearColor(new THREE.Color());
//     const oldClearAlpha = this.renderer.getClearAlpha();

//     // Use a specific background color for minimap (e.g., ground color or fog color)
//     // or just transparent. Transparent is better for styling.
//     this.renderer.setClearColor(0x000000, 0);

//     this.renderer.setRenderTarget(this.minimapRenderTarget);
//     this.renderer.clear();
//     this.renderer.render(this.scene, this.minimapCamera);

//     // 3. Restore renderer state
//     this.renderer.setRenderTarget(null);
//     this.renderer.setClearColor(oldClearColor, oldClearAlpha);

//     // Reset layers just in case
//     this.minimapCamera.layers.enableAll();
//   }
// }

// export class AssetLibrary {
//   constructor() {
//     this.geometries = {};
//     this.materials = {};
//     this.groundClippingPlane = null;
//   }

//   init(groundClippingPlane) {
//     // Store a copy of the ground clipping plane to avoid reference issues
//     this.groundClippingPlane = groundClippingPlane.clone ? groundClippingPlane.clone() : groundClippingPlane;
//     // --- Geometries ---

//     // Bullets
//     this.geometries.bulletDesktop = new THREE.SphereGeometry(0.2, 8, 8);
//     this.geometries.bulletMobile = new THREE.SphereGeometry(0.15, 4, 4);

//     this.geometries.shotgunPelletDesktop = new THREE.SphereGeometry(0.12, 6, 6);
//     this.geometries.shotgunPelletMobile = new THREE.SphereGeometry(0.08, 3, 3);

//     this.geometries.tankBullet = new THREE.SphereGeometry(0.25, 8, 8);
//     this.geometries.sniperBullet = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);

//     // Rockets
//     this.geometries.rocketDesktop = new THREE.CylinderGeometry(0.15, 0.25, 1.0, 8);
//     this.geometries.rocketMobile = new THREE.CylinderGeometry(0.12, 0.2, 0.8, 6);

//     // Flames
//     this.geometries.flame = new THREE.SphereGeometry(0.12, 4, 4);

//     // Muzzle Flash (Base geometry, scale it for variation)
//     this.geometries.muzzleFlashDesktop = new THREE.SphereGeometry(1, 6, 6);
//     this.geometries.muzzleFlashMobile = new THREE.SphereGeometry(1, 3, 3);

//     // Particles
//     this.geometries.explosionParticle = new THREE.BoxGeometry(0.1, 0.1, 0.1);
//     this.geometries.rocketExplosionParticle = new THREE.SphereGeometry(0.1, 6, 6);

//     // Enemies
//     this.geometries.scout = new THREE.OctahedronGeometry(0.4, 0);
//     this.geometries.tank = new THREE.BoxGeometry(1.5, 1.5, 1.5);
//     this.geometries.sniper = new THREE.CylinderGeometry(0.4, 0.6, 2, 8);
//     this.geometries.enemy = new THREE.IcosahedronGeometry(0.8, 0);

//     // Pickups
//     this.geometries.healthPack = new THREE.SphereGeometry(0.4, 16, 12);
//     this.geometries.armorPickup = new THREE.OctahedronGeometry(0.5, 0);
//     this.geometries.collectable = new THREE.OctahedronGeometry(1, 0);
//     this.geometries.arrow = new THREE.ConeGeometry(0.1, 0.5, 6);

//     // Weapon Pickups
//     this.geometries.pickupShotgun = new THREE.BoxGeometry(1.2, 0.4, 0.3);
//     this.geometries.pickupShotgunShell = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6);
//     this.geometries.pickupMachineGun = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
//     this.geometries.pickupMachineGunBullet = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6);
//     this.geometries.pickupRocket = new THREE.ConeGeometry(0.4, 1.5, 8);
//     this.geometries.pickupRocketFin = new THREE.BoxGeometry(0.1, 0.3, 0.05);
//     this.geometries.pickupFlamethrower = new THREE.CylinderGeometry(0.25, 0.35, 1.0, 8);
//     this.geometries.pickupFlamethrowerFlame = new THREE.ConeGeometry(0.1, 0.4, 6);

//     // --- Materials ---

//     // Bullets
//     this.materials.bulletPlayer = new THREE.MeshPhongMaterial({
//       color: 0x00ffff,
//       emissive: 0x00ffff,
//       emissiveIntensity: 2,
//       // clippingPlanes: [groundClippingPlane],
//     });
//     this.materials.bulletEnemy = new THREE.MeshPhongMaterial({
//       color: 0xff00ff,
//       emissive: 0xff00ff,
//       emissiveIntensity: 2,
//       // clippingPlanes: [groundClippingPlane],
//     });
//     this.materials.bulletBasicPlayer = new THREE.MeshBasicMaterial({
//       color: 0x00ffff,
//       // clippingPlanes: [groundClippingPlane],
//     });
//     this.materials.bulletBasicEnemy = new THREE.MeshBasicMaterial({
//       color: 0xff00ff,
//       // clippingPlanes: [groundClippingPlane],
//     });

//     // Shotgun
//     this.materials.shotgunPellet = new THREE.MeshPhongMaterial({
//       color: 0xffaa00,
//       emissive: 0x442200,
//       emissiveIntensity: 1.5,
//       // clippingPlanes: [groundClippingPlane],
//     });
//     this.materials.shotgunPelletBasic = new THREE.MeshBasicMaterial({
//       color: 0xffaa00,
//       // clippingPlanes: [groundClippingPlane],
//     });

//     // Tank Bullet
//     this.materials.tankBullet = new THREE.MeshPhongMaterial({
//       color: 0xff6600,
//       emissive: 0x441100,
//       emissiveIntensity: 2.5,

//     });

//     // Sniper Bullet
//     this.materials.sniperBullet = new THREE.MeshPhongMaterial({
//       color: 0x00ff00,
//       emissive: 0x004400,
//       emissiveIntensity: 1.5,

//     });

//     // Rocket
//     this.materials.rocket = new THREE.MeshPhongMaterial({
//       color: 0x444444,
//       emissive: 0x220000,
//       emissiveIntensity: 0.8,

//     });
//     this.materials.rocketBasic = new THREE.MeshBasicMaterial({
//       color: 0x444444,

//     });

//     // Flame
//     this.materials.flame = new THREE.MeshBasicMaterial({
//       color: 0xff6600,
//       transparent: true,
//       opacity: 0.8,

//     });

//     // Muzzle Flashes
//     this.materials.flashYellow = new THREE.MeshBasicMaterial({
//         color: 0xffff00,
//         transparent: true,
//         opacity: 0.8,

//     });
//     this.materials.flashOrange = new THREE.MeshBasicMaterial({
//         color: 0xffaa00,
//         transparent: true,
//         opacity: 0.8,

//     });
//     this.materials.flashCyan = new THREE.MeshBasicMaterial({
//         color: 0x00ffff,
//         transparent: true,
//         opacity: 0.8,

//     });
//     this.materials.flashRed = new THREE.MeshBasicMaterial({
//         color: 0xff4444,
//         transparent: true,
//         opacity: 0.8,

//     });
//     // Mobile low-opacity versions
//     this.materials.flashYellowMobile = this.materials.flashYellow.clone();
//     this.materials.flashYellowMobile.opacity = 0.6;
//     this.materials.flashOrangeMobile = this.materials.flashOrange.clone();
//     this.materials.flashOrangeMobile.opacity = 0.6;
//     this.materials.flashCyanMobile = this.materials.flashCyan.clone();
//     this.materials.flashCyanMobile.opacity = 0.6;
//     this.materials.flashRedMobile = this.materials.flashRed.clone();
//     this.materials.flashRedMobile.opacity = 0.6;

//     // Explosion
//     this.materials.explosionOrange = new THREE.MeshBasicMaterial({
//         color: 0xff6600,

//     });

//     // Enemies
//     this.materials.scout = new THREE.MeshPhongMaterial({
//       color: 0x00aaff,
//       emissive: 0x002244,
//       emissiveIntensity: 0.3,

//     });
//     this.materials.tank = new THREE.MeshPhongMaterial({
//         color: 0x666666,
//         emissive: 0x222222,
//         emissiveIntensity: 0.2,

//     });
//     this.materials.sniper = new THREE.MeshPhongMaterial({
//         color: 0x008800,
//         emissive: 0x002200,
//         emissiveIntensity: 0.4,

//     });
//     this.materials.enemy = new THREE.MeshPhongMaterial({
//         color: 0x8b0000,
//         emissive: 0x330000,
//         emissiveIntensity: 0.2,

//     });

//     // Pickups
//     this.materials.healthPack = new THREE.MeshPhongMaterial({
//       color: 0x00ff88,
//       emissive: 0x004422,
//       emissiveIntensity: 0.3,
//       transparent: true,
//       opacity: 0.8,

//     });
//     this.materials.armorPickup = new THREE.MeshPhongMaterial({
//         color: 0x4444ff,
//         emissive: 0x111122,
//         emissiveIntensity: 0.3,
//         transparent: true,
//         opacity: 0.8,

//     });
//     this.materials.collectable = new THREE.MeshPhongMaterial({
//         color: 0xffd700,
//         emissive: 0x444400,
//         emissiveIntensity: 0.3,
//         shininess: 100,
//         transparent: true,
//         opacity: 0.9,

//     });
//     this.materials.arrow = new THREE.MeshPhongMaterial({
//         color: 0xffff00,
//         emissive: 0x444400,
//         emissiveIntensity: 0.8,
//         transparent: true,
//         opacity: 0.9,

//     });
//     this.materials.arrowArmor = new THREE.MeshPhongMaterial({
//         color: 0x4444ff,
//         emissive: 0x111122,
//         emissiveIntensity: 0.8,
//         transparent: true,
//         opacity: 0.9,

//     });

//     // Weapon Pickup Materials
//     this.materials.pickupShotgun = new THREE.MeshPhongMaterial({
//         color: 0x8b4513,
//         emissive: 0x331100,
//         emissiveIntensity: 0.4,

//     });
//     this.materials.pickupShotgunShell = new THREE.MeshPhongMaterial({
//         color: 0xffd700,
//         emissive: 0x442200,
//         emissiveIntensity: 0.6,

//     });
//     this.materials.pickupMachineGun = new THREE.MeshPhongMaterial({
//         color: 0xc0c0c0,
//         emissive: 0x404040,
//         emissiveIntensity: 0.5,

//     });
//     this.materials.pickupMachineGunBullet = new THREE.MeshPhongMaterial({
//         color: 0xffff00,
//         emissive: 0x444400,
//         emissiveIntensity: 0.8,

//     });
//     this.materials.pickupRocket = new THREE.MeshPhongMaterial({
//         color: 0xff0000,
//         emissive: 0x880000,
//         emissiveIntensity: 0.6,

//     });
//     this.materials.pickupRocketFin = new THREE.MeshPhongMaterial({
//         color: 0x444444,
//         emissive: 0x222222,
//         emissiveIntensity: 0.3,

//     });
//     this.materials.pickupFlamethrower = new THREE.MeshPhongMaterial({
//         color: 0x0088ff,
//         emissive: 0x004488,
//         emissiveIntensity: 0.7,

//     });
//     this.materials.pickupFlamethrowerFlame = new THREE.MeshBasicMaterial({
//         color: 0xff6600,
//         transparent: true,
//         opacity: 0.8,

//     });
//   }

//   getExplosionMaterial(color) {
//       // Basic cache for explosion materials
//       if (!this.materials[`explosion_${color}`]) {
//            this.materials[`explosion_${color}`] = new THREE.MeshBasicMaterial({
//               color,
//               // Don't set clippingPlanes for explosion materials to avoid issues
//             });
//       }
//       return this.materials[`explosion_${color}`];
//   }
// }

// export class Controls {
//   constructor(camera, canvas) {
//     this.pointerLock = new PointerLockControls(camera, canvas);
//   }
// }

// export class InputState {
//   forward = false;
//   backward = false;
//   left = false;
//   right = false;
//   shoot = false;
//   shootReleased = true;
// }

// export class GameConfig {
//   maxEnemies = 50;
//   enemySpawnRate = 20;
//   healthPackSpawnRate = 300;
//   weaponPickupSpawnRate = 900; // Spawn weapon pickups less frequently
// }

// export class Weapon {
//   constructor(type, name, damage, fireRate, ammo = Infinity) {
//     this.type = type;
//     this.name = name;
//     this.damage = damage;
//     this.fireRate = fireRate; // frames between shots
//     this.ammo = ammo;
//     this.maxAmmo = ammo; // Store the original max ammo
//     this.lastFired = 0;
//   }
// }

// /**
//  * QueryCache resource stores commonly-used queries to avoid repeated locateAll() calls.
//  *
//  * **Performance Benefits:**
//  * - Queries are created once and automatically maintained by the World
//  * - No need to scan all entities every frame - queries update reactively
//  * - Queries use efficient bitmask operations for component matching
//  * - Calling query.get() returns a filtered list instantly
//  *
//  * **Usage Pattern:**
//  * Instead of:
//  *   const enemies = world.locateAll([EnemyAI, Collider]); // Scans all entities every call
//  *
//  * Do this:
//  *   const queryCache = world.getResource(QueryCache);
//  *   const enemies = queryCache.allEnemies.get(); // O(n) where n = matched entities only
//  *
//  * The World automatically adds/removes entities from queries when components change.
//  */
// export class QueryCache {
//   constructor() {
//     // These will be populated after world.query() calls in game initialization
//     this.projectiles = null;         // { all: [Projectile, Collider] }
//     this.allEnemies = null;          // { any: [EnemyAI, ScoutAI, TankAI, SniperAI], all: [Collider] }
//     this.obstacles = null;           // Tagged Obstacle (if needed)
//     this.healthPacks = null;         // { all: [HealthPack] }
//     this.weaponPickups = null;       // { all: [WeaponPickup] }
//     this.armorPickups = null;        // { all: [ArmorPickup] }
//     this.collectables = null;        // { all: [Collectable] }
//     this.enemiesWithAI = null;       // { any: [EnemyAI, ScoutAI, TankAI, SniperAI], all: [ThreeObject, Collider] }
//     this.armorRegenPlayers = null;   // { all: [Armor, ArmorRegeneration] }
//     this.weaponPickupArrows = null;  // { all: [WeaponPickupArrow] }
//     this.damageIndicators = null;    // { all: [DamageIndicator] }
//   }
// }

// export class WeaponSystem {
//   constructor(isMobile = false) {
//     // Adjust firing rates for mobile performance
//     const mobileMultiplier = isMobile ? 1.5 : 1; // 50% slower firing on mobile

//     this.weapons = [
//       new Weapon('pistol', 'Pistol', 15, Math.round(0 * mobileMultiplier)), // No cooldown for pistol
//       new Weapon(
//         'shotgun',
//         'Shotgun',
//         8,
//         Math.round(45 * mobileMultiplier),
//         30
//       ), // 8 damage per pellet
//       new Weapon(
//         'machinegun',
//         'Machine Gun',
//         6,
//         Math.round(8 * mobileMultiplier),
//         100
//       ), // Rapid fire
//       new Weapon(
//         'rocket',
//         'Rocket Launcher',
//         100,
//         Math.round(120 * mobileMultiplier),
//         5
//       ), // Very high direct damage + splash
//       new Weapon(
//         'flamethrower',
//         'Flamethrower',
//         3,
//         Math.round(3 * mobileMultiplier),
//         200
//       ), // Slower fire rate for performance
//     ];
//     this.currentWeaponIndex = 0;
//     this.switchCooldown = 30;
//     this.lastSwitch = 0;
//   }

//   getCurrentWeapon() {
//     return this.weapons[this.currentWeaponIndex];
//   }

//   switchWeapon(index) {
//     if (index >= 0 && index < this.weapons.length && this.lastSwitch <= 0) {
//       this.currentWeaponIndex = index;
//       this.lastSwitch = this.switchCooldown;
//       return true;
//     }
//     return false;
//   }

//   nextWeapon() {
//     this.switchWeapon((this.currentWeaponIndex + 1) % this.weapons.length);
//   }

//   previousWeapon() {
//     this.switchWeapon(
//       (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length
//     );
//   }

//   canFire() {
//     const weapon = this.getCurrentWeapon();
//     return weapon.lastFired <= 0 && weapon.ammo > 0;
//   }

//   fire() {
//     const weapon = this.getCurrentWeapon();
//     if (this.canFire()) {
//       weapon.lastFired = weapon.fireRate;
//       if (weapon.ammo !== Infinity) {
//         weapon.ammo--;
//       }
//       return true;
//     }
//     return false;
//   }

//   update() {
//     this.weapons.forEach(weapon => {
//       if (weapon.lastFired > 0) weapon.lastFired--;
//     });
//     if (this.lastSwitch > 0) this.lastSwitch--;
//   }
// }
