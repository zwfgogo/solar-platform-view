import React, {useEffect, useRef, useState} from 'react'
import {Button, FullContainer, message} from 'wanke-gui'

import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import {DiagramVideo} from './model'
import Page from '../../components/Page'
import {globalNS, storage_diagram_video} from '../constants'
import {makeConnect} from '../umi.helper'
import usePageSize from '../../hooks/usePageSize'
import EditVideoItem from './dialog/EditVideoItem'
import ListVideo from './item/ListVideo'

import utils from '../../public/js/utils'
import { CrumbsPortal } from '../../frameset/Crumbs'

interface Props extends PageProps, MakeConnectProps<DiagramVideo>, DiagramVideo {
  stationId: number
  loading: boolean
  addVideoSuccess: boolean
  editVideoSuccess: boolean
  deleteVideoSuccess: boolean
}

const VideoList: React.FC<Props> = function (this: null, props) {
  const [showEditVideoItem, setShowEditVideoItem] = useState(false)
  const [pageSize, setPageSize] = usePageSize()
  const editIndexRef = useRef(-1)

  const addVideoItem = (param) => {
    props.action('addVideoItem', param)
  }

  const editVideoItem = (param) => {
    props.action('updateVideoItem', param)
  }

  const deleteVideoItem = (index) => {
    props.action('deleteVideoItem', {id: props.list1[index].id})
  }

  const onEdit = (index) => {
    editIndexRef.current = index
    setShowEditVideoItem(true)
  }

  const fetchList = () => {
    props.action('fetchVideoList1', {page: pageSize.page, size: pageSize.size, stationId: props.stationId})
  }

  useEffect(() => {
    if (props.stationId) {
      fetchList()
    }
  }, [pageSize])

  useEffect(() => {
    if (props.stationId) {
      setPageSize(1, pageSize.size)
    }
  }, [props.stationId])

  useEffect(() => {
    if (props.editVideoSuccess) {
      fetchList()
      setShowEditVideoItem(false)
    }
    if (props.deleteVideoSuccess) {
      if (props.list1.length == 1) {
        setPageSize(1, pageSize.size)
      }
      fetchList()
    }
  }, [props.addVideoSuccess, props.editVideoSuccess, props.deleteVideoSuccess])

  let detail = null
  if (editIndexRef.current != -1) {
    detail = props.list1[editIndexRef.current]
  }

  return (
    <div
      // pageId={props.pageId}
      // pageTitle={utils.intl('视频列表')}
      className={'diagram-video-page'}
      style={{ height: '100%' }}
    >
      {
        showEditVideoItem && (
          <EditVideoItem
            stationId={props.stationId}
            visible={showEditVideoItem}
            detail={detail}
            updateVideoItem={editVideoItem}
            onCancel={() => setShowEditVideoItem(false)}
          />
        )
      }
      <FullContainer>
        <div className="flex1">
          <ListVideo
            loading={props.loading}
            dataSource={props.list1}
            pageSize={pageSize}
            total={props.total}
            setPageSize={setPageSize}
            onEdit={onEdit}
            onDelete={deleteVideoItem}
          />
        </div>
      </FullContainer>
    </div>
  )
}

const mapStateToProps = (model, {getLoading, isSuccess}, state) => {
  return {
    ...model,
    stationId: state[globalNS].selectedStationId,
    loading: getLoading('fetchVideoList1'),
    addVideoSuccess: isSuccess('addVideoItem'),
    editVideoSuccess: isSuccess('updateVideoItem'),
    deleteVideoSuccess: isSuccess('deleteVideoItem'),
  }
}

export default makeConnect(storage_diagram_video, mapStateToProps)(VideoList)
