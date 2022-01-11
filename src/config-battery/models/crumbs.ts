import { crumbsNS } from '../pages/constants'
import { getPageId } from '../components/Page'
import { makeModel } from '../pages/umi.helper'
import { simpleEqual } from '../util/utils'

interface CrumbItem {
  pageId: number
  pageName: string
  pageTitle: string
  data: Record<any, any>
  url: string
  onActivity: () => void
  onHide: () => void
  onShow: () => void
  needUpdate: boolean
  updateType: string
  updateData: any
  onNeedUpdate: (type: string, data: any) => void
  showStation: boolean | any
  showEnergyUnit: boolean | any
}

export class CrumbState {
  crumbs: CrumbItem[] = []
}

export default makeModel(crumbsNS, new CrumbState(), () => {
  return {
    * updateCrumbs({ payload }, { select, put }) {
      const { type, pageName, data, newCrumbs, pageTitle } = payload
      const { crumbs }: CrumbState = yield select(state => state.crumbs)

      if (type === 'add') {
        crumbs[crumbs.length - 1]?.onHide?.()
        yield put({ type: '_updateCrumbs', newCrumbs: [...crumbs, { pageId: getPageId(), pageName, pageTitle, data }] })
      } else if (type === 'edit') {
        if (crumbs.length) {
          const temp = crumbs.slice(0, crumbs.length - 1)
          const last = JSON.parse(JSON.stringify(crumbs[crumbs.length - 1]))
          last.pageTitle = pageTitle
          yield put({ type: '_updateCrumbs', newCrumbs: [...temp, last] })
        }
      } else if (type === 'back') {
        const currentCrumb = crumbs[crumbs.length - 1]
        const temp = crumbs.slice(0, crumbs.length - payload.count)
        const toCrumb = temp[temp.length - 1]
        toCrumb.onActivity && toCrumb.onActivity()
        toCrumb.onShow && toCrumb.onShow()
        if (currentCrumb.needUpdate) {
          toCrumb.onNeedUpdate(currentCrumb.updateType, currentCrumb.updateData)
        }
        yield put({ type: '_updateCrumbs', newCrumbs: temp })
      } else {
        yield put({ type: '_updateCrumbs', newCrumbs })
      }
    },
    * addCrumb(action, { put, select }) {
      const { crumbs }: CrumbState = yield select(state => state.crumbs)
      const { pageId, pageName, data, pageTitle, url } = action.payload
      let newPageId = pageId || getPageId()
      crumbs[crumbs.length - 1]?.onHide?.()
      yield put({ type: '_updateCrumbs', newCrumbs: [...crumbs, { pageId: newPageId, url, pageName, pageTitle, data }] })
    },
    * removeCrumb(action, { put, select }) {
      const { pageId } = action.payload
      const { crumbs } = yield select(state => state.crumbs)
      yield put({ type: '_updateCrumbs', newCrumbs: crumbs.filter(item => item.pageId != pageId) })
    },
    * clear(action, { put, select }) {
      yield put({ type: '_updateCrumbs', newCrumbs: [] })
    },
    * updateCrumb(action, { put, select }) {
      const { pageId, ...other } = action.payload
      const { crumbs }: CrumbState = yield select(state => state.crumbs)
      let index = crumbs.findIndex(item => item.pageId == pageId)
      if (index != -1) {
        if (
          !simpleEqual(other.pageTitle, crumbs[index].pageTitle)
          || !simpleEqual(other.showStation, crumbs[index].showStation)
          || !simpleEqual(other.showEnergyUnit, crumbs[index].showEnergyUnit)
        ) {
          crumbs[index] = { ...crumbs[index], ...other }
          yield put({ type: '_updateCrumbs', newCrumbs: [...crumbs] })
        }
        if (
          (!simpleEqual(other.url, crumbs[index].url)
            || !simpleEqual(other.pageName, crumbs[index].pageName)
            || !simpleEqual(other.data, crumbs[index].data)
            || !simpleEqual(other.updateType, crumbs[index].updateType)
            || !simpleEqual(other.updateData, crumbs[index].updateData)
          )
          && (other.url || other.pageName || other.data || other.updateType || other.updateData)
        ) {
          crumbs[index] = { ...crumbs[index], ...other }
          yield put({ type: '_updateCrumbs', newCrumbs: [...crumbs] })
        }
        if (other.needUpdate) {
          crumbs[index].needUpdate = true
        }
        crumbs[index].onActivity = other.onActivity
        crumbs[index].onHide = other.onHide
        crumbs[index].onShow = other.onShow
        crumbs[index].onNeedUpdate = other.onNeedUpdate
      }
    }
  }
}, {
  _updateCrumbs(state, { newCrumbs }) {
    return {
      crumbs: newCrumbs
    }
  }
})
