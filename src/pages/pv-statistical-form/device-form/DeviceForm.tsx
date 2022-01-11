import React, { useState, useEffect } from 'react'
import { Table1, message } from 'wanke-gui';
import RangePicker from '../../../components/range-picker/RangePicker'
import TreeSelect from '../../../components/TreeSelect';
import TabSelect from '../../../components/TabSelect';
import { WankeAddOutlined } from 'wanke-icon';
import Columns, { DeviceTypeMap } from './columns';
import styles from './device-form.less'
import { makeConnect } from '../../umi.helper';
import { device_form } from '../../constants';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import { DeviceFormModal } from './model';
import { TimeFormatMap, PickerMap } from '../station-form/StationForm';
import moment from 'moment';
import _ from 'lodash'
import ExportButton from '../../../components/ExportButton';
import { disabledDateAfterToday } from '../../../util/dateUtil';
import utils from '../../../public/js/utils'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs';
import FormLayout from '../../../components/FormLayout';
import classNames from "classnames"

const { FieldItem } = FormLayout

interface Props
  extends DeviceFormModal,
  MakeConnectProps<DeviceFormModal> {
  loading?: boolean
  exportLoading?: boolean
  deviceTreeLoading?: boolean
  pageId: number
  stationDetail: any
}

const DeviceForm: React.FC<Props> = (props) => {
  const { exportLoading, deviceTreeList, deviceTreeLoading, loading, list, pageId, stationDetail } = props
  const { deviceType, timeMode, deviceList, timeRange } = props.query

  let columns: any = deviceType ? Columns[deviceType] : []
  const deviceTypeList = [{
    title: utils.intl('逆变器'),
    key: DeviceTypeMap.inverter,
  }, {
    title: utils.intl('汇流箱'),
    key: DeviceTypeMap.combinerBox,
  }, {
    title: utils.intl('变压器'),
    key: DeviceTypeMap.transformer
  }];

  const deviceTypeNameMap = {
    [DeviceTypeMap.inverter]: utils.intl('逆变器'),
    [DeviceTypeMap.combinerBox]: utils.intl('汇流箱'),
    [DeviceTypeMap.transformer]: utils.intl('变压器'),
  }


  const tabList = [
    {
      key: "day",
      name: utils.intl("日"),
      value: "day"
    },
    {
      key: "month",
      name: utils.intl("月"),
      value: "month"
    },
    {
      key: "year",
      name: utils.intl("年"),
      value: "year"
    },
    {
      key: "total",
      name: utils.intl("总"),
      value: "total"
    }
  ]

  if (timeMode !== 'day' && deviceType !== DeviceTypeMap.transformer) {
    columns = columns.filter(item => item.title !== '离散率')
  }

  const handleTimeRangeChange = (range) => {
    props.updateQuery({ timeRange: range })
    fetchData(deviceList);
  }

  // const handleTypeCheck = (keys) => {
  //   const newDeviceType = keys[0];
  //   if (!newDeviceType) {
  //     props.updateState({ deviceTreeList: [], list: [] })
  //     props.updateQuery({ deviceList: [], deviceType: newDeviceType })
  //   } else {
  //     if (newDeviceType !== deviceType) {
  //       props.updateQuery({ deviceType: newDeviceType, deviceList: [] })
  //       props.updateState({ list: [], deviceTreeList: [] })
  //       fetchDeviceList()
  //     }
  //   }
  // }

  const handleDeviceCheck = (keys, obj) => {
    props.updateQuery({ deviceList: keys, deviceType: `${obj?.typeIndex || 1}` })
    // fetchData(keys);
  }

  const changeTime = item => {
    props.updateQuery({
      timeMode: item.key,
      timeRange: [moment(), moment()]
    });
    // fetchData(deviceList);
  };

  const fetchData = (deviceList) => {
    if (!deviceList.length) {
      props.updateState({ list: [] })
      return;
    }
    props.action('getTableData');
  }

  const fetchDeviceList = (stationId) => {
    props.action('getDeviceTree', { stationId });
  }

  const handleExport = () => {
    if (!deviceType) {
      message.error(utils.intl("请选择设备类型"))
      return;
    }
    if (!deviceList.length) {
      message.error(utils.intl("请选择设备"))
      return;
    }
    props.action('onExport')
  }


  useEffect(() => {
    if (stationDetail?.id) fetchDeviceList(stationDetail?.id)
    return () => {
      props.action('reset');
    }
  }, [stationDetail?.id]);

  const language = localStorage.getItem('language') ?? 'zh';

  return (
    <Page pageId={pageId} showStation style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal>
        <ExportButton
          loading={exportLoading}
          onExport={handleExport}
          disabled={!deviceType || !deviceList.length}
        />
      </CrumbsPortal>
      <FormLayout
        onSearch={() => {
          props.action('getTableData')
        }}
        onReset={() => props.updateQuery({ deviceList: [], timeRange: [moment(), moment()], timeMode: 'day' })}>
        <FieldItem style={{ width: 200 }}>
          <TreeSelect
            singleCheck
            className={styles['tree-select']}
            label={utils.intl("设备选择")}
            title={utils.intl("请选择设备")}
            placeholder={utils.intl("请输入设备名称")}
            treeData={deviceTreeList}
            onCheck={handleDeviceCheck}
            checkedKeys={deviceList}
            loading={deviceTreeLoading}
          />
        </FieldItem>
        <FieldItem style={{ width: language === 'zh' ? 226 : 291 }}>
          <TabSelect list={tabList} onClick={changeTime} value={timeMode} size="large" />
        </FieldItem>
        {timeMode !== 'total' ? (
          <FieldItem>
            <RangePicker
              disabledDate={current => disabledDateAfterToday(current)}
              allowClear={false}
              picker={PickerMap[timeMode]}
              style={{ height: 36 }}
              value={timeRange}
              onChange={handleTimeRangeChange}
            />
          </FieldItem>
        ) : null
        }
        {/* <FieldItem style={{ width: 180 }}>
          <div className={styles['desc']}> {utils.intl('已选择设备')}{utils.intl("：")}{deviceList.length}{utils.intl("个")}</div>
        </FieldItem> */}
      </FormLayout>
      <section className={classNames(styles['page-container'], "page-sub-container")}>
        {/* <header className={styles['header']}>
          <div className={styles['filter']}>
            <div>
              <TreeSelect
                singleCheck
                noSearch
                defaultCheck={[deviceType]}
                size='small'
                className={styles['tree-select']}
                label={deviceType ? deviceTypeNameMap[deviceType] : utils.intl("设备类型选择")}
                title={utils.intl("请选择设备类型")}
                treeData={deviceTypeList}
                onCheck={handleTypeCheck}
              />
            </div>
            <div>
              <TreeSelect
                singleCheck
                className={styles['tree-select']}
                label={utils.intl("设备选择")}
                title={utils.intl("请选择设备")}
                placeholder={utils.intl("请输入设备名称")}
                treeData={deviceTreeList}
                onCheck={handleDeviceCheck}
                checkedKeys={deviceList}
                loading={deviceTreeLoading}
              />
            </div>
            <div>
              <TabSelect list={tabList} onClick={changeTime} value={timeMode} size="large" />
            </div>
            <div>
              {timeMode !== 'total' ? (
                <RangePicker
                  disabledDate={current => disabledDateAfterToday(current)}
                  allowClear={false}
                  picker={PickerMap[timeMode]}
                  style={{ height: 36, width: 250 }}
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                />
              ) : ''
              }
            </div>
            <div className={styles['desc']}> {utils.intl('已选择设备')}{utils.intl("：")}{deviceList.length}{utils.intl("个")}</div>
          </div>
        </header> */}
        <footer className={styles['footer']}>
          {columns.length > 0 && (
            <Table1
              x={500}
              columns={columns.map(item => ({
                ...item,
                title: utils.intl(item.title)
              }))}
              emptyText={utils.intl('暂无数据')}
              dataSource={list}
              loading={loading}
            />
          )}
        </footer>
      </section>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    ...state.global,
    loading: getLoading("getTableData"),
    deviceTreeLoading: getLoading("getDeviceTree"),
    exportLoading: getLoading("onExport"),
    language: state.global.language
  };
};

export default makeConnect(device_form, mapStateToProps)(DeviceForm);
