/* -------------------------------------------------------------------------- */
/*                                   EVENTS                                   */
/* -------------------------------------------------------------------------- */

export class CollisionEvent {
  constructor(entityA, entityB) {
    this.entityA = entityA;
    this.entityB = entityB;
  }
}

export class PlayerDamagedEvent {}

export class PlayerHealedEvent {
  constructor(packEntity) {
    this.packEntity = packEntity;
  }
}

export class PlayerWeaponPickupEvent {
  constructor(pickupEntity) {
    this.pickupEntity = pickupEntity;
  }
}

export class PlayerDeathEvent {}
