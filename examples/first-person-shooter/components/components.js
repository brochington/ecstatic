/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

import * as THREE from 'three';

export class GameState {
  score = 0;
  kills = 0;
  collectablesCollected = 0;
  isGameOver = false;
  enemySpawnTimer = 0;
  healthPackSpawnTimer = 300;
  collectableSpawnTimer = 0;
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

export class Armor {
  constructor(value, maxValue) {
    this.value = value;
    this.maxValue = maxValue;
  }
}

export class ArmorRegeneration {
  constructor(regenerationRate = 5, regenerationDelay = 120) {
    this.regenerationRate = regenerationRate; // Armor points per second (assuming 60fps)
    this.regenerationDelay = regenerationDelay; // Frames to wait before starting regeneration (2 seconds at 60fps)
    this.damageTimer = 0; // Frames since last damage was taken
    this.isRegenerating = false;
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

export class ArmorPickup {
  constructor(armorAmount) {
    this.armorAmount = armorAmount;
    this.bobTimer = 0;
    this.bobOffset = 0;
    this.pickedUp = false;
  }
}

export class Collectable {
  constructor() {
    this.bobTimer = 0;
    this.bobOffset = 0;
    this.rotationTimer = 0;
    this.collected = false;
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

export class DamageIndicator {
  constructor(direction, damage) {
    this.direction = direction; // Angle in radians from player forward direction
    this.damage = damage;
    this.timer = 0;
    this.duration = 60; // 1 second at 60fps
    this.distance = 100; // Distance from center of screen
  }
}

export class Particle {}

// Tags
export const Player = 'player';
export const Enemy = 'enemy';
export const Scout = 'scout';
export const Tank = 'tank';
export const Sniper = 'sniper';
export const Bullet = 'bullet';
export const Obstacle = 'obstacle';
export const Boulder = 'boulder';
export const Tree = 'tree';
