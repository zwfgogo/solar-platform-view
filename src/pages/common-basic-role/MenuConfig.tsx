import React, { useEffect } from 'react'
import { MenuSelectState } from 'umi'
import { Button, FullLoading } from 'wanke-gui'
import CommonHeader from '../../components/CommonHeader'
import CommonTitle from '../../components/CommonTitle'
import EmptyData from '../../components/EmptyData'
import Page from '../../components/Page'
import { CrumbsPortal } from '../../frameset/Crumbs'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { r_o_menu_select } from '../constants'
import { makeConnect } from '../umi.helper'
import './menu-config.less'
import MenuTree from './MenuTree'

interface Props extends PageProps, MakeConnectProps<MenuSelectState>, MenuSelectState {
  pageTitle: string
  terminalType: any
  firmTypeName: any
  firmId: any
  roleId: any
  loading: boolean
  updateLoading: boolean
}

const MenuConfig: React.FC<Props> = (props) => {
  const { menuData, selectMenu } = props

  const handleDisabled = (tab, item) => {

    if (!tab.isUpdate) {
      return true
    }
    if (tab.disable && tab.disable.indexOf(item.id) != -1) {
      return true
    }
    return false
  }

  const selectTree = o => {
    props.action('updateState', {
      selectMenu: o,
      exit: false
    })
  }


  const handleSave = () => {
    props.action('$save', { roleId: props.roleId, firmId: props.firmId })
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
    <Page className="menu-config-page" pageId={props.pageId} pageTitle={utils.intl(props.pageTitle)}>
      {
        props.loading && (<FullLoading />)
      }
      <CrumbsPortal>
        {menuData?.isUpdate && (
          <>
            <Button type="primary" style={{ marginLeft: 8 }} onClick={handleSave} loading={props.updateLoading}>
              {utils.intl('保存')}
            </Button>
          </>
        )}
      </CrumbsPortal>
      <CommonTitle
        fontSize={16}
        iconHeight={12}
        className="menu-config-title"
        title={utils.intl('tabManageLook.菜单功能')}
      />
      <section className="menu-config-body">
        {menuData.list && menuData.list.length > 0 ? (
          <MenuTree
            list={menuData.list}
            disabled={(item) => handleDisabled(menuData, item)}
            onChange={e => selectTree(e)}
            value={selectMenu}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <EmptyData />
          </div>
        )}
      </section>
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

export default makeConnect(r_o_menu_select, mapStateToProps)(MenuConfig)
