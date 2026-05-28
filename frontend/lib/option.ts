export function enumToOptions<T extends Record<string, string>>(e: T) {
  return Object.values(e).map((value) => ({
    value,
    label: value,
  }));
}
