function getSequence(arr) {
  const result = []
  const map = new Map()

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (result.length === 0) {
      // 如果 result 里面一个都没有，直接将索引放进去
      result.push(i)
      continue
    }

    const lastIndex = result[result.length - 1]
    const lastItem = arr[lastIndex]
    if (item > lastItem) {
      // 如果当前节点大于上一个，直接讲内容放到 result 中
      result.push(i)
      map.set(i, lastIndex)
      continue
    } else {
      // item 小于 lastItem
      let left = 0
      let right = result.length - 1

      while (left < right) {
        const mid = (left + right) >> 1
        const midItem = arr[result[mid]]
        if (midItem < item) left = mid + 1
        else right = mid
      }

      if (arr[result[left]] > item) {
        if (left > 0) {
          map.set(i, result[left - 1])
        }
        // 找到最合适的，把索引进行替换
        result[left] = i
      }
    }

    // 反向追溯
    let l = result.length
    let last = result[l - 1]

    while (l > 0) {
      l--
      result[l] = last
      last = map.get(last)
    }
  }
  return result
}

console.log(getSequence([10, 3, 5, 9, 12, 8, 15, 18]))
// 输出 [1, 2, 3, 4, 6, 7]
