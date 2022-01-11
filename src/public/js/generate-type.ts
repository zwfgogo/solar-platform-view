function generateObjectType(obj) {
  let keys = Object.getOwnPropertyNames(obj)

  let props = keys.reduce((result, key) => {
    let value = obj[key]
    let prop = `${key}: `
    if (typeof value === 'number') {
      prop += 'number'
    } else if (typeof value === 'boolean') {
      prop += 'boolean'
    } else if (typeof value === 'string') {
      prop += 'string'
    } else if (value instanceof Array) {
      prop += generateArrayType(value)
    } else if (typeof value == 'object') {
      prop += '{\n' + generateObjectType(value) + '}'
    }
    return result + '\n' + prop
  }, '')
  return '{\n' + props + '\n}'

}

function generateArrayType(arr) {
  let item = arr[0]
  if (typeof item == 'string') {
    return 'string[]'
  }
  if (typeof item == 'number') {
    return 'number[]'
  }
  if (typeof item == 'boolean') {
    return 'boolean[]'
  }
  return generateObjectType(item) + '[]'
}

export function generate(modal, interfaceName) {
  let props
  if (modal instanceof Array) {
    props = generateArrayType(modal)
    return `interface ${interfaceName} {
      ${props}
      }`
  } else if (typeof modal == 'object') {
    props = generateObjectType(modal)
    return `interface ${interfaceName} 
      ${props}
      `
  }
  return null

}
