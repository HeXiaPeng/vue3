export function isObject(value) {
  return typeof value === 'object' && value !== null
}

/**
 * 判断值是否发生变化，发生变化，返回 true
 * @param newValue 新值
 * @param oldValue 老值
 * @returns
 */
export function hasChange(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function isString(value) {
  return typeof value === 'string'
}

export function isNumber(value) {
  return typeof value === 'number'
}

export function isOn(key) {
  return /^on[A-Z]/.test(key)
}

export const isArray = Array.isArray
