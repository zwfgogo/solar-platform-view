import React, { useEffect, useCallback } from 'react'
import { Tabs, Button, Modal, Empty } from 'wanke-gui'
import Footer from '../../../public/components/Footer'
import Back from '../../../public/components/Back'
import ShowElectrityDialog from '../../common-basic-station/list/ShowElectrityDialog'
import { r_u_station } from '../../constants'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import List8 from './List8'
import { Checkbox } from 'antd'
import FullContainer from '../../../components/layout/FullContainer'
import { FullLoading } from "wanke-gui"
import utils from '../../../public/js/utils'

const { confirm } = Modal
const { TabPane } = Tabs

const Layout = props => {
  const { rules1, rules2, periodEnumList, list, canUpdate, query, isSaved, stationEnums, stationSelected } = props

  let [showElectrityDailog, setVisible] = React.useState(false)
  const [recordInfo, setRecordInfo] = React.useState({})

  const lookStation = (id, record) => {
    setVisible(true)
    setRecordInfo(record)
    props.action('$fetchStationDetail', { stationId: id })
  }

  function callback(key) {
    if (isSaved) {
      props.action('updateQuery', {
        stationTypeId: parseInt(key)
      })
      props.action('$getList')
    } else {
      confirm({
        title: utils.intl('提示'),
        content: utils.intl('未保存，确定要切换吗'),
        okText: utils.intl('确定'),
        okType: 'danger',
        cancelText: utils.intl('取消'),
        onOk() {
          props.action('updateQuery', {
            stationTypeId: parseInt(key),
            isSaved: true
          })
          props.action('$getList')
        },
        onCancel() {
        }
      })
    }
  }

  //选择框回调
  const onSelectChange = (selectedRowKeys, selectedRows) => {
    props.action('updateState', {
      exit: false,
      stationSelected: selectedRowKeys
    })
  }

  // 全选
  const allSelect = useCallback((e) => {
    const { checked } = e.target
    console.log('e', e)
    props.action('updateState', {
      exit: false,
      stationSelected: checked ? list.map(item => item.id) : []
    })
  }, [list])

  const rowSelection = {
    selectedRowKeys: stationSelected,
    onChange: onSelectChange,
    columnTitle: <Checkbox
      disabled={!canUpdate}
      indeterminate={list.length !== Array.from(new Set(stationSelected)).length && stationSelected && stationSelected.length > 0}
      checked={list.length === Array.from(new Set(stationSelected)).length}
      onChange={allSelect}
    />,
    getCheckboxProps: record => {
      return ({
        disabled: !canUpdate,
      })
    }
  }
  const handle = () => {
    props.action('$save', {
      stationSelected: stationSelected
    })
  }

  useEffect(() => {
    const { firmId, roleName, userId } = props
    props.action('reset')
    props.action('updateQuery', {
      firmId,
      userId
    })
    props.action('updateState', {
      roleName
    })
    props.action('$getEnums')
    props.action('fetchElectrictPeriodEnum')
  }, [])

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('电站权限')} className="rights-station-page">
      <FullContainer>
        <Tabs activeKey={query.stationTypeId + ''} onChange={callback}>
          {stationEnums && stationEnums.map((o, i) => {
            return <TabPane tab={o.name} key={o.value + ''} />
          })}
        </Tabs>
        <div className="flex1 f-pr e-pl10 e-pr10">
          {
            // (props.stationTypeLoading || props.loading) && (<FullLoading style={{ background: '#fff' }} />)
          }
          {
            stationEnums && stationEnums.length == 0 && !props.loading && (
              <div className="vh-center">
                <Empty />
              </div>
            )
          }
          {stationEnums && stationEnums.length !== 0 && (
            <List8
              loading={props.loading}
              dataSource={list} rowSelection={rowSelection} lookStation={lookStation}
            />
          )}
        </div>

        {/* <Back {...props}/> */}
        {
          canUpdate && (
            <Footer>
              <Button type="primary" style={{ marginLeft: '10px' }} onClick={handle}>
                {utils.intl('保存')}
              </Button>
            </Footer>
          )
        }
        <ShowElectrityDialog
          loading={props.priceLoading}
          visible={showElectrityDailog}
          onCancel={() => {
            setVisible(false)
            props.action('updateState', {
              rules1: [],
              rules2: {}
            })
          }}
          rules1={rules1}
          rules2={rules2}
          recordInfo={recordInfo}
        // periodEnumList={periodEnumList}
        />
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model,
    loading: getLoading('$getList'),
    stationTypeLoading: getLoading('$getEnums'),
    priceLoading: getLoading('$fetchStationDetail')
  }
}

export default makeConnect(r_u_station, mapStateToProps)(Layout)
