import React, { useEffect } from 'react'
import { Tabs, Button, Modal, Empty } from 'wanke-gui'
import ShineTree from 'shineout/lib/Tree'
import Footer from '../../public/components/Footer'
import Back from '../../public/components/Back'
import { crumbsNS, r_o_menu_select } from '../constants'
import Page from '../../components/Page'
import { makeConnect } from '../umi.helper'
import { FullLoading } from "wanke-gui"
import utils from '../../public/js/utils'
import { WankeFileOutlined, WankeFolderCloseOutlined, WankeFolderOpenOutlined } from 'wanke-icon'


function Layout(this: null, props) {
  const { menuData, exit, selectMenu } = props

  const handleDisabled = (tab, item) => {

    if (!tab.isUpdate) {
      return true
    }
    if (tab.disable && tab.disable.indexOf(item.id) != -1) {
      return true
    }
    return false
  }
  let menuInfo = menuData.list && menuData.list.length > 0 ? (
    <div className="f-df g-wh100 flex1 e-pt10 e-pb10 f-pr f-oa">
      <div className="flex-shrink" style={{ width: '100px' }}></div>
      <div className={'e-ml10  e-mr10 checkboxline flex1 f-oa'}>
        <ShineTree
          mode={1}
          data={menuData.list}
          disabled={(item) => handleDisabled(menuData, item)}
          keygen="id"
          defaultExpandAll={true}
          onChange={e => selectTree(e)}
          value={selectMenu}
          renderItem={(node, isExpanded) => (
            <span>
              {
                !node.children || node.children.length === 0 ? <WankeFileOutlined style={{ marginRight: 8 }} /> : isExpanded ? <WankeFolderOpenOutlined style={{ marginRight: 8 }} /> : <WankeFolderCloseOutlined style={{ marginRight: 8 }} />
              }
              {`${node.title}`}
            </span>
          )} />
      </div>
    </div>
  ) :
    (<div className="vh-center">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
    );

  const handle = () => {
    props.action('$save', { roleId: props.roleId })
  }

  const calBack = () => {
    props.dispatch({
      type: `${crumbsNS}/updateCrumbs`,
      payload: {
        type: 'back', count: 1
      }
    })
  }

  const selectTree = o => {
    props.action('updateState', {
      selectMenu: o,
      exit: false
    })
  }

  useEffect(() => {
    props.action('reset')
    const { terminalType, firmTypeName } = props
    props.action('updateQuery', {
      terminalType,
      firmType: firmTypeName
    })
    props.action('$getList', { firmId: props.firmId, roleId: props.roleId })
  }, [])

  return (
    <Page className="menu-select-page" pageId={props.pageId} pageTitle={utils.intl(props.pageTitle)}>
      {
        props.loading && (<FullLoading />)
      }
      <div className="f-df flex-column">
        <div className="flex1 TabHeight f-oa">
          {menuInfo}
        </div>

        {/* <Back>{utils.intl('取消')}</Back> */}
        {menuData?.isUpdate && (
          <Footer>
            <Button type="primary" style={{ marginLeft: '10px' }} onClick={handle} loading={props.updateLoading}>
              {utils.intl('保存')}
            </Button>
            <Button style={{ marginLeft: '10px' }} onClick={calBack}>
              {utils.intl('取消')}
            </Button>
          </Footer>
        )}
      </div>
    </Page>
  )
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model,
    loading: getLoading('$getList'),
    updateLoading: getLoading('$save')
  }
}

export default makeConnect(r_o_menu_select, mapStateToProps)(Layout)
