import React, { useEffect } from 'react'
import { Input, Button, Row, Col } from 'wanke-gui'
import Header from '../../../components/Header/index'
import Page from '../../../components/Page'
import Form from './Form'
import Tree from './Tree'
import { r_o_role_list } from '../../constants'
import { makeConnect } from '../../umi.helper'
import List7 from './List7'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { RightsRoleState } from '../models/rights-role-list'
import { FullLoading } from "wanke-gui"
import utils from '../../../public/js/utils'
import { CrumbsPortal } from '../../../frameset/Crumbs'

const { Search } = Input

interface Props extends PageProps, MakeConnectProps<RightsRoleState>, RightsRoleState {
  loading: boolean
  treeLoading: boolean
}

const Layout: React.FC<Props> = (props) => {
  const { list, modal, activity, firmTitle, treeKey, query, total, firmTypeName } = props
  const New = () => {
    props.action('updateState', {
      modal: true,
      record: {},
      modalTitle: '新增角色'
    })
  }
  const del = o => {
    props.action('$del', {
      o
    })
  }
  const edit = o => {
    props.action('updateState', {
      modal: true,
      record: o,
      modalTitle: '编辑角色'
    })
  }

  const changeSearch = (type, value) => {
    props.action('updateQuery', {
      [type]: value
    })
  }
  const handleSearch = () => {
    props.action('pageChange', { page: 1, size: 20 })
    props.action('$getList')
  }

  useEffect(() => {
    props.action('reset')
    props.action('$getTree')
  }, [])

  const language = localStorage.getItem("language")

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('角色权限管理')} className="rights-role-list-page"
      onNeedUpdate={() => props.action('$getList')}
      style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal pageName='RightsRoleList'>
        {sessionStorage.getItem('isAdmin') === 'Admin' && activity ? (
          <Button style={{ marginLeft: 16 }} type="primary" onClick={New}>
            {utils.intl('新增')}
          </Button>
        ) : (
          ''
        )}
        <Button style={{ marginLeft: 16 }} type="primary" onClick={() => props.action('onExport')}>
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <div className="f-df">
        <div style={{ width: '260px', padding: '20px 10px 10px 20px', boxShadow: '0px 4px 10px 2px rgb(0 0 0 / 5%)' }} className="flex-shrink f-df bf-br4">
          <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            {props.treeLoading && <FullLoading />}
            <Tree />
          </div>
        </div>
        <div className="flex1 f-df flex-column page-right-container">
          <Header borderBottom title={language === 'zh' ? `${firmTitle}角色权限管理` : "Role Authority"}>
            <span className="e-ml10">
              <Search
                // searchSize="small"
                name="queryStr"
                value={query.queryStr}
                onChange={e => {
                  changeSearch(e.target.name, e.target.value)
                }}
                placeholder={utils.intl('请输入关键字查询')}
                style={{ width: '300px' }}
                onSearch={handleSearch}
              />
            </span>
          </Header>
          <div className="flex1" style={{ margin: 10, position: 'relative' }}>
            <List7
              loading={props.loading}
              dataSource={list}
              menuDisplay={props.menuDisplay}
              firmTypeName={firmTypeName}
              total={total} page={query.page} size={query.size} onPageChange={props.onPageChange('$getList')}
              del={del} edit={edit} activity={activity} firmId={query.firmId} firmTitle={firmTitle} treeKey={treeKey}
            />
          </div>
          {modal ? <Form /> : ''}
        </div>
      </div>
    </Page>
  )
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model,
    loading: getLoading('$getList'),
    treeLoading: getLoading('$getTree')
  }
}

export default makeConnect(r_o_role_list, mapStateToProps)(Layout)
