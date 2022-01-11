const START = '@@DVA_SUCCESS/START'
const SUCCESS = '@@DVA_SUCCESS/SUCCESS'
const RESET = '@@DVA_SUCCESS/RESET'

function createSuccess(opts: any = {}) {
  const namespace = 'success'

  const {only = [], except = []} = opts
  if (only.length > 0 && except.length > 0) {
    throw Error('It is ambiguous to configurate `only` and `except` items at the same time.')
  }

  const initialState = {
    effects: {}
  }

  const extraReducers = {
    success(state = initialState, {type, payload}) {
      const {namespace, actionType} = payload || {}
      let ret
      switch (type) {
        case START:
        case RESET:
          ret = {
            ...state,
            effects: {...state.effects, [actionType]: false}
          }
          break
        case SUCCESS: {
          const effects = {...state.effects, [actionType]: true}
          ret = {
            ...state,
            effects
          }
          break
        }
        default:
          ret = state
          break
      }
      return ret
    }
  }

  function onEffect(effect, {put}, model, actionType) {
    const {namespace} = model
    if (
      (only.length === 0 && except.length === 0) ||
      (only.length > 0 && only.indexOf(actionType) !== -1) ||
      (except.length > 0 && except.indexOf(actionType) === -1)
    ) {
      return function* (...args) {
        yield put({type: START, payload: {namespace, actionType}})
        yield effect(...args)
        yield put({type: SUCCESS, payload: {namespace, actionType}})
        yield put({type: RESET, payload: {namespace, actionType}})
      }
    } else {
      return effect
    }
  }

  return {
    extraReducers,
    onEffect
  }
}

export default createSuccess
