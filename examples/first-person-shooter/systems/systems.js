import * as THREE from 'three';
import { getRandomNumber } from '../utils/utils.js';
import {
  InputState,
  Controls,
  WeaponSystem,
  ThreeScene,
  GameConfig,
} from '../resources/resources.js';
import {
  GameState,
  ThreeObject,
  Velocity,
  Collider,
  Health,
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
  Player,
  Enemy,
  Scout,
  Tank,
  Sniper,
  Obstacle,
} from '../components/components.js';
import {
  CollisionEvent,
  PlayerDamagedEvent,
  PlayerDeathEvent,
  PlayerHealedEvent,
  PlayerWeaponPickupEvent,
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
  spawnEnemy,
  spawnScout,
  spawnTank,
  spawnSniper,
  spawnHealthPack,
  dropHealthPack,
  spawnWeaponPickup,
} from '../entities/entities.js';
import { sceneSize } from '../game/game.js';

/* -------------------------------------------------------------------------- */
/*                                   SYSTEMS                                  */
/* -------------------------------------------------------------------------- */

export function playerMovementSystem({ world }) {
  const input = world.getResource(InputState);
  const playerEntity = world.getTagged(Player);
  const controls = world.getResource(Controls);
  if (!input || !playerEntity || !controls) return;

  const velocity = playerEntity.get(Velocity);
  const threeObject = playerEntity.get(ThreeObject);

  velocity.y -= 0.01;
  velocity.x *= 0.95;
  velocity.z *= 0.95;

  const speed = 0.02;
  const direction = new THREE.Vector3();
  const camera = controls.pointerLock.getObject();

  if (input.forward) {
    camera.getWorldDirection(direction);
    velocity.add(direction.multiplyScalar(speed));
  }
  if (input.backward) {
    camera.getWorldDirection(direction);
    velocity.sub(direction.multiplyScalar(speed));
  }
  if (input.right) {
    direction.setFromMatrixColumn(camera.matrix, 0);
    velocity.add(direction.multiplyScalar(speed));
  }
  if (input.left) {
    direction.setFromMatrixColumn(camera.matrix, 0);
    velocity.sub(direction.multiplyScalar(speed));
  }

  const maxSpeed = 0.2;
  if (new THREE.Vector2(velocity.x, velocity.z).length() > maxSpeed) {
    const yVel = velocity.y;
    velocity.y = 0;
    velocity.normalize().multiplyScalar(maxSpeed);
    velocity.y = yVel;
  }

  threeObject.mesh.position.add(velocity);

  // --- NEW: Boundary Clamping ---
  const halfSize = sceneSize / 2;
  const playerRadius = 0.5; // A small buffer for player size
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

  if (
    !input ||
    !player ||
    !controls ||
    !weaponSystem ||
    !input.shoot ||
    !input.shootReleased
  )
    return;

  const camera = controls.pointerLock.getObject();
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const startPosition = new THREE.Vector3();
  camera
    .getWorldPosition(startPosition)
    .add(direction.clone().multiplyScalar(1.5));

  if (weaponSystem.fire()) {
    const weapon = weaponSystem.getCurrentWeapon();

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
    }

    createMuzzleFlash(world, startPosition, direction, weapon.type);
  }

  input.shootReleased = false;
}

export function enemyAISystem({ world, components }) {
  const ai = components.get(EnemyAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01;

  ai.timer--;
  if (ai.timer <= 0) {
    const startPosition = enemyObj.mesh.position.clone();
    const direction = playerObj.mesh.position
      .clone()
      .sub(startPosition)
      .normalize();
    createBullet(world, startPosition, direction, Enemy, 5); // Enemy bullets do 5 damage
    ai.timer = ai.shootCooldown + getRandomNumber(-30, 30);
  }

  ai.moveTimer--;
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

export function scoutAISystem({ world, components }) {
  const ai = components.get(ScoutAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01;

  // Fast shooting
  ai.timer--;
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
  ai.moveTimer--;
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
  ai.dodgeTimer--;
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

export function tankAISystem({ world, components }) {
  const ai = components.get(TankAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01;

  // Slow but powerful shooting
  ai.timer--;
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
  ai.moveTimer--;
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

export function sniperAISystem({ world, components }) {
  const ai = components.get(SniperAI);
  const enemyObj = components.get(ThreeObject);
  const velocity = components.get(Velocity);
  const player = world.getTagged(Player);
  if (!player) return;

  const playerObj = player.get(ThreeObject);
  enemyObj.mesh.lookAt(playerObj.mesh.position);

  // Apply gravity to prevent floating
  velocity.y -= 0.01;

  // Accurate shooting from distance
  ai.timer--;
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
  ai.moveTimer--;
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

export function movementSystem({ components }) {
  const velocity = components.get(Velocity);
  const threeObject = components.get(ThreeObject);
  threeObject.mesh.position.add(velocity);
}

export function particleMovementSystem({ components }) {
  const velocity = components.get(Velocity);
  velocity.y -= 0.005;
  velocity.multiplyScalar(0.98);
}

export function healthPackAnimationSystem({ components }) {
  const healthPack = components.get(HealthPack);

  // Skip animation for picked up health packs
  if (healthPack.pickedUp) return;

  const threeObject = components.get(ThreeObject);

  healthPack.bobTimer += 0.05;
  healthPack.bobOffset = Math.sin(healthPack.bobTimer) * 0.2;
  threeObject.mesh.position.y = 1 + healthPack.bobOffset;

  threeObject.mesh.rotation.y += 0.02;
}

export function weaponPickupAnimationSystem({ components }) {
  const weaponPickup = components.get(WeaponPickup);

  // Skip animation for picked up weapon pickups
  if (weaponPickup.pickedUp) return;

  const threeObject = components.get(ThreeObject);

  weaponPickup.bobTimer += 0.05;
  weaponPickup.bobOffset = Math.sin(weaponPickup.bobTimer) * 0.15;
  threeObject.mesh.position.y = 1 + weaponPickup.bobOffset;

  // Rotate weapons to make them more visible
  threeObject.mesh.rotation.y += 0.03;
  threeObject.mesh.rotation.x = Math.sin(weaponPickup.bobTimer * 0.5) * 0.1;
}

export function weaponPickupArrowAnimationSystem({ components }) {
  const arrow = components.get(WeaponPickupArrow);
  const threeObject = components.get(ThreeObject);

  // Update arrow position to follow the weapon
  if (arrow.weaponEntity && arrow.weaponEntity.state === 'created') {
    const weaponObject = arrow.weaponEntity.get(ThreeObject);
    if (weaponObject) {
      // Keep arrow above weapon with some floating motion
      arrow.bobTimer += 0.08;
      arrow.bobOffset = Math.sin(arrow.bobTimer) * 0.3;
      threeObject.mesh.position
        .copy(weaponObject.mesh.position)
        .add(new THREE.Vector3(0, 2.5 + arrow.bobOffset, 0));
    }
  }

  // Rotate arrow for visibility
  threeObject.mesh.rotation.y += 0.05;
  threeObject.mesh.rotation.z = Math.sin(arrow.bobTimer * 0.7) * 0.2;
}

export function lifecycleSystem({ entity, components }) {
  const expires = components.get(Expires);
  expires.life--;
  if (expires.life <= 0) {
    entity.destroy();
  }
}

export function updateCollidersSystem({ entity, components }) {
  if (entity.hasTag(Player)) return;

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

export function entityObstacleCollisionSystem({ world }) {
  const obstacles = world.getAllTagged(Obstacle);

  // Handle player collision with obstacles
  const player = world.getTagged(Player);
  if (player && player.state === 'created') {
    const playerCollider = player.get(Collider);
    const playerObject = player.get(ThreeObject);

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (playerCollider.box.intersectsBox(obstacleCollider.box)) {
        const playerBox = playerCollider.box;
        const obstacleBox = obstacleCollider.box;

        // Calculate overlap on each axis
        const overlapX =
          Math.min(playerBox.max.x, obstacleBox.max.x) -
          Math.max(playerBox.min.x, obstacleBox.min.x);
        const overlapZ =
          Math.min(playerBox.max.z, obstacleBox.max.z) -
          Math.max(playerBox.min.z, obstacleBox.min.z);

        if (Math.abs(overlapX) < Math.abs(overlapZ)) {
          const sign = Math.sign(
            playerObject.mesh.position.x -
              obstacle.get(ThreeObject).mesh.position.x
          );
          playerObject.mesh.position.x += overlapX * sign;
        } else {
          const sign = Math.sign(
            playerObject.mesh.position.z -
              obstacle.get(ThreeObject).mesh.position.z
          );
          playerObject.mesh.position.z += overlapZ * sign;
        }
      }
    }
  }

  // Handle weapon pickup collision with player (destroy arrows when weapon is picked up)
  if (player && player.state === 'created') {
    const playerCollider = player.get(Collider);
    const weaponPickups = world.locateAll([WeaponPickup]);

    for (const pickup of weaponPickups) {
      const pickupCollider = pickup.get(Collider);
      if (playerCollider.box.intersectsBox(pickupCollider.box)) {
        // Destroy arrow indicators when weapon is picked up
        const arrows = world.locateAll([WeaponPickupArrow]);
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

  // Handle enemy collision with obstacles
  const enemies = world.locateAll([
    EnemyAI,
    ScoutAI,
    TankAI,
    SniperAI,
    ThreeObject,
    Collider,
  ]);
  for (const enemy of enemies) {
    if (enemy.state !== 'created') continue;

    const enemyCollider = enemy.get(Collider);
    const enemyObject = enemy.get(ThreeObject);
    const enemyVelocity = enemy.get(Velocity);

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (enemyCollider.box.intersectsBox(obstacleCollider.box)) {
        const enemyBox = enemyCollider.box;
        const obstacleBox = obstacleCollider.box;

        // Calculate overlap on each axis
        const overlapX =
          Math.min(enemyBox.max.x, obstacleBox.max.x) -
          Math.max(enemyBox.min.x, obstacleBox.min.x);
        const overlapY =
          Math.min(enemyBox.max.y, obstacleBox.max.y) -
          Math.max(enemyBox.min.y, obstacleBox.min.y);
        const overlapZ =
          Math.min(enemyBox.max.z, obstacleBox.max.z) -
          Math.max(enemyBox.min.z, obstacleBox.min.z);

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
              obstacle.get(ThreeObject).mesh.position.y
          );
          enemyObject.mesh.position.y += overlapY * sign;
          enemyVelocity.y = 0; // Stop vertical movement
        } else if (Math.abs(overlapX) < Math.abs(overlapZ)) {
          // X axis collision
          const sign = Math.sign(
            enemyObject.mesh.position.x -
              obstacle.get(ThreeObject).mesh.position.x
          );
          enemyObject.mesh.position.x += overlapX * sign;
        } else {
          // Z axis collision
          const sign = Math.sign(
            enemyObject.mesh.position.z -
              obstacle.get(ThreeObject).mesh.position.z
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

export function rocketExplosionSystem({ world }) {
  const rockets = world.locateAll(['rocket', Collider]);

  for (const rocket of rockets) {
    if (rocket.state !== 'created') continue;
    const rocketCollider = rocket.get(Collider);
    const projectile = rocket.get(Projectile);

    // Check for collision with obstacles or expiry
    let shouldExplode = false;
    const obstacles = world.getAllTagged(Obstacle);

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (rocketCollider.box.intersectsBox(obstacleCollider.box)) {
        shouldExplode = true;
        break;
      }
    }

    // Rockets also explode on impact with enemies or players
    if (projectile.firedBy === Player) {
      const enemies = world.locateAll([
        EnemyAI,
        ScoutAI,
        TankAI,
        SniperAI,
        Collider,
      ]);
      for (const enemy of enemies) {
        if (enemy.state === 'created') {
          const enemyCollider = enemy.get(Collider);
          if (rocketCollider.box.intersectsBox(enemyCollider.box)) {
            shouldExplode = true;
            break;
          }
        }
      }
    } else {
      const player = world.getTagged(Player);
      if (player && player.state === 'created') {
        const playerCollider = player.get(Collider);
        if (rocketCollider.box.intersectsBox(playerCollider.box)) {
          shouldExplode = true;
        }
      }
    }

    if (shouldExplode) {
      const position = rocket.get(ThreeObject).mesh.position;
      createRocketExplosion(world, position);
      rocket.destroy();
    }
  }
}

export function collisionSystem({ world }) {
  const bullets = world.locateAll([Projectile, Collider]);
  const regularEnemies = world.locateAll([EnemyAI, Collider]);
  const scouts = world.locateAll([ScoutAI, Collider]);
  const tanks = world.locateAll([TankAI, Collider]);
  const snipers = world.locateAll([SniperAI, Collider]);
  const enemies = [...regularEnemies, ...scouts, ...tanks, ...snipers];
  const obstacles = world.getAllTagged(Obstacle);
  const healthPacks = world.locateAll([HealthPack]);
  const weaponPickups = world.locateAll([WeaponPickup]);
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
        world.events.emit(new CollisionEvent(bullet, player));
        continue;
      }
    }

    if (projectile.firedBy === Player) {
      for (const enemy of enemies) {
        if (enemy.state !== 'created') continue;
        const enemyCollider = enemy.get(Collider);
        if (bulletCollider.box.intersectsBox(enemyCollider.box)) {
          world.events.emit(new CollisionEvent(bullet, enemy));
          break;
        }
      }
    }

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (bulletCollider.box.intersectsBox(obstacleCollider.box)) {
        bullet.destroy();
        break;
      }
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

      // Chance to drop health pack when enemy dies
      let dropChance = 0.2; // 20% base chance
      if (entity.hasTag(Tank)) {
        dropChance = 0.4; // 40% chance for tanks (tougher enemies)
      } else if (entity.hasTag(Sniper)) {
        dropChance = 0.3; // 30% chance for snipers
      }

      if (Math.random() < dropChance) {
        dropHealthPack(world, position);
      }
    }
    entity.destroy();
  }
}

export function damageSystem({ event: collision, world }) {
  const { entityA: bullet, entityB: target } = collision;

  if (bullet.state !== 'created' || target.state !== 'created') return;

  if (target.has(Health)) {
    const targetHealth = target.get(Health);
    const projectile = bullet.get(Projectile);
    const damage = projectile.damage;
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
    }
  }

  const position = bullet.get(ThreeObject).mesh.position;
  createExplosion(world, position, 0xffffff, 5);
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

export function uiRenderSystem({ world }) {
  const gameStateEntity = world.locate(GameState);
  if (!gameStateEntity) return;
  const gameState = gameStateEntity.get(GameState);
  const player = world.getTagged(Player);
  const weaponSystem = world.getResource(WeaponSystem);

  document.getElementById('score').innerText = gameState.score;
  if (player && player.has(Health)) {
    document.getElementById('health').innerText = Math.floor(
      player.get(Health).value
    );
  } else {
    document.getElementById('health').innerText = 0;
  }

  // Update weapon UI
  if (weaponSystem) {
    const currentWeapon = weaponSystem.getCurrentWeapon();
    document.getElementById('current-weapon').innerText = currentWeapon.name;
    document.getElementById('current-ammo').innerText =
      currentWeapon.ammo === Infinity ? '∞' : currentWeapon.ammo;
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

  for (const entity of world.entities.values()) {
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
  const currentEnemies = world.locateAll([
    EnemyAI,
    ScoutAI,
    TankAI,
    SniperAI,
  ]).length;

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
  const currentPacks = world.locateAll([HealthPack]).length;

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
  const currentPickups = world.locateAll([WeaponPickup]).length;

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
