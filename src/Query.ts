import { BitSet } from './BitSet';
import { ComponentRegistry } from './ComponentRegistry';
import Entity, { EntityId } from './Entity';
import World, { ClassConstructor } from './World';

export interface QueryDef<CT> {
  /** Must include ALL of these components */
  all?: ClassConstructor<CT>[];
  /** Must include AT LEAST ONE of these components */
  any?: ClassConstructor<CT>[];
  /** Must NOT include ANY of these components */
  none?: ClassConstructor<CT>[];
  /** Must include EXACTLY these components (no more, no less). Equivalent to 'same'. */
  only?: ClassConstructor<CT>[];
  /** Must include EXACTLY these components. Equivalent to 'only'. */
  same?: ClassConstructor<CT>[];
  /** Must NOT include EXACTLY these components. */
  different?: ClassConstructor<CT>[];
  /** Must include AT LEAST this many components */
  min?: number;
  /** Must include AT MOST this many components */
  max?: number;
}

export class Query<CT> {
  private world: World<CT>;

  // The cached result set managed by the World
  entities: Set<EntityId> = new Set();

  // The unique key identifying this query configuration
  readonly key: string;

  // BitMasks for fast checks
  private allMask: BitSet | null = null;
  private anyMask: BitSet | null = null;
  private noneMask: BitSet | null = null;
  private onlyMask: BitSet | null = null;
  private differentMask: BitSet | null = null;

  // Count constraints
  private minCount: number = 0;
  private maxCount: number = Infinity;

  // Track if this query relies on specific component indexes or global updates
  // 'Universal' queries (min, max, only, different) must be checked on every component change.
  readonly isUniversal: boolean;

  // Components that trigger this query
  readonly relevantComponents: Set<string> = new Set();

  constructor(world: World<CT>, def: QueryDef<CT>) {
    this.world = world;

    const keyParts: string[] = [];

    // -- ALL --
    if (def.all && def.all.length > 0) {
      const sorted = [...def.all].sort((a, b) => a.name.localeCompare(b.name));
      this.allMask = new BitSet();
      sorted.forEach(c => {
        this.allMask?.set(ComponentRegistry.getId(c));
        this.relevantComponents.add(c.name);
      });
      keyParts.push(`all:${sorted.map(c => c.name).join(',')}`);
    }

    // -- ANY (Some) --
    if (def.any && def.any.length > 0) {
      const sorted = [...def.any].sort((a, b) => a.name.localeCompare(b.name));
      this.anyMask = new BitSet();
      sorted.forEach(c => {
        this.anyMask?.set(ComponentRegistry.getId(c));
        this.relevantComponents.add(c.name);
      });
      keyParts.push(`any:${sorted.map(c => c.name).join(',')}`);
    }

    // -- NONE --
    if (def.none && def.none.length > 0) {
      const sorted = [...def.none].sort((a, b) => a.name.localeCompare(b.name));
      this.noneMask = new BitSet();
      sorted.forEach(c => {
        this.noneMask?.set(ComponentRegistry.getId(c));
        this.relevantComponents.add(c.name);
      });
      keyParts.push(`none:${sorted.map(c => c.name).join(',')}`);
    }

    // -- ONLY / SAME --
    const onlyList = def.only || def.same;
    if (onlyList && onlyList.length > 0) {
      const sorted = [...onlyList].sort((a, b) => a.name.localeCompare(b.name));
      this.onlyMask = new BitSet();
      sorted.forEach(c => this.onlyMask?.set(ComponentRegistry.getId(c)));
      // 'Only' implies global checking because adding an irrelevant component breaks the match
      keyParts.push(`only:${sorted.map(c => c.name).join(',')}`);
    }

    // -- DIFFERENT --
    if (def.different && def.different.length > 0) {
      const sorted = [...def.different].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      this.differentMask = new BitSet();
      sorted.forEach(c => this.differentMask?.set(ComponentRegistry.getId(c)));
      keyParts.push(`diff:${sorted.map(c => c.name).join(',')}`);
    }

    // -- MIN / MAX --
    if (def.min !== undefined) {
      this.minCount = def.min;
      keyParts.push(`min:${def.min}`);
    }
    if (def.max !== undefined) {
      this.maxCount = def.max;
      keyParts.push(`max:${def.max}`);
    }

    this.key = keyParts.join('|');

    // Determine if this query needs to be checked on EVERY component change
    // (vs just changes to relevant components)
    this.isUniversal =
      !!this.onlyMask ||
      !!this.differentMask ||
      this.minCount > 0 ||
      this.maxCount < Infinity;
  }

  /**
   * Checks if the entity matches the query criteria.
   */
  match(entity: Entity<CT>): boolean {
    const mask = entity.componentMask;

    // 1. All (Must contain all bits)
    if (this.allMask && !mask.contains(this.allMask)) return false;

    // 2. None (Must not share any bits)
    if (this.noneMask && mask.intersects(this.noneMask)) return false;

    // 3. Any (Must share at least one bit)
    if (this.anyMask && !mask.intersects(this.anyMask)) return false;

    // 4. Only/Same (Must be exactly equal)
    if (this.onlyMask && !mask.equals(this.onlyMask)) return false;

    // 5. Different (Must NOT be exactly equal)
    if (this.differentMask && mask.equals(this.differentMask)) return false;

    // 6. Counts
    if (this.minCount > 0 || this.maxCount < Infinity) {
      const count = mask.count();
      if (count < this.minCount || count > this.maxCount) return false;
    }

    return true;
  }

  /**
   * Make Query iterable.
   * Iterates over the entities currently in the result set.
   */
  *[Symbol.iterator](): Iterator<Entity<CT>> {
    for (const id of this.entities) {
      const entity = this.world.entities[id];
      if (entity) yield entity;
    }
  }

  /**
   * Returns the results as an array for easier filtering/mapping.
   */
  get(): Entity<CT>[] {
    return Array.from(this);
  }

  /**
   * Returns the first matching entity or null.
   */
  first(): Entity<CT> | null {
    const iter = this.entities.values();
    const firstId = iter.next().value;
    if (firstId !== undefined) {
      return this.world.entities[firstId] || null;
    }
    return null;
  }

  /**
   * Returns the number of matching entities.
   */
  get size(): number {
    return this.entities.size;
  }
}
