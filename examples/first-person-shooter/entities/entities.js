import { getRandomNumber } from '../utils/utils.js';
import * as THREE from 'three';
import { PlayerDamagedEvent } from '../events/events.js';
import { ThreeScene, AssetLibrary } from '../resources/resources.js';
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
import { sceneSize, getTerrainHeight } from '../game/terrain.js';

/* -------------------------------------------------------------------------- */
/*                           UTILITY FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

export function applySplashDamage(world, position, damage, firedBy, radius) {
  const regularEnemies = world.locateAll([EnemyAI, Collider]);
  const scouts = world.locateAll([ScoutAI, Collider]);
  const tanks = world.locateAll([TankAI, Collider]);
  const snipers = world.locateAll([SniperAI, Collider]);
  const enemies = [...regularEnemies, ...scouts, ...tanks, ...snipers];
  const player = world.getTagged(Player);

  // Damage enemies in splash radius (unless fired by enemy)
  if (
    firedBy !== Enemy &&
    firedBy !== Scout &&
    firedBy !== Tank &&
    firedBy !== Sniper
  ) {
    for (const enemy of enemies) {
      if (enemy.state !== 'created') continue;
      const enemyPos = enemy.get(ThreeObject).mesh.position;
      const distance = position.distanceTo(enemyPos);

      if (distance <= radius) {
        // Damage decreases with distance from center
        const splashDamage = Math.max(1, damage * (1 - distance / radius));
        if (enemy.has(Health)) {
          const health = enemy.get(Health);
          health.value -= splashDamage;
        }
      }
    }
  }

  // Damage player if in splash radius (for enemy-fired weapons or neutral explosions)
  if (player && player.state === 'created' && firedBy !== Player) {
    const playerPos = player.get(ThreeObject).mesh.position;
    const distance = position.distanceTo(playerPos);

    if (distance <= radius) {
      const splashDamage = Math.max(1, damage * (1 - distance / radius));
      if (player.has(Health)) {
        const health = player.get(Health);
        health.value -= splashDamage;
        world.events.emit(new PlayerDamagedEvent());
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                           ENTITY CREATION FUNCTIONS                       */
/* -------------------------------------------------------------------------- */

export function createExplosion(world, position, color, count = 20) {
  const threeScene = world.getResource(ThreeScene);
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  for (let i = 0; i < count; i++) {
    const geo = assets.geometries.explosionParticle;
    const mat = assets.getExplosionMaterial(color);
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
  const mobileControls = world.getResource('MobileControls');
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const isPlayerBullet = firedByTag === Player;
  const color = isPlayerBullet ? 0x00ffff : 0xff00ff;
  const isLowPerformanceMode =
    mobileControls && mobileControls.isLowPerformanceMode;

  let geo, mat, mesh;

  if (isLowPerformanceMode) {
    // Mobile-optimized: simpler geometry, no lighting, basic material
    geo = assets.geometries.bulletMobile;
    mat = isPlayerBullet
      ? assets.materials.bulletBasicPlayer
      : assets.materials.bulletBasicEnemy;
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);

    // No point light on mobile for performance
  } else {
    // Desktop version: full effects
    geo = assets.geometries.bulletDesktop;
    mat = isPlayerBullet
      ? assets.materials.bulletPlayer
      : assets.materials.bulletEnemy;
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);

    // Add point light for desktop
    const light = new THREE.PointLight(color, 2, 15);
    mesh.add(light);
  }

  const velocity = direction.clone().multiplyScalar(0.8);
  const collider = new Collider(new THREE.Box3().setFromObject(mesh));

  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Velocity(velocity.x, velocity.y, velocity.z))
    .add(collider)
    .add(new Expires(isLowPerformanceMode ? 120 : 180)) // Shorter lifetime on mobile
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
  const mobileControls = world.getResource('MobileControls');
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const isLowPerformanceMode =
    mobileControls && mobileControls.isLowPerformanceMode;
  const pelletCount = isLowPerformanceMode ? 4 : 8; // Reduced from 8 to 4 pellets on mobile

  // Create pellets in a spread
  for (let i = 0; i < pelletCount; i++) {
    const pelletDirection = direction.clone();
    // Add random spread
    pelletDirection.x += getRandomNumber(-0.15, 0.15);
    pelletDirection.y += getRandomNumber(-0.15, 0.15);
    pelletDirection.z += getRandomNumber(-0.15, 0.15);
    pelletDirection.normalize();

    let geo, mat;

    if (isLowPerformanceMode) {
      // Mobile-optimized: simpler geometry and material
      geo = assets.geometries.shotgunPelletMobile;
      mat = assets.materials.shotgunPelletBasic;
    } else {
      // Desktop version
      geo = assets.geometries.shotgunPelletDesktop;
      mat = assets.materials.shotgunPellet;
    }

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
      .add(new Expires(isLowPerformanceMode ? 45 : 60)) // Shorter lifetime on mobile
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  // Create fewer, simpler flame particles for better performance
  for (let i = 0; i < 3; i++) {
    const flameDirection = direction.clone();
    // Reduced spread for more concentrated flames
    flameDirection.x += getRandomNumber(-0.05, 0.05);
    flameDirection.y += getRandomNumber(-0.05, 0.05);
    flameDirection.z += getRandomNumber(-0.05, 0.05);
    flameDirection.normalize();

    // Simpler geometry - smaller sphere with fewer segments
    const geo = assets.geometries.flame;
    const mat = assets.materials.flame;
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
  const mobileControls = world.getResource('MobileControls');
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const isLowPerformanceMode =
    mobileControls && mobileControls.isLowPerformanceMode;

  let geo, mat, mesh;

  if (isLowPerformanceMode) {
    // Mobile-optimized: simpler geometry, no lighting
    geo = assets.geometries.rocketMobile;
    mat = assets.materials.rocketBasic;
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.lookAt(position.clone().add(direction));

    // No trail light on mobile for performance
  } else {
    // Desktop version
    geo = assets.geometries.rocketDesktop;
    mat = assets.materials.rocket;
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.lookAt(position.clone().add(direction));

    // Add rocket trail effect for desktop
    const trailLight = new THREE.PointLight(0xff4400, 2, 10);
    mesh.add(trailLight);
  }

  const velocity = direction.clone().multiplyScalar(0.8);
  const collider = new Collider(new THREE.Box3().setFromObject(mesh));

  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Velocity(velocity.x, velocity.y, velocity.z))
    .add(collider)
    .add(new Expires(isLowPerformanceMode ? 180 : 240)) // Shorter lifetime on mobile
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const geo = assets.geometries.tankBullet;
  const mat = assets.materials.tankBullet;
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const geo = assets.geometries.sniperBullet;
  const mat = assets.materials.sniperBullet;
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
  const mobileControls = world.getResource('MobileControls');
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const isLowPerformanceMode =
    mobileControls && mobileControls.isLowPerformanceMode;

  // Different colors and effects based on weapon type (reduced for mobile)
  let particleCount, flashSize;
  switch (weaponType) {
    case 'pistol':
      particleCount = isLowPerformanceMode ? 1 : 3;
      flashSize = 0.05;
      break;
    case 'shotgun':
      particleCount = isLowPerformanceMode ? 2 : 6;
      flashSize = 0.08;
      break;
    case 'machinegun':
      particleCount = isLowPerformanceMode ? 2 : 4;
      flashSize = 0.06;
      break;
    case 'rocket':
      particleCount = isLowPerformanceMode ? 3 : 8;
      flashSize = 0.1;
      break;
    case 'flamethrower':
      particleCount = isLowPerformanceMode ? 1 : 3;
      flashSize = 0.06;
      break;
    default:
      particleCount = isLowPerformanceMode ? 1 : 3;
      flashSize = 0.05;
  }

  for (let i = 0; i < particleCount; i++) {
    let geo, mat;

    if (isLowPerformanceMode) {
      // Mobile-optimized: simpler geometry
      geo = assets.geometries.muzzleFlashMobile;
      switch (weaponType) {
        case 'pistol': mat = assets.materials.flashYellowMobile; break;
        case 'shotgun': mat = assets.materials.flashOrangeMobile; break;
        case 'machinegun': mat = assets.materials.flashCyanMobile; break;
        case 'rocket': mat = assets.materials.flashRedMobile; break;
        case 'flamethrower': mat = assets.materials.flashOrangeMobile; break;
        default: mat = assets.materials.flashYellowMobile;
      }
    } else {
      // Desktop version
      geo = assets.geometries.muzzleFlashDesktop;
      switch (weaponType) {
        case 'pistol': mat = assets.materials.flashYellow; break;
        case 'shotgun': mat = assets.materials.flashOrange; break;
        case 'machinegun': mat = assets.materials.flashCyan; break;
        case 'rocket': mat = assets.materials.flashRed; break;
        case 'flamethrower': mat = assets.materials.flashOrange; break;
        default: mat = assets.materials.flashYellow;
      }
    }

    const mesh = new THREE.Mesh(geo, mat);

    // Scale the mesh for random size
    const scale = flashSize + Math.random() * flashSize;
    mesh.scale.set(scale, scale, scale);

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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      0,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );
    
    // Adjust height to terrain
    position.y = getTerrainHeight(position.x, position.z) + 1;

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
      const obstacleBoxes = Array.isArray(obstacleCollider.box)
        ? obstacleCollider.box
        : [obstacleCollider.box];

      for (const obstacleBox of obstacleBoxes) {
        if (testBox.intersectsBox(obstacleBox)) {
          validPosition = false;
          break;
        }
      }
      if (!validPosition) break;
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      0,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );
    position.y = getTerrainHeight(position.x, position.z) + 1;
  }

  const enemyGeo = assets.geometries.scout;
  const enemyMat = assets.materials.scout.clone();
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3),
      0,
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3)
    );
    
    // Adjust height to terrain
    position.y = getTerrainHeight(position.x, position.z) + 1;

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
      const obstacleBoxes = Array.isArray(obstacleCollider.box)
        ? obstacleCollider.box
        : [obstacleCollider.box];

      for (const obstacleBox of obstacleBoxes) {
        if (testBox.intersectsBox(obstacleBox)) {
          validPosition = false;
          break;
        }
      }
      if (!validPosition) break;
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3),
      0,
      getRandomNumber(-sceneSize / 2 + 3, sceneSize / 2 - 3)
    );
    position.y = getTerrainHeight(position.x, position.z) + 1;
  }

  const enemyGeo = assets.geometries.tank;
  const enemyMat = assets.materials.tank.clone();
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    
    // Adjust height to terrain
    position.y = getTerrainHeight(position.x, position.z) + 1;

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
      const obstacleBoxes = Array.isArray(obstacleCollider.box)
        ? obstacleCollider.box
        : [obstacleCollider.box];

      for (const obstacleBox of obstacleBoxes) {
        if (testBox.intersectsBox(obstacleBox)) {
          validPosition = false;
          break;
        }
      }
      if (!validPosition) break;
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    position.y = getTerrainHeight(position.x, position.z) + 1;
  }

  const enemyGeo = assets.geometries.sniper;
  const enemyMat = assets.materials.sniper.clone();
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  const obstacles = world.getAllTagged(Obstacle);
  const player = world.getTagged(Player);
  const position = new THREE.Vector3();
  let validPosition = false;
  let attempts = 0;

  while (!validPosition && attempts < 50) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      0,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );
    
    // Adjust height to terrain
    position.y = getTerrainHeight(position.x, position.z) + 1;

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
      const obstacleBoxes = Array.isArray(obstacleCollider.box)
        ? obstacleCollider.box
        : [obstacleCollider.box];

      for (const obstacleBox of obstacleBoxes) {
        if (testBox.intersectsBox(obstacleBox)) {
          validPosition = false;
          break;
        }
      }
      if (!validPosition) break;
    }

    attempts++;
  }

  if (!validPosition) {
    position.set(
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2),
      0,
      getRandomNumber(-sceneSize / 2 + 2, sceneSize / 2 - 2)
    );
    position.y = getTerrainHeight(position.x, position.z) + 1;
  }

  const enemyGeo = assets.geometries.enemy;
  const enemyMat = assets.materials.enemy.clone();
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  // Create a glowing orb for health packs instead of a cube
  const packGeo = assets.geometries.healthPack;
  const packMat = assets.materials.healthPack;
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
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    
    // Adjust height to terrain
    packPosition.y = getTerrainHeight(packPosition.x, packPosition.z) + 1;

    attempts++;
  } while (attempts < maxAttempts && isPositionBlocked(world, packPosition));

  // If we couldn't find a good position, just use a random one anyway
  if (attempts >= maxAttempts) {
    packPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    packPosition.y = getTerrainHeight(packPosition.x, packPosition.z) + 1;
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  // Create a glowing orb for health packs instead of a cube
  const packGeo = assets.geometries.healthPack;
  const packMat = assets.materials.healthPack;
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

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
      geometry = assets.geometries.pickupShotgun;
      material = assets.materials.pickupShotgun;
      // Add visible shotgun shells
      for (let i = 0; i < 3; i++) {
        const shell = new THREE.Mesh(
          assets.geometries.pickupShotgunShell,
          assets.materials.pickupShotgunShell
        );
        shell.position.set(-0.3 + i * 0.2, 0.3, 0);
        extraElements.push(shell);
      }
      break;
    case 'machinegun':
      // MACHINE GUN: Long metallic cylinder with belt of bullets
      geometry = assets.geometries.pickupMachineGun;
      material = assets.materials.pickupMachineGun;
      // Add bullet belt
      for (let i = 0; i < 5; i++) {
        const bullet = new THREE.Mesh(
          assets.geometries.pickupMachineGunBullet,
          assets.materials.pickupMachineGunBullet
        );
        bullet.position.set(0.4, -0.3 + i * 0.15, 0);
        extraElements.push(bullet);
      }
      break;
    case 'rocket':
      // ROCKET: Large red rocket shape
      geometry = assets.geometries.pickupRocket;
      material = assets.materials.pickupRocket;
      // Add rocket fins
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(
          assets.geometries.pickupRocketFin,
          assets.materials.pickupRocketFin
        );
        const angle = (i / 4) * Math.PI * 2;
        fin.position.set(Math.cos(angle) * 0.3, -0.4, Math.sin(angle) * 0.3);
        fin.rotation.y = angle;
        extraElements.push(fin);
      }
      break;
    case 'flamethrower':
      // FLAMETHROWER: Blue flame-shaped object
      geometry = assets.geometries.pickupFlamethrower;
      material = assets.materials.pickupFlamethrower;
      // Add flame effects
      for (let i = 0; i < 4; i++) {
        const flame = new THREE.Mesh(
          assets.geometries.pickupFlamethrowerFlame,
          assets.materials.pickupFlamethrowerFlame
        );
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

  const weaponMesh = new THREE.Mesh(geometry, material);

  // Add extra visual elements to make ammo type obvious
  extraElements.forEach(element => {
    weaponMesh.add(element);
  });

  // Add a subtle pulsing light
  const weaponLight = new THREE.PointLight(0x00ff88, 0.3, 3);
  weaponMesh.add(weaponLight);

  let weaponPosition;
  if (position) {
    weaponPosition = position.clone();
    weaponPosition.y = getTerrainHeight(weaponPosition.x, weaponPosition.z) + 1; // Ensure it's on the ground
  } else {
    // Generate random position for weapon pickup, avoiding obstacles
    let attempts = 0;
    const maxAttempts = 50;

    do {
      weaponPosition = new THREE.Vector3(
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
        0,
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
      );
      
      // Adjust height to terrain
      weaponPosition.y = getTerrainHeight(weaponPosition.x, weaponPosition.z) + 1;

      attempts++;
    } while (
      attempts < maxAttempts &&
      isPositionBlocked(world, weaponPosition)
    );

    // If we couldn't find a good position, just use a random one anyway
    if (attempts >= maxAttempts) {
      weaponPosition = new THREE.Vector3(
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
        0,
        getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
      );
      weaponPosition.y = getTerrainHeight(weaponPosition.x, weaponPosition.z) + 1;
    }
  }

  weaponMesh.position.copy(weaponPosition);
  threeScene.scene.add(weaponMesh);

  // Create floating arrow indicator above the weapon
  const arrowGeometry = assets.geometries.arrow;
  const arrowMaterial = assets.materials.arrow;
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  // Create a shield-like armor pickup
  const armorGeometry = assets.geometries.armorPickup;
  const armorMaterial = assets.materials.armorPickup;
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
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    
    // Adjust height to terrain
    armorPosition.y = getTerrainHeight(armorPosition.x, armorPosition.z) + 1;

    attempts++;
  } while (attempts < maxAttempts && isPositionBlocked(world, armorPosition));

  // If we couldn't find a good position, just use a random one anyway
  if (attempts >= maxAttempts) {
    armorPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    armorPosition.y = getTerrainHeight(armorPosition.x, armorPosition.z) + 1;
  }

  armorMesh.position.copy(armorPosition);
  threeScene.scene.add(armorMesh);

  // Create floating arrow indicator above the armor
  const arrowGeometry = assets.geometries.arrow;
  const arrowMaterial = assets.materials.arrowArmor;
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

export function createCollectable(world, position) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  const geo = new THREE.OctahedronGeometry(0.5, 0);
  const mat = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    emissive: 0xaa5500,
    emissiveIntensity: 0.4,
    shininess: 100
  });
  const mesh = new THREE.Mesh(geo, mat);
  
  const light = new THREE.PointLight(0xffd700, 0.8, 6);
  mesh.add(light);

  mesh.position.copy(position);
  threeScene.scene.add(mesh);

  world
    .createEntity()
    .add(new ThreeObject(mesh))
    .add(new Collider(new THREE.Box3().setFromObject(mesh)))
    .add(new Collectable());
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
    
    // Adjust height to terrain
    position.y = getTerrainHeight(position.x, position.z);

    attempts++;
  } while (attempts < maxAttempts && isPositionBlocked(world, position));

  // If we couldn't find a good position, just use a random one anyway
  if (attempts >= maxAttempts) {
    position = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10),
      0,
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10)
    );
    position.y = getTerrainHeight(position.x, position.z);
  }

  createCollectable(world, position);
}

function isPositionBlocked(world, position) {
  const obstacles = world.getAllTagged(Obstacle);
  // Create a test box sized for collectables (1-unit octahedron) with some padding
  // Collectables are positioned at y=1.5 (relative to ground)
  const testBox = new THREE.Box3(
    new THREE.Vector3(position.x - 1.5, position.y - 0.5, position.z - 1.5),
    new THREE.Vector3(position.x + 1.5, position.y + 2.5, position.z + 1.5)
  );

  // Check distance from player - collectables must be at least 25 units away horizontally
  const player = world.getTagged(Player);
  if (player) {
    const playerObj = player.get(ThreeObject);
    if (playerObj) {
      const playerPos = playerObj.mesh.position;
      const horizontalDistance = Math.sqrt(
        Math.pow(position.x - playerPos.x, 2) +
        Math.pow(position.z - playerPos.z, 2)
      );
      if (horizontalDistance < 25) {
        return true; // Too close to player
      }
    }
  }

  for (const obstacle of obstacles) {
    const obstacleCollider = obstacle.get(Collider);
    const obstacleBoxes = Array.isArray(obstacleCollider.box)
      ? obstacleCollider.box
      : [obstacleCollider.box];

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
    });

    const rock = new THREE.Mesh(geometry, rockMat);
    rocks.push(rock);
  }

  // Position rocks... (logic omitted for brevity, assume same as before but adjusted)
  // Since we overwrite the file, I need to include the full logic.
  // Let's reuse the existing logic but ensure the base y is relative to 0 so when we move the group it works.
  
  if (size > 12) {
    if (formationType < 0.3) {
      rocks.forEach(rock => {
        rock.position.set(
          (Math.random() - 0.5) * size * 0.2,
          size * 0.3 + Math.random() * size * 0.4, 
          (Math.random() - 0.5) * size * 0.2
        );
        rock.rotation.set(
          Math.random() * Math.PI * 0.3 - Math.PI * 0.15,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.3 - Math.PI * 0.15
        );
        boulderGroup.add(rock);
      });
    } else if (formationType < 0.6) {
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
    if (formationType < 0.4) {
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
    if (formationType < 0.4) {
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

  const collisionBoxes = [];
  rocks.forEach(rock => {
    const rockBox = new THREE.Box3().setFromObject(rock);
    const shrinkFactor = 0.5;
    const center = rockBox.getCenter(new THREE.Vector3());
    const size = rockBox.getSize(new THREE.Vector3());
    const halfSize = size.clone().multiplyScalar(shrinkFactor * 0.5);
    const min = center.clone().sub(halfSize);
    const max = center.clone().add(halfSize);
    const shrunkBox = new THREE.Box3(min, max);
    shrunkBox.translate(boulderGroup.position);
    collisionBoxes.push(shrunkBox);
  });

  return { mesh: boulderGroup, collisionBoxes };
}

export function createTree(world, position) {
  const treeGroup = new THREE.Group();
  const isJoshuaTree = Math.random() < 0.4;

  if (isJoshuaTree) {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 6, 8);
    const trunkMat = new THREE.MeshPhongMaterial({
      color: 0x654321,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);

    trunk.rotation.y = Math.random() * Math.PI * 0.3 - Math.PI * 0.15;
    trunk.rotation.x = Math.random() * Math.PI * 0.2 - Math.PI * 0.1;
    trunk.position.y = 3;
    treeGroup.add(trunk);

    const leafColors = [0x228b22, 0x32cd32, 0x006400, 0x90ee90];
    for (let i = 0; i < 8; i++) {
      const leafGeo = new THREE.ConeGeometry(0.1, 1.5 + Math.random() * 1, 6);
      const leafMat = new THREE.MeshPhongMaterial({
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
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
      leaf.lookAt(
        new THREE.Vector3(Math.cos(angle) * 2, height, Math.sin(angle) * 2)
      );
      leaf.rotation.z += (Math.random() - 0.5) * 0.3;
      treeGroup.add(leaf);
    }
  } else {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
    const trunkMat = new THREE.MeshPhongMaterial({
      color: 0x8b4513,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    treeGroup.add(trunk);

    const foliageColors = [0x228b22, 0x32cd32, 0x006400];
    for (let i = 0; i < 3; i++) {
      const foliageGeo = new THREE.ConeGeometry(2 - i * 0.3, 2, 8);
      const foliageMat = new THREE.MeshPhongMaterial({
        color: foliageColors[i % foliageColors.length],
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

  const crateGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const crateMat = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
  });
  const crate = new THREE.Mesh(crateGeo, crateMat);
  crateGroup.add(crate);

  crateGroup.position.copy(position);
  return crateGroup;
}

export function createBarrel(world, position) {
  const barrelGroup = new THREE.Group();

  const barrelGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 12);
  const barrelMat = new THREE.MeshPhongMaterial({
    color: 0x666666,
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrelGroup.add(barrel);

  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 16);
    const ringMat = new THREE.MeshPhongMaterial({
      color: 0x444444,
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

  const logGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
  const logMat = new THREE.MeshPhongMaterial({
    color: 0x654321,
  });
  const log = new THREE.Mesh(logGeo, logMat);
  log.rotation.z = Math.PI / 2;
  log.position.y = 0.3;
  logGroup.add(log);

  logGroup.position.copy(position);
  return logGroup;
}

export function createStonePillar(world, position) {
  const pillarGroup = new THREE.Group();

  const pillarGeo = new THREE.CylinderGeometry(0.6, 0.8, 3, 8);
  const pillarMat = new THREE.MeshPhongMaterial({
    color: 0x888888,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 1.5;
  pillarGroup.add(pillar);

  const mossGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 8);
  const mossMat = new THREE.MeshPhongMaterial({
    color: 0x228b22,
  });
  const moss = new THREE.Mesh(mossGeo, mossMat);
  moss.position.y = 3.05;
  pillarGroup.add(moss);

  pillarGroup.position.copy(position);
  return pillarGroup;
}

export function createGrassPatch(world, position) {
  const grassGroup = new THREE.Group();

  for (let i = 0; i < 15; i++) {
    const bladeGeo = new THREE.PlaneGeometry(0.1, 0.8);
    const bladeMat = new THREE.MeshPhongMaterial({
      color: 0x228b22,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);

    blade.position.set(
      (Math.random() - 0.5) * 3,
      Math.random() * 0.4,
      (Math.random() - 0.5) * 3
    );
    blade.rotation.y = Math.random() * Math.PI * 2;
    blade.rotation.x = (Math.random() - 0.5) * 0.3;

    grassGroup.add(blade);
  }

  grassGroup.position.copy(position);
  return grassGroup;
}

export function createRuin(world, position) {
  const ruinGroup = new THREE.Group();

  const stoneColors = [0x888888, 0x999999, 0x777777];

  for (let i = 0; i < 5; i++) {
    const stoneGeo = new THREE.BoxGeometry(
      1 + Math.random() * 2,
      0.5 + Math.random() * 1.5,
      0.8 + Math.random() * 1.2
    );
    const stoneMat = new THREE.MeshPhongMaterial({
      color: stoneColors[Math.floor(Math.random() * stoneColors.length)],
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
    color: 0x8b4513,
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
  const assets = world.getResource(AssetLibrary);
  if (!threeScene || !assets) return;

  for (let i = 0; i < 25; i++) {
    const geo = assets.geometries.rocketExplosionParticle;
    const mat = assets.materials.explosionOrange;
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

  const explosionRadius = 10;
  applySplashDamage(world, position, 80, null, explosionRadius);
}
