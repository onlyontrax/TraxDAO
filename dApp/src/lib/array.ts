export function uniqueStringArrayValue(array: string[]) {
  return array.filter((v, i, a) => a.indexOf(v) === i);
}
