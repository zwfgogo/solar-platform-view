import { getBool, traverseTree } from '../../src/pages/page.helper'
import { mockTree } from '../testMockData'


describe('test page.helper', () => {
  it('test getBool', () => {
    expect(getBool(true)).toBeTruthy()
    expect(getBool('true')).toBeTruthy()

    expect(getBool(false)).toBeFalsy()
    expect(getBool('false')).toBeFalsy()
    expect(getBool(1)).toBeFalsy()
    expect(getBool(undefined)).toBeFalsy()
    expect(getBool(null)).toBeFalsy()
    expect(getBool(0)).toBeFalsy()
  })

  it('test traverseTree', () => {
    let item = traverseTree(mockTree, item => null)
    expect(item).toBe(null)

    item = traverseTree(mockTree, item => {
      if (item.name == 3) {
        return item.age
      }
      return null
    })
    expect(item).toBe(3)
  })
})
