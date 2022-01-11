import { connect } from 'react-redux'
import { isDeepEqual } from '../util/utils'
import _ from 'lodash'

/**
 *
 */
export function getCurve(res, echart, arrName): any {
  let arr = _.clone(echart)
  arrName.forEach((element,index) => {
    for (let o of res.results[element]) {
      if (arr.xData.indexOf(o.dtime) === -1) {
        arr.xData = arr.xData.concat(o.dtime)
      }
      arr.yData = arr.yData.slice();
      arr.yData[arrName.indexOf(element)][index] = o.val
    }
  });
  return arr
}

export function* updateState<T = any>(put: any, payload: Partial<T>) {
  yield put({
    type: '_updateState',
    payload
  })
}

export function getModelState(namespace): any {
  return function* getState<T>(select): IterableIterator<T> {
    return yield select(state => state[namespace])
  }
}

export const getUpdateQuery = (namespace) => {
  return function* updateQuery(select, put, newQuery) {
    const model = yield select(state => {
      return state[namespace]
    })
    let queryKey = newQuery.queryKey || 'query'
    delete newQuery['queryKey']

    yield put({
      type: '_updateState',
      payload: {
        ...model,
        [queryKey]: {
          ...model[queryKey],
          ...newQuery
        }
      }
    })
  }
}

export const getAction = (namespace, type, payload = {}) => {
  if (!namespace) {
    return {
      type, payload
    }
  }
  return {
    type: getActionType(namespace, type),
    payload
  }
}

export const getActionType = (namespace, type) => {
  if (type.indexOf('/') != -1) {
    return type
  }
  return `${namespace}/${type}`
}

export function mapModelState(namespace, mapStateToProps) {
  return (state, props) => {
    const model = state[namespace]
    let getLoading1: any = (type) => getLoading(state, namespace, type)
    getLoading1.getLoading = getLoading1
    getLoading1.isSuccess = (type) => getSuccess(state, namespace, type)
    return mapStateToProps(model, getLoading1, state)
  }
}

export function getLoading(state, namespace, type) {
  return state.loading.effects[getActionType(namespace, type)]
}

export function getSuccess(state, namespace, type) {
  return state.success.effects[getActionType(namespace, type)] || false
}

type UpdateState<T> = (put: any, payload: Partial<T>) => any

interface ModelState {
  new(): any
}

export function makeModel<T>(namespace: string, state: T, getEffects: (updateState: UpdateState<T>, updateQuery, getState: (select) => T) => any, reducers = {}, subscriptions = {}) {
  let mergeReducers = {
    _updateState(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    afterListItemDelete(state) {
      if (state.list.length == 1) {
        return {
          ...state,
          query: {
            ...state.query,
            page: 1
          }
        }
      }
      return state
    },
    ...reducers
  }
  const updateQuery = getUpdateQuery(namespace)
  const getState = getModelState(namespace)

  return {
    namespace,
    state: state,
    effects: {
      * updateState({ payload }, { select, put }) {
        yield updateState(put, payload)
      },
      * updateQuery({ payload }, { select, put }) {
        yield updateQuery(select, put, payload)
      },
      * reset(action, { put }) {
        yield updateState(put, state)
      },
      ...getEffects(updateState, updateQuery, getState)
    },
    reducers: mergeReducers,
    subscriptions
  }
}

export function makeConnect(namespace, mapState) :any {
  const mapStateToProps = mapModelState(namespace, mapState)
  return connect<any, any, any, any>(mapStateToProps, (dispatch) => {
    return {
      dispatch: dispatch,
      action: (type, payload?) => {
          return dispatch(getAction(namespace, type, payload))
      },
      updateState: (payload) => {
        dispatch(getAction(namespace, 'updateState', payload))
      },
      updateQuery: (payload, queryKey) => {
        if (queryKey) {
          dispatch(getAction(namespace, 'updateQuery', { ...payload, queryKey }))
        } else {
          dispatch(getAction(namespace, 'updateQuery', payload))
        }
      },
      onPageChange: (fetchListName) => (page, size) => {
        dispatch(getAction(namespace, 'updateQuery', { page, size }))
        dispatch(getAction(namespace, fetchListName))
      }
    }
  })
}
