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
