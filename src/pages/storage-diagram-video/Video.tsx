import React, {CSSProperties, useEffect, useRef, useState} from 'react'
import {Button, FullContainer, message, Modal, Pagination, Radio, Tabs} from 'wanke-gui'

import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import {DiagramVideo} from './model'
import Page from '../../components/Page'
import {globalNS, storage_diagram_video} from '../constants'
import {makeConnect} from '../umi.helper'
import usePageSize from '../../hooks/usePageSize'
import {copy} from '../../util/utils'
import VideoItem from './item/VideoItem'
import EditVideoItem from './dialog/EditVideoItem'

import utils from '../../public/js/utils'
import { GfSquareModeFilled, WankeGridFourFilled, WankeGridNineFilled, WankeGridOneFilled } from 'wanke-icon'
import VideoList from './VideoList'
import { CrumbsPortal } from '../../frameset/Crumbs'
import VideoItemDetail from './dialog/VideoItemDetail'

interface Props extends PageProps, MakeConnectProps<DiagramVideo>, DiagramVideo {
  stationId: number
  loading: boolean
  addVideoSuccess: boolean
  editVideoSuccess: boolean
  deleteVideoSuccess: boolean
}

const Layout: React.FC<Props> = function (this: null, props) {
  const [showAddVideoItem, setShowAddVideoItem] = useState(false)
  const [showVideoItemDetail, setShowVideoItemDetail] = useState(false)
  const [showEditVideoItem, setShowEditVideoItem] = useState(false)
  const [pageSize, setPageSize] = usePageSize({page: 1, size: 4})
  const [list, setList] = useState([])
  const [activeKey, setActiveKey] = useState('1')
  const editDetailRef = useRef({})

  useEffect(() => {
    setList(getList(props.list))
  }, [props.list])

  const getList = (vList: any[]) => {
    let list = copy(vList)
    let length = list.length
    if (length < pageSize.size) {
      for (let i = 0; i < pageSize.size - length; i++) {
        list.push(null)
      }
    }
    return list
  }

  const addVideoItem = (param) => {
    props.action('addVideoItem', param)
  }

  const onHide = () => {
    setList(getList([]))
  }

  const onShow = () => {
    setList(getList(props.list))
  }

  useEffect(() => {
    if (props.stationId) {
      props.action('fetchVideoList', {page: pageSize.page, size: pageSize.size, stationId: props.stationId})
    }
  }, [pageSize])

  useEffect(() => {
    if (props.stationId) {
      setPageSize(1, pageSize.size)
    }
  }, [props.stationId])

  const fetchList = () => {
    setPageSize(1, pageSize.size)
  }

  useEffect(() => {
    if (props.addVideoSuccess) {
      setShowAddVideoItem(false)
      setPageSize(1, pageSize.size)
      message.success(utils.intl('添加成功'))
    }
    if (props.editVideoSuccess) {
      fetchList()
      message.success(utils.intl('更新成功'))
      setShowEditVideoItem(false)
    }
    if (props.deleteVideoSuccess) {
      fetchList()
      message.success(utils.intl('删除成功'))
    }
  }, [props.addVideoSuccess, props.editVideoSuccess, props.deleteVideoSuccess])

  let style: CSSProperties = {}
  if (pageSize.size == 1) {
    style.width = '100%'
    style.height = '100%'
  }
  if (pageSize.size == 4) {
    style.width = '50%'
    style.height = '50%'
  }
  if (pageSize.size == 9) {
    style.width = '33%'
    style.height = '33%'
  }

  const onEdit = () => {
    setShowVideoItemDetail(false)
    setShowEditVideoItem(true)
  }

  const handleModeChange = (e) => {
    const val = e.target.value;
    setPageSize(1, Number(val))
  }

  const handleLook = (detail) => {
    editDetailRef.current = detail
    setShowVideoItemDetail(true)
  }

  const handleDelete = (item) => {
    Modal.confirm({
      title: utils.intl('确定删除吗？'),
      content: utils.intl('删除后将不可恢复，请谨慎操作'),
      onOk: () => deleteVideoItem(item)
    })
  }

  const editVideoItem = (param) => {
    props.action('updateVideoItem', param)
  }

  const deleteVideoItem = (item) => {
    return props.action('deleteVideoItem', {id: item.id})
  }

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl('视频')}
      className={'diagram-video-page'}
      onHide={onHide}
      onShow={onShow}
    >
      {
        showVideoItemDetail && (
          <VideoItemDetail
            detail={editDetailRef.current}
            onEdit={onEdit}
            onCancel={() => setShowVideoItemDetail(false)}
          />
        )
      }
      {
        showAddVideoItem && (
          <EditVideoItem
            stationId={props.stationId}
            visible={showAddVideoItem}
            addVideoItem={addVideoItem}
            onCancel={() => setShowAddVideoItem(false)}
          />
        )
      }
      {
        showEditVideoItem && (
          <EditVideoItem
            stationId={props.stationId}
            visible={showEditVideoItem}
            detail={editDetailRef.current}
            updateVideoItem={editVideoItem}
            onCancel={() => setShowEditVideoItem(false)}
          />
        )
      }
      <CrumbsPortal>
        <Button
          type="primary"
          onClick={() => setShowAddVideoItem(true)}
          style={{ marginLeft: 8 }}
        >{utils.intl('新增监控设备')}</Button>
      </CrumbsPortal>

      <FullContainer>
        {activeKey === '1' && (
          <div className="diagram-video-menu">
            <Radio.Group onChange={handleModeChange} value={pageSize.size.toString()}>
              <Radio.Button value="1"><WankeGridOneFilled /></Radio.Button>
              <Radio.Button value="4"><WankeGridFourFilled /></Radio.Button>
              <Radio.Button value="9"><WankeGridNineFilled /></Radio.Button>
            </Radio.Group>
          </div>
        )}
        <Tabs activeKey={activeKey} onChange={setActiveKey}>
          <Tabs.TabPane key="1" tab={utils.intl('视频')}>
            <section className="diagram-video-body">
              <div className="flex1 flex-wrap video-list">
                {
                  list.map((item, index) => {
                    if (!item) {
                      return (
                        <VideoItem key={index} style={style} url={null} onAdd={() => setShowAddVideoItem(true)}/>
                      )
                    }
                    return (
                      <VideoItem
                        key={item.urlAddress}
                        style={style}
                        url={item.urlAddress}
                        onLook={() => handleLook(item)}
                        onDelete={() => handleDelete(item)}
                      />
                    )
                  })
                }
              </div>

              <footer className="h-space" style={{height: 35, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                {
                  props.total !== 0 && (
                    <Pagination
                      current={pageSize.page}
                      total={props.total}
                      pageSize={pageSize.size}
                      onChange={setPageSize}
                      onShowSizeChange={setPageSize}
                      showTotal={(total) => utils.intl('共{0}条', total)}
                      size={'small'}
                    />
                  )
                }
              </footer>
            </section>
          </Tabs.TabPane>
          <Tabs.TabPane key="2" tab={utils.intl('列表')}>
            <section className="diagram-video-body">
              <VideoList />
            </section>
          </Tabs.TabPane>
        </Tabs>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, {getLoading, isSuccess}, state) => {
  return {
    ...model,
    stationId: state[globalNS].selectedStationId,
    loading: getLoading('fetchVideoList'),
    addVideoSuccess: isSuccess('addVideoItem'),
    editVideoSuccess: isSuccess('updateVideoItem'),
    deleteVideoSuccess: isSuccess('deleteVideoItem'),
  }
}

export default makeConnect(storage_diagram_video, mapStateToProps)(Layout)
