import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*                                 RESOURCES                                  */
/* -------------------------------------------------------------------------- */

export class ThreeScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('ecs-canvas'),
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Disable clipping for now to avoid rendering issues
    // this.renderer.localClippingEnabled = true;
    this.groundClippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Create a more natural sky gradient background
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // Improved lighting for outdoor scene
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6); // Sky blue to brown
    this.scene.add(hemiLight);

    // Sun-like directional light
    const dirLight = new THREE.DirectionalLight(0xfff8dc, 1.0); // Warm sunlight color
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -400;
    dirLight.shadow.camera.right = 400;
    dirLight.shadow.camera.top = 400;
    dirLight.shadow.camera.bottom = -400;
    this.scene.add(dirLight);

    // Add atmospheric fog
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 800);
  }
}

export class AssetLibrary {
  constructor() {
    this.geometries = {};
    this.materials = {};
    this.groundClippingPlane = null;
  }

  init(groundClippingPlane) {
    // Store a copy of the ground clipping plane to avoid reference issues
    this.groundClippingPlane = groundClippingPlane.clone ? groundClippingPlane.clone() : groundClippingPlane;
    // --- Geometries ---
    
    // Bullets
    this.geometries.bulletDesktop = new THREE.SphereGeometry(0.2, 8, 8);
    this.geometries.bulletMobile = new THREE.SphereGeometry(0.15, 4, 4);
    
    this.geometries.shotgunPelletDesktop = new THREE.SphereGeometry(0.12, 6, 6);
    this.geometries.shotgunPelletMobile = new THREE.SphereGeometry(0.08, 3, 3);
    
    this.geometries.tankBullet = new THREE.SphereGeometry(0.25, 8, 8);
    this.geometries.sniperBullet = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
    
    // Rockets
    this.geometries.rocketDesktop = new THREE.CylinderGeometry(0.15, 0.25, 1.0, 8);
    this.geometries.rocketMobile = new THREE.CylinderGeometry(0.12, 0.2, 0.8, 6);
    
    // Flames
    this.geometries.flame = new THREE.SphereGeometry(0.12, 4, 4);
    
    // Muzzle Flash (Base geometry, scale it for variation)
    this.geometries.muzzleFlashDesktop = new THREE.SphereGeometry(1, 6, 6); 
    this.geometries.muzzleFlashMobile = new THREE.SphereGeometry(1, 3, 3);

    // Particles
    this.geometries.explosionParticle = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.geometries.rocketExplosionParticle = new THREE.SphereGeometry(0.1, 6, 6);

    // Enemies
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
    this.geometries.pickupShotgunShell = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6);
    this.geometries.pickupMachineGun = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
    this.geometries.pickupMachineGunBullet = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6);
    this.geometries.pickupRocket = new THREE.ConeGeometry(0.4, 1.5, 8);
    this.geometries.pickupRocketFin = new THREE.BoxGeometry(0.1, 0.3, 0.05);
    this.geometries.pickupFlamethrower = new THREE.CylinderGeometry(0.25, 0.35, 1.0, 8);
    this.geometries.pickupFlamethrowerFlame = new THREE.ConeGeometry(0.1, 0.4, 6);

    // --- Materials ---

    // Bullets
    this.materials.bulletPlayer = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2,
      // clippingPlanes: [groundClippingPlane],
    });
    this.materials.bulletEnemy = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 2,
      // clippingPlanes: [groundClippingPlane],
    });
    this.materials.bulletBasicPlayer = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      // clippingPlanes: [groundClippingPlane],
    });
    this.materials.bulletBasicEnemy = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      // clippingPlanes: [groundClippingPlane],
    });

    // Shotgun
    this.materials.shotgunPellet = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0x442200,
      emissiveIntensity: 1.5,
      // clippingPlanes: [groundClippingPlane],
    });
    this.materials.shotgunPelletBasic = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      // clippingPlanes: [groundClippingPlane],
    });

    // Tank Bullet
    this.materials.tankBullet = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: 0x441100,
      emissiveIntensity: 2.5,

    });

    // Sniper Bullet
    this.materials.sniperBullet = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x004400,
      emissiveIntensity: 1.5,

    });

    // Rocket
    this.materials.rocket = new THREE.MeshPhongMaterial({
      color: 0x444444,
      emissive: 0x220000,
      emissiveIntensity: 0.8,

    });
    this.materials.rocketBasic = new THREE.MeshBasicMaterial({
      color: 0x444444,

    });

    // Flame
    this.materials.flame = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8,

    });

    // Muzzle Flashes
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
    // Mobile low-opacity versions
    this.materials.flashYellowMobile = this.materials.flashYellow.clone();
    this.materials.flashYellowMobile.opacity = 0.6;
    this.materials.flashOrangeMobile = this.materials.flashOrange.clone();
    this.materials.flashOrangeMobile.opacity = 0.6;
    this.materials.flashCyanMobile = this.materials.flashCyan.clone();
    this.materials.flashCyanMobile.opacity = 0.6;
    this.materials.flashRedMobile = this.materials.flashRed.clone();
    this.materials.flashRedMobile.opacity = 0.6;


    // Explosion
    this.materials.explosionOrange = new THREE.MeshBasicMaterial({
        color: 0xff6600,
  
    });

    // Enemies
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

    // Pickups
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

    // Weapon Pickup Materials
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
      // Basic cache for explosion materials
      if (!this.materials[`explosion_${color}`]) {
           this.materials[`explosion_${color}`] = new THREE.MeshBasicMaterial({
              color,
              // Don't set clippingPlanes for explosion materials to avoid issues
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
  weaponPickupSpawnRate = 900; // Spawn weapon pickups less frequently
}

export class Weapon {
  constructor(type, name, damage, fireRate, ammo = Infinity) {
    this.type = type;
    this.name = name;
    this.damage = damage;
    this.fireRate = fireRate; // frames between shots
    this.ammo = ammo;
    this.maxAmmo = ammo; // Store the original max ammo
    this.lastFired = 0;
  }
}

/**
 * QueryCache resource stores commonly-used queries to avoid repeated locateAll() calls.
 * 
 * **Performance Benefits:**
 * - Queries are created once and automatically maintained by the World
 * - No need to scan all entities every frame - queries update reactively
 * - Queries use efficient bitmask operations for component matching
 * - Calling query.get() returns a filtered list instantly
 * 
 * **Usage Pattern:**
 * Instead of:
 *   const enemies = world.locateAll([EnemyAI, Collider]); // Scans all entities every call
 * 
 * Do this:
 *   const queryCache = world.getResource(QueryCache);
 *   const enemies = queryCache.allEnemies.get(); // O(n) where n = matched entities only
 * 
 * The World automatically adds/removes entities from queries when components change.
 */
export class QueryCache {
  constructor() {
    // These will be populated after world.query() calls in game initialization
    this.projectiles = null;         // { all: [Projectile, Collider] }
    this.allEnemies = null;          // { any: [EnemyAI, ScoutAI, TankAI, SniperAI], all: [Collider] }
    this.obstacles = null;           // Tagged Obstacle (if needed)
    this.healthPacks = null;         // { all: [HealthPack] }
    this.weaponPickups = null;       // { all: [WeaponPickup] }
    this.armorPickups = null;        // { all: [ArmorPickup] }
    this.collectables = null;        // { all: [Collectable] }
    this.enemiesWithAI = null;       // { any: [EnemyAI, ScoutAI, TankAI, SniperAI], all: [ThreeObject, Collider] }
    this.armorRegenPlayers = null;   // { all: [Armor, ArmorRegeneration] }
    this.weaponPickupArrows = null;  // { all: [WeaponPickupArrow] }
    this.damageIndicators = null;    // { all: [DamageIndicator] }
  }
}

export class WeaponSystem {
  constructor(isMobile = false) {
    // Adjust firing rates for mobile performance
    const mobileMultiplier = isMobile ? 1.5 : 1; // 50% slower firing on mobile

    this.weapons = [
      new Weapon('pistol', 'Pistol', 15, Math.round(0 * mobileMultiplier)), // No cooldown for pistol
      new Weapon(
        'shotgun',
        'Shotgun',
        8,
        Math.round(45 * mobileMultiplier),
        30
      ), // 8 damage per pellet
      new Weapon(
        'machinegun',
        'Machine Gun',
        6,
        Math.round(8 * mobileMultiplier),
        100
      ), // Rapid fire
      new Weapon(
        'rocket',
        'Rocket Launcher',
        100,
        Math.round(120 * mobileMultiplier),
        5
      ), // Very high direct damage + splash
      new Weapon(
        'flamethrower',
        'Flamethrower',
        3,
        Math.round(3 * mobileMultiplier),
        200
      ), // Slower fire rate for performance
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
