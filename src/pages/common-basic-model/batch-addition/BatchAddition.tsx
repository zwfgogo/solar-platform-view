import React, { useEffect } from 'react'
import { Button, Col, Row, Input, message } from 'wanke-gui'
import Footer from '../../../public/components/Footer'
import Header from '../../../public/components/Header/index'
import Back from '../../../public/components/Back'
import { getAction, getActionType } from '../../umi.helper'
import { r_e_batch_addition } from '../../constants'

import Page from '../../../components/Page'

import { makeConnect } from '../../umi.helper'
import List3 from './List3'
import FullContainer from '../../../components/layout/FullContainer'
import utils from '../../../public/js/utils'

const { Search } = Input

const BatchAddition = props => {
  const { libraryList, dispatch, total, query, _id, selectTerminal } = props
  let [selectedRowKeys, setSelectedRowKeys] = React.useState([])
  const handleSearch = () => {
    props.action('$getList')
  }

  const handle = () => {
    if (selectedRowKeys && selectedRowKeys.length === 0) {
      message.warning(utils.intl('请选择内容再编辑'))
    } else {
      props.action('$batchSave', {
        deviceTypeId: props.deviceTypeId,
        selectedRowKeys,
        selectTerminal,
        back: props.back
      })
    }
  }
  //选择框回调
  const onSelectChange = (selectedRowKeys, selectedRows) => {
    props.action('updateState', { exit: false })
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 80
  }

  useEffect(() => {
    props.updateState({ deviceTypeId: _id })

    props.action('$getList')
    return () => {
      props.action('updateState', {
        libraryList: [],
        queryStr: '',
        deviceTypeId: null
      })
    }
  }, [])

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('批量添加数据项')} className="rights-batch-addition-page">
      <FullContainer>
        <Header title={utils.intl('批量添加数据项')}></Header>
        <Row>
          <Col span={6}>
            <span className="e-pl10">
              <Search
                onChange={e => {
                  props.action('updateState', {
                    queryStr: e.target.value
                  })
                }}
                onSearch={handleSearch}
                name="query"
                style={{ width: '300px', paddingLeft: '10px' }}
                placeholder={utils.intl('请输入关键字查询')}
              />
            </span>
          </Col>
        </Row>
        <div className="flex1 e-pt10 f-pr e-mr10 e-ml10">
          <List3
            dataSource={libraryList}
            rowSelection={rowSelection}
          />
        </div>
        <Footer>
          <Back>{utils.intl('取消')}</Back>
          <Button type="primary" loading={props.loading} style={{ marginLeft: '10px' }} onClick={handle}>
            {utils.intl('保存')}
          </Button>
        </Footer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('$batchSave')
  }
}

export default makeConnect('model_batch_addition', mapStateToProps)(BatchAddition)
