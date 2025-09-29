import { getRandomNumber } from '../utils/utils.js';
import * as THREE from 'three';
import { applySplashDamage } from '../systems/systems.js';
import { ThreeScene } from '../resources/resources.js';
import {
  ThreeObject,
  Velocity,
  Collider,
  Expires,
  Projectile,
  EnemyAI,
  ScoutAI,
  TankAI,
  SniperAI,
  Health,
  HealthPack,
  WeaponPickup,
  Player,
  Enemy,
  Scout,
  Tank,
  Sniper,
  Bullet,
  Obstacle,
  Particle,
  WeaponPickupArrow,
  ArmorPickup,
  Collectable,
} from '../components/components.js';
import { sceneSize } from '../game/game.js';

/* -------------------------------------------------------------------------- */
/*                           ENTITY CREATION FUNCTIONS                       */
/* -------------------------------------------------------------------------- */

export function createExplosion(world, position, color, count = 20) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  for (let i = 0; i < count; i++) {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({
      color,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    threeScene.scene.add(mesh);

    const velocity = new Velocity(
      getRandomNumber(-0.2, 0.2),
      getRandomNumber(0.1, 0.3),
      getRandomNumber(-0.2, 0.2)
    );
    world
      .createEntity()
      .add(new ThreeObject(mesh))
      .add(velocity)
      .add(new Expires(60))
      .addTag(Particle);
  }
}

export function createBullet(
  world,
  position,
  direction,
  firedByTag,
  damage = 5
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const isPlayerBullet = firedByTag === Player;
  const color = isPlayerBullet ? 0x00ffff : 0xff00ff;

  // Make bullets larger and more visible
  const geo = new THREE.SphereGeometry(0.2, 8, 8);
  const mat = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2, // Increased from 1
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);

  // Make the light stronger and larger range
  const light = new THREE.PointLight(color, 2, 15);
  mesh.add(light);

  const velocity = direction.clone().multiplyScalar(0.8); // Reduced speed to prevent tunneling
  const collider = new Collider(new THREE.Box3().setFromObject(mesh));

  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Velocity(velocity.x, velocity.y, velocity.z))
    .add(collider)
    .add(new Expires(180))
    .add(new Projectile(firedByTag, damage))
    .addTag(Bullet);
}

export function createShotgunBlast(
  world,
  position,
  direction,
  firedByTag,
  damage = 8
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Create 8 pellets in a spread
  for (let i = 0; i < 8; i++) {
    const pelletDirection = direction.clone();
    // Add random spread
    pelletDirection.x += getRandomNumber(-0.15, 0.15);
    pelletDirection.y += getRandomNumber(-0.15, 0.15);
    pelletDirection.z += getRandomNumber(-0.15, 0.15);
    pelletDirection.normalize();

    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0x442200,
      emissiveIntensity: 1.5,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);

    const velocity = pelletDirection.clone().multiplyScalar(1.8);
    const collider = new Collider(new THREE.Box3().setFromObject(mesh));

    threeScene.scene.add(mesh);

    world
      .createEntity()
      .add(new ThreeObject(mesh))
      .add(new Velocity(velocity.x, velocity.y, velocity.z))
      .add(collider)
      .add(new Expires(60))
      .add(new Projectile(firedByTag, damage))
      .addTag(Bullet)
      .addTag('shotgunPellet');
  }
}

export function createFlameThrowerBlast(
  world,
  position,
  direction,
  firedByTag,
  damage = 3
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Create fewer, simpler flame particles for better performance
  for (let i = 0; i < 3; i++) {
    const flameDirection = direction.clone();
    // Reduced spread for more concentrated flames
    flameDirection.x += getRandomNumber(-0.05, 0.05);
    flameDirection.y += getRandomNumber(-0.05, 0.05);
    flameDirection.z += getRandomNumber(-0.05, 0.05);
    flameDirection.normalize();

    // Simpler geometry - smaller sphere with fewer segments
    const geo = new THREE.SphereGeometry(0.12, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff6600, // Bright orange flame color
      transparent: true,
      opacity: 0.8,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);

    // No individual point lights - too expensive for many particles
    // The emissive color provides some glow without lights

    const velocity = flameDirection.clone().multiplyScalar(0.3); // Even slower, shorter range
    const collider = new Collider(new THREE.Box3().setFromObject(mesh));

    threeScene.scene.add(mesh);

    world
      .createEntity()
      .add(new ThreeObject(mesh))
      .add(new Velocity(velocity.x, velocity.y, velocity.z))
      .add(collider)
      .add(new Expires(12)) // Much shorter lifetime - flames don't travel far
      .add(new Projectile(firedByTag, damage))
      .addTag('flame')
      .addTag(Bullet);
  }
}

export function createRocket(
  world,
  position,
  direction,
  firedByTag,
  damage = 50
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const geo = new THREE.CylinderGeometry(0.15, 0.25, 1.0, 8);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x444444,
    emissive: 0x220000,
    emissiveIntensity: 0.8,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  mesh.lookAt(position.clone().add(direction));

  // Add rocket trail effect - make it much brighter
  const trailLight = new THREE.PointLight(0xff4400, 2, 10);
  mesh.add(trailLight);

  const velocity = direction.clone().multiplyScalar(0.8); // Reduced speed to prevent tunneling
  const collider = new Collider(new THREE.Box3().setFromObject(mesh));

  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Velocity(velocity.x, velocity.y, velocity.z))
    .add(collider)
    .add(new Expires(240))
    .add(new Projectile(firedByTag, damage))
    .addTag('rocket');
}

export function createTankBullet(
  world,
  position,
  direction,
  firedByTag,
  damage = 12
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const geo = new THREE.SphereGeometry(0.25, 8, 8);
  const mat = new THREE.MeshPhongMaterial({
    color: 0xff6600,
    emissive: 0x441100,
    emissiveIntensity: 2.5,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);

  const light = new THREE.PointLight(0xff6600, 3, 20);
  mesh.add(light);

  const velocity = direction.clone().multiplyScalar(1.0); // Slower but more powerful
  const collider = new Collider(new THREE.Box3().setFromObject(mesh));

  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Velocity(velocity.x, velocity.y, velocity.z))
    .add(collider)
    .add(new Expires(300))
    .add(new Projectile(firedByTag, damage))
    .addTag(Bullet);
}

export function createSniperBullet(
  world,
  position,
  direction,
  firedByTag,
  damage = 25
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const geo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x004400,
    emissiveIntensity: 1.5,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  mesh.lookAt(position.clone().add(direction));

  const velocity = direction.clone().multiplyScalar(1.2); // Reduced speed to prevent tunneling
  const collider = new Collider(new THREE.Box3().setFromObject(mesh));

  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Velocity(velocity.x, velocity.y, velocity.z))
    .add(collider)
    .add(new Expires(180))
    .add(new Projectile(firedByTag, damage))
    .addTag(Bullet);
}

export function createMuzzleFlash(
  world,
  position,
  direction,
  weaponType = 'pistol'
) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Different colors and effects based on weapon type
  let flashColor, particleCount, flashSize;
  switch (weaponType) {
    case 'pistol':
      flashColor = 0xffff00; // Yellow
      particleCount = 3;
      flashSize = 0.05;
      break;
    case 'shotgun':
      flashColor = 0xffaa00; // Orange
      particleCount = 6;
      flashSize = 0.08;
      break;
    case 'machinegun':
      flashColor = 0x00ffff; // Cyan
      particleCount = 4;
      flashSize = 0.06;
      break;
    case 'rocket':
      flashColor = 0xff4444; // Red
      particleCount = 8;
      flashSize = 0.1;
      break;
    case 'flamethrower':
      flashColor = 0xff6600; // Orange
      particleCount = 3; // Reduced for performance
      flashSize = 0.06;
      break;
    default:
      flashColor = 0xffff00;
      particleCount = 3;
      flashSize = 0.05;
  }

  for (let i = 0; i < particleCount; i++) {
    const geo = new THREE.SphereGeometry(
      flashSize + Math.random() * flashSize,
      6,
      6
    );
    const mat = new THREE.MeshBasicMaterial({
      color: flashColor,
      transparent: true,
      opacity: 0.8,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const mesh = new THREE.Mesh(geo, mat);

    const flashPos = position
      .clone()
      .add(direction.clone().multiplyScalar(0.2));
    flashPos.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      )
    );
    mesh.position.copy(flashPos);

    threeScene.scene.add(mesh);

    const velocity = direction.clone().multiplyScalar(0.02);
    velocity.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      )
    );

    world
      .createEntity()
      .add(new ThreeObject(mesh))
      .add(new Velocity(velocity.x, velocity.y, velocity.z))
      .add(new Expires(8))
      .addTag(Particle);
  }
}

export function spawnScout(world) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      1,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );

    if (player) {
      const playerPos = player.get(ThreeObject).mesh.position;
      if (position.distanceTo(playerPos) < 6) {
        attempts++;
        continue;
      }
    }

    validPosition = true;
    const testBox = new THREE.Box3().setFromCenterAndSize(
      position,
      new THREE.Vector3(1.2, 1.5, 1.2)
    );

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (testBox.intersectsBox(obstacleCollider.box)) {
        validPosition = false;
        break;
      }
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      1,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );
  }

  const enemyGeo = new THREE.OctahedronGeometry(0.4, 0);
  const enemyMat = new THREE.MeshPhongMaterial({
    color: 0x00aaff, // Light blue for scouts
    emissive: 0x002244,
    emissiveIntensity: 0.3,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
  enemyMesh.position.copy(position);
  threeScene.scene.add(enemyMesh);

  world
    .createEntity()
    .add(new ThreeObject(enemyMesh))
    .add(new Velocity())
    .add(new Collider(new THREE.Box3().setFromObject(enemyMesh)))
    .add(new Health(15, 15)) // Low health
    .add(new ScoutAI())
    .addTag(Scout);
}

export function spawnTank(world) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3),
      1,
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3)
    );

    if (player) {
      const playerPos = player.get(ThreeObject).mesh.position;
      if (position.distanceTo(playerPos) < 10) {
        attempts++;
        continue;
      }
    }

    validPosition = true;
    const testBox = new THREE.Box3().setFromCenterAndSize(
      position,
      new THREE.Vector3(2.5, 3, 2.5)
    );

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (testBox.intersectsBox(obstacleCollider.box)) {
        validPosition = false;
        break;
      }
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3),
      1,
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3)
    );
  }

  const enemyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const enemyMat = new THREE.MeshPhongMaterial({
    color: 0x666666, // Gray for tanks
    emissive: 0x222222,
    emissiveIntensity: 0.2,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
  enemyMesh.position.copy(position);
  threeScene.scene.add(enemyMesh);

  world
    .createEntity()
    .add(new ThreeObject(enemyMesh))
    .add(new Velocity())
    .add(new Collider(new THREE.Box3().setFromObject(enemyMesh)))
    .add(new Health(80, 80)) // High health
    .add(new TankAI())
    .addTag(Tank);
}

export function spawnSniper(world) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      1,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );

    if (player) {
      const playerPos = player.get(ThreeObject).mesh.position;
      if (position.distanceTo(playerPos) < 15) {
        attempts++;
        continue;
      }
    }

    validPosition = true;
    const testBox = new THREE.Box3().setFromCenterAndSize(
      position,
      new THREE.Vector3(1.8, 2.5, 1.8)
    );

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (testBox.intersectsBox(obstacleCollider.box)) {
        validPosition = false;
        break;
      }
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      1,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
  }

  const enemyGeo = new THREE.CylinderGeometry(0.4, 0.6, 2, 8);
  const enemyMat = new THREE.MeshPhongMaterial({
    color: 0x008800, // Dark green for snipers
    emissive: 0x002200,
    emissiveIntensity: 0.4,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
  enemyMesh.position.copy(position);
  threeScene.scene.add(enemyMesh);

  world
    .createEntity()
    .add(new ThreeObject(enemyMesh))
    .add(new Velocity())
    .add(new Collider(new THREE.Box3().setFromObject(enemyMesh)))
    .add(new Health(25, 25)) // Medium health
    .add(new SniperAI())
    .addTag(Sniper);
}

export function spawnEnemy(world) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      1,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );

    if (player) {
      const playerPos = player.get(ThreeObject).mesh.position;
      if (position.distanceTo(playerPos) < 8) {
        attempts++;
        continue;
      }
    }

    validPosition = true;
    const testBox = new THREE.Box3().setFromCenterAndSize(
      position,
      new THREE.Vector3(1.6, 2, 1.6)
    );

    for (const obstacle of obstacles) {
      const obstacleCollider = obstacle.get(Collider);
      if (testBox.intersectsBox(obstacleCollider.box)) {
        validPosition = false;
        break;
      }
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      1,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );
  }

  const enemyGeo = new THREE.IcosahedronGeometry(0.8, 0);
  const enemyMat = new THREE.MeshPhongMaterial({
    color: 0x8b0000, // Dark red for a more natural enemy color
    emissive: 0x330000,
    emissiveIntensity: 0.2,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
  enemyMesh.position.copy(position);
  threeScene.scene.add(enemyMesh);

  world
    .createEntity()
    .add(new ThreeObject(enemyMesh))
    .add(new Velocity())
    .add(new Collider(new THREE.Box3().setFromObject(enemyMesh)))
    .add(new Health(30, 30))
    .add(new EnemyAI())
    .addTag(Enemy);
}

export function spawnHealthPack(world) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Create a glowing orb for health packs instead of a cube
  const packGeo = new THREE.SphereGeometry(0.4, 16, 12);
  const packMat = new THREE.MeshPhongMaterial({
    color: 0x00ff88, // Bright green-blue
    emissive: 0x004422,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const packMesh = new THREE.Mesh(packGeo, packMat);

  // Add a subtle pulsing light
  const packLight = new THREE.PointLight(0x00ff88, 0.5, 5);
  packMesh.add(packLight);

  // Generate random position for health pack, avoiding obstacles
  let packPosition;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    packPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      1,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    attempts++;
  } while (attempts < maxAttempts && isPositionBlocked(world, packPosition));

  // If we couldn't find a good position, just use a random one anyway
  if (attempts >= maxAttempts) {
    packPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      1,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
  }

  packMesh.position.copy(packPosition);
  threeScene.scene.add(packMesh);

  world
    .createEntity()
    .add(new ThreeObject(packMesh))
    .add(new Collider(new THREE.Box3().setFromObject(packMesh)))
    .add(new HealthPack());
}

export function dropHealthPack(world, position) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Create a glowing orb for health packs instead of a cube
  const packGeo = new THREE.SphereGeometry(0.4, 16, 12);
  const packMat = new THREE.MeshPhongMaterial({
    color: 0x00ff88, // Bright green-blue
    emissive: 0x004422,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const packMesh = new THREE.Mesh(packGeo, packMat);

  // Add a subtle pulsing light
  const packLight = new THREE.PointLight(0x00ff88, 0.5, 5);
  packMesh.add(packLight);

  packMesh.position.copy(position);
  threeScene.scene.add(packMesh);

  world
    .createEntity()
    .add(new ThreeObject(packMesh))
    .add(new Collider(new THREE.Box3().setFromObject(packMesh)))
    .add(new HealthPack());
}

export function spawnWeaponPickup(world, weaponType = null, position = null) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // If no weapon type specified, randomly choose one (excluding pistol since player starts with it)
  if (!weaponType) {
    const weaponTypes = ['shotgun', 'machinegun', 'rocket', 'flamethrower'];
    weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
  }

  // Very distinct appearances based on weapon type - make ammo types obvious!
  let geometry, material;
  const extraElements = [];
  switch (weaponType) {
    case 'shotgun':
      // SHOTGUN: Wide brown shotgun shape with shells visible
      geometry = new THREE.BoxGeometry(1.2, 0.4, 0.3);
      material = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // Rich brown wood
        emissive: 0x331100,
        emissiveIntensity: 0.4,
      });
      // Add visible shotgun shells
      for (let i = 0; i < 3; i++) {
        const shellGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6);
        const shellMat = new THREE.MeshPhongMaterial({
          color: 0xFFD700, // Gold shells
          emissive: 0x442200,
          emissiveIntensity: 0.6,
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.position.set(-0.3 + i * 0.2, 0.3, 0);
        extraElements.push(shell);
      }
      break;
    case 'machinegun':
      // MACHINE GUN: Long metallic cylinder with belt of bullets
      geometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
      material = new THREE.MeshPhongMaterial({
        color: 0xC0C0C0, // Bright silver
        emissive: 0x404040,
        emissiveIntensity: 0.5,
      });
      // Add bullet belt
      for (let i = 0; i < 5; i++) {
        const bulletGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6);
        const bulletMat = new THREE.MeshPhongMaterial({
          color: 0xFFFF00, // Bright yellow bullets
          emissive: 0x444400,
          emissiveIntensity: 0.8,
        });
        const bullet = new THREE.Mesh(bulletGeo, bulletMat);
        bullet.position.set(0.4, -0.3 + i * 0.15, 0);
        extraElements.push(bullet);
      }
      break;
    case 'rocket':
      // ROCKET: Large red rocket shape
      geometry = new THREE.ConeGeometry(0.4, 1.5, 8);
      material = new THREE.MeshPhongMaterial({
        color: 0xFF0000, // Bright red
        emissive: 0x880000,
        emissiveIntensity: 0.6,
      });
      // Add rocket fins
      for (let i = 0; i < 4; i++) {
        const finGeo = new THREE.BoxGeometry(0.1, 0.3, 0.05);
        const finMat = new THREE.MeshPhongMaterial({
          color: 0x444444,
          emissive: 0x222222,
          emissiveIntensity: 0.3,
        });
        const fin = new THREE.Mesh(finGeo, finMat);
        const angle = (i / 4) * Math.PI * 2;
        fin.position.set(Math.cos(angle) * 0.3, -0.4, Math.sin(angle) * 0.3);
        fin.rotation.y = angle;
        extraElements.push(fin);
      }
      break;
    case 'flamethrower':
      // FLAMETHROWER: Blue flame-shaped object
      geometry = new THREE.CylinderGeometry(0.25, 0.35, 1.0, 8);
      material = new THREE.MeshPhongMaterial({
        color: 0x0088FF, // Bright blue
        emissive: 0x004488,
        emissiveIntensity: 0.7,
      });
      // Add flame effects
      for (let i = 0; i < 4; i++) {
        const flameGeo = new THREE.ConeGeometry(0.1, 0.4, 6);
        const flameMat = new THREE.MeshBasicMaterial({
          color: 0xFF6600, // Orange flame
          transparent: true,
          opacity: 0.8,
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(
          (Math.random() - 0.5) * 0.3,
          0.6 + Math.random() * 0.2,
          (Math.random() - 0.5) * 0.3
        );
        extraElements.push(flame);
      }
      break;
    default:
      return; // Invalid weapon type
  }

  material.clippingPlanes = [world.getResource(ThreeScene).groundClippingPlane];
  const weaponMesh = new THREE.Mesh(geometry, material);

  // Add extra visual elements to make ammo type obvious
  extraElements.forEach(element => {
    element.material.clippingPlanes = [world.getResource(ThreeScene).groundClippingPlane];
    weaponMesh.add(element);
  });

  // Add a subtle pulsing light
  const weaponLight = new THREE.PointLight(0x00ff88, 0.3, 3);
  weaponMesh.add(weaponLight);

  let weaponPosition;
  if (position) {
    weaponPosition = position.clone();
    weaponPosition.y = 1; // Ensure it's on the ground
  } else {
    // Generate random position for weapon pickup, avoiding obstacles
    let attempts = 0;
    const maxAttempts = 50;

    do {
      weaponPosition = new THREE.Vector3(
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
        1,
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
      );
      attempts++;
    } while (attempts < maxAttempts && isPositionBlocked(world, weaponPosition));

    // If we couldn't find a good position, just use a random one anyway
    if (attempts >= maxAttempts) {
      weaponPosition = new THREE.Vector3(
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
        1,
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
      );
    }
  }

  weaponMesh.position.copy(weaponPosition);
  threeScene.scene.add(weaponMesh);

  // Create floating arrow indicator above the weapon
  const arrowGeometry = new THREE.ConeGeometry(0.1, 0.5, 6);
  const arrowMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00, // Bright yellow
    emissive: 0x444400,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);

  // Position arrow above weapon
  arrowMesh.position.copy(weaponPosition).add(new THREE.Vector3(0, 2.5, 0));
  arrowMesh.rotation.x = -Math.PI / 2; // Point downward

  // Add bright light to arrow
  const arrowLight = new THREE.PointLight(0xffff00, 1.0, 8);
  arrowMesh.add(arrowLight);

  threeScene.scene.add(arrowMesh);

  // Create weapon pickup entity
  const weaponEntity = world
    .createEntity()
    .add(new ThreeObject(weaponMesh))
    .add(new Collider(new THREE.Box3().setFromObject(weaponMesh)))
    .add(new WeaponPickup(weaponType));

  // Create arrow indicator entity
  world
    .createEntity()
    .add(new ThreeObject(arrowMesh))
    .add(new WeaponPickupArrow(weaponEntity)); // Link to weapon entity
}

export function spawnArmorPickup(world, armorAmount = 50) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Create a shield-like armor pickup
  const armorGeometry = new THREE.OctahedronGeometry(0.5, 0);
  const armorMaterial = new THREE.MeshPhongMaterial({
    color: 0x4444ff, // Blue shield color
    emissive: 0x111122,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });

  const armorMesh = new THREE.Mesh(armorGeometry, armorMaterial);

  // Add a subtle blue pulsing light
  const armorLight = new THREE.PointLight(0x4444ff, 0.4, 4);
  armorMesh.add(armorLight);

  // Generate random position for armor pickup, avoiding obstacles
  let armorPosition;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    armorPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      1,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    attempts++;
  } while (attempts < maxAttempts && isPositionBlocked(world, armorPosition));

  // If we couldn't find a good position, just use a random one anyway
  if (attempts >= maxAttempts) {
    armorPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      1,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
  }

  armorMesh.position.copy(armorPosition);
  threeScene.scene.add(armorMesh);

  // Create floating arrow indicator above the armor
  const arrowGeometry = new THREE.ConeGeometry(0.1, 0.5, 6);
  const arrowMaterial = new THREE.MeshPhongMaterial({
    color: 0x4444ff, // Blue for armor
    emissive: 0x111122,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);

  // Position arrow above armor
  arrowMesh.position.copy(armorPosition).add(new THREE.Vector3(0, 2.5, 0));
  arrowMesh.rotation.x = -Math.PI / 2; // Point downward

  // Add bright light to arrow
  const arrowLight = new THREE.PointLight(0x4444ff, 1.0, 8);
  arrowMesh.add(arrowLight);

  threeScene.scene.add(arrowMesh);

  // Create armor pickup entity
  const armorEntity = world
    .createEntity()
    .add(new ThreeObject(armorMesh))
    .add(new Collider(new THREE.Box3().setFromObject(armorMesh)))
    .add(new ArmorPickup(armorAmount));

  // Create arrow indicator entity
  world
    .createEntity()
    .add(new ThreeObject(arrowMesh))
    .add(new WeaponPickupArrow(armorEntity)); // Link to armor entity
}

export function spawnCollectable(world) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Generate random position for collectable, avoiding obstacles
  let position;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    position = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10),
      0,
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10)
    );
    attempts++;
  } while (attempts < maxAttempts && isPositionBlocked(world, position));

  // If we couldn't find a good position, just use a random one anyway
  if (attempts >= maxAttempts) {
    position = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10),
      0,
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10)
    );
  }

  createCollectable(world, position);
}

function isPositionBlocked(world, position) {
  const obstacles = world.getAllTagged(Obstacle);
  // Create a test box sized for collectables (1-unit octahedron) with some padding
  // Collectables are positioned at y=1.5 and have roughly 1x1x1 collision boxes
  const testBox = new THREE.Box3(
    new THREE.Vector3(position.x - 1.5, position.y - 0.5, position.z - 1.5),
    new THREE.Vector3(position.x + 1.5, position.y + 2.5, position.z + 1.5)
  );

  for (const obstacle of obstacles) {
    const obstacleCollider = obstacle.get(Collider);
    const obstacleBoxes = Array.isArray(obstacleCollider.box) ? obstacleCollider.box : [obstacleCollider.box];

    for (const obstacleBox of obstacleBoxes) {
      if (obstacleBox.intersectsBox(testBox)) {
        return true;
      }
    }
  }

  return false;
}

export function createSkybox(scene) {
  // Create a large sphere for the sky
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec3 skyColor = vec3(0.53, 0.81, 0.92); // Sky blue
        vec3 horizonColor = vec3(0.82, 0.70, 0.55); // Warm horizon
        float h = normalize(vWorldPosition).y;
        gl_FragColor = vec4(mix(horizonColor, skyColor, max(pow(max(h, 0.0), 0.8), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyMesh);
}

export function createBoulder(world, position, size) {
  // Create natural rock formations that extend from the ground
  const boulderGroup = new THREE.Group();

  const baseColor = new THREE.Color().setHSL(
    0.08 + Math.random() * 0.12, // Brownish hue with more variation
    0.15 + Math.random() * 0.25, // Low to medium saturation
    0.25 + Math.random() * 0.4 // Dark to medium brightness
  );

  // Decide on formation type: massive monoliths, piles, outcroppings, or scattered rocks
  const formationType = Math.random();
  let numRocks;

  if (size > 12) {
    // Very large formations - Joshua Tree style monoliths
    if (formationType < 0.3) {
      numRocks = getRandomNumber(1, 2); // Single massive rock
    } else if (formationType < 0.6) {
      numRocks = getRandomNumber(2, 4); // Small cluster of large rocks
    } else {
      numRocks = getRandomNumber(3, 6); // Medium formation
    }
  } else if (size > 8) {
    // Large formations
    if (formationType < 0.4) {
      numRocks = getRandomNumber(2, 4); // Outcropping
    } else if (formationType < 0.7) {
      numRocks = getRandomNumber(4, 8); // Rock pile
    } else {
      numRocks = getRandomNumber(1, 3); // Large individual rocks
    }
  } else {
    // Smaller formations
    if (formationType < 0.4) {
      numRocks = getRandomNumber(4, 8); // Rock pile
    } else if (formationType < 0.7) {
      numRocks = getRandomNumber(2, 5); // Outcropping
    } else {
      numRocks = getRandomNumber(1, 3); // Scattered rocks
    }
  }

  const rocks = [];

  for (let i = 0; i < numRocks; i++) {
    // Vary rock shapes: spheres, flattened spheres, and irregular shapes
    const rockType = Math.random();
    let geometry,
      scaleY = 1;

    if (rockType < 0.4) {
      // Round boulder
      geometry = new THREE.SphereGeometry(1, 8, 6);
    } else if (rockType < 0.7) {
      // Flattened rock (lying on ground)
      geometry = new THREE.SphereGeometry(1, 8, 6);
      scaleY = 0.3 + Math.random() * 0.4; // Flatten it
    } else {
      // Irregular angular rock
      geometry = new THREE.DodecahedronGeometry(1, 0);
      // Randomly scale to make it irregular
      geometry.scale(
        0.8 + Math.random() * 0.4,
        0.6 + Math.random() * 0.8,
        0.8 + Math.random() * 0.4
      );
    }

    // Vary rock size significantly
    const rockSize = size * (0.4 + Math.random() * 1.2);
    geometry.scale(rockSize, rockSize * scaleY, rockSize);

    const rockMat = new THREE.MeshPhongMaterial({
      color: baseColor.clone().multiplyScalar(0.7 + Math.random() * 0.5),
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });

    const rock = new THREE.Mesh(geometry, rockMat);
    rocks.push(rock);
  }

  // Position rocks to create Joshua Tree-style formations
  if (size > 12) {
    // Massive monoliths that tower above the landscape
    if (formationType < 0.3) {
      // Single massive rock
      rocks.forEach(rock => {
        rock.position.set(
          (Math.random() - 0.5) * size * 0.2,
          size * 0.3 + Math.random() * size * 0.4, // High above ground
          (Math.random() - 0.5) * size * 0.2
        );
        rock.rotation.set(
          Math.random() * Math.PI * 0.3 - Math.PI * 0.15, // Slight tilt
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.3 - Math.PI * 0.15
        );
        boulderGroup.add(rock);
      });
    } else if (formationType < 0.6) {
      // Small cluster of massive rocks
      rocks.forEach((rock, index) => {
        const angle = (index / rocks.length) * Math.PI * 2;
        const radius = size * 0.4;
        const height = size * 0.2 + Math.random() * size * 0.6;

        rock.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );

        rock.rotation.set(
          Math.random() * Math.PI * 0.4 - Math.PI * 0.2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.4 - Math.PI * 0.2
        );

        boulderGroup.add(rock);
      });
    } else {
      // Large formation with rocks at different heights
      rocks.forEach((rock, index) => {
        const height = index * size * 0.25 + Math.random() * size * 0.3;
        rock.position.set(
          (Math.random() - 0.5) * size * 0.8,
          height,
          (Math.random() - 0.5) * size * 0.8
        );

        rock.rotation.set(
          Math.random() * Math.PI * 0.6 - Math.PI * 0.3,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.6 - Math.PI * 0.3
        );

        boulderGroup.add(rock);
      });
    }
  } else if (size > 8) {
    // Large formations
    if (formationType < 0.4) {
      // Large outcropping
      rocks.forEach((rock, index) => {
        const baseHeight = -size * 0.3 + index * size * 0.4;
        rock.position.set(
          (Math.random() - 0.5) * size * 0.7,
          baseHeight + Math.random() * size * 0.5,
          (Math.random() - 0.5) * size * 0.7
        );

        rock.rotation.set(
          Math.random() * Math.PI * 0.5 - Math.PI * 0.25,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.5 - Math.PI * 0.25
        );

        boulderGroup.add(rock);
      });
    } else if (formationType < 0.7) {
      // Large rock pile
      rocks.forEach((rock, index) => {
        const angle = (index / rocks.length) * Math.PI * 2;
        const radius = size * (0.4 + Math.random() * 0.3);
        const height = -size * 0.2 + Math.random() * size * 1.0;

        rock.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );

        rock.position.x += (Math.random() - 0.5) * size * 0.4;
        rock.position.z += (Math.random() - 0.5) * size * 0.4;

        rock.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        boulderGroup.add(rock);
      });
    } else {
      // Large individual boulders
      rocks.forEach(rock => {
        rock.position.set(
          (Math.random() - 0.5) * size * 2.5,
          -size * 0.1 + Math.random() * size * 0.6,
          (Math.random() - 0.5) * size * 2.5
        );

        rock.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        boulderGroup.add(rock);
      });
    }
  } else {
    // Smaller formations - original logic
    if (formationType < 0.4) {
      // Rock pile - cluster rocks together with some buried in ground
      rocks.forEach((rock, index) => {
        const angle = (index / rocks.length) * Math.PI * 2;
        const radius = size * (0.3 + Math.random() * 0.4);
        const height = -size * 0.3 + Math.random() * size * 0.8;

        rock.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );

        rock.position.x += (Math.random() - 0.5) * size * 0.3;
        rock.position.z += (Math.random() - 0.5) * size * 0.3;

        rock.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        boulderGroup.add(rock);
      });
    } else if (formationType < 0.7) {
      // Outcropping - larger rocks emerging from ground
      rocks.forEach((rock, index) => {
        const baseHeight = -size * 0.5 + index * size * 0.3;
        rock.position.set(
          (Math.random() - 0.5) * size * 0.6,
          baseHeight + Math.random() * size * 0.4,
          (Math.random() - 0.5) * size * 0.6
        );

        rock.rotation.set(
          Math.random() * Math.PI * 0.5 - Math.PI * 0.25,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.5 - Math.PI * 0.25
        );

        boulderGroup.add(rock);
      });
    } else {
      // Scattered rocks - individual boulders
      rocks.forEach(rock => {
        rock.position.set(
          (Math.random() - 0.5) * size * 2,
          -size * 0.2 + Math.random() * size * 0.4,
          (Math.random() - 0.5) * size * 2
        );

        rock.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        boulderGroup.add(rock);
      });
    }
  }

  boulderGroup.position.copy(position);
  // Don't add extra height offset since rocks are positioned relative to ground

  // Create individual collision boxes for each rock instead of one large box
  const collisionBoxes = [];
  rocks.forEach(rock => {
    // Create a bounding box for each individual rock
    const rockBox = new THREE.Box3().setFromObject(rock);

    // Shrink the collision box significantly to allow getting much closer to rocks
    // Use a single aggressive shrink factor since all rocks should be walkable-around
    const shrinkFactor = 0.5; // 50% of original size

    // Get the center and size of the original box
    const center = rockBox.getCenter(new THREE.Vector3());
    const size = rockBox.getSize(new THREE.Vector3());

    // Create a smaller box centered on the same point
    const halfSize = size.clone().multiplyScalar(shrinkFactor * 0.5);
    const min = center.clone().sub(halfSize);
    const max = center.clone().add(halfSize);

    const shrunkBox = new THREE.Box3(min, max);

    // Transform the box to world coordinates (rock position + boulder group position)
    shrunkBox.translate(boulderGroup.position);
    collisionBoxes.push(shrunkBox);
  });

  return { mesh: boulderGroup, collisionBoxes };
}

export function createTree(world, position) {
  const treeGroup = new THREE.Group();

  // Randomly choose between regular trees and Joshua Tree yuccas
  const isJoshuaTree = Math.random() < 0.4; // 40% chance for Joshua Tree style

  if (isJoshuaTree) {
    // Joshua Tree yucca - twisted trunk with sparse spiky leaves
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 6, 8);
    const trunkMat = new THREE.MeshPhongMaterial({
      color: 0x654321, // Darker brown for desert tree
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);

    // Twist the trunk slightly for character
    trunk.rotation.y = Math.random() * Math.PI * 0.3 - Math.PI * 0.15;
    trunk.rotation.x = Math.random() * Math.PI * 0.2 - Math.PI * 0.1;
    trunk.position.y = 3;
    treeGroup.add(trunk);

    // Sparse spiky leaves pointing outward
    const leafColors = [0x228B22, 0x32CD32, 0x006400, 0x90EE90];
    for (let i = 0; i < 8; i++) {
      const leafGeo = new THREE.ConeGeometry(0.1, 1.5 + Math.random() * 1, 6);
      const leafMat = new THREE.MeshPhongMaterial({
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
      });
      const leaf = new THREE.Mesh(leafGeo, leafMat);

      const angle = (i / 8) * Math.PI * 2;
      const distance = 0.8 + Math.random() * 0.4;
      const height = 4 + Math.random() * 2;

      leaf.position.set(
        Math.cos(angle) * distance,
        height,
        Math.sin(angle) * distance
      );

      // Point leaves outward from center
      leaf.lookAt(
        new THREE.Vector3(
          Math.cos(angle) * 2,
          height,
          Math.sin(angle) * 2
        )
      );

      // Add some random rotation
      leaf.rotation.z += (Math.random() - 0.5) * 0.3;

      treeGroup.add(leaf);
    }
  } else {
    // Regular desert tree
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
    const trunkMat = new THREE.MeshPhongMaterial({
      color: 0x8b4513, // Brown
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    treeGroup.add(trunk);

    // Tree foliage (multiple layers)
    const foliageColors = [0x228b22, 0x32cd32, 0x006400]; // Different green shades
    for (let i = 0; i < 3; i++) {
      const foliageGeo = new THREE.ConeGeometry(2 - i * 0.3, 2, 8);
      const foliageMat = new THREE.MeshPhongMaterial({
        color: foliageColors[i % foliageColors.length],
        clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
      });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 3 + i * 0.8;
      treeGroup.add(foliage);
    }
  }

  treeGroup.position.copy(position);
  return treeGroup;
}

export function createBushes(world, position, count = 3) {
  const bushGroup = new THREE.Group();

  for (let i = 0; i < count; i++) {
    const bushGeo = new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 6, 4);
    const bushMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.6, 0.4),
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(
      (Math.random() - 0.5) * 2,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 2
    );
    bushGroup.add(bush);
  }

  bushGroup.position.copy(position);
  return bushGroup;
}

export function createCrate(world, position) {
  const crateGroup = new THREE.Group();

  // Wooden crate
  const crateGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const crateMat = new THREE.MeshPhongMaterial({
    color: 0x8b4513, // Brown wood
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const crate = new THREE.Mesh(crateGeo, crateMat);
  crateGroup.add(crate);

  crateGroup.position.copy(position);
  return crateGroup;
}

export function createBarrel(world, position) {
  const barrelGroup = new THREE.Group();

  // Metal barrel
  const barrelGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 12);
  const barrelMat = new THREE.MeshPhongMaterial({
    color: 0x666666, // Gray metal
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrelGroup.add(barrel);

  // Barrel rings
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 16);
    const ringMat = new THREE.MeshPhongMaterial({
      color: 0x444444,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -0.8 + i * 0.8;
    barrelGroup.add(ring);
  }

  barrelGroup.position.copy(position);
  return barrelGroup;
}

export function createFallenLog(world, position) {
  const logGroup = new THREE.Group();

  // Fallen log
  const logGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
  const logMat = new THREE.MeshPhongMaterial({
    color: 0x654321, // Dark brown wood
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const log = new THREE.Mesh(logGeo, logMat);
  log.rotation.z = Math.PI / 2; // Lay it flat
  log.position.y = 0.3;
  logGroup.add(log);

  logGroup.position.copy(position);
  return logGroup;
}

export function createStonePillar(world, position) {
  const pillarGroup = new THREE.Group();

  // Stone pillar
  const pillarGeo = new THREE.CylinderGeometry(0.6, 0.8, 3, 8);
  const pillarMat = new THREE.MeshPhongMaterial({
    color: 0x888888, // Light gray stone
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 1.5;
  pillarGroup.add(pillar);

  // Add some moss/lichen on top
  const mossGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 8);
  const mossMat = new THREE.MeshPhongMaterial({
    color: 0x228B22, // Forest green
    clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
  });
  const moss = new THREE.Mesh(mossGeo, mossMat);
  moss.position.y = 3.05;
  pillarGroup.add(moss);

  pillarGroup.position.copy(position);
  return pillarGroup;
}

export function createGrassPatch(world, position) {
  const grassGroup = new THREE.Group();

  // Create multiple grass blades
  for (let i = 0; i < 15; i++) {
    const bladeGeo = new THREE.PlaneGeometry(0.1, 0.8);
    const bladeMat = new THREE.MeshPhongMaterial({
      color: 0x228B22, // Green
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);

    blade.position.set(
      (Math.random() - 0.5) * 3,
      Math.random() * 0.4,
      (Math.random() - 0.5) * 3
    );
    blade.rotation.y = Math.random() * Math.PI * 2;
    blade.rotation.x = (Math.random() - 0.5) * 0.3; // Slight tilt

    grassGroup.add(blade);
  }

  grassGroup.position.copy(position);
  return grassGroup;
}

export function createRuin(world, position) {
  const ruinGroup = new THREE.Group();

  // Broken stone wall pieces
  const stoneColors = [0x888888, 0x999999, 0x777777];

  for (let i = 0; i < 5; i++) {
    const stoneGeo = new THREE.BoxGeometry(
      1 + Math.random() * 2,
      0.5 + Math.random() * 1.5,
      0.8 + Math.random() * 1.2
    );
    const stoneMat = new THREE.MeshPhongMaterial({
      color: stoneColors[Math.floor(Math.random() * stoneColors.length)],
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);

    stone.position.set(
      (Math.random() - 0.5) * 4,
      Math.random() * 1,
      (Math.random() - 0.5) * 4
    );
    stone.rotation.set(
      Math.random() * 0.5,
      Math.random() * Math.PI * 2,
      Math.random() * 0.5
    );

    ruinGroup.add(stone);
  }

  ruinGroup.position.copy(position);
  return ruinGroup;
}

export function createBoundaryWalls(world, threeScene) {
  const wallThickness = 2;
  const wallHeight = 10;
  const halfSize = sceneSize / 2;
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513, // Brown color for natural rock walls
    transparent: true,
    opacity: 0.1,
  });

  const wallPositions = [
    {
      size: [sceneSize + wallThickness, wallHeight, wallThickness],
      pos: [0, wallHeight / 2, -halfSize],
    },
    {
      size: [sceneSize + wallThickness, wallHeight, wallThickness],
      pos: [0, wallHeight / 2, halfSize],
    },
    {
      size: [wallThickness, wallHeight, sceneSize + wallThickness],
      pos: [-halfSize, wallHeight / 2, 0],
    },
    {
      size: [wallThickness, wallHeight, sceneSize + wallThickness],
      pos: [halfSize, wallHeight / 2, 0],
    },
  ];

  for (const wall of wallPositions) {
    const wallGeo = new THREE.BoxGeometry(...wall.size);
    const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
    wallMesh.position.set(...wall.pos);
    threeScene.scene.add(wallMesh);

    world
      .createEntity()
      .add(new ThreeObject(wallMesh))
      .add(new Collider(new THREE.Box3().setFromObject(wallMesh)))
      .addTag(Obstacle);
  }
}

export function createRocketExplosion(world, position) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // Create explosion particles
  for (let i = 0; i < 25; i++) {
    const geo = new THREE.SphereGeometry(0.1, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      clippingPlanes: [world.getResource(ThreeScene).groundClippingPlane],
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    threeScene.scene.add(mesh);

    const velocity = new THREE.Vector3(
      getRandomNumber(-0.3, 0.3),
      getRandomNumber(0.1, 0.4),
      getRandomNumber(-0.3, 0.3)
    );

    world
      .createEntity()
      .add(new ThreeObject(mesh))
      .add(new Velocity(velocity.x, velocity.y, velocity.z))
      .add(new Expires(90))
      .addTag(Particle);
  }

  // Apply splash damage in explosion radius
  const explosionRadius = 4;
  applySplashDamage(world, position, 40, null, explosionRadius); // null firedBy means it damages everyone
}

export function createCollectable(world, position) {
  const threeScene = world.getResource(ThreeScene);

  // Create a glowing crystal-like collectable
  const geometry = new THREE.OctahedronGeometry(1, 0);

  // Create glowing material with emissive properties
  const material = new THREE.MeshPhongMaterial({
    color: 0xffd700, // Gold color
    emissive: 0x444400, // Subtle emissive glow
    emissiveIntensity: 0.3,
    shininess: 100,
    transparent: true,
    opacity: 0.9,
    clippingPlanes: [threeScene.groundClippingPlane],
  });

  const collectable = new THREE.Mesh(geometry, material);

  // Add a point light to make it glow
  const light = new THREE.PointLight(0xffd700, 1, 10);
  light.position.copy(position);
  collectable.add(light);

  // Position the collectable slightly above ground
  collectable.position.copy(position);
  collectable.position.y += 1.5;

  threeScene.scene.add(collectable);

  // Create bounding box for collision detection
  const collectableBox = new THREE.Box3().setFromObject(collectable);

  world
    .createEntity()
    .add(new ThreeObject(collectable))
    .add(new Collectable())
    .add(new Collider(collectableBox));

  return collectable;
}
