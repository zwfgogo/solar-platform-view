import React, { useEffect } from 'react';
import styles from './load-management.less'
import { getNextAlias, LoadManagementModal } from '../models/load-management';
import Forward from '../../../../public/components/Forward';
import AbsoluteBubble from '../../../../components/AbsoluteBubble';
import { Button, Popconfirm, Table1 } from 'wanke-gui';
import { PlusOutlined } from 'wanke-icon';
import LoadFormModal from './components/LoadFormModal';
import moment from 'moment';
import PageProps from '../../../../interfaces/PageProps';
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import Page from '../../../../components/Page';
import { makeConnect } from '../../../umi.helper';
import { load_management } from '../../../constants';
import { CrumbsPortal } from '../../../../frameset/Crumbs';
import utils from '../../../../public/js/utils';

interface Props extends PageProps, LoadManagementModal, MakeConnectProps<LoadManagementModal> {
  loading: boolean
  stationId: number
}

const LoadManagement: React.FC<Props> = (props) => {
  const columns = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65,
    },
    {
      title: utils.intl('负荷名称'),
      dataIndex: 'title',
      render: (text, record) => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('开关对象'),
      dataIndex: 'device',
      render: (text, record) => <AbsoluteBubble>{text?.title}</AbsoluteBubble>
    },
    {
      title: utils.intl('负荷代号'),
      width: 150,
      dataIndex: 'alias',
      render: (text, record) => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('功率定值'),
      width: 140,
      dataIndex: 'powerRating',
      render: text => (text || text === 0) ? text + 'kW' : text
    },
    {
      title: utils.intl('控制时段'),
      width: 140,
      dataIndex: 'controlPeriod',
      render: (text, record) => {
        let time = formatControlPeriod(text).map(item => `${item.startTime}~${item.endTime}`).join('\n')
        if (time === '00:00~00:00') time = utils.intl('全天')
        return <AbsoluteBubble>{time}</AbsoluteBubble>
      }
    },
    {
      title: utils.intl('操作'),
      align: 'right',
      width: 120,
      render: (text, record) => (
        <>
          <a onClick={() => handleOpenModal('edit', record)} style={{ marginRight: 8 }}>{utils.intl('编辑')}</a>
          <Popconfirm
            title={utils.intl('确定要删除?')}
            okText={utils.intl('确认')}
            cancelText={utils.intl('取消')}
            onConfirm={() => props.action('delete', { id: record.id })}
          >
            <a>{utils.intl('删除')}</a>
          </Popconfirm>
        </>
        )
    },
  ]

  useEffect(() => {
    return () => {
      props.action('reset')
    }
  }, [])

  useEffect(() => {
    if (props.stationId) {
      props.action('fetchSwitchList', { stationId: props.stationId })
      props.action('fetchList', { stationId: props.stationId })
    }
  }, [props.stationId])

  const handleOpenModal = (modalMode, data = {}) => {
    let record: any = { ...data }
    if (modalMode === 'new') {
      record.timeList = [{
        startTime: moment('00:00', 'HH:mm'),
        endTime: moment('00:00', 'HH:mm')
      }]
      record.alias = getNextAlias(props.aliasMap)
    } else {
      record.switchObjectId = record.device?.id
      record.timeList = formatControlPeriod(record.controlPeriod)
        .map(item => {
          return {
            startTime: moment(item.startTime, 'HH:mm'),
            endTime: moment(item.endTime, 'HH:mm')
          }
        })
        || [{}]
      if (!record.timeList.length) {
        record.timeList = [{}]
      }
    }
    props.updateState({ modalMode, modalVisible: true, record })
  }
  
  return (
    <Page pageId={props.pageId} showStation>
      <CrumbsPortal pageName='loadList'>
        <Button type="primary" onClick={() => handleOpenModal('new')}>
          <span>{utils.intl('新增')}</span>
        </Button>
      </CrumbsPortal>
      <section className={styles['page-container']}>
        <footer>
          <Table1
            columns={columns}
            dataSource={props.list}
            loading={props.loading}
          />
        </footer>
      </section>
      {props.modalVisible && <LoadFormModal />}
    </Page>
  );
};

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    stationId: state.global.selectedStationId,
    loading: getLoading('fetchList')
  }
}

export default makeConnect(load_management, mapStateToProps)(LoadManagement)

function formatControlPeriod(str) {
  if (!str) return []
  let list = []
  str.split(';').forEach(item => {
    const [startTime, endTime] = item.split(',')
    list.push({ startTime, endTime })
  })
  return list
}
