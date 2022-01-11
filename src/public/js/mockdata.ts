function table(item: any, length: number, id) {
  const list = []
  for (let index = 0; index < length; index++) {
    let newItem = {...item, key: index, [id]: index}
    list.push(newItem)
  }
  return {
    results: {
      results: list,
      totalCount: length
    },
    errorCode: 0,
    errorMsg: ''
  }
}

function mockTable(length: number, getItem: Function) {
  return {
    results: {
      results: mockList1(length, getItem),
      totalCount: length
    },
    errorCode: 0,
    errorMsg: ''
  }
}

function mockSelect(length, getItem) {

  return {
    results: mockList1(length, getItem),
    errorCode: 0,
    errorMsg: ''
  }
}

function success() {
  return {
    errorCode: 0,
    errorMsg: '保存成功！'
  }
}

function error() {
  return {
    errorCode: 300,
    errorMsg: '保存失败！'
  }
}

function mockResponse(data) {
  let response = {
    results: data,
    errorCode: 0,
    errorMsg: ''
  }
  return response
}

function mockList(item, length) {
  const list = []
  for (let index = 0; index < length; index++) {
    let newItem = {key: index, id: index, ...item}
    list.push(newItem)
  }
  return list
}

function mockList1(length: number, getItem: Function) {
  const list = []
  for (let index = 0; index < length; index++) {
    list.push(getItem(index))
  }
  return list
}

function mockTree() {
  return {
    results: [
      {
        id: '0',
        text: 'all',
        children: [
          {
            id: '1',
            text: '1',
            children: [
              {
                id: '1-1',
                text: '1-1'
              },
              {id: '1-2', text: '1-2'},
              {id: '1-3', text: '1-2'},
              {id: '1-4', text: '1-2'},
              {id: '1-5', text: '1-2'},
              {id: '1-6', text: '1-2'},
              {id: '1-7', text: '1-2'},
              {id: '1-8', text: '1-2'},
              {id: '1-9', text: '1-2'},
              {id: '1-10', text: '1-2'},
              {id: '1-12', text: '1-2'},
              {id: '1-13', text: '1-2'},
              {id: '1-14', text: '1-2'},
              {id: '1-15', text: '1-2'}
            ]
          },
          {id: '2', text: '2', children: [{id: '2-1', text: '2-1'}, {id: '2-2', text: '2-2'}]},
          {id: '3', text: '3', children: [{id: '3-1', text: '3-1'}]},
          {id: '4', text: '4', children: [{id: '4-1', text: '4-1'}]},
          {id: '5', text: '5'}
        ]
      }
    ],
    errorCode: 0,
    errorMsg: ''
  }
}

export {
  table,
  mockTable,
  mockSelect,
  success,
  error,
  mockResponse,
  mockList,
  mockList1,
  mockTree
}