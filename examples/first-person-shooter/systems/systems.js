import * as THREE from 'three';
import { getRandomNumber } from '../utils/utils.js';
import { MobileControls } from '../mobile-controls.js';
import {
  InputState,
  Controls,
  WeaponSystem,
  ThreeScene,
  GameConfig,
  QueryCache,
} from '../resources/resources.js';
import {
  GameState,
  ThreeObject,
  Velocity,
  Collider,
  Health,
  Armor,
  ArmorRegeneration,
  Expires,
  EnemyAI,
  ScoutAI,
  TankAI,
  SniperAI,
  Projectile,
  HealthPack,
  WeaponPickup,
  WeaponPickupArrow,
  HitFlash,
  DamageIndicator,
  Player,
  Enemy,
  Scout,
  Tank,
  Sniper,
  Obstacle,
  ArmorPickup,
  Collectable,
  Bullet,
  Boulder,
} from '../components/components.js';
import {
  CollisionEvent,
  PlayerDamagedEvent,
  PlayerDeathEvent,
  PlayerHealedEvent,
  PlayerWeaponPickupEvent,
  PlayerArmorPickupEvent,
  PlayerCollectablePickupEvent,
} from '../events/events.js';
import {
  createBullet,
  createShotgunBlast,
  createRocket,
  createTankBullet,
  createSniperBullet,
  createMuzzleFlash,
  createExplosion,
  createRocketExplosion,
  createFlameThrowerBlast,
  applySplashDamage,
  spawnEnemy,
  spawnScout,
  spawnTank,
  spawnSniper,
  spawnHealthPack,
  dropHealthPack,
  spawnWeaponPickup,
  spawnArmorPickup,
  spawnCollectable,
} from '../entities/entities.js';
import { sceneSize } from '../game/game.js';

/* -------------------------------------------------------------------------- */
/*                                   SYSTEMS                                  */
/* -------------------------------------------------------------------------- */

export function playerMovementSystem({ world, dt }) {
  const input = world.getResource(InputState);
  const playerEntity = world.getTagged(Player);
  const controls = world.getResource(Controls);
  const mobileControls = world.getResource(MobileControls);
  if (!input || !playerEntity || !controls) return;

  const dtScale = dt / 16.66667;

  const velocity = playerEntity.get(Velocity);
  const threeObject = playerEntity.get(ThreeObject);

  velocity.y -= 0.01 * dtScale;
  velocity.x *= Math.pow(0.95, dtScale);
  velocity.z *= Math.pow(0.95, dtScale);

  const speed = 0.04 * dtScale;
  const direction = new THREE.Vector3();

  // Handle desktop controls
  if (!mobileControls || !mobileControls.isMobile) {
    // Get direction relative to the Camera (which rotates via PointerLock),
    // not the player mesh (which stays static on Y axis in desktop mode).
    const camera = controls.pointerLock.getObject();

    // Get forward vector from camera, flatten to ground (y=0), and normalize
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Calculate right vector
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (input.forward) {
      velocity.add(forward.multiplyScalar(speed));
    }
    if (input.backward) {
      velocity.sub(forward.multiplyScalar(speed));
    }
    if (input.right) {
      velocity.add(right.multiplyScalar(speed));
    }
    if (input.left) {
      velocity.sub(right.multiplyScalar(speed));
    }
  } else {
    // Handle mobile virtual joystick
    const movementVector = mobileControls.getMovementVector();

    if (movementVector.x !== 0 || movementVector.y !== 0) {
      const playerRotationMatrix = new THREE.Matrix4();
      playerRotationMatrix.makeRotationY(threeObject.mesh.rotation.y);

      // Forward/backward
      direction.set(0, 0, -1);
      direction.applyMatrix4(playerRotationMatrix);
      velocity.add(direction.multiplyScalar(speed * -movementVector.y));

      // Left/right
      direction.set(1, 0, 0);
      direction.applyMatrix4(playerRotationMatrix);
      velocity.add(direction.multiplyScalar(speed * movementVector.x));
    }
  }

  const maxSpeed = 0.4; // Max speed is absolute, doesn't need scaling if applied to current velocity
  if (new THREE.Vector2(velocity.x, velocity.z).length() > maxSpeed) {
    const yVel = velocity.y;
    velocity.y = 0;
    velocity.normalize().multiplyScalar(maxSpeed);
    velocity.y = yVel;
  }
  
  // Note: position update is handled in movementSystem, which also uses dtScale
  
  // Boundary Clamping
  const halfSize = sceneSize / 2;
  const playerRadius = 0.5;
  threeObject.mesh.position.x = THREE.MathUtils.clamp(
    threeObject.mesh.position.x,
    -halfSize + playerRadius,
    halfSize - playerRadius
  );
  threeObject.mesh.position.z = THREE.MathUtils.clamp(
    threeObject.mesh.position.z,
    -halfSize + playerRadius,
    halfSize - playerRadius
  );

  if (threeObject.mesh.position.y < 1.7) {
    threeObject.mesh.position.y = 1.7;
    velocity.y = 0;
  }
}

export function weaponUpdateSystem({ world }) {
  const weaponSystem = world.getResource(WeaponSystem);
  if (weaponSystem) {
    weaponSystem.update();
  }
}

export function playerShootingSystem({ world }) {
  const input = world.getResource(InputState);
  const player = world.getTagged(Player);
  const controls = world.getResource(Controls);
  const weaponSystem = world.getResource(WeaponSystem);
  const mobileControls = world.getResource(MobileControls);

  if (!input || !player || !controls || !weaponSystem) return;

  const camera = controls.pointerLock.getObject();
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const startPosition = new THREE.Vector3();
  camera
    .getWorldPosition(startPosition)
    .add(direction.clone().multiplyScalar(1.5));

  const weapon = weaponSystem.getCurrentWeapon();

  // Check if we should fire based on weapon type and input
  let shouldFire = false;

  // Handle mobile shooting
  if (mobileControls && mobileControls.isMobile) {
    if (weapon.type === 'machinegun' || weapon.type === 'flamethrower') {
      // Machine gun and flamethrower auto-fire while button is held down
      shouldFire = mobileControls.isShooting() && weaponSystem.canFire();
    } else {
      // Single-shot weapons: Fire only on button press (transition from not shooting to shooting)
      const isShooting = mobileControls.isShooting();
      if (isShooting && !input.shoot) {
        // Button was just pressed
        shouldFire = weaponSystem.canFire();
        input.shoot = true;
      } else if (!isShooting && input.shoot) {
        // Button was released
        input.shoot = false;
      }
    }
  } else {
    // Desktop shooting logic
    if (weapon.type === 'machinegun' || weapon.type === 'flamethrower') {
      // Machine gun and flamethrower auto-fire while button is held down
      shouldFire = input.shoot && weaponSystem.canFire();
    } else {
      // Other weapons fire on button release (single shot)
      shouldFire = input.shootReleased && weaponSystem.canFire();
    }
  }

  if (shouldFire && weaponSystem.fire()) {
    switch (weapon.type) {
      case 'pistol':
        createBullet(world, startPosition, direction, Player, weapon.damage);
        break;
      case 'shotgun':
        createShotgunBlast(
          world,
          startPosition,
          direction,
          Player,
          weapon.damage
        );
        break;
      case 'machinegun':
        createBullet(world, startPosition, direction, Player, weapon.damage);
        break;
      case 'rocket':
        createRocket(world, startPosition, direction, Player, weapon.damage);
        break;
      case 'flamethrower':
        createFlameThrowerBlast(
          world,
          startPosition,
          direction,
          Player,
          weapon.damage
        );
        break;
    }

    createMuzzleFlash(world, startPosition, direction, weapon.type);
  }

  // Reset shootReleased after firing
  if (input.shootReleased) {
    input.shootReleased = false;
  }
}

export function enemyAISystem({ world, components, dt }) {
  const ai = components.get(EnemyAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const dtScale = dt / 16.66667;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01 * dtScale;

  ai.timer -= dtScale;
  if (ai.timer <= 0) {
    const startPosition = enemyObj.mesh.position.clone();
    const direction = playerObj.mesh.position
      .clone()
      .sub(startPosition)
      .normalize();
    createBullet(world, startPosition, direction, Enemy, 5); // Enemy bullets do 5 damage
    ai.timer = ai.shootCooldown + getRandomNumber(-30, 30);
  }

  ai.moveTimer -= dtScale;
  if (ai.moveTimer <= 0) {
    const distanceFromPlayer = getRandomNumber(5, 15);
    const angle = Math.random() * Math.PI * 2;
    ai.targetPosition.copy(playerObj.mesh.position);
    ai.targetPosition.x += Math.cos(angle) * distanceFromPlayer;
    ai.targetPosition.z += Math.sin(angle) * distanceFromPlayer;
    ai.targetPosition.y = 1;
    ai.moveTimer = ai.moveCooldown;
  }

  const directionToTarget = ai.targetPosition
    .clone()
    .sub(enemyObj.mesh.position);
  const distanceToTarget = directionToTarget.length();

  if (distanceToTarget > 1) {
    directionToTarget.normalize().multiplyScalar(0.015);
    velocity.x += directionToTarget.x;
    velocity.z += directionToTarget.z;
  }

  velocity.x *= 0.9;
  velocity.z *= 0.9;

  const obstacles = world.getAllTagged(Obstacle);
  ai.avoidanceForce.set(0, 0, 0);

  for (const obstacle of obstacles) {
    const obstaclePos = obstacle.get(ThreeObject).mesh.position;
    const distance = enemyObj.mesh.position.distanceTo(obstaclePos);

    if (distance < 3) {
      const avoidDir = enemyObj.mesh.position
        .clone()
        .sub(obstaclePos)
        .normalize();
      const strength = (3 - distance) / 3;
      ai.avoidanceForce.add(avoidDir.multiplyScalar(strength * 0.05));
    }
  }

  velocity.add(ai.avoidanceForce);
}

export function scoutAISystem({ world, components, dt }) {
  const ai = components.get(ScoutAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const dtScale = dt / 16.66667;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01 * dtScale;

  // Fast shooting
  ai.timer -= dtScale;
  if (ai.timer <= 0) {
    const startPosition = enemyObj.mesh.position.clone();
    const direction = playerObj.mesh.position
      .clone()
      .sub(startPosition)
      .normalize();
    // Add slight inaccuracy for scouts
    direction.x += getRandomNumber(-0.1, 0.1);
    direction.z += getRandomNumber(-0.1, 0.1);
    direction.normalize();
    createBullet(world, startPosition, direction, Scout, 4); // Scout bullets do 4 damage
    ai.timer = ai.shootCooldown + getRandomNumber(-15, 15);
  }

  // Fast movement with dodging
  ai.moveTimer -= dtScale;
  if (ai.moveTimer <= 0) {
    const distanceFromPlayer = getRandomNumber(3, 8);
    const angle = Math.random() * Math.PI * 2;
    ai.targetPosition.copy(playerObj.mesh.position);
    ai.targetPosition.x += Math.cos(angle) * distanceFromPlayer;
    ai.targetPosition.z += Math.sin(angle) * distanceFromPlayer;
    ai.targetPosition.y = 1;
    ai.moveTimer = ai.moveCooldown;
  }

  // Dodging behavior
  ai.dodgeTimer -= dtScale;
  if (ai.dodgeTimer <= 0) {
    // Random dodge direction
    const dodgeAngle = Math.random() * Math.PI * 2;
    const dodgeDistance = 2;
    ai.targetPosition.x += Math.cos(dodgeAngle) * dodgeDistance;
    ai.targetPosition.z += Math.sin(dodgeAngle) * dodgeDistance;
    ai.dodgeTimer = ai.dodgeCooldown + getRandomNumber(-30, 30);
  }

  const directionToTarget = ai.targetPosition
    .clone()
    .sub(enemyObj.mesh.position);
  const distanceToTarget = directionToTarget.length();

  if (distanceToTarget > 0.5) {
    directionToTarget.normalize().multiplyScalar(0.025); // Faster than regular enemies
    velocity.x += directionToTarget.x;
    velocity.z += directionToTarget.z;
  }

  velocity.x *= 0.85;
  velocity.z *= 0.85;

  // Scout avoidance (less avoidance than regular enemies)
  const obstacles = world.getAllTagged(Obstacle);
  ai.avoidanceForce.set(0, 0, 0);

  for (const obstacle of obstacles) {
    const obstaclePos = obstacle.get(ThreeObject).mesh.position;
    const distance = enemyObj.mesh.position.distanceTo(obstaclePos);

    if (distance < 2) {
      const avoidDir = enemyObj.mesh.position
        .clone()
        .sub(obstaclePos)
        .normalize();
      const strength = (2 - distance) / 2;
      ai.avoidanceForce.add(avoidDir.multiplyScalar(strength * 0.08));
    }
  }

  velocity.add(ai.avoidanceForce);
}

export function tankAISystem({ world, components, dt }) {
  const ai = components.get(TankAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const dtScale = dt / 16.66667;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01 * dtScale;

  // Slow but powerful shooting
  ai.timer -= dtScale;
  if (ai.timer <= 0) {
    const startPosition = enemyObj.mesh.position.clone();
    const direction = playerObj.mesh.position
      .clone()
      .sub(startPosition)
      .normalize();
    createTankBullet(world, startPosition, direction, Tank, 12); // Tank bullets do 12 damage
    ai.timer = ai.shootCooldown + getRandomNumber(-60, 60);
  }

  // Slow movement
  ai.moveTimer -= dtScale;
  if (ai.moveTimer <= 0) {
    const distanceFromPlayer = getRandomNumber(8, 15);
    const angle = Math.random() * Math.PI * 2;
    ai.targetPosition.copy(playerObj.mesh.position);
    ai.targetPosition.x += Math.cos(angle) * distanceFromPlayer;
    ai.targetPosition.z += Math.sin(angle) * distanceFromPlayer;
    ai.targetPosition.y = 1;
    ai.moveTimer = ai.moveCooldown;
  }

  const directionToTarget = ai.targetPosition
    .clone()
    .sub(enemyObj.mesh.position);
  const distanceToTarget = directionToTarget.length();

  if (distanceToTarget > 1) {
    directionToTarget.normalize().multiplyScalar(0.008); // Much slower movement
    velocity.x += directionToTarget.x;
    velocity.z += directionToTarget.z;
  }

  velocity.x *= 0.95;
  velocity.z *= 0.95;

  // Store last direction for momentum
  ai.lastDirection.copy(velocity);
}

export function sniperAISystem({ world, components, dt }) {
  const ai = components.get(SniperAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const dtScale = dt / 16.66667;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01 * dtScale;

  // Accurate shooting from distance
  ai.timer -= dtScale;
  if (ai.timer <= 0) {
    const startPosition = enemyObj.mesh.position.clone();
    const direction = playerObj.mesh.position
      .clone()
      .sub(startPosition)
      .normalize();
    // Add small inaccuracy based on distance
    const distance = startPosition.distanceTo(playerObj.mesh.position);
    const inaccuracy = Math.max(
      0.02,
      1 - (distance / ai.preferredDistance) * 0.1
    );
    direction.x += getRandomNumber(-inaccuracy, inaccuracy);
    direction.z += getRandomNumber(-inaccuracy, inaccuracy);
    direction.normalize();
    createSniperBullet(world, startPosition, direction, Sniper, 25); // Sniper bullets do 25 damage
    ai.timer = ai.shootCooldown + getRandomNumber(-60, 60);
  }

  // Movement to maintain preferred distance
  ai.moveTimer -= dtScale;
  if (ai.moveTimer <= 0) {
    const currentDistance = enemyObj.mesh.position.distanceTo(
      playerObj.mesh.position
    );
    let targetDistance = ai.preferredDistance;

    // If too close, back away; if too far, get closer
    if (currentDistance < ai.preferredDistance - 5) {
      targetDistance = ai.preferredDistance + 3;
    } else if (currentDistance > ai.preferredDistance + 5) {
      targetDistance = ai.preferredDistance - 3;
    }

    const angle = Math.random() * Math.PI * 2;
    ai.targetPosition.copy(playerObj.mesh.position);
    ai.targetPosition.x += Math.cos(angle) * targetDistance;
    ai.targetPosition.z += Math.sin(angle) * targetDistance;
    ai.targetPosition.y = 1;
    ai.moveTimer = ai.moveCooldown;
  }

  const directionToTarget = ai.targetPosition
    .clone()
    .sub(enemyObj.mesh.position);
  const distanceToTarget = directionToTarget.length();

  if (distanceToTarget > 1) {
    directionToTarget.normalize().multiplyScalar(0.012);
    velocity.x += directionToTarget.x;
    velocity.z += directionToTarget.z;
  }

  velocity.x *= 0.9;
  velocity.z *= 0.9;

  // Sniper avoidance
  const obstacles = world.getAllTagged(Obstacle);
  ai.avoidanceForce.set(0, 0, 0);

  for (const obstacle of obstacles) {
    const obstaclePos = obstacle.get(ThreeObject).mesh.position;
    const distance = enemyObj.mesh.position.distanceTo(obstaclePos);

    if (distance < 4) {
      // Avoid from further away
      const avoidDir = enemyObj.mesh.position
        .clone()
        .sub(obstaclePos)
        .normalize();
      const strength = (4 - distance) / 4;
      ai.avoidanceForce.add(avoidDir.multiplyScalar(strength * 0.03));
    }
  }

  velocity.add(ai.avoidanceForce);
}

export function movementSystem({ entity, components, dt }) {
  const velocity = components.get(Velocity);
  const threeObject = components.get(ThreeObject);
  
  const dtScale = dt / 16.66667;
  
  threeObject.mesh.position.add(velocity.clone().multiplyScalar(dtScale));

  // Boundary check for projectiles - destroy if too far outside scene
  if (
    entity.hasTag &&
    (entity.hasTag(Bullet) ||
      entity.hasTag('shotgunPellet') ||
      entity.hasTag('flame'))
  ) {
    const pos = threeObject.mesh.position;
    const boundary = sceneSize / 2 + 10; // Allow some buffer outside scene
    if (
      Math.abs(pos.x) > boundary ||
      Math.abs(pos.z) > boundary ||
      pos.y < -10 ||
      pos.y > 50
    ) {
      entity.destroy();
    }
  }
}

export function particleMovementSystem({ components }) {
  const velocity = components.get(Velocity);
  velocity.y -= 0.005;
  velocity.multiplyScalar(0.98);
}

export function healthPackAnimationSystem({ components, dt }) {
  const healthPack = components.get(HealthPack);

  // Skip animation for picked up health packs
  if (healthPack.pickedUp) return;

  const threeObject = components.get(ThreeObject);
  const dtScale = dt / 16.66667;

  healthPack.bobTimer += 0.05 * dtScale;
  healthPack.bobOffset = Math.sin(healthPack.bobTimer) * 0.2;
  threeObject.mesh.position.y = 1 + healthPack.bobOffset;

  threeObject.mesh.rotation.y += 0.02 * dtScale;
}

export function weaponPickupAnimationSystem({ components, dt }) {
  const weaponPickup = components.get(WeaponPickup);

  // Skip animation for picked up weapon pickups
  if (weaponPickup.pickedUp) return;

  const threeObject = components.get(ThreeObject);
  const dtScale = dt / 16.66667;

  weaponPickup.bobTimer += 0.05 * dtScale;
  weaponPickup.bobOffset = Math.sin(weaponPickup.bobTimer) * 0.15;
  threeObject.mesh.position.y = 1 + weaponPickup.bobOffset;

  // Rotate weapons to make them more visible
  threeObject.mesh.rotation.y += 0.03 * dtScale;
  threeObject.mesh.rotation.x = Math.sin(weaponPickup.bobTimer * 0.5) * 0.1;
}

export function armorPickupAnimationSystem({ components, dt }) {
  const armorPickup = components.get(ArmorPickup);

  // Skip animation for picked up armor pickups
  if (armorPickup.pickedUp) return;

  const threeObject = components.get(ThreeObject);
  const dtScale = dt / 16.66667;

  armorPickup.bobTimer += 0.05 * dtScale;
  armorPickup.bobOffset = Math.sin(armorPickup.bobTimer) * 0.15;
  threeObject.mesh.position.y = 1 + armorPickup.bobOffset;

  // Rotate armor to make it more visible with shield-like motion
  threeObject.mesh.rotation.y += 0.02 * dtScale;
  threeObject.mesh.rotation.x = Math.sin(armorPickup.bobTimer * 0.3) * 0.2;
  threeObject.mesh.rotation.z = Math.cos(armorPickup.bobTimer * 0.4) * 0.1;
}

export function collectableAnimationSystem({ components, dt }) {
  const collectable = components.get(Collectable);

  // Skip animation for collected items
  if (collectable.collected) return;

  const threeObject = components.get(ThreeObject);
  const dtScale = dt / 16.66667;

  // Bobbing animation
  collectable.bobTimer += 0.03 * dtScale;
  collectable.bobOffset = Math.sin(collectable.bobTimer) * 0.4;

  // Rotation animation
  collectable.rotationTimer += 0.02 * dtScale;
  threeObject.mesh.rotation.x = collectable.rotationTimer * 0.5;
  threeObject.mesh.rotation.y = collectable.rotationTimer;
  threeObject.mesh.rotation.z = collectable.rotationTimer * 0.3;

  // Set base position with bobbing
  threeObject.mesh.position.y = collectable.bobOffset + 1.5;

  // Pulsing emissive intensity for extra glow effect
  const emissivePulse = Math.sin(collectable.bobTimer * 2) * 0.2 + 0.8;
  threeObject.mesh.material.emissiveIntensity = emissivePulse * 0.4;
}

export function weaponPickupArrowAnimationSystem({ components, dt }) {
  const arrow = components.get(WeaponPickupArrow);
  const threeObject = components.get(ThreeObject);
  const dtScale = dt / 16.66667;

  // Update arrow position to follow the weapon
  if (arrow.weaponEntity && arrow.weaponEntity.state === 'created') {
    const weaponObject = arrow.weaponEntity.get(ThreeObject);
    if (weaponObject) {
      // Keep arrow above weapon with some floating motion
      arrow.bobTimer += 0.08 * dtScale;
      arrow.bobOffset = Math.sin(arrow.bobTimer) * 0.3;
      threeObject.mesh.position
        .copy(weaponObject.mesh.position)
        .add(new THREE.Vector3(0, 2.5 + arrow.bobOffset, 0));
    }
  }

  // Rotate arrow for visibility
  threeObject.mesh.rotation.y += 0.05 * dtScale;
  threeObject.mesh.rotation.z = Math.sin(arrow.bobTimer * 0.7) * 0.2;
}

export function lifecycleSystem({ entity, components, world, dt }) {
  const expires = components.get(Expires);
  const dtScale = dt / 16.66667;
  expires.life -= dtScale;
  if (expires.life <= 0) {
    // Rockets explode when they expire (run out of fuel)
    if (entity.hasTag && entity.hasTag('rocket')) {
      const position = entity.get(ThreeObject).mesh.position;
      createRocketExplosion(world, position);
    }
    entity.destroy();
  }
}

export function updateCollidersSystem({ entity, components }) {
  if (entity.hasTag(Player) || entity.hasTag(Obstacle)) return;

  const threeObject = components.get(ThreeObject);
  const collider = components.get(Collider);
  collider.box.setFromObject(threeObject.mesh);
}

export function updatePlayerColliderSystem({ world }) {
  const player = world.getTagged(Player);
  if (!player) return;

  const threeObject = player.get(ThreeObject);
  const collider = player.get(Collider);

  const playerPosition = threeObject.mesh.position;
  collider.box.setFromCenterAndSize(playerPosition, new THREE.Vector3(1, 2, 1));
}

// Helper function to check collision between entity and obstacle (handles both single boxes and arrays)
function checkObstacleCollision(entityBox, obstacleCollider) {
  const obstacleBoxes = Array.isArray(obstacleCollider.box)
    ? obstacleCollider.box
    : [obstacleCollider.box];

  for (const obstacleBox of obstacleBoxes) {
    if (entityBox.intersectsBox(obstacleBox)) {
      // Calculate overlap on each axis
      const overlapX =
        Math.min(entityBox.max.x, obstacleBox.max.x) -
        Math.max(entityBox.min.x, obstacleBox.min.x);
      const overlapY =
        Math.min(entityBox.max.y, obstacleBox.max.y) -
        Math.max(entityBox.min.y, obstacleBox.min.y);
      const overlapZ =
        Math.min(entityBox.max.z, obstacleBox.max.z) -
        Math.max(entityBox.min.z, obstacleBox.min.z);

      return { overlapX, overlapY, overlapZ, obstacleBox };
    }
  }
  return null;
}

export function entityObstacleCollisionSystem({ world }) {
  const obstacles = world.getAllTagged(Obstacle);
  const queryCache = world.getResource(QueryCache);

  // Handle player collision with obstacles
  const player = world.getTagged(Player);
  if (player && player.state === 'created') {
    const playerCollider = player.get(Collider);
    const playerObject = player.get(ThreeObject);
    const playerBox = playerCollider.box;

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      const collision = checkObstacleCollision(playerBox, obstacleCollider);

      if (collision) {
        const { overlapX, overlapZ, obstacleBox } = collision;

        if (Math.abs(overlapX) < Math.abs(overlapZ)) {
          const sign = Math.sign(
            playerObject.mesh.position.x -
              obstacleBox.getCenter(new THREE.Vector3()).x
          );
          playerObject.mesh.position.x += overlapX * sign;
        } else {
          const sign = Math.sign(
            playerObject.mesh.position.z -
              obstacleBox.getCenter(new THREE.Vector3()).z
          );
          playerObject.mesh.position.z += overlapZ * sign;
        }
      }
    }
  }

  // Handle weapon pickup collision with player (destroy arrows when weapon is picked up)
  if (player && player.state === 'created') {
    const playerCollider = player.get(Collider);
    const weaponPickups = queryCache.weaponPickups.get();

    for (const pickup of weaponPickups) {
      const pickupCollider = pickup.get(Collider);
      if (playerCollider.box.intersectsBox(pickupCollider.box)) {
        // Destroy arrow indicators when weapon is picked up
        const arrows = queryCache.weaponPickupArrows.get();
        for (const arrow of arrows) {
          const arrowComponent = arrow.get(WeaponPickupArrow);
          if (arrowComponent.weaponEntity === pickup) {
            arrow.destroy();
            break;
          }
        }
      }
    }
  }

  // Handle enemy collision with obstacles - use cached query
  const enemies = queryCache.enemiesWithAI.get();
  for (const enemy of enemies) {
    if (enemy.state !== 'created') continue;

    const enemyCollider = enemy.get(Collider);
    const enemyObject = enemy.get(ThreeObject);
    const enemyVelocity = enemy.get(Velocity);

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      const collision = checkObstacleCollision(
        enemyCollider.box,
        obstacleCollider
      );

      if (collision) {
        const { overlapX, overlapY, overlapZ, obstacleBox } = collision;

        // Find the axis with the smallest overlap
        const minOverlap = Math.min(
          Math.abs(overlapX),
          Math.abs(overlapY),
          Math.abs(overlapZ)
        );

        if (minOverlap === Math.abs(overlapY)) {
          // Y axis collision (ground/ceiling)
          const sign = Math.sign(
            enemyObject.mesh.position.y -
              obstacleBox.getCenter(new THREE.Vector3()).y
          );
          enemyObject.mesh.position.y += overlapY * sign;
          enemyVelocity.y = 0; // Stop vertical movement
        } else if (Math.abs(overlapX) < Math.abs(overlapZ)) {
          // X axis collision
          const sign = Math.sign(
            enemyObject.mesh.position.x -
              obstacleBox.getCenter(new THREE.Vector3()).x
          );
          enemyObject.mesh.position.x += overlapX * sign;
        } else {
          // Z axis collision
          const sign = Math.sign(
            enemyObject.mesh.position.z -
              obstacleBox.getCenter(new THREE.Vector3()).z
          );
          enemyObject.mesh.position.z += overlapZ * sign;
        }
      }
    }

    // Ground collision for enemies (similar to player)
    if (enemyObject.mesh.position.y < 1.0) {
      enemyObject.mesh.position.y = 1.0;
      enemyVelocity.y = 0;
    }
  }
}

// Rocket explosion handling has been moved to collisionSystem and lifecycleSystem
// export function rocketExplosionSystem({ world }) {
//   const rockets = world.locateAll(['rocket', Collider]);
//
//   for (const rocket of rockets) {
//     if (rocket.state !== 'created') continue;
//     const rocketCollider = rocket.get(Collider);
//     const projectile = rocket.get(Projectile);
//
//     // Check for collision with obstacles or expiry
//     let shouldExplode = false;
//     const obstacles = world.getAllTagged(Obstacle);
//
//     for (const obstacle of obstacles) {
//       const obstacleCollider = obstacle.get(Collider);
//       const obstacleBoxes = Array.isArray(obstacleCollider.box)
//         ? obstacleCollider.box
//         : [obstacleCollider.box];
//
//       for (const obstacleBox of obstacleBoxes) {
//         if (rocketCollider.box.intersectsBox(obstacleBox)) {
//           shouldExplode = true;
//           break;
//         }
//       }
//       if (shouldExplode) break;
//     }
//
//     // Rockets also explode on impact with enemies or players
//     if (projectile.firedBy === Player) {
//       const enemies = world.locateAll([
//         EnemyAI,
//         ScoutAI,
//         TankAI,
//         SniperAI,
//         Collider,
//       ]);
//       for (const enemy of enemies) {
//         if (enemy.state === 'created') {
//           const enemyCollider = enemy.get(Collider);
//           if (rocketCollider.box.intersectsBox(enemyCollider.box)) {
//             shouldExplode = true;
//             break;
//           }
//         }
//       }
//     } else {
//       const player = world.getTagged(Player);
//       if (player && player.state === 'created') {
//         const playerCollider = player.get(Collider);
//         if (rocketCollider.box.intersectsBox(playerCollider.box)) {
//           shouldExplode = true;
//         }
//       }
//     }
//
//     if (shouldExplode) {
//       const position = rocket.get(ThreeObject).mesh.position;
//       createRocketExplosion(world, position);
//       rocket.destroy();
//     }
//   }
// }

export function collisionSystem({ world }) {
  // Use cached queries for better performance
  const queryCache = world.getResource(QueryCache);
  const bullets = queryCache.projectiles.get();
  const enemies = queryCache.allEnemies.get();
  const obstacles = world.getAllTagged(Obstacle);
  const healthPacks = queryCache.healthPacks.get();
  const weaponPickups = queryCache.weaponPickups.get();
  const player = world.getTagged(Player);

  for (const bullet of bullets) {
    if (bullet.state !== 'created') continue;
    const bulletCollider = bullet.get(Collider);
    const projectile = bullet.get(Projectile);

    // Check if bullet was fired by any enemy type
    const isEnemyBullet =
      projectile.firedBy === Enemy ||
      projectile.firedBy === Scout ||
      projectile.firedBy === Tank ||
      projectile.firedBy === Sniper;
    if (isEnemyBullet && player && player.state === 'created') {
      const playerCollider = player.get(Collider);
      if (bulletCollider.box.intersectsBox(playerCollider.box)) {
        // Enemy rockets explode on impact with player with splash damage
        if (bullet.hasTag && bullet.hasTag('rocket')) {
          const position = bullet.get(ThreeObject).mesh.position;
          createRocketExplosion(world, position);
          // Also apply direct splash damage
          applySplashDamage(world, position, projectile.damage, projectile.firedBy, 8);
          bullet.destroy();
        } else {
          world.events.emit(new CollisionEvent(bullet, player));
        }
        continue;
      }
    }

    if (projectile.firedBy === Player) {
      for (const enemy of enemies) {
        if (enemy.state !== 'created') continue;
        const enemyCollider = enemy.get(Collider);
        if (bulletCollider.box.intersectsBox(enemyCollider.box)) {
          // Rockets explode on impact with enemies with massive splash damage
          if (bullet.hasTag && bullet.hasTag('rocket')) {
            const position = bullet.get(ThreeObject).mesh.position;
            createRocketExplosion(world, position);
            // Direct hit also does splash damage (in addition to explosion damage)
            applySplashDamage(world, position, projectile.damage, projectile.firedBy, 8);
            bullet.destroy();
          } else {
            world.events.emit(new CollisionEvent(bullet, enemy));

            // Handle splash damage for shotgun pellets
            if (bullet.hasTag && bullet.hasTag('shotgunPellet')) {
              const bulletPos = bullet.get(ThreeObject).mesh.position;
              applySplashDamage(
                world,
                bulletPos,
                projectile.damage,
                projectile.firedBy,
                3
              );
            }
          }
          break;
        }
      }
    }

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      const obstacleBoxes = Array.isArray(obstacleCollider.box)
        ? obstacleCollider.box
        : [obstacleCollider.box];

      for (const obstacleBox of obstacleBoxes) {
        if (bulletCollider.box.intersectsBox(obstacleBox)) {
          // Rockets explode on impact with obstacles with splash damage
          if (bullet.hasTag && bullet.hasTag('rocket')) {
            const position = bullet.get(ThreeObject).mesh.position;
            createRocketExplosion(world, position);
            // Also apply splash damage to nearby entities
            const projectile = bullet.get(Projectile);
            applySplashDamage(world, position, projectile.damage, projectile.firedBy, 8);
          }
          bullet.destroy();
          break;
        }
      }
      if (!bullet.state || bullet.state === 'destroying') break;
    }
  }

  if (player && player.state === 'created') {
    const playerCollider = player.get(Collider);
    for (const pack of healthPacks) {
      const packCollider = pack.get(Collider);
      const healthPack = pack.get(HealthPack);
      if (
        playerCollider.box.intersectsBox(packCollider.box) &&
        !healthPack.pickedUp
      ) {
        healthPack.pickedUp = true;
        world.events.emit(new PlayerHealedEvent(pack));
      }
    }

    for (const pickup of weaponPickups) {
      const pickupCollider = pickup.get(Collider);
      const weaponPickup = pickup.get(WeaponPickup);
      if (
        playerCollider.box.intersectsBox(pickupCollider.box) &&
        !weaponPickup.pickedUp
      ) {
        weaponPickup.pickedUp = true;
        world.events.emit(new PlayerWeaponPickupEvent(pickup));
      }
    }

    // Handle armor pickup collision with player
    const queryCache = world.getResource(QueryCache);
    const armorPickups = queryCache.armorPickups.get();
    for (const pickup of armorPickups) {
      const pickupCollider = pickup.get(Collider);
      const armorPickup = pickup.get(ArmorPickup);
      if (
        playerCollider.box.intersectsBox(pickupCollider.box) &&
        !armorPickup.pickedUp
      ) {
        armorPickup.pickedUp = true;
        world.events.emit(new PlayerArmorPickupEvent(pickup));
      }
    }

    // Handle collectable collision with player
    const collectables = queryCache.collectables.get();
    for (const collectable of collectables) {
      const collectableCollider = collectable.get(Collider);
      const collectableComponent = collectable.get(Collectable);
      if (
        playerCollider.box.intersectsBox(collectableCollider.box) &&
        !collectableComponent.collected
      ) {
        collectableComponent.collected = true;
        world.events.emit(new PlayerCollectablePickupEvent(collectable));
      }
    }
  }
}

export function deathSystem({ world, entity, components }) {
  if (entity.state !== 'created') return;

  const health = components.get(Health);
  if (health.value <= 0) {
    if (entity.hasTag(Player)) {
      world.events.emit(new PlayerDeathEvent());
    } else if (
      entity.hasTag(Enemy) ||
      entity.hasTag(Scout) ||
      entity.hasTag(Tank) ||
      entity.hasTag(Sniper)
    ) {
      const gameStateEntity = world.locate(GameState);
      if (gameStateEntity) {
        const gameState = gameStateEntity.get(GameState);
        gameState.kills += 1; // Increment kill count
        if (entity.hasTag(Scout)) {
          gameState.score += 150; // Scouts give more points
        } else if (entity.hasTag(Tank)) {
          gameState.score += 300; // Tanks give lots of points
        } else if (entity.hasTag(Sniper)) {
          gameState.score += 200; // Snipers give good points
        } else {
          gameState.score += 100; // Regular enemies
        }
      }
      const position = entity.get(ThreeObject).mesh.position;
      createExplosion(world, position, 0xff4444);

      // Every enemy death guarantees either ammo or health drop
      const dropType = Math.random();

      if (dropType < 0.5) {
        // Drop health pack (50% chance)
        dropHealthPack(world, position);
      } else {
        // Drop ammo (50% chance) - make ammo type obvious
        let weaponType;
        if (entity.hasTag(Tank)) {
          // Tanks drop rocket ammo (most powerful)
          weaponType = 'rocket';
        } else if (entity.hasTag(Sniper)) {
          // Snipers drop machine gun ammo (rapid fire)
          weaponType = 'machinegun';
        } else if (entity.hasTag(Scout)) {
          // Scouts drop shotgun ammo (spread damage)
          weaponType = 'shotgun';
        } else {
          // Regular enemies randomly drop flamethrower (area damage)
          weaponType = 'flamethrower';
        }
        spawnWeaponPickup(world, weaponType, position);
      }
    }
    entity.destroy();
  }
}

export function damageSystem({ event: collision, world }) {
  const { entityA: bullet, entityB: target } = collision;

  // Verify entities and components still exist
  if (!bullet || !target) return;
  if (!bullet.has(Projectile)) return;
  if (!target.has(Health)) return;

  const targetHealth = target.get(Health);
  const projectile = bullet.get(Projectile);
  let damage = projectile.damage;

  // Apply damage to armor first if player has armor
  if (target.hasTag(Player) && target.has(Armor)) {
    const armor = target.get(Armor);
    if (armor.value > 0) {
      const armorDamage = Math.min(damage, armor.value);
      armor.value -= armorDamage;
      damage -= armorDamage;
    }

    // Reset armor regeneration timer when player takes damage
    if (target.has(ArmorRegeneration)) {
      const regen = target.get(ArmorRegeneration);
      regen.damageTimer = 0;
      regen.isRegenerating = false;
    }
  }

  targetHealth.value -= damage;

  // Add hit flash effect for enemies
  if (
    target.hasTag(Enemy) ||
    target.hasTag(Scout) ||
    target.hasTag(Tank) ||
    target.hasTag(Sniper)
  ) {
    // Remove any existing hit flash
    if (target.has(HitFlash)) {
      target.remove(HitFlash);
    }
    target.add(new HitFlash());
  }

  if (target.hasTag(Player)) {
    world.events.emit(new PlayerDamagedEvent());

    // Create damage indicator
    if (damage > 0) {
      // Calculate direction from player to bullet
      const playerPos = target.get(ThreeObject).mesh.position;
      const bulletPos = bullet.get(ThreeObject).mesh.position;
      const direction = Math.atan2(
        bulletPos.x - playerPos.x,
        bulletPos.z - playerPos.z
      );
      world.createEntity().add(new DamageIndicator(direction, damage));
    }
  }

  // Create explosion effect if bullet still has ThreeObject
  if (bullet.has(ThreeObject)) {
    const position = bullet.get(ThreeObject).mesh.position;
    createExplosion(world, position, 0xffffff, 5);
  }

  bullet.destroy();
}

export function gameOverSystem({ world }) {
  const gameStateEntity = world.locate(GameState);
  if (!gameStateEntity) return;
  const gameState = gameStateEntity.get(GameState);

  const controls = world.getResource(Controls);
  if (!gameState || !controls) return;

  gameState.isGameOver = true;
  controls.pointerLock.unlock();
  document.getElementById('game-over-screen').style.display = 'flex';
}

export function crosshairSystem({ world }) {
  const controls = world.getResource(Controls);
  const crosshair = document.getElementById('crosshair');
  if (!controls || !crosshair) return;

  const camera = controls.pointerLock.getObject();
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  const enemies = world.getAllTagged(Enemy);
  let aimingAtEnemy = false;

  for (const enemy of enemies) {
    const enemyMesh = enemy.get(ThreeObject).mesh;
    const intersects = raycaster.intersectObject(enemyMesh);

    if (intersects.length > 0 && intersects[0].distance < 30) {
      aimingAtEnemy = true;
      break;
    }
  }

  if (aimingAtEnemy) {
    crosshair.style.width = '6px';
    crosshair.style.height = '6px';
    crosshair.style.backgroundColor = '#ff4444';
    crosshair.style.boxShadow = '0 0 4px #ff4444';
  } else {
    crosshair.style.width = '4px';
    crosshair.style.height = '4px';
    crosshair.style.backgroundColor = 'white';
    crosshair.style.boxShadow = 'none';
  }
}

// Store previous state to check against to avoid DOM thrashing
const uiState = {
  lastScore: -1,
  lastKills: -1,
  lastCollectables: -1,
  lastHealthPercent: -1,
  lastArmorPercent: -1,
  lastWeaponName: '',
  lastAmmo: -1,
  lastWeaponIcon: '',
};

export function uiRenderSystem({ world }) {
  const gameStateEntity = world.locate(GameState);
  if (!gameStateEntity) return;
  const gameState = gameStateEntity.get(GameState);
  const player = world.getTagged(Player);
  const weaponSystem = world.getResource(WeaponSystem);

  // Update basic stats
  if (gameState.score !== uiState.lastScore) {
    document.getElementById('score').innerText = gameState.score;
    uiState.lastScore = gameState.score;
  }
  if (gameState.kills !== uiState.lastKills) {
    document.getElementById('kills').innerText = gameState.kills;
    uiState.lastKills = gameState.kills;
  }
  if (gameState.collectablesCollected !== uiState.lastCollectables) {
    document.getElementById('collectables').innerText =
      `${gameState.collectablesCollected}/10`;
    uiState.lastCollectables = gameState.collectablesCollected;
  }

  // Update health bar
  if (player && player.has(Health)) {
    const health = player.get(Health);
    const healthPercent = (health.value / health.maxValue) * 100;
    
    if (Math.abs(healthPercent - uiState.lastHealthPercent) > 0.1) {
      document.getElementById('health-bar').style.width = `${healthPercent}%`;

      // Low health warning effect
      const screenBlood = document.getElementById('screen-blood');
      if (healthPercent < 25) {
        screenBlood.classList.add('low-health-flash');
        screenBlood.style.opacity = '0.3';
      } else if (healthPercent < 50) {
        screenBlood.classList.remove('low-health-flash');
        screenBlood.style.opacity = '0.1';
      } else {
        screenBlood.classList.remove('low-health-flash');
        screenBlood.style.opacity = '0';
      }
      uiState.lastHealthPercent = healthPercent;
    }
  }

  // Update armor bar
  if (player && player.has(Armor)) {
    const armor = player.get(Armor);
    const armorPercent = (armor.value / armor.maxValue) * 100;
    
    if (Math.abs(armorPercent - uiState.lastArmorPercent) > 0.1) {
      document.getElementById('armor-bar').style.width = `${armorPercent}%`;
      uiState.lastArmorPercent = armorPercent;
    }
  }

  // Update weapon UI
  if (weaponSystem) {
    const currentWeapon = weaponSystem.getCurrentWeapon();
    const currentWeaponIndex = weaponSystem.currentWeaponIndex;

    if (currentWeapon.name !== uiState.lastWeaponName) {
      document.getElementById('current-weapon').innerText = currentWeapon.name;
      uiState.lastWeaponName = currentWeapon.name;
    }
    
    if (currentWeapon.ammo !== uiState.lastAmmo) {
      document.getElementById('current-ammo').innerText =
        currentWeapon.ammo === Infinity ? '∞' : currentWeapon.ammo;
      uiState.lastAmmo = currentWeapon.ammo;
    }

    // Update weapon icon
    const weaponIcon = document.getElementById('weapon-icon');
    let iconText = '🔫';
    switch (currentWeapon.name.toLowerCase()) {
      case 'pistol':
        iconText = '🔫';
        break;
      case 'shotgun':
        iconText = '💥';
        break;
      case 'machine gun':
        iconText = '🔥';
        break;
      case 'rocket launcher':
        iconText = '🚀';
        break;
      case 'flamethrower':
        iconText = '🔥';
        break;
    }
    
    if (iconText !== uiState.lastWeaponIcon) {
      weaponIcon.innerText = iconText;
      uiState.lastWeaponIcon = iconText;
    }

    // Update mobile weapon buttons
    const mobileControls = world.getResource(MobileControls);
    if (mobileControls && mobileControls.isMobile) {
      mobileControls.updateWeaponButtons(currentWeaponIndex);
    }
  }

  // Update minimap
  updateMinimap(world);

  // Update compass
  updateCompass(world);
}

function updateCompass(world) {
  const controls = world.getResource(Controls);
  const compassStrip = document.getElementById('compass-strip');

  if (!controls || !compassStrip) return;

  // Initialize if empty
  if (compassStrip.children.length === 0) {
    const pixelsPerDegree = 4;
    const step = 15;

    // Create ticks for range -180 to 540 (covers 0-360 with padding on both sides)
    for (let deg = -180; deg < 540; deg += step) {
      const tick = document.createElement('div');
      tick.className = 'compass-tick';

      // Shift by 180 degrees so 0 starts at 180*4 = 720px
      tick.style.left = `${(deg + 180) * pixelsPerDegree}px`;

      // Determine label
      let labelText = '';
      let isMajor = false;
      let isCardinal = false;

      // Normalize degree for label (0-360)
      let normalizedDeg = deg % 360;
      if (normalizedDeg < 0) normalizedDeg += 360;

      if (normalizedDeg === 0) {
        labelText = 'N';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 45) {
        labelText = 'NE';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 90) {
        labelText = 'E';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 135) {
        labelText = 'SE';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 180) {
        labelText = 'S';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 225) {
        labelText = 'SW';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 270) {
        labelText = 'W';
        isMajor = true;
        isCardinal = true;
      } else if (normalizedDeg === 315) {
        labelText = 'NW';
        isMajor = true;
        isCardinal = true;
      } else {
        labelText = normalizedDeg.toString();
      }

      if (isMajor) {
        tick.classList.add('major');
      }

      const label = document.createElement('div');
      label.className = 'compass-label';
      if (isCardinal) label.classList.add('cardinal');
      label.textContent = labelText;
      tick.appendChild(label);

      compassStrip.appendChild(tick);
    }
  }

  // Update rotation
  const camera = controls.pointerLock.getObject();
  const vector = new THREE.Vector3();
  camera.getWorldDirection(vector);
  // atan2(x, z) gives angle relative to North (-Z) in typical Three.js FPS
  // 0,-1 -> PI (180)
  // 1,0 -> PI/2 (90)
  // 0,1 -> 0
  // -1,0 -> -PI/2 (-90)
  // We want N=0, E=90, S=180, W=270.
  // Formula: 180 - radToDeg(theta) maps correctly.
  // (0,-1) -> 180 - 180 = 0
  // (1,0) -> 180 - 90 = 90
  // (0,1) -> 180 - 0 = 180
  // (-1,0) -> 180 - (-90) = 270
  let deg = 180 - THREE.MathUtils.radToDeg(Math.atan2(vector.x, vector.z));

  // Normalize to 0-360
  deg = (deg + 360) % 360;

  // Calculate offset
  const pixelsPerDegree = 4;
  const containerCenter = compassStrip.parentElement.clientWidth / 2;
  // Our tick for 'deg' is at (deg + 180) * pixelsPerDegree
  const targetPos = (deg + 180) * pixelsPerDegree;
  const offset = containerCenter - targetPos;

  compassStrip.style.transform = `translateX(${offset}px)`;
}

function updateMinimap(world) {
  const player = world.getTagged(Player);
  const threeScene = world.getResource(ThreeScene);

  if (!player || !threeScene) {
    return;
  }

  const minimap = document.getElementById('minimap');
  if (!minimap) {
    return;
  }

  // Clear existing dots
  const existingDots = minimap.querySelectorAll(
    '.minimap-enemy, .minimap-item, .minimap-armor, .minimap-collectable, .minimap-obstacle, .minimap-health'
  );
  existingDots.forEach(dot => dot.remove());

  const entityDetails = [];
  for (const entity of world.entities) {
    // Skip undefined entities (holes in the array from deleted entities)
    if (!entity) continue;

    const details = [];
    if (entity.has(Obstacle)) {
      details.push('Obstacle');
    }
    if (entity.has(Player)) {
      details.push('Player');
    }
    if (entity.has(Collectable)) {
      details.push('Collectable');
    }
    if (
      entity.has(Enemy) ||
      entity.has(Scout) ||
      entity.has(Tank) ||
      entity.has(Sniper)
    ) {
      if (entity.has(Enemy)) details.push('Enemy');
      if (entity.has(Scout)) details.push('Scout');
      if (entity.has(Tank)) details.push('Tank');
      if (entity.has(Sniper)) details.push('Sniper');
    }
    if (details.length > 0) {
      entityDetails.push(details.join('+'));
    }
  }

  const mapSize = minimap.clientWidth; // Minimap size in pixels (matches CSS scaling)

  // Update player position on minimap
  if (player.has(ThreeObject)) {
    const playerDot = minimap.querySelector('.minimap-player');

    if (playerDot) {
      // Get the camera's world position since it's attached to the player container
      const camera = threeScene.camera;
      const playerPos = new THREE.Vector3();
      camera.getWorldPosition(playerPos);

      const playerX = ((playerPos.x + sceneSize / 2) / sceneSize) * mapSize;
      const playerZ = ((playerPos.z + sceneSize / 2) / sceneSize) * mapSize;

      // Ensure coordinates are within bounds
      const clampedX = Math.max(0, Math.min(mapSize, playerX));
      const clampedZ = Math.max(0, Math.min(mapSize, playerZ));

      playerDot.style.left = `${clampedX}px`;
      playerDot.style.top = `${clampedZ}px`;
    }
  }

  // Add enemy positions - collect all enemy types
  const enemyTags = [Enemy, Scout, Tank, Sniper];
  const enemies = [];
  for (const entity of world.entities) {
    // Skip undefined entities (holes in the array from deleted entities)
    if (!entity) continue;

    for (const tag of enemyTags) {
      if (entity.has(tag)) {
        enemies.push(entity);
        break; // Don't add the same entity multiple times if it has multiple enemy tags
      }
    }
  }

  enemies.forEach(enemy => {
    if (enemy.has(ThreeObject)) {
      const enemyMesh = enemy.get(ThreeObject).mesh;
      const dot = document.createElement('div');
      dot.className = 'minimap-enemy';

      // Get world position of the enemy mesh
      const enemyPos = new THREE.Vector3();
      enemyMesh.getWorldPosition(enemyPos);

      // Convert world coordinates to minimap coordinates
      // World goes from -50 to +50, map from 0 to 150
      const x = ((enemyPos.x + sceneSize / 2) / sceneSize) * mapSize;
      const z = ((enemyPos.z + sceneSize / 2) / sceneSize) * mapSize;

      // Ensure coordinates are within bounds
      const clampedX = Math.max(0, Math.min(mapSize, x));
      const clampedZ = Math.max(0, Math.min(mapSize, z));

      dot.style.left = `${clampedX}px`;
      dot.style.top = `${clampedZ}px`;
      minimap.appendChild(dot);
    }
  });

  // Add obstacle positions (terrain)
  const obstacles = [];
  for (const entity of world.entities) {
    // Skip undefined entities (holes in the array from deleted entities)
    if (!entity) continue;

    if (entity.has(Obstacle)) {
      obstacles.push(entity);
    }
  }
  obstacles.forEach(obstacle => {
    if (obstacle.has(ThreeObject)) {
      const obstacleMesh = obstacle.get(ThreeObject).mesh;
      const dot = document.createElement('div');
      dot.className = 'minimap-obstacle';

      // Get world position of the obstacle mesh
      const obstaclePos = new THREE.Vector3();
      obstacleMesh.getWorldPosition(obstaclePos);

      // Convert world coordinates to minimap coordinates
      const x = ((obstaclePos.x + sceneSize / 2) / sceneSize) * mapSize;
      const z = ((obstaclePos.z + sceneSize / 2) / sceneSize) * mapSize;

      // Ensure coordinates are within bounds
      const clampedX = Math.max(0, Math.min(mapSize, x));
      const clampedZ = Math.max(0, Math.min(mapSize, z));

      dot.style.left = `${clampedX}px`;
      dot.style.top = `${clampedZ}px`;
      minimap.appendChild(dot);
    }
  });

  // Add pickup positions
  const pickups = world.entities;

  for (const entity of pickups) {
    // Skip undefined entities (holes in the array from deleted entities)
    if (!entity) continue;

    if (entity.has(ThreeObject)) {
      let dotClass = '';
      let shouldShow = false;

      // Determine what type of pickup this is and set appropriate class
      if (entity.has(ArmorPickup)) {
        dotClass = 'minimap-armor';
        shouldShow = true;
      } else if (entity.has(WeaponPickup)) {
        dotClass = 'minimap-item';
        shouldShow = true;
      } else if (entity.has(Collectable)) {
        // Only show collectables that haven't been collected yet
        const collectable = entity.get(Collectable);
        if (!collectable.collected) {
          dotClass = 'minimap-collectable';
          shouldShow = true;
        }
      } else if (entity.has(HealthPack)) {
        dotClass = 'minimap-health';
        shouldShow = true;
      }

      if (shouldShow) {
        const pickupMesh = entity.get(ThreeObject).mesh;
        const dot = document.createElement('div');
        dot.className = dotClass;

        // Get world position of the pickup mesh
        const pickupPos = new THREE.Vector3();
        pickupMesh.getWorldPosition(pickupPos);

        const x = ((pickupPos.x + sceneSize / 2) / sceneSize) * mapSize;
        const z = ((pickupPos.z + sceneSize / 2) / sceneSize) * mapSize;

        // Ensure coordinates are within bounds
        const clampedX = Math.max(0, Math.min(mapSize, x));
        const clampedZ = Math.max(0, Math.min(mapSize, z));

        dot.style.left = `${clampedX}px`;
        dot.style.top = `${clampedZ}px`;
        minimap.appendChild(dot);
      }
    }
  }
}

export function damageIndicatorSystem({ world, dt }) {
  const indicatorsContainer = document.getElementById('damage-indicators');
  if (!indicatorsContainer) return;

  // Clear existing indicators
  indicatorsContainer.innerHTML = '';

  const dtScale = dt / 16.66667;

  // Process all damage indicators - use cached query
  const queryCache = world.getResource(QueryCache);
  const indicators = queryCache.damageIndicators.get();
  indicators.forEach(entity => {
    const indicator = entity.get(DamageIndicator);
    indicator.timer += dtScale;

    if (indicator.timer >= indicator.duration) {
      entity.destroy();
      return;
    }

    // Calculate opacity based on timer
    const progress = indicator.timer / indicator.duration;
    const opacity = 1 - progress;

    // Calculate position on screen edge
    const angle = indicator.direction;
    const x = Math.cos(angle) * indicator.distance;
    const y = Math.sin(angle) * indicator.distance;

    // Create indicator element
    const indicatorElement = document.createElement('div');
    indicatorElement.className = 'damage-indicator';
    indicatorElement.style.left = `calc(50% + ${x}px)`;
    indicatorElement.style.top = `calc(50% + ${y}px)`;
    indicatorElement.style.opacity = opacity;
    indicatorElement.textContent = Math.floor(indicator.damage);

    indicatorsContainer.appendChild(indicatorElement);
  });
}

export function cameraControlSystem({ world }) {
  const controls = world.getResource(Controls);
  const mobileControls = world.getResource(MobileControls);
  const player = world.getTagged(Player);

  if (!controls || !player) return;

  const camera = controls.pointerLock.getObject();
  const threeObject = player.get(ThreeObject);

  // Handle mobile camera controls
  if (mobileControls && mobileControls.isMobile) {
    const cameraRotation = mobileControls.getCameraRotation();

    // Apply rotation deltas from camera joystick
    if (cameraRotation.x !== 0 || cameraRotation.y !== 0) {
      // Rotate player container horizontally (left/right look)
      threeObject.mesh.rotation.y += cameraRotation.x;

      // Rotate camera vertically (up/down look)
      camera.rotation.x -= cameraRotation.y; // Inverted for natural feel
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -Math.PI / 2,
        Math.PI / 2
      );
    }
  }
}

export function rendererSystem({ world }) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;
  threeScene.renderer.render(threeScene.scene, threeScene.camera);
}


export function cleanupSystem({ world }) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  for (const entity of world.entities) {
    // Skip undefined entities (holes in the array from deleted entities)
    if (!entity) continue;

    if (entity.state === 'destroying') {
      if (entity.has(ThreeObject)) {
        const threeObject = entity.get(ThreeObject);
        threeScene.scene.remove(threeObject.mesh);
        if (threeObject.mesh.geometry) threeObject.mesh.geometry.dispose();
        if (threeObject.mesh.material) threeObject.mesh.material.dispose();
      }
      entity.destroyImmediately();
    }
  }
}

export function enemySpawnerSystem({ world, components }) {
  const gameState = components.get(GameState);
  const gameConfig = world.getResource(GameConfig);
  const queryCache = world.getResource(QueryCache);
  const currentEnemies = queryCache.allEnemies.get().length;

  if (currentEnemies < gameConfig.maxEnemies) {
    gameState.enemySpawnTimer--;
    if (gameState.enemySpawnTimer <= 0) {
      // Randomly choose enemy type
      const rand = Math.random();
      if (rand < 0.4) {
        spawnEnemy(world); // Regular enemy (40%)
      } else if (rand < 0.6) {
        spawnScout(world); // Scout (20%)
      } else if (rand < 0.8) {
        spawnSniper(world); // Sniper (20%)
      } else {
        spawnTank(world); // Tank (20%)
      }
      gameState.enemySpawnTimer = gameConfig.enemySpawnRate;
    }
  }
}

export function healthPackSpawnerSystem({ world, components }) {
  const gameState = components.get(GameState);
  const gameConfig = world.getResource(GameConfig);
  const queryCache = world.getResource(QueryCache);
  const currentPacks = queryCache.healthPacks.get().length;

  if (currentPacks < 1) {
    gameState.healthPackSpawnTimer--;
    if (gameState.healthPackSpawnTimer <= 0) {
      spawnHealthPack(world);
      gameState.healthPackSpawnTimer = gameConfig.healthPackSpawnRate;
    }
  }
}

export function weaponPickupSpawnerSystem({ world, components }) {
  const gameState = components.get(GameState);
  const gameConfig = world.getResource(GameConfig);
  const queryCache = world.getResource(QueryCache);
  const currentPickups = queryCache.weaponPickups.get().length;

  // Allow up to 2 weapon pickups on the field at once
  if (currentPickups < 2) {
    // Use a separate timer for weapon pickups (spawn less frequently than health packs)
    if (!gameState.weaponPickupSpawnTimer) {
      gameState.weaponPickupSpawnTimer =
        gameConfig.weaponPickupSpawnRate || 900; // Default to 900 if not set
    }

    gameState.weaponPickupSpawnTimer--;
    if (gameState.weaponPickupSpawnTimer <= 0) {
      spawnWeaponPickup(world);
      gameState.weaponPickupSpawnTimer =
        gameConfig.weaponPickupSpawnRate || 900;
    }
  }
}

export function armorPickupSpawnerSystem({ world, components }) {
  const gameState = components.get(GameState);
  const gameConfig = world.getResource(GameConfig);
  const queryCache = world.getResource(QueryCache);
  const currentPickups = queryCache.armorPickups.get().length;

  // Allow up to 1 armor pickup on the field at once
  if (currentPickups < 1) {
    // Use a separate timer for armor pickups (spawn less frequently than weapon pickups)
    if (!gameState.armorPickupSpawnTimer) {
      gameState.armorPickupSpawnTimer = gameConfig.armorPickupSpawnRate || 1200; // Default to 1200 if not set
    }

    gameState.armorPickupSpawnTimer--;
    if (gameState.armorPickupSpawnTimer <= 0) {
      spawnArmorPickup(world);
      gameState.armorPickupSpawnTimer = gameConfig.armorPickupSpawnRate || 1200;
    }
  }
}

export function collectableSpawnerSystem({ world, components }) {
  const gameState = components.get(GameState);
  const queryCache = world.getResource(QueryCache);

  // Only spawn collectables at the start of the game (not continuously)
  const currentCollectables = queryCache.collectables.get().length;
  const totalSpawned = currentCollectables + gameState.collectablesCollected;

  // Spawn collectables until we have 10 total (spawned + collected)
  if (totalSpawned < 10) {
    const toSpawn = 10 - totalSpawned;
    for (let i = 0; i < toSpawn; i++) {
      spawnCollectable(world);
    }

    // After spawning collectables, check if any boulders contain them and remove colliders
    removeCollidersFromBouldersWithCollectables(world);
  }
}

function removeCollidersFromBouldersWithCollectables(world) {
  const boulders = world.getAllTagged(Boulder);
  const queryCache = world.getResource(QueryCache);
  const collectables = queryCache.collectables.get();

  for (const boulder of boulders) {
    if (!boulder.has(ThreeObject) || !boulder.has(Collider)) continue;

    const boulderObject = boulder.get(ThreeObject);

    // Get boulder bounding box
    const boulderBox = new THREE.Box3().setFromObject(boulderObject.mesh);

    // Check if this boulder contains any collectable
    let containsCollectable = false;
    for (const collectable of collectables) {
      if (!collectable.has(ThreeObject)) continue;

      const collectableObject = collectable.get(ThreeObject);
      const collectableBox = new THREE.Box3().setFromObject(
        collectableObject.mesh
      );

      if (boulderBox.intersectsBox(collectableBox)) {
        containsCollectable = true;
        break;
      }
    }

    // If boulder contains a collectable, remove its collider and obstacle tag
    if (containsCollectable) {
      boulder.remove(Collider);
      boulder.removeTag(Obstacle);
    }
  }
}

export function groundCollisionSystem({ components }) {
  const threeObject = components.get(ThreeObject);
  const velocity = components.get(Velocity);

  // Assuming ground is at y=0. Adjust y position based on entity's height.
  // Most of your enemies have their origin at the center.
  // A simple check is to see if they go below their resting height.
  const groundY = 1.0; // A common resting height for your enemies.

  if (threeObject.mesh.position.y < groundY) {
    threeObject.mesh.position.y = groundY;
    // Stop downward movement upon hitting the ground.
    if (velocity.y < 0) {
      velocity.y = 0;
    }
  }
}

export function hitFlashSystem({ entity, components }) {
  const hitFlash = components.get(HitFlash);
  const threeObject = components.get(ThreeObject);
  const health = components.get(Health);

  if (!threeObject || !health) return;

  const material = threeObject.mesh.material;
  if (!material) return;

  // Store original colors if not already stored
  if (hitFlash.originalColor === null) {
    hitFlash.originalColor = material.color.getHex();
    hitFlash.originalEmissive = material.emissive
      ? material.emissive.getHex()
      : 0x000000;
    hitFlash.originalEmissiveIntensity = material.emissiveIntensity || 0;
  }

  // Calculate health percentage (0 to 1)
  const healthPercent = Math.max(0, health.value / (health.maxValue || 100));

  // Interpolate between white (full health) and red (low health)
  // White: 0xffffff, Red: 0xff0000
  const r = Math.round(255); // Always full red
  const g = Math.round(255 * healthPercent); // Green decreases with health loss
  const b = Math.round(255 * healthPercent); // Blue decreases with health loss

  const flashColor = (r << 16) | (g << 8) | b;

  // Set flash color and increased emissive intensity
  material.color.setHex(flashColor);
  material.emissive.setHex(flashColor);
  material.emissiveIntensity = 0.8;

  // Update flash timer
  hitFlash.timer++;

  // Remove flash when duration is over
  if (hitFlash.timer >= hitFlash.duration) {
    // Restore original colors
    material.color.setHex(hitFlash.originalColor);
    material.emissive.setHex(hitFlash.originalEmissive);
    material.emissiveIntensity = hitFlash.originalEmissiveIntensity;
    entity.remove(HitFlash);
  }
}

/* -------------------------------------------------------------------------- */
/*                           ARMOR REGENERATION SYSTEM                        */
/* -------------------------------------------------------------------------- */

export function armorRegenerationSystem({ world }) {
  // Use cached query for better performance
  const queryCache = world.getResource(QueryCache);
  const players = queryCache.armorRegenPlayers.get();

  for (const player of players) {
    const armor = player.get(Armor);
    const regen = player.get(ArmorRegeneration);

    // If armor is already full, don't need to regenerate
    if (armor.value >= armor.maxValue) {
      regen.isRegenerating = false;
      regen.damageTimer = 0; // Reset timer when full
      continue;
    }

    // Increment damage timer
    regen.damageTimer++;

    // Check if enough time has passed since last damage
    if (regen.damageTimer >= regen.regenerationDelay) {
      // Start regenerating
      regen.isRegenerating = true;

      // Regenerate armor at the specified rate (converted from per-second to per-frame)
      const regenAmount = regen.regenerationRate / 60; // Assuming 60fps
      armor.value = Math.min(armor.maxValue, armor.value + regenAmount);
    } else {
      regen.isRegenerating = false;
    }
  }
}
