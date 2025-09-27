export function isComponentInstance<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
  Class: new (...args: any) => T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
