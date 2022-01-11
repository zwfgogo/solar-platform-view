/**
 * Created by zhuweifeng on 2019/11/5.
 */
import { history } from 'umi'
import Service from '../services/index'
import pubService from '../../../../../public/services/index'
import utils from '../../../../../util/utils'
import season from '../effects/season'
import save from '../effects/save'
import { message } from 'wanke-gui'
import month from '../effects/month'

export default {
  namespace: 'priceEdit',
  state: {
    show: false,
    detail: {
      season: []
    },
    editDetail: {
      season: [{}]
    },
    editSeason: [],
    priceType: [],
    volType: [],
    source: '', // 界面来源，如果是其他模块跳转进来，则只能查看不能编辑
    editable: false, // 是否进入编辑页面
    forms: {},
    monthSelected: [],
    id: '',
    jump: true,
    pricesBind: false
  },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    addForm(state, action) {
      return {
        ...state,
        forms: {
          ...state.forms,
          ...action.payload
        }
      }
    }
  },
  effects: {
    * getDetail(action, { call, put, select }) {
      let data = {
        results: {
          voltageLevelId: [],
          season: [
            {
              priceRates: [],
              seasonPriceDetails: []
            }
          ]
        }
      }
      if (action && action.payload && action.payload.id) {
        yield put({
          type: 'updateToView',
          payload: {
            id: action.payload.id
          }
        })
        data = yield Service.getDetail({ id: action.payload.id })
      }
      // 转换数据
      // 季节列表
      let monthSelected = []
      const editSeason = data.results.season
      utils.each(editSeason, (item, key) => {
        item.id = key
        const { seasonPriceDetails } = item
        utils.each(seasonPriceDetails, (detailper, k) => {
          detailper.id = k
          item['price' + detailper.priceRateId] = detailper.price
          const timestemp = detailper.time.split(',')
          utils.each(timestemp, (timesper, i) => {
            const tt = timesper.split('-')
            if (item['seasonPriceDetails' + detailper.priceRateId]) {
              item['seasonPriceDetails' + detailper.priceRateId].push({ startTime: tt[0], endTime: tt[1], id: i })
            } else {
              item['seasonPriceDetails' + detailper.priceRateId] = []
              item['seasonPriceDetails' + detailper.priceRateId].push({ startTime: tt[0], endTime: tt[1], id: i })
            }
          })
          return detailper
        })
        item.runMonth = item.runMonth ? item.runMonth.split(',') : []
        monthSelected.push.apply(monthSelected, item.runMonth)
      })
      // 期待的数据
      yield put({
        type: 'updateToView',
        payload: {
          detail: data.results,
          show: true,
          editSeason,
          monthSelected: monthSelected
        }
      })
    },
    * del({ id }) {
      const res = yield Service.getList({
        stationId: sessionStorage.getItem('station-id'),
        page: 1, size: 20, query: ''
      })
      this.$getList({})
    },
    * updateState(action, { call, put, take }) {
      yield put({
        type: 'updateToView',
        payload: action.payload
      })
    },
    // 电压枚举
    * getVolType(action, { call, put, select }) {
      const { jump } = yield select(state => state.global)
      if (jump) {
        history.push('/basic-data/electricity-price')
      }
      const data = yield pubService.memoGetVolType({ resource: 'voltageLevels', type: 1 })
      utils.each(data, item => {
        item.label = item.name
      })
      utils.enumeration('volType', data)
      yield put({
        type: 'updateToView',
        payload: { volType: data }
      })
    },
    *getIsbind(action, { call, put }) {
      const res = yield Service.getIsbind({ id: action.payload.id, pricesType: '2' });
      yield put({
        type: 'updateToView',
        payload: { pricesBind: res.results }
      });
    },
    * getPriceType(action, { call, put, select }) {
      const data = yield pubService.memoGetPriceType({ resource: 'priceRate' })
      utils.enumeration('priceType', data)
      utils.each(data, (item, key) => {
        data[key].label = item.name
      })
      yield put({
        type: 'updateToView',
        payload: { priceType: data }
      })
    },
    ...season,
    ...save,
    ...month
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/basic-data/electricity-price/Edit') {
          dispatch({ type: 'getVolType', payload: query })
          dispatch({ type: 'getPriceType', payload: query })
          dispatch({ type: 'getDetail', payload: query })
        }
      })
    }
  }
}