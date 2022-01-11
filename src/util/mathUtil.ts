/**
 * 求和
 * @param list
 */
export function sum(list: number[]): number {
  return list.reduce((result, current) => result + current, 0)
}

export function fix(value: number, count: number) {
  if (value == null) {
    return null
  }
  if (typeof value == 'string') {
    return value
  }
  return value.toFixed(count)
}
