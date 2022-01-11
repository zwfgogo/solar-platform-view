import React, { useEffect, useState } from 'react'
import { Button, FullLoading, Input, message, Table2 } from 'wanke-gui'
import ImportExcelDialog from '../../../components/ImportExcelDialog'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import usePageSize from '../../../hooks/usePageSize'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import { device_management_twice_signal } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { DeviceManagementTwiceSignalModal } from '../models/signalList'
import './index.less'

const { Search } = Input

interface Props extends PageProps, DeviceManagementTwiceSignalModal, MakeConnectProps<DeviceManagementTwiceSignalModal> {
  deviceName: string
  deviceId: number
  fetchListLoading?: boolean
  exportLoading?: boolean
  importDataLoading?: boolean
}

const SignalList: React.FC<Props> = (props) => {
  const { pageId, deviceName } = props
  const [pageSize, setPageSize] = usePageSize()
  const [searchVal, setSearchVal] = useState('')
  const [importVisible, setImportVisible] = useState(false)
  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 65,
      dataIndex: 'num',
    },
    {
      title: utils.intl('点号'),
      dataIndex: 'pointNumber',
    },
    {
      title: utils.intl('信号名称'),
      dataIndex: 'title',
    },
    {
      title: utils.intl('单位'),
      dataIndex: 'unit',
    },
  ]

  const fetchData = (searchStr, pageSize) => {
    props.action('fetchList', {
      searchStr,
      pageSize,
      deviceId: props.deviceId
    })
  }

  const handleSearch = () => {
    setPageSize(1, pageSize.size)
    // fetchData(searchVal, pageSize)
  }

  const handleImport = (list) => {
    if (!list.length) {
      message.error(utils.intl('导入数据不能为空'))
      return
    }

    let errorMsg = ''
    let pointMap = {}
    list.every(item => {
      if (!item.pointNumber) {
        errorMsg = utils.intl('点号不能为空')
        return false
      }
      if (!item.title) {
        errorMsg = utils.intl('信号名称不能为空')
        return false
      }
      if (pointMap[item.pointNumber]) {
        errorMsg = utils.intl('点号重复')
        return false
      }
      pointMap[item.pointNumber] = true
      item.deviceId = props.deviceId
      return true
    })

    if (errorMsg) {
      message.error(errorMsg)
    } else {
      props.action('importData', {
        list,
        deviceId: props.deviceId,
      }).then(() => {
        setImportVisible(false)
        setPageSize(1, pageSize.size)
      })
    }
  }

  const handleExport = () => {
    props.action('export', {
      searchVal,
      pageSize,
      deviceId: props.deviceId,
      deviceName: props.deviceName
    })
  }

  useEffect(() => {
    fetchData(searchVal, pageSize)
  }, [pageSize])

  return (
    <Page pageId={pageId} pageTitle={deviceName + utils.intl('SignalList.采集信号')}>
      <CrumbsPortal>
        <Button
          type="default"
          onClick={handleExport}
          loading={props.exportLoading}
          style={{ marginLeft: 8 }}
        >{utils.intl('导出')}</Button>
        <Button
          type="primary"
          style={{ marginLeft: 8 }}
          onClick={() => setImportVisible(true)}
        >{utils.intl('导入')}</Button>
      </CrumbsPortal>
      <section className="device-signal-list-page">
        <header className="signal-list-filter">
          <Search
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 260 }}
            placeholder={utils.intl('请输入点号/信号名称')}
          />
        </header>
        <div className="signal-list-body">
          {props.fetchListLoading ? <FullLoading /> : ''}
          <Table2
            dataSource={props.dataSource}
            columns={columns}
            page={pageSize.page}
            size={pageSize.size}
            total={props.total}
            onPageChange={setPageSize}
          />
        </div>
      </section>
      <ImportExcelDialog
        loading={props.importDataLoading}
        onImport={handleImport}
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        attrKeyMap={{
          '点号': 'pointNumber',
          '信号名称': 'title',
          '单位': 'unit',
          'Point Number': 'pointNumber',
          'Signal Name': 'title',
          'Unit': 'unit',
        }}
      />
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    fetchListLoading: getLoading('fetchList'),
    exportLoading: getLoading('export'),
    importDataLoading: getLoading('importData'),
  };
};

export default makeConnect(device_management_twice_signal, mapStateToProps)(SignalList);
