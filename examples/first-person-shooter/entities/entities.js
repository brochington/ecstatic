import { getRandomNumber } from '../utils/utils.js';
import * as THREE from 'three';
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
      .add(new Expires(120))
      .add(new Projectile(firedByTag, damage))
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

  packMesh.position.set(
    getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
    1,
    getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
  );
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

export function spawnWeaponPickup(world, weaponType = null) {
  const threeScene = world.getResource(ThreeScene);
  if (!threeScene) return;

  // If no weapon type specified, randomly choose one (excluding pistol since player starts with it)
  if (!weaponType) {
    const weaponTypes = ['shotgun', 'machinegun', 'rocket'];
    weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
  }

  // Different appearances based on weapon type
  let geometry, material;
  switch (weaponType) {
    case 'shotgun':
      geometry = new THREE.BoxGeometry(0.8, 0.3, 0.2);
      material = new THREE.MeshPhongMaterial({
        color: 0x8b4513, // Brown wood-like
        emissive: 0x331100,
        emissiveIntensity: 0.2,
      });
      break;
    case 'machinegun':
      geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
      material = new THREE.MeshPhongMaterial({
        color: 0x666666, // Metallic gray
        emissive: 0x222222,
        emissiveIntensity: 0.3,
      });
      break;
    case 'rocket':
      geometry = new THREE.ConeGeometry(0.25, 0.8, 8);
      material = new THREE.MeshPhongMaterial({
        color: 0x444444, // Dark gray
        emissive: 0x220000,
        emissiveIntensity: 0.4,
      });
      break;
    default:
      return; // Invalid weapon type
  }

  material.clippingPlanes = [world.getResource(ThreeScene).groundClippingPlane];
  const weaponMesh = new THREE.Mesh(geometry, material);

  // Add a subtle pulsing light
  const weaponLight = new THREE.PointLight(0x00ff88, 0.3, 3);
  weaponMesh.add(weaponLight);

  const weaponPosition = new THREE.Vector3(
    getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
    1,
    getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
  );

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

  // Decide on formation type: pile, outcropping, or scattered rocks
  const formationType = Math.random();
  let numRocks;

  if (formationType < 0.4) {
    // Rock pile - clustered rocks
    numRocks = getRandomNumber(4, 8);
  } else if (formationType < 0.7) {
    // Outcropping - larger rocks emerging from ground
    numRocks = getRandomNumber(2, 5);
  } else {
    // Scattered rocks - individual boulders
    numRocks = getRandomNumber(1, 3);
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

  // Position rocks to create natural formations
  if (formationType < 0.4) {
    // Rock pile - cluster rocks together with some buried in ground
    rocks.forEach((rock, index) => {
      const angle = (index / rocks.length) * Math.PI * 2;
      const radius = size * (0.3 + Math.random() * 0.4);
      const height = -size * 0.3 + Math.random() * size * 0.8; // Some buried, some above

      rock.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Add some random offset
      rock.position.x += (Math.random() - 0.5) * size * 0.3;
      rock.position.z += (Math.random() - 0.5) * size * 0.3;

      // Rotate randomly for natural look
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
        Math.random() * Math.PI * 0.5 - Math.PI * 0.25, // Tilt slightly
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
        -size * 0.2 + Math.random() * size * 0.4, // Partially buried
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

  boulderGroup.position.copy(position);
  // Don't add extra height offset since rocks are positioned relative to ground

  return boulderGroup;
}

export function createTree(world, position) {
  const treeGroup = new THREE.Group();

  // Tree trunk
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

  // Check for enemies in explosion radius
  const explosionRadius = 4;
  const enemies = world.locateAll([
    EnemyAI,
    ScoutAI,
    TankAI,
    SniperAI,
    ThreeObject,
  ]);

  for (const enemy of enemies) {
    if (enemy.state === 'created') {
      const enemyPos = enemy.get(ThreeObject).mesh.position;
      const distance = position.distanceTo(enemyPos);

      if (distance <= explosionRadius) {
        // Damage decreases with distance
        const damage = Math.max(10, 40 * (1 - distance / explosionRadius));
        if (enemy.has(Health)) {
          const health = enemy.get(Health);
          health.value -= damage;
        }
      }
    }
  }

  // Check for player in explosion radius
  const player = world.getTagged(Player);
  if (player && player.state === 'created') {
    const playerPos = player.get(ThreeObject).mesh.position;
    const distance = position.distanceTo(playerPos);

    if (distance <= explosionRadius) {
      const damage = Math.max(5, 30 * (1 - distance / explosionRadius));
      if (player.has(Health)) {
        const health = player.get(Health);
        health.value -= damage;
        world.events.emit(new PlayerDamagedEvent());
      }
    }
  }
}
