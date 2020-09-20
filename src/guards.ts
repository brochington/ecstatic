import Entity, { EntityId } from "./Entity";
import { CompTypes } from 'interfaces';
import ComponentCollection from './ComponentCollection';

export function isComponentInstance<T>(
  Class: new (...args: any) => T,
  comp: any
): comp is InstanceType<typeof Class> {
  if (!comp) {
    return false;
  }

  if (!(comp instanceof Class)) {
    return false;
  }

  return true;
}


export function isComponentName<CT extends CompTypes<CT>>(
  possibleName: any,
  entitiesByCTypes: Map<(keyof CT)[], Set<EntityId>>
): possibleName is CT[keyof CT] {
  // string
  if (typeof possibleName !== 'string') {
    return false;
  }

  for (const a of entitiesByCTypes.keys()) {
    if (a.includes(possibleName)) {
      return true;
    }
  }

  return false;
}
