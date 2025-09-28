/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

import * as THREE from 'three';

export class GameState {
  score = 0;
  isGameOver = false;
  enemySpawnTimer = 0;
  healthPackSpawnTimer = 300;
}

export class ThreeObject {
  constructor(mesh) {
    this.mesh = mesh;
  }
}

export class Velocity extends THREE.Vector3 {}

export class Collider {
  constructor(boundingBox) {
    this.box = boundingBox;
  }
}

export class Health {
  constructor(value, maxValue) {
    this.value = value;
    this.maxValue = maxValue;
  }
}

export class Expires {
  constructor(lifeInFrames) {
    this.life = lifeInFrames;
  }
}

export class EnemyAI {
  constructor(shootCooldown = 180) {
    this.shootCooldown = shootCooldown;
    this.timer = Math.random() * shootCooldown;
    this.moveTimer = 0;
    this.moveCooldown = 60;
    this.targetPosition = new THREE.Vector3(0, 1, 0); // Initialize at ground level
    this.avoidanceForce = new THREE.Vector3();
  }
}

export class ScoutAI {
  constructor() {
    this.shootCooldown = 90; // Fast shooting
    this.timer = Math.random() * this.shootCooldown;
    this.moveTimer = 0;
    this.moveCooldown = 30; // Fast movement
    this.targetPosition = new THREE.Vector3(0, 1, 0); // Initialize at ground level
    this.avoidanceForce = new THREE.Vector3();
    this.dodgeTimer = 0;
    this.dodgeCooldown = 120;
  }
}

export class TankAI {
  constructor() {
    this.shootCooldown = 300; // Slow but powerful shooting
    this.timer = Math.random() * this.shootCooldown;
    this.moveTimer = 0;
    this.moveCooldown = 120; // Slow movement
    this.targetPosition = new THREE.Vector3(0, 1, 0); // Initialize at ground level
    this.avoidanceForce = new THREE.Vector3();
    this.lastDirection = new THREE.Vector3();
  }
}

export class SniperAI {
  constructor() {
    this.shootCooldown = 240; // Slower but accurate shooting
    this.timer = Math.random() * this.shootCooldown;
    this.moveTimer = 0;
    this.moveCooldown = 90;
    this.targetPosition = new THREE.Vector3(0, 1, 0); // Initialize at ground level
    this.avoidanceForce = new THREE.Vector3();
    this.preferredDistance = 20; // Stays far away
    this.accuracy = 0.95; // Very accurate
  }
}

export class Projectile {
  constructor(firedBy, damage = 1) {
    this.firedBy = firedBy;
    this.damage = damage;
  }
}

export class HealthPack {
  constructor() {
    this.bobTimer = 0;
    this.bobOffset = 0;
    this.pickedUp = false;
  }
}

export class WeaponPickup {
  constructor(weaponType) {
    this.weaponType = weaponType;
    this.bobTimer = 0;
    this.bobOffset = 0;
    this.pickedUp = false;
  }
}

export class WeaponPickupArrow {
  constructor(weaponEntity) {
    this.weaponEntity = weaponEntity;
    this.bobTimer = 0;
    this.bobOffset = 0;
  }
}

export class HitFlash {
  constructor(duration = 15) {
    this.duration = duration;
    this.timer = 0;
    this.originalColor = null;
    this.originalEmissive = null;
    this.originalEmissiveIntensity = null;
  }
}

// Tags
export const Player = 'player';
export const Enemy = 'enemy';
export const Scout = 'scout';
export const Tank = 'tank';
export const Sniper = 'sniper';
export const Bullet = 'bullet';
export const Obstacle = 'obstacle';
export const Particle = 'particle';
