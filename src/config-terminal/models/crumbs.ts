import { crumbsNS } from '../pages/constants'
import { getPageId } from '../components/Page'
import { makeModel } from '../pages/umi.helper'

interface CrumbItem {
  pageId: number
  pageName: string
  pageTitle: string
  data: Record<any, any>
  url: string
  onActivity: () => void
  needUpdate: boolean
  updateType: string
  updateData: any
  onNeedUpdate: (type: string, data: any) => void
}

export class CrumbState {
  crumbs: CrumbItem[] = []
}

export default makeModel(crumbsNS, new CrumbState(), () => {
  return {
    * updateCrumbs({payload}, {select, put}) {
      const {type, pageName, data, newCrumbs, pageTitle} = payload
      const {crumbs}: CrumbState = yield select(state => state.crumbs)

      if (type === 'add') {
        yield put({type: '_updateCrumbs', newCrumbs: [...crumbs, {pageId: getPageId(), pageName, pageTitle, data}]})
      } else if (type === 'edit') {
        if (crumbs.length) {
          const temp = crumbs.slice(0, crumbs.length - 1)
          const last = JSON.parse(JSON.stringify(crumbs[crumbs.length - 1]))
          last.pageTitle = pageTitle
          yield put({type: '_updateCrumbs', newCrumbs: [...temp, last]})
        }
      } else if (type === 'back') {
        console.log(payload)
        const currentCrumb = crumbs[crumbs.length - 1]
        const temp = crumbs.slice(0, crumbs.length - payload.count)
        const toCrumb = temp[temp.length - 1]
        toCrumb.onActivity && toCrumb.onActivity()
        if (currentCrumb.needUpdate) {
          toCrumb.onNeedUpdate(currentCrumb.updateType, currentCrumb.updateData)
        }
        yield put({type: '_updateCrumbs', newCrumbs: temp})
      } else {
        yield put({type: '_updateCrumbs', newCrumbs})
      }
    },
    * addCrumb(action, {put, select}) {
      const {crumbs}: CrumbState = yield select(state => state.crumbs)
      const {pageId, pageName, data, pageTitle, url} = action.payload
      let newPageId = pageId || getPageId()
      yield put({type: '_updateCrumbs', newCrumbs: [...crumbs, {pageId: newPageId, url, pageName, pageTitle, data}]})
    },
    * removeCrumb(action, {put, select}) {
      const {pageId} = action.payload
      console.log('remove', pageId)
      const {crumbs} = yield select(state => state.crumbs)
      yield put({type: '_updateCrumbs', newCrumbs: crumbs.filter(item => item.pageId != pageId)})
    },
    * clear(action, {put, select}) {
      yield put({type: '_updateCrumbs', newCrumbs: []})
    },
    * updateCrumb(action, {put, select}) {
      const {pageId, ...other} = action.payload
      const {crumbs}: CrumbState = yield select(state => state.crumbs)
      let index = crumbs.findIndex(item => item.pageId == pageId)
      if (index != -1) {
        crumbs[index] = {...crumbs[index], ...other}
        yield put({type: '_updateCrumbs', newCrumbs: [...crumbs]})
      }
    }
  }
}, {
  _updateCrumbs(state, {newCrumbs}) {
    return {
      crumbs: newCrumbs
    }
  }
})
