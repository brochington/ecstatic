import * as THREE from 'three';
import { World } from 'ecstatic';
import { getRandomNumber } from '../utils/utils.js';
import {
  ThreeScene,
  Controls,
  InputState,
  GameConfig,
  WeaponSystem,
} from '../resources/resources.js';
import {
  GameState,
  ThreeObject,
  Velocity,
  Particle,
  Collider,
  Health,
  Armor,
  ArmorRegeneration,
  Player,
  Obstacle,
  HealthPack,
  EnemyAI,
  ScoutAI,
  TankAI,
  SniperAI,
  WeaponPickup,
  ArmorPickup,
  WeaponPickupArrow,
  HitFlash,
} from '../components/components.js';
import {
  PlayerHealedEvent,
  PlayerWeaponPickupEvent,
  PlayerArmorPickupEvent,
  CollisionEvent,
  PlayerDeathEvent,
} from '../events/events.js';
import {
  playerMovementSystem,
  weaponUpdateSystem,
  playerShootingSystem,
  enemySpawnerSystem,
  healthPackSpawnerSystem,
  weaponPickupSpawnerSystem,
  armorPickupSpawnerSystem,
  lifecycleSystem,
  updateCollidersSystem,
  updatePlayerColliderSystem,
  entityObstacleCollisionSystem,
  collisionSystem,
  movementSystem,
  particleMovementSystem,
  healthPackAnimationSystem,
  weaponPickupAnimationSystem,
  armorPickupAnimationSystem,
  weaponPickupArrowAnimationSystem,
  hitFlashSystem,
  enemyAISystem,
  scoutAISystem,
  tankAISystem,
  sniperAISystem,
  rocketExplosionSystem,
  deathSystem,
  damageSystem,
  armorRegenerationSystem,
  gameOverSystem,
  uiRenderSystem,
  damageIndicatorSystem,
  crosshairSystem,
  rendererSystem,
  cleanupSystem,
  groundCollisionSystem,
} from '../systems/systems.js';
import {
  createSkybox,
  createBoundaryWalls,
  createBoulder,
  createTree,
  createBushes,
  createCrate,
  createBarrel,
  createFallenLog,
  createStonePillar,
  createGrassPatch,
  createRuin,
} from '../entities/entities.js';

export const sceneSize = 400;

/* -------------------------------------------------------------------------- */
/*                           SYSTEM REGISTRATION                            */
/* -------------------------------------------------------------------------- */

function registerSystems(world) {
  world.setPhaseOrder(['Input', 'Logic', 'Events', 'Render', 'Cleanup']);

  world.addSystem([GameState], playerMovementSystem, {
    phase: 'Input',
  });
  world.addSystem([GameState], weaponUpdateSystem, {
    phase: 'Input',
  });
  world.addSystem([GameState], playerShootingSystem, {
    phase: 'Input',
  });

  world.addSystem([GameState], enemySpawnerSystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], healthPackSpawnerSystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], weaponPickupSpawnerSystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], armorPickupSpawnerSystem, {
    phase: 'Logic',
  });
  world.addSystem([lifecycleSystem], lifecycleSystem, {
    phase: 'Logic',
  });
  world.addSystem([Collider, ThreeObject], updateCollidersSystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], updatePlayerColliderSystem, {
    phase: 'Logic',
  });
  world.addSystem([Armor, ArmorRegeneration], armorRegenerationSystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], entityObstacleCollisionSystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], collisionSystem, {
    phase: 'Logic',
  });
  world.addSystem([Velocity, ThreeObject], movementSystem, {
    phase: 'Logic',
  });
  world.addSystem([Velocity, ThreeObject], groundCollisionSystem, {
    phase: 'Logic',
  });
  world.addSystem([Velocity, Particle], particleMovementSystem, {
    phase: 'Logic',
  });
  world.addSystem([HealthPack, ThreeObject], healthPackAnimationSystem, {
    phase: 'Logic',
  });
  world.addSystem([WeaponPickup, ThreeObject], weaponPickupAnimationSystem, {
    phase: 'Logic',
  });
  world.addSystem([ArmorPickup, ThreeObject], armorPickupAnimationSystem, {
    phase: 'Logic',
  });
  world.addSystem(
    [WeaponPickupArrow, ThreeObject],
    weaponPickupArrowAnimationSystem,
    {
      phase: 'Logic',
    }
  );
  world.addSystem([HitFlash, ThreeObject, Health], hitFlashSystem, {
    phase: 'Logic',
  });
  world.addSystem([EnemyAI, ThreeObject, Velocity], enemyAISystem, {
    phase: 'Logic',
  });
  world.addSystem([ScoutAI, ThreeObject, Velocity], scoutAISystem, {
    phase: 'Logic',
  });
  world.addSystem([TankAI, ThreeObject, Velocity], tankAISystem, {
    phase: 'Logic',
  });
  world.addSystem([SniperAI, ThreeObject, Velocity], sniperAISystem, {
    phase: 'Logic',
  });
  world.addSystem([GameState], rocketExplosionSystem, {
    phase: 'Logic',
  });
  world.addSystem([Health], deathSystem, {
    phase: 'Logic',
  });

  world.addSystemListener(CollisionEvent, damageSystem, {
    phase: 'Events',
  });
  world.addSystemListener(PlayerDeathEvent, gameOverSystem, {
    phase: 'Events',
  });

  world.addSystem([GameState], uiRenderSystem, {
    phase: 'Render',
  });
  world.addSystem([GameState], damageIndicatorSystem, {
    phase: 'Render',
  });
  world.addSystem([GameState], crosshairSystem, {
    phase: 'Render',
  });
  // world.addSystem([GameState], splatterFadeSystem, {
  //   phase: 'Render'
  // });
  world.addSystem([GameState], rendererSystem, {
    phase: 'Render',
  });

  world.addSystem([GameState], cleanupSystem, {
    phase: 'Cleanup',
  });
}

/* -------------------------------------------------------------------------- */
/*                               INITIALIZATION                               */
/* -------------------------------------------------------------------------- */

function initializeGame(world) {
  const threeScene = new ThreeScene();
  world.setResource(threeScene);
  world.setResource(
    new Controls(threeScene.camera, threeScene.renderer.domElement)
  );
  world.setResource(new InputState());
  world.setResource(new GameConfig());
  world.setResource(new WeaponSystem());
  world.createEntity().add(new GameState());

  createSkybox(threeScene.scene);
  createBoundaryWalls(world, threeScene);

  // Create more natural ground with grass-like appearance
  const groundGeo = new THREE.PlaneGeometry(sceneSize, sceneSize, 32, 32);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0x228b22, // Bright green grass color
    transparent: false,
    shininess: 0,
  });

  // Add some height variation to make ground less flat
  const positions = groundGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    // Create subtle rolling hills
    const height = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.2;
    positions.setY(i, height);
  }
  groundGeo.computeVertexNormals();

  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  threeScene.scene.add(ground);

  // Add ground as an obstacle to prevent entities from falling through
  // Create a proper bounding box for the ground plane
  const groundBox = new THREE.Box3(
    new THREE.Vector3(-sceneSize / 2, -0.5, -sceneSize / 2),
    new THREE.Vector3(sceneSize / 2, 0.5, sceneSize / 2)
  );
  world
    .createEntity()
    .add(new ThreeObject(ground))
    .add(new Collider(groundBox))
    .addTag(Obstacle);

  // Create massive rock formations like Joshua Tree Desert
  const numFormations = 80 + Math.floor(Math.random() * 40); // 80-120 formations

  for (let i = 0; i < numFormations; i++) {
    // Vary sizes dramatically - from small rocks to massive formations
    const boulderSize = getRandomNumber(1.5, 18); // Much larger range

    // Position formations with spacing to accommodate massive ones
    const minDistance = 8 + boulderSize; // Larger formations need much more space
    const boulderPosition = new THREE.Vector3(
      getRandomNumber(
        -sceneSize / 2 + minDistance,
        sceneSize / 2 - minDistance
      ),
      0,
      getRandomNumber(-sceneSize / 2 + minDistance, sceneSize / 2 - minDistance)
    );

    const boulder = createBoulder(world, boulderPosition, boulderSize);
    threeScene.scene.add(boulder);

    // Create bounding box for collision detection
    const boulderBox = new THREE.Box3().setFromObject(boulder);
    world
      .createEntity()
      .add(new ThreeObject(boulder))
      .add(new Collider(boulderBox))
      .addTag(Obstacle);
  }

  // Add abundant desert trees like Joshua Tree Desert
  for (let i = 0; i < 65; i++) {
    const treePosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 12, sceneSize / 2 - 12),
      0,
      getRandomNumber(-sceneSize / 2 + 12, sceneSize / 2 - 12)
    );
    const tree = createTree(world, treePosition);
    threeScene.scene.add(tree);
  }

  // Add many bushes
  for (let i = 0; i < 35; i++) {
    const bushPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 8, sceneSize / 2 - 8),
      0,
      getRandomNumber(-sceneSize / 2 + 8, sceneSize / 2 - 8)
    );
    const bush = createBushes(world, bushPosition);
    threeScene.scene.add(bush);
  }

  // Add crates for cover and atmosphere
  for (let i = 0; i < 18; i++) {
    const cratePosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10),
      0,
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10)
    );
    const crate = createCrate(world, cratePosition);
    threeScene.scene.add(crate);

    // Create bounding box for collision detection
    const crateBox = new THREE.Box3().setFromObject(crate);
    world
      .createEntity()
      .add(new ThreeObject(crate))
      .add(new Collider(crateBox))
      .addTag(Obstacle);
  }

  // Add barrels for cover
  for (let i = 0; i < 15; i++) {
    const barrelPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 8, sceneSize / 2 - 8),
      0,
      getRandomNumber(-sceneSize / 2 + 8, sceneSize / 2 - 8)
    );
    const barrel = createBarrel(world, barrelPosition);
    threeScene.scene.add(barrel);

    // Create bounding box for collision detection
    const barrelBox = new THREE.Box3().setFromObject(barrel);
    world
      .createEntity()
      .add(new ThreeObject(barrel))
      .add(new Collider(barrelBox))
      .addTag(Obstacle);
  }

  // Add fallen logs
  for (let i = 0; i < 12; i++) {
    const logPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 8, sceneSize / 2 - 8),
      0,
      getRandomNumber(-sceneSize / 2 + 8, sceneSize / 2 - 8)
    );
    const log = createFallenLog(world, logPosition);
    threeScene.scene.add(log);

    // Create bounding box for collision detection
    const logBox = new THREE.Box3().setFromObject(log);
    world
      .createEntity()
      .add(new ThreeObject(log))
      .add(new Collider(logBox))
      .addTag(Obstacle);
  }

  // Add stone pillars
  for (let i = 0; i < 10; i++) {
    const pillarPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10),
      0,
      getRandomNumber(-sceneSize / 2 + 10, sceneSize / 2 - 10)
    );
    const pillar = createStonePillar(world, pillarPosition);
    threeScene.scene.add(pillar);

    // Create bounding box for collision detection
    const pillarBox = new THREE.Box3().setFromObject(pillar);
    world
      .createEntity()
      .add(new ThreeObject(pillar))
      .add(new Collider(pillarBox))
      .addTag(Obstacle);
  }

  // Add grass patches
  for (let i = 0; i < 20; i++) {
    const grassPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5),
      0,
      getRandomNumber(-sceneSize / 2 + 5, sceneSize / 2 - 5)
    );
    const grass = createGrassPatch(world, grassPosition);
    threeScene.scene.add(grass);
  }

  // Add ancient ruins
  for (let i = 0; i < 6; i++) {
    const ruinPosition = new THREE.Vector3(
      getRandomNumber(-sceneSize / 2 + 15, sceneSize / 2 - 15),
      0,
      getRandomNumber(-sceneSize / 2 + 15, sceneSize / 2 - 15)
    );
    const ruin = createRuin(world, ruinPosition);
    threeScene.scene.add(ruin);

    // Create bounding box for collision detection (rough approximation)
    const ruinBox = new THREE.Box3().setFromObject(ruin);
    world
      .createEntity()
      .add(new ThreeObject(ruin))
      .add(new Collider(ruinBox))
      .addTag(Obstacle);
  }

  const playerContainer = new THREE.Object3D();
  playerContainer.position.set(0, 1.7, 0);
  threeScene.scene.add(playerContainer);
  threeScene.camera.position.set(0, 0, 0);
  playerContainer.add(threeScene.camera);

  const playerCollider = new Collider(
    new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 2, 1)
    )
  );

  world
    .createEntity()
    .add(new ThreeObject(playerContainer))
    .add(new Velocity())
    .add(new Health(100, 100))
    .add(new Armor(100, 100)) // Start with full armor
    .add(new ArmorRegeneration(5, 120)) // Regenerate 5 armor per second after 2 seconds delay
    .add(playerCollider)
    .addTag(Player);
}

/* -------------------------------------------------------------------------- */
/*                                INPUT HANDLING                              */
/* -------------------------------------------------------------------------- */

function setupInput(world) {
  const gameOverScreen = document.getElementById('game-over-screen');

  // Remove existing event listeners to prevent duplicates after reset
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('mousedown', handleMouseDown);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('wheel', handleWheel);

  // Define event handlers that fetch resources dynamically
  function handleKeyDown(e) {
    const input = world.getResource(InputState);
    const weaponSystem = world.getResource(WeaponSystem);
    if (!input) return;

    if (e.key === 'w' || e.key === 'ArrowUp') input.forward = true;
    if (e.key === 's' || e.key === 'ArrowDown') input.backward = true;
    if (e.key === 'a' || e.key === 'ArrowLeft') input.left = true;
    if (e.key === 'd' || e.key === 'ArrowRight') input.right = true;

    // Weapon switching
    if (weaponSystem) {
      if (e.key === '1') weaponSystem.switchWeapon(0); // Pistol
      if (e.key === '2') weaponSystem.switchWeapon(1); // Shotgun
      if (e.key === '3') weaponSystem.switchWeapon(2); // Machine Gun
      if (e.key === '4') weaponSystem.switchWeapon(3); // Rocket Launcher
      if (e.key === 'q' || e.key === 'Q') weaponSystem.previousWeapon();
      if (e.key === 'e' || e.key === 'E') weaponSystem.nextWeapon();
    }
  }

  function handleKeyUp(e) {
    const input = world.getResource(InputState);
    if (!input) return;
    if (e.key === 'w' || e.key === 'ArrowUp') input.forward = false;
    if (e.key === 's' || e.key === 'ArrowDown') input.backward = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') input.left = false;
    if (e.key === 'd' || e.key === 'ArrowRight') input.right = false;
  }

  function handleMouseDown() {
    const input = world.getResource(InputState);
    const controls = world.getResource(Controls);
    const gameStateEntity = world.locate(GameState);
    if (!input || !controls || !gameStateEntity) return;
    const gameState = gameStateEntity.get(GameState);

    if (controls.pointerLock.isLocked) {
      input.shoot = true;
    } else if (!gameState.isGameOver) {
      controls.pointerLock.lock();
    }
  }

  function handleMouseUp() {
    const input = world.getResource(InputState);
    if (!input) return;
    input.shoot = false;
    input.shootReleased = true;
  }

  function handleWheel(e) {
    const weaponSystem = world.getResource(WeaponSystem);
    if (!weaponSystem) return;

    if (e.deltaY > 0) {
      weaponSystem.nextWeapon();
    } else {
      weaponSystem.previousWeapon();
    }
    e.preventDefault();
  }

  // Add event listeners
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('wheel', handleWheel, { passive: false });

  window.addEventListener('resize', () => {
    const threeScene = world.getResource(ThreeScene);
    if (!threeScene) return;
    threeScene.camera.aspect = window.innerWidth / window.innerHeight;
    threeScene.camera.updateProjectionMatrix();
    threeScene.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  gameOverScreen.addEventListener('click', () => {
    const gameStateEntity = world.locate(GameState);
    if (!gameStateEntity) return;
    const gameState = gameStateEntity.get(GameState);
    if (gameState.isGameOver) {
      resetGame(world);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                                  GAME LOGIC                                */
/* -------------------------------------------------------------------------- */

function resetGame(world) {
  // Destroy all entities immediately
  world.entities.forEach(entity => entity.destroyImmediately());

  // Clear resources
  world.removeResource(ThreeScene);
  world.removeResource(Controls);
  world.removeResource(InputState);
  world.removeResource(GameConfig);
  world.removeResource(WeaponSystem);

  document.getElementById('game-over-screen').style.display = 'none';
  document.getElementById('health-bar').style.width = '100%';
  document.getElementById('armor-bar').style.width = '0%';
  document.getElementById('current-weapon').innerText = 'Pistol';
  document.getElementById('current-ammo').innerText = '∞';
  document.getElementById('weapon-icon').innerText = '🔫';
  document.getElementById('kills').textContent = '0';
  document.getElementById('score').textContent = '0';

  initializeGame(world);
  setupInput(world);

  // Re-lock the pointer for the new game
  const controls = world.getResource(Controls);
  if (controls) {
    controls.pointerLock.lock();
  }
}

function gameLoop(world) {
  const gameStateEntity = world.locate(GameState);
  if (gameStateEntity) {
    const gameState = gameStateEntity.get(GameState);
    if (gameState.isGameOver) {
      rendererSystem({
        world,
      });
      uiRenderSystem({
        world,
      });
    } else {
      world.systems.run();
    }
  }
  requestAnimationFrame(() => gameLoop(world));
}

function setupEventListeners(world) {
  world.addSystemListener(
    PlayerHealedEvent,
    ({ event }) => {
      const player = world.getTagged(Player);
      if (!player) return;

      const pack = event.packEntity;

      // Check if the pack entity still exists and has the HealthPack component
      if (pack && pack.has(HealthPack)) {
        const health = player.get(Health);
        health.value = Math.min(health.maxValue, health.value + 50);

        // Destroy the health pack entity
        pack.destroy();
      }
    },
    {
      phase: 'Events',
    }
  );

  world.addSystemListener(
    PlayerWeaponPickupEvent,
    ({ event }) => {
      const weaponSystem = world.getResource(WeaponSystem);
      if (!weaponSystem) return;

      const pickup = event.pickupEntity;

      // Check if the pickup entity still exists and has the WeaponPickup component
      if (pickup && pickup.has(WeaponPickup)) {
        const weaponPickup = pickup.get(WeaponPickup);

        // Auto-switch to the picked up weapon
        const weaponIndex = weaponSystem.weapons.findIndex(
          w => w.type === weaponPickup.weaponType
        );
        if (weaponIndex !== -1) {
          weaponSystem.switchWeapon(weaponIndex);
        }

        // Destroy the pickup
        pickup.destroy();
      }
    },
    {
      phase: 'Events',
    }
  );

  world.addSystemListener(
    PlayerArmorPickupEvent,
    ({ event }) => {
      const player = world.getTagged(Player);
      if (!player) return;

      const pickup = event.pickupEntity;

      // Check if the pickup entity still exists and has the ArmorPickup component
      if (pickup && pickup.has(ArmorPickup)) {
        const armorPickup = pickup.get(ArmorPickup);

        // Add armor to player (up to max armor)
        if (player.has(Armor)) {
          const armor = player.get(Armor);
          armor.value = Math.min(
            armor.maxValue,
            armor.value + armorPickup.armorAmount
          );
        }

        // Destroy the pickup
        pickup.destroy();
      }
    },
    {
      phase: 'Events',
    }
  );
}

export function startGame() {
  const world = new World();

  registerSystems(world);
  setupEventListeners(world);
  initializeGame(world);
  setupInput(world);
  gameLoop(world);

  return world;
}
