import {makeModel} from '../umi.helper'
import {storage_diagram_video} from '../constants'
import {
  addVideoItem,
  deleteVideoItem,
  fetchStationDiagram,
  fetchVideoList,
  updateVideoItem
} from './diagram-video.service'

export class DiagramVideo {
  diagramUrl = null
  total: 0
  list: any[] = []
  list1: any[] = []
}

export default makeModel(storage_diagram_video, new DiagramVideo(), (updateState, updateQuery, getState) => {
  return {
    * fetchStationDiagram(action, {put, call}) {
      let url = yield call(fetchStationDiagram, action.payload)
      yield updateState(put, {
        diagramUrl: url
      })
    },
    * fetchVideoList(action, {put, call}) {
      let result = yield call(fetchVideoList, action.payload)
      yield updateState(put, {
        total: result.totalCount,
        list: result.list
      })
    },
    * fetchVideoList1(action, {put, call}) {
      let result = yield call(fetchVideoList, action.payload)
      yield updateState(put, {
        total: result.totalCount,
        list1: result.list
      })
    },
    * addVideoItem(action, {put, call}) {
      yield call(addVideoItem, action.payload)
    },
    * updateVideoItem(action, {put, call}) {
      yield call(updateVideoItem, action.payload)
    },
    * deleteVideoItem(action, {put, call}) {
      yield call(deleteVideoItem, action.payload)
    }
  }
})
