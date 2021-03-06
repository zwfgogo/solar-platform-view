import React, { useEffect, useRef, useState } from 'react'
import { CrumbState, Dispatch, GlobalState } from 'umi';
import Page from '../../components/Page'
import { makeConnect } from '../umi.helper'
import { LgcManagement, modelNamespace } from './models';
import { Button, DatePicker, FormTable, message, Popconfirm, InputNumber, Tooltip } from 'wanke-gui'
import { Form } from 'antd'
import utils from '../../public/js/utils';
import "./index.less"
import moment, { Moment } from 'moment';
import { PlusOutlined, VerticalAlignBottomOutlined } from 'wanke-icon';
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import CommonEcharts from '../../components/charts/common-echarts/CommonEcharts';
import AutoSizer from "../../components/AutoSizer";
import _ from 'lodash'
import Modal from 'antd/lib/modal/Modal';
import { exportCSV } from '../../util/fileUtil';
import { CrumbsPortal } from '../../frameset/Crumbs';
import classNames from 'classnames'

const { RangePicker } = DatePicker
const FormItem = Form.Item

interface Props extends MakeConnectProps<LgcManagement>, LgcManagement, GlobalState, Dispatch {
  pageId: number,
  loading: boolean,
  crumbs: any
}


// const layout = {
//   labelCol: { span: 7 },
//   wrapperCol: { span: 17 },
// };

const index: React.FC<Props> = (props) => {
  const { lgcList, sellCount, earnCount, stationDetail, xData, sellNumList, earnNumList, profitList, theme, loading, crumbs, stationList } = props
  const [dates, setDates] = useState([moment(), moment()])
  const [editCellKeys, setEditCellKeys] = useState([])
  const [visible, setVisible] = useState(false)
  const [isClickEdit, setIsClickEdit] = useState(false)

  const tableFormBox = useRef();
  const formBox = useRef();

  const dtimes = lgcList.filter((item, index) => index > 0).map(item => moment(item.dtime, 'YYYY-MM-DD').format('YYYY-MM'))
  const editIndex = editCellKeys && editCellKeys.length && parseInt(editCellKeys[0].split('_')[1]) || 0

  const options = {
    tooltip: {
      trigger: 'axis',
      // formatter: (params) => {

      //   // console.log('params', params)
      //   return params.map(item => {
      //     const { componentSubType, seriesName, value, marker } = item
      //     return `${marker} ${seriesName}: ${value}${componentSubType === 'line' ? utils.intl('??????') : utils.intl('???')}`
      //   }).join('<br/>')
      // }
    },
    grid: {
      left: 70,
      right: 70,
      bottom: 40
    },
    legend: {
      data: [utils.intl('??????LGC'), utils.intl('??????LGC'), utils.intl('??????')],
      textStyle: {
        color: theme === 'dark' ? '#ccc' : '#333'
      },
      inactiveColor: theme === 'dark' ? '#555' : '#ccc',
    },
    color: ['#0062FF', '#27AE60', '#F2994A'],
    xAxis: [
      {
        type: 'category',
        data: xData,
        axisPointer: {
          type: 'shadow'
        },
        axisLine: {
          lineStyle: {
            color: '#92929d'
          }
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: utils.intl('???'),
        axisLabel: {
          formatter: `{value}`
        },
        axisLine: {
          lineStyle: {
            color: '#92929d'
          }
        },
      },
      {
        type: 'value',
        name: utils.intl('??????'),
        axisLabel: {
          formatter: `{value}`
        },
        axisLine: {
          lineStyle: {
            color: '#92929d'
          }
        },
      }
    ],
    series: [
      {
        name: utils.intl('??????LGC'),
        type: 'bar',
        barWidth: 6,
        data: earnNumList
      },
      {
        name: utils.intl('??????LGC'),
        type: 'bar',
        barWidth: 6,
        data: sellNumList
      },
      {
        name: utils.intl('??????'),
        type: 'line',
        yAxisIndex: 1,
        data: profitList
      }
    ]
  }

  const columns = [
    {
      title: utils.intl("??????1"),
      dataIndex: "dtime",
      key: "dtime",
      width: 250,
      renderType: "datePicker",
      // align: "center",
      componentProps: {
        format: "YYYY-MM",
        disabledDate: (currentDate: Moment) => {
          const isDisabledDate = stationDetail?.productionTime ? currentDate.isAfter(moment(), 'M') || currentDate.year() < moment(stationDetail?.productionTime, 'YYYY-MM-DD HH:mm').year() : true
          return isDisabledDate || !!dtimes.find((d, index) => currentDate.format('YYYY-MM') === d && index + 1 !== editIndex)
        },
        picker: "month"
      },
      render: (value) => value.indexOf('-') > 0 ? moment(value, 'YYYY-MM-DD').format('YYYY-MM') : value,
      rules: [{ required: true, message: utils.intl("???????????????") }]
    },
    {
      title: utils.intl("??????LGC"),
      dataIndex: "earnCount",
      key: "earnCount",
      renderType: "inputNumber",
      width: 120,
      // align: "right",
      rules: [{ required: true, message: utils.intl("???????????????LGC") }]
    },
    {
      title: utils.intl("??????LGC"),
      dataIndex: "sellCount",
      key: "sellCount",
      renderType: "inputNumber",
      width: 120,
      // align: "right",
      rules: [{ required: true, message: utils.intl("???????????????LGC") }]
    },
    {
      title: utils.intl("??????"),
      dataIndex: "price",
      key: "price",
      renderType: "inputNumber",
      width: 120,
      // align: "right",
      render: (value) => `${value}${utils.intl("??????")}`,
      rules: [{ required: true, message: utils.intl("???????????????") }]
    },
    {
      title: utils.intl("??????"),
      dataIndex: "profit",
      key: "profit",
      renderType: "inputNumber",
      width: 120,
      // align: "right",
      render: (value) => `${value}${utils.intl("??????")}`,
      rules: [{ required: true, message: utils.intl("???????????????") }]
    },
    {
      title: utils.intl("??????"),
      dataIndex: "oprate",
      key: "oprate",
      width: 200,
      align: "right",
      render: (value, record, index) => record.dtime && record.dtime.indexOf('-') >= 0 ?
        editIndex === index ? (<div className="lgc-table-btns">
          <Tooltip placement="top" title={utils.intl("????????????")} visible={isClickEdit}><div></div></Tooltip>
          <span className="confirm-btn" onClick={() => {
            const { form } = tableFormBox.current
            const { validateFields } = form
            validateFields().then(val => {
              const value = _.mapKeys(val, (value, key) => key.split('_')[0])
              value.dtime = value.dtime.format('YYYY-MM-01')
              props.dispatch({ type: `${modelNamespace}/updateLGC`, payload: { data: { ...record, ...value }, dtime: [dates[0].format('YYYY-01-01 00:00:00'), dates[1].format('YYYY-12-01 00:00:00')].join() } })
                .then(result => {
                  if (result.errorCode === 0) {
                    message.success(utils.intl('????????????'))
                    tableCancel();
                  }
                })
            })
          }}>{utils.intl("??????")}</span>
          <span className="cancel-btn" onClick={tableCancel}>{utils.intl("??????")}</span>
        </div>) :
          (
            <div className="lgc-table-btns">
              <span className="confirm-btn" onClick={() => {
                if (editCellKeys && editCellKeys.length) {
                  setIsClickEdit(true)
                } else {
                  setEditCellKeys([`dtime_${index}`, `earnCount_${index}`, `sellCount_${index}`, `price_${index}`, `profit_${index}`])
                }
              }}>{utils.intl("??????")}</span>
              <Popconfirm
                title={utils.intl('???????????????')}
                onConfirm={() => {
                  props.dispatch({ type: `${modelNamespace}/deleteLGC`, payload: { data: record, dtime: [dates[0].format('YYYY-01-01 00:00:00'), dates[1].format('YYYY-12-01 00:00:00')].join() } })
                    .then(() => message.success(utils.intl("????????????")))
                }}
                // onCancel={cancel}
                okText={utils.intl('??????')}
                cancelText={utils.intl("??????")}
              >
                <span className="cancel-btn">{utils.intl("??????")}</span>
              </Popconfirm>
            </div>
          ) : null
    }
  ]

  const changeDate = (value: [Moment, Moment]) => {
    setDates(value)
  }

  // ????????????
  const tableCancel = () => {
    const { form } = tableFormBox.current
    const { resetFields } = form
    setEditCellKeys([])
    setIsClickEdit(false)
    setVisible(false)
    resetFields();
  }

  useEffect(() => {
    const stationId = stationDetail?.id
    const lgcStationList = (stationList || []).filter(item => item.timeZone.indexOf('Australia') > -1)
    const dtime = [dates[0].format('YYYY-01-01 00:00:00'), dates[1].format('YYYY-12-01 00:00:00')].join()
    if (stationId && lgcStationList.find(item => item.id === stationId)) searchLGC({ stationId, dtime })
  }, [dates, stationDetail?.id, stationList]);

  // ??????lgc
  const searchLGC = ({ stationId, dtime }) => {
    props.dispatch({ type: `${modelNamespace}/getLGC`, payload: { stationId, dtime } })
    props.dispatch({ type: `${modelNamespace}/getCountByStationId`, payload: { stationId } })
  }

  const language = localStorage.getItem('language')

  return (
    <Page pageId={crumbs[crumbs.length - 1].pageId} showStation={list => {
      return list.filter(item => item.timeZone.indexOf('Australia') > -1)
    }} className="lgc-page">
      <CrumbsPortal>
        <Button type="primary" onClick={() => setVisible(true)}>{utils.intl("??????")}</Button>
        <Button style={{ marginLeft: 16 }} type="primary" onClick={() => {
          const newLgcList = lgcList.map(item => ({
            ...item,
            // earnCount: `${item.earnCount}${utils.intl('???')}`,
            // sellCount: `${item.sellCount}${utils.intl('???')}`,
            price: `${item.price}${utils.intl('??????')}`,
            profit: `${item.profit}${utils.intl('??????')}`
          }))
          exportCSV(columns.filter((item, index) => index < columns.length - 1), newLgcList, `LGC-${[dates[0].format('YYYY'), dates[1].format('YYYY')].join('_')}`)
        }}>{utils.intl("??????")}</Button>
      </CrumbsPortal>
      <header className="lgc-header">
        <div>{utils.intl("????????????LGC??????")}:<span style={{ color: "#27ae60", marginLeft: 5 }}>{sellCount}</span>{utils.intl("???")}</div>
        <div>{utils.intl("????????????LGC??????")}:<span style={{ color: "#0062ff", marginLeft: 5 }}>{earnCount - sellCount}</span>{utils.intl("???")}</div>
      </header>
      <div className="lgc-filter">
        <RangePicker
          format="YYYY"
          picker="year"
          value={dates as [Moment, Moment]}
          allowClear={false}
          disabledDate={(currentDate: Moment) => {
            const isDisabledDate = stationDetail?.productionTime ? currentDate.year() > moment().year() || currentDate.year() < moment(stationDetail?.productionTime, 'YYYY-MM-DD HH:mm').year() : true
            return isDisabledDate
          }}
          onChange={changeDate} />

      </div>
      <div className="lgc-charts">
        <CommonEcharts option={options} />
      </div>
      <div className="lgc-table">
        <div className="lgc-table-header">
          <div>{utils.intl("???????????????")}</div>

        </div>
        <div className="lgc-table-body">
          <AutoSizer style={{ overflow: 'visible' }}>
            {({ width, height }) => (
              <FormTable
                errorTipType="icon"
                columns={columns}
                ref={tableFormBox}
                loading={loading}
                editCellKeys={editCellKeys}
                size="small"
                scroll={{ y: height }}
                dataSource={lgcList}
                onValuesChange={(changedValues, allValues) => {
                  // console.log(changedValues, allValues)
                }}
              />
            )}
          </AutoSizer>
        </div>
      </div>
      <Modal
        visible={visible}
        title={utils.intl('??????LGC????????????')}
        width={396}
        destroyOnClose
        maskClosable={false}
        onCancel={() => { setVisible(false); }}
        okText={utils.intl('??????')}
        cancelText={utils.intl('??????')}
        onOk={() => {
          const { validateFields } = formBox.current
          validateFields().then(value => {
            value.dtime = value.dtime.format('YYYY-MM-01')
            const stationId = stationDetail?.id
            props.dispatch({ type: `${modelNamespace}/createLGC`, payload: { data: { ...value, stationId }, dtime: [dates[0].format('YYYY-01-01 00:00:00'), dates[1].format('YYYY-12-01 00:00:00')].join() } })
              .then(result => {
                if (result.errorCode === 0) {
                  message.success(utils.intl('????????????'))
                  tableCancel();
                }
              })
          })
        }}
      >
        <Form
          // {...layout}
          layout={language === 'zh' ? "horizontal" : "vertical"}
          className={classNames("lgc-modal-box", `new-style-form-${language}`)}
          ref={formBox}
        >
          <FormItem
            label={utils.intl("????????????")}
            name="dtime"
            rules={[{ required: true, message: utils.intl('?????????????????????') }]}
          >
            <DatePicker style={{ width: language === 'zh' ? 200 : '100%' }} format="YYYY-MM" disabledDate={(currentDate: Moment) => {
              const isDisabledDate = stationDetail?.productionTime ? currentDate.isAfter(moment(), 'M') || currentDate.year() < moment(stationDetail?.productionTime, 'YYYY-MM-DD HH:mm').year() : true
              return isDisabledDate || !!dtimes.find((d, index) => currentDate.format('YYYY-MM') === d)
            }} picker="month" />
          </FormItem>
          <FormItem
            label={utils.intl("??????LGC")}
            name="earnCount"
            rules={[{ required: true, message: utils.intl("???????????????LGC") }]}
          >
            <InputNumber style={{ width: language === 'zh' ? 200 : '100%' }} placeholder={utils.intl("?????????")} />
          </FormItem>
          <FormItem
            label={utils.intl("??????LGC")}
            name="sellCount"
            rules={[{ required: true, message: utils.intl("???????????????LGC") }]}
          >
            <InputNumber style={{ width: language === 'zh' ? 200 : '100%' }} placeholder={utils.intl("?????????")} />
          </FormItem>
          <FormItem
            label={utils.intl("??????")}
            name="price"
            extra={<div className="edit-form-extra" style={{ left: language === 'zh' ? 152 : 298 }}>{utils.intl("??????")}</div>}
            rules={[{ required: true, message: utils.intl("???????????????") }]}
          >
            <InputNumber style={{ width: language === 'zh' ? 159 : 305 }} placeholder={utils.intl("?????????")} />
          </FormItem>
        </Form>
      </Modal>
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {

  return {
    ...model,
    ...state.global,
    ...state.crumbs,
    loading: getLoading('getLGC'),
  };
}

export default makeConnect(modelNamespace, mapStateToProps)(index) 
