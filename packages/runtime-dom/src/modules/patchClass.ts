export function patchClass(el, value) {
  if (value == undefined) {
    // null undefined 那就需要移除
    el.removeAttribute('class')
  } else {
    el.className = value
  }
}
