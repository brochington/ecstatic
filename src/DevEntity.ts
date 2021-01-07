import World, { Class } from "./World";
import Entity from "./Entity";
import { Tag } from "./Tag";

class DevEntity<CT extends Class<any>> {
  id: string;

  components: Record<string, InstanceType<CT>>;

  tags: Tag[];

  constructor(entity: Entity<CT>, world: World<CT>) {
    this.id = entity.id;
    this.components = entity.components.toDevComponents(),
    this.tags = [...entity.tags];

    // get all the systems that would trigger with this entity...
  }
}

export default DevEntity;
