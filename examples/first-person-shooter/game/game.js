import * as THREE from 'three';
import { World } from 'ecstatic';
import { getRandomNumber } from '../utils/utils.js';
import { MobileControls } from '../mobile-controls.js';
import {
  ThreeScene,
  Controls,
  InputState,
  GameConfig,
  WeaponSystem,
  AssetLibrary,
  QueryCache,
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
  Collectable,
  Boulder,
  Expires,
  Projectile,
  DamageIndicator,
} from '../components/components.js';
import {
  PlayerHealedEvent,
  PlayerWeaponPickupEvent,
  PlayerArmorPickupEvent,
  PlayerCollectablePickupEvent,
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
  collectableSpawnerSystem,
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
  collectableAnimationSystem,
  weaponPickupArrowAnimationSystem,
  hitFlashSystem,
  enemyAISystem,
  scoutAISystem,
  tankAISystem,
  sniperAISystem,
  deathSystem,
  damageSystem,
  armorRegenerationSystem,
  gameOverSystem,
  uiRenderSystem,
  damageIndicatorSystem,
  crosshairSystem,
  cameraControlSystem,
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
  world.addSystem([GameState], collectableSpawnerSystem, {
    phase: 'Logic',
  });
  world.addSystem([Expires], lifecycleSystem, {
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
  world.addSystem([Collectable, ThreeObject], collectableAnimationSystem, {
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
  world.addSystem([GameState], cameraControlSystem, {
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

  // Initialize mobile controls first to determine if we're on mobile
  const mobileControls = new MobileControls();
  world.setResource(mobileControls);

  const assetLibrary = new AssetLibrary();
  assetLibrary.init(threeScene.groundClippingPlane);
  world.setResource(assetLibrary);

  // Pass mobile flag to weapon system for performance optimization
  world.setResource(new WeaponSystem(mobileControls.isMobile));

  // Initialize QueryCache with commonly-used queries for performance
  const queryCache = new QueryCache();
  world.setResource(queryCache);
  
  // Create persistent queries that auto-update when entities change
  queryCache.projectiles = world.query({ all: [Projectile, Collider] });
  queryCache.healthPacks = world.query({ all: [HealthPack] });
  queryCache.weaponPickups = world.query({ all: [WeaponPickup] });
  queryCache.armorPickups = world.query({ all: [ArmorPickup] });
  queryCache.collectables = world.query({ all: [Collectable] });
  queryCache.armorRegenPlayers = world.query({ all: [Armor, ArmorRegeneration] });
  queryCache.weaponPickupArrows = world.query({ all: [WeaponPickupArrow] });
  queryCache.damageIndicators = world.query({ all: [DamageIndicator] });
  
  // Query for all enemy types - uses ANY to match any enemy AI component
  queryCache.allEnemies = world.query({ 
    any: [EnemyAI, ScoutAI, TankAI, SniperAI],
    all: [Collider]
  });
  
  // Query for enemies with collision components (for obstacle avoidance)
  queryCache.enemiesWithAI = world.query({
    any: [EnemyAI, ScoutAI, TankAI, SniperAI],
    all: [ThreeObject, Collider]
  });

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
    const y = positions.getY(i);
    // Create subtle rolling hills
    const height = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 0.2;
    positions.setZ(i, height);
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

    const boulderData = createBoulder(world, boulderPosition, boulderSize);
    threeScene.scene.add(boulderData.mesh);

    // Use individual rock collision boxes instead of one large box for more accurate collision
    world
      .createEntity()
      .add(new ThreeObject(boulderData.mesh))
      .add(new Collider(boulderData.collisionBoxes)) // Store array of collision boxes
      .addTag(Obstacle)
      .addTag(Boulder);
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

    // Create bounding box for collision detection
    const treeBox = new THREE.Box3().setFromObject(tree);
    treeBox.expandByScalar(0.5); // Add some padding for trees
    world
      .createEntity()
      .add(new ThreeObject(tree))
      .add(new Collider(treeBox))
      .addTag(Obstacle);
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

    // Create bounding box for collision detection
    const bushBox = new THREE.Box3().setFromObject(bush);
    bushBox.expandByScalar(0.3); // Smaller padding for bushes
    world
      .createEntity()
      .add(new ThreeObject(bush))
      .add(new Collider(bushBox))
      .addTag(Obstacle);
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

    // Create bounding box for collision detection with some padding
    const crateBox = new THREE.Box3().setFromObject(crate);
    crateBox.expandByScalar(0.2); // Small padding for crates
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

    // Create bounding box for collision detection with some padding
    const barrelBox = new THREE.Box3().setFromObject(barrel);
    barrelBox.expandByScalar(0.2); // Small padding for barrels
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

    // Create bounding box for collision detection with some padding
    const logBox = new THREE.Box3().setFromObject(log);
    logBox.expandByScalar(0.3); // More padding for logs since they can be long
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

    // Create bounding box for collision detection with some padding
    const pillarBox = new THREE.Box3().setFromObject(pillar);
    pillarBox.expandByScalar(0.2); // Small padding for pillars
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

    // Create bounding box for collision detection with padding to prevent getting stuck
    const ruinBox = new THREE.Box3().setFromObject(ruin);
    ruinBox.expandByScalar(0.5); // More padding for complex ruin structures
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
  const mobileControls = world.getResource(MobileControls);
  const isMobile = mobileControls && mobileControls.isMobile;

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

  // Add event listeners - only desktop controls on non-mobile devices
  if (!isMobile) {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel, { passive: false });
  } else {
    // Setup mobile weapon switching callback
    mobileControls.onWeaponSwitch = weaponIndex => {
      const weaponSystem = world.getResource(WeaponSystem);
      if (weaponSystem) {
        if (weaponIndex === -1) {
          // Cycle to next weapon
          weaponSystem.nextWeapon();
        } else {
          // Switch to specific weapon
          weaponSystem.switchWeapon(weaponIndex);
        }
      }
    };
  }

  window.addEventListener('resize', () => {
    const threeScene = world.getResource(ThreeScene);
    const mobileControls = world.getResource(MobileControls);
    if (!threeScene) return;

    // Set appropriate resolution based on device
    const isMobile = mobileControls && mobileControls.isMobile;
    let renderWidth, renderHeight;

    if (isMobile) {
      // Use a reasonable resolution for mobile devices (around 720p equivalent)
      const maxMobileWidth = 1280;
      const maxMobileHeight = 720;
      const aspectRatio = window.innerWidth / window.innerHeight;

      if (aspectRatio > 16 / 9) {
        // Wide screen (landscape)
        renderWidth = maxMobileWidth;
        renderHeight = Math.round(maxMobileWidth / aspectRatio);
      } else {
        // Tall screen (portrait or near-square)
        renderHeight = maxMobileHeight;
        renderWidth = Math.round(maxMobileHeight * aspectRatio);
      }

      // Ensure minimum resolution
      renderWidth = Math.max(renderWidth, 640);
      renderHeight = Math.max(renderHeight, 360);
    } else {
      // Desktop: use window size
      renderWidth = window.innerWidth;
      renderHeight = window.innerHeight;
    }

    threeScene.camera.aspect = window.innerWidth / window.innerHeight;
    threeScene.camera.updateProjectionMatrix();
    threeScene.renderer.setSize(renderWidth, renderHeight);
  });

  gameOverScreen.onclick = () => {
    const gameStateEntity = world.locate(GameState);
    if (!gameStateEntity) return;
    const gameState = gameStateEntity.get(GameState);
    if (gameState.isGameOver) {
      resetGame(world);
    }
  };
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
  world.removeResource(MobileControls);
  world.removeResource(AssetLibrary);

  document.getElementById('game-over-screen').style.display = 'none';
  document.getElementById('health-bar').style.width = '100%';
  document.getElementById('armor-bar').style.width = '0%';
  document.getElementById('current-weapon').innerText = 'Pistol';
  document.getElementById('current-ammo').innerText = '∞';
  document.getElementById('weapon-icon').innerText = '🔫';
  document.getElementById('kills').textContent = '0';
  document.getElementById('score').textContent = '0';
  document.getElementById('collectables').textContent = '0/10';

  initializeGame(world);
  setupInput(world);

  // Re-lock the pointer for the new game
  const controls = world.getResource(Controls);
  if (controls) {
    controls.pointerLock.lock();
  }
}

let lastTime = 0;
window.gameSpeed = 1.0;

function gameLoop(world, currentTime = 0) {
  try {
    const dt = currentTime - lastTime;
    lastTime = currentTime;

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
        // Cap dt to avoid spiral of death on lag spikes
        const cappedDt = Math.min(dt, 100) * window.gameSpeed;
        world.systems.run({ dt: cappedDt });
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ERROR in gameLoop:', error);
    // eslint-disable-next-line no-console
    console.error('Stack trace:', error.stack);
  }

  requestAnimationFrame(time => gameLoop(world, time));
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

        // Find the weapon and add ammo instead of switching
        const weaponIndex = weaponSystem.weapons.findIndex(
          w => w.type === weaponPickup.weaponType
        );
        if (weaponIndex !== -1) {
          const weapon = weaponSystem.weapons[weaponIndex];
          // Add ammo to the weapon (give a reasonable amount)
          const ammoToAdd =
            weapon.type === 'shotgun'
              ? 10
              : weapon.type === 'machinegun'
                ? 30
                : weapon.type === 'rocket'
                  ? 3
                  : weapon.type === 'flamethrower'
                    ? 50
                    : 0;

          if (weapon.ammo !== Infinity) {
            weapon.ammo = Math.min(weapon.ammo + ammoToAdd, weapon.maxAmmo);
          }

          // Only switch to the weapon if it's currently out of ammo
          const currentWeapon = weaponSystem.getCurrentWeapon();
          if (currentWeapon.ammo <= 0) {
            weaponSystem.switchWeapon(weaponIndex);
          }
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

  world.addSystemListener(
    PlayerCollectablePickupEvent,
    ({ event }) => {
      const gameStateEntity = world.locate(GameState);
      if (!gameStateEntity) return;

      const collectable = event.collectableEntity;

      // Check if the collectable entity still exists and has the Collectable component
      if (collectable && collectable.has(Collectable)) {
        const gameState = gameStateEntity.get(GameState);
        gameState.collectablesCollected++;

        // Check for win condition
        if (gameState.collectablesCollected >= 10) {
          // Player wins! Show win screen
          showWinScreen(world);
        }

        // Destroy the collectable
        collectable.destroy();
      }
    },
    {
      phase: 'Events',
    }
  );
}

function showWinScreen(world) {
  const gameStateEntity = world.locate(GameState);
  if (!gameStateEntity) return;
  const gameState = gameStateEntity.get(GameState);

  // Create win screen overlay
  const winScreen = document.createElement('div');
  winScreen.id = 'win-screen';
  winScreen.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    pointer-events: auto;
    cursor: pointer;
    z-index: 1000;
  `;

  winScreen.innerHTML = `
    <h1 style="font-size: 4em; color: #ffd700; margin: 0; text-shadow: 2px 2px 4px black;">VICTORY!</h1>
    <p style="font-size: 1.5em; margin: 20px 0;">You collected all 10 collectables!</p>
    <p style="font-size: 1.2em; margin: 10px 0;">Kills: ${gameState.kills}</p>
    <p style="font-size: 1.2em; margin: 10px 0;">Score: ${gameState.score}</p>
    <p style="font-size: 1.2em; margin: 20px 0;">Click to Play Again</p>
  `;

  winScreen.addEventListener('click', () => {
    winScreen.remove();
    resetGame(world);
  });

  document.body.appendChild(winScreen);

  // Set game as over to prevent further updates
  gameState.isGameOver = true;
}

export function startGame() {
  const world = new World();

  registerSystems(world);
  setupEventListeners(world);
  initializeGame(world);
  setupInput(world);
  gameLoop(world);

  // Expose for debugging
  window.gameWorld = world;
  window.MobileControls = MobileControls;

  return world;
}
