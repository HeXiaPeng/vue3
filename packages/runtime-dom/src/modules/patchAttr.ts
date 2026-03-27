export function patchAttr(el, key, value) {
  if (value == undefined) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
  }
}
