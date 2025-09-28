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

    // Enable clipping to prevent rendering below ground level
    this.renderer.localClippingEnabled = true;
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
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.scene.add(dirLight);

    // Add atmospheric fog
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);
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
  maxEnemies = 8;
  enemySpawnRate = 240;
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
    this.lastFired = 0;
  }
}

export class WeaponSystem {
  constructor() {
    this.weapons = [
      new Weapon('pistol', 'Pistol', 15, 0), // No cooldown for pistol
      new Weapon('shotgun', 'Shotgun', 8, 45, 30), // 8 damage per pellet
      new Weapon('machinegun', 'Machine Gun', 6, 8, 100), // Rapid fire
      new Weapon('rocket', 'Rocket Launcher', 50, 120, 5), // High damage, area effect
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
