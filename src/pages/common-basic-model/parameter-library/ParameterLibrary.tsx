import React, { useEffect } from 'react'
import { Button, Col, Row, Input, message } from 'wanke-gui'
import Footer from '../../../public/components/Footer'
import Header from '../../../public/components/Header/index'
import ListItemDelete from '../../../public/components/ListItemDelete/index'
import DeleteForm from '../data-item-view/DeleteForm'
import LibraryForm from './LibraryForm'
import Back from '../../../public/components/Back'

import { r_e_parameter_library } from '../../constants'
import { getActionType } from '../../umi.helper'

import Page from '../../../components/Page'

import { makeConnect } from '../../umi.helper'
import List5 from './List5'
import FullContainer from '../../../components/layout/FullContainer'
import { ParameterLibraryState } from './model'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'

const {Search} = Input


interface Props extends ParameterLibraryState, MakeConnectProps<ParameterLibraryState>, PageProps {
  loading: boolean
}

const Layout: React.FC<Props> = function(this: null, props) {
  const {libraryList, dispatch, deleteModal, libraryModal} = props
  let [selectedRowKeys, setSelectedRowKeys] = React.useState([])
  const edit = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(utils.intl('编辑数据项需选中目标数据项'))
    } else if (selectedRowKeys && selectedRowKeys.length === 1) {
      let o
      for (let i = 0; i < libraryList.length; i++) {
        if (libraryList[i].id === selectedRowKeys[0]) {
          o = libraryList[i]
        }
      }
      props.action('updateState', {
        libraryModal: true,
        libraryRecord: o,
        libraryModalTitle: '编辑数据项'
      })
    } else {
      message.warning(utils.intl('请选择一项内容进行编辑'))
    }
  }
  const New = () => {
    props.action('getName')
  }
  const del = () => {
    if (selectedRowKeys && selectedRowKeys.length === 0) {
      message.warning(utils.intl('删除数据项需选中目标数据项'))
    } else {
      props.parentPageNeedUpdate('deleteLibrary')
      props.action('$del', {
        deleteId: selectedRowKeys
      })
      setSelectedRowKeys([])
    }
  }

  const handleSearch = () => {
    props.action('$getList')
  }
  //选择框回调
  const onSelectChange = (selectedRowKeys, selectedRows) => {
    props.action('updateState', {
      exit: false
    })
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange
  }

  useEffect(() => {
    props.action('reset')
    props.action('$getList')
    props.action('$getEnums')
  }, [])
  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('数据参数库')} className="rights-parameter-library-page">
      <FullContainer className="e-pr10">
        <Header title={utils.intl('数据参数库')}></Header>
        <Row className="e-pl10">
          <Col span={18}>
            <Search
              onChange={e => {
                props.action('updateQuery', {
                  queryStr: e.target.value
                })
              }}
              onSearch={handleSearch}
              name="detailSearch"
              style={{width: '300px',paddingLeft:'10px'}}
              placeholder={utils.intl('请输入关键字查询')}
            />
          </Col>
          <Col span={6} className="f-tar">
            {/* <Button type="primary" onClick={New}>
              {utils.intl('添加')}
            </Button> */}
            <Button type="primary" onClick={edit} style={{marginLeft: 16}}>
              {utils.intl('编辑')}
            </Button>
          </Col>
        </Row>
        <div className="flex1 e-p10 f-pr">
          <List5
            loading={props.loading}
            dataSource={libraryList}
            rowSelection={rowSelection}
          />
        </div>
        <Footer>
          {/* <Back>{utils.intl('取消')}</Back> */}
          <Button type="primary">
            <ListItemDelete onConfirm={del}/>
          </Button>
        </Footer>
        {deleteModal ? <DeleteForm/> : ''}
        {libraryModal && (
          <LibraryForm
            parentPageNeedUpdate={props.parentPageNeedUpdate}
          />
        )}
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model,
    loading: getLoading('$getList')
  }
}

export default makeConnect('model_parameter_library', mapStateToProps)(Layout)
