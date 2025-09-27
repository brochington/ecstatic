import { EntityState } from 'ecstatic';

import World from './World';
import Entity from './Entity';
import { Tag } from './Tag';

interface DevEntityTableRow {
  id: string;
  components: string;
  tags: string;
  systems: string;
}

class DevEntity<CT> {
  id: string;

  components: Record<string, CT>;

  tags: Tag[];

  systems: string[] = [];

  state: EntityState;

  constructor(entity: Entity<CT>, world: World<CT>) {
    this.id = entity.id;
    ((this.components = entity.components.toDevComponents()),
      (this.tags = [...entity.tags]));
    this.state = entity.state;

    const compNames = Object.keys(this.components);

    for (const [systemName, cNames] of world.systems.compNamesBySystemName) {
      if (cNames.every(cName => compNames.includes(cName))) {
        this.systems.push(systemName);
      }
    }
  }

  toTableRow(): DevEntityTableRow {
    return {
      id: this.id,
      components: Object.keys(this.components).join(', '),
      tags: this.tags.join(', '),
      systems: this.systems.join(', '),
    };
  }
}

export default DevEntity;
