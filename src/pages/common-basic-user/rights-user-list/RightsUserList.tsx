import React, { useEffect } from 'react'
import { Input, Row, Col, Button } from 'wanke-gui'
import Header from '../../../components/Header/index'
import Form from './Form'
import Tree from './Tree'

import { globalNS, r_u_user_list } from '../../constants'
const { Search } = Input

import Page from '../../../components/Page'

import { makeConnect } from '../../umi.helper'
import List9 from './List9'
import Export from '../../../components/layout/Export'
import FullContainer from '../../../components/layout/FullContainer'
import Tools from '../../../components/layout/Tools'
import { RightsUserListState } from '../models/rights-user-list'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { traverseTree } from '../../page.helper'
import { GlobalState } from '../../../models/global'
import { FullLoading } from "wanke-gui"
import utils from '../../../public/js/utils'
import { CrumbsPortal } from '../../../frameset/Crumbs'

const { Search: SearchInput } = Input

interface Props extends RightsUserListState, PageProps, MakeConnectProps<RightsUserListState>,
  Pick<GlobalState, 'roleName'> {
  loading: boolean
  treeLoading: boolean
  queryStr: string
  _firmId: number
  _treeKey: number
}

const UserList: React.FC<Props> = function (this: null, props) {
  const { list, modal, activity, query, firmId, total } = props
  const del = o => {
    props.parentPageNeedUpdate('deleteUser')
    props.action('$del', {
      o
    })
  }
  const reset = o => {
    props.action('$reset', {
      o
    })
  }
  const New = () => {
    props.action('getSelection', { firmId })
    props.action('getFirms', { firmId })
    props.action('updateState', {
      modal: true,
      record: {},
      modalTitle: '新增用户'
    })
  }
  const edit = record => {
    props.action('editUser', { record })
    // props.action('getFirms', {firmId: record.firmId})
    // props.action('updateState', {
    //   modal: true,
    //   record,
    //   modalTitle: '编辑用户'
    // })
    // props.action('getSelection', {firmId})
  }

  const changeSearch = (type, value) => {
    props.action('updateQuery', {
      [type]: value
    })
  }
  const handleSearch = () => {
    props.action('pageChange', { page: 1, size: 20 })
    props.action('$getList', { firmId: props.firmId })
  }

  useEffect(() => {
    props.action('reset')
    const { activity, _firmId, _treeKey } = props
    if (props.queryStr) {
      props.updateQuery({ queryStr: props.queryStr, firmId: _firmId })
    }
    props.action('updateState', { activity, treeKey: _treeKey ? _treeKey : '', firmId: _firmId })
    props.action('$getTree', { firmId: _firmId })
  }, [])

  let title = traverseTree(props.companyTree, item => item.key == props.treeKey ? item.title : null)
  let individual = traverseTree(props.companyTree, item => item.key == props.treeKey ? item.individual : null)

  const language = localStorage.getItem("language")

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl("用户权限管理")} className="rights-user-page"
      style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal pageName='list'>
        {
          props.roleName === 'Admin' && !individual && (
            <Button style={{ marginLeft: 16 }} type="primary" onClick={New}>
              {utils.intl('新增')}
            </Button>
          )
        }
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
        <FullContainer className="flex1 page-right-container">
          <Header borderBottom title={language === 'zh' ? `${title || ''}用户信息` : "User Information"}>
            <span>
              <SearchInput
                // searchSize="small"
                name="queryStr"
                value={query.queryStr}
                onChange={e => {
                  changeSearch('queryStr', e.target.value)
                }}
                placeholder={utils.intl("请输入关键字查询")}
                style={{ width: '300px' }}
                onSearch={handleSearch}
              />
            </span>
          </Header>
          <div className="flex1" style={{ margin: 10, position: 'relative' }}>
            <List9
              {...props}
              individual={individual}
              loading={props.loading}
              stationDisplay={props.stationDisplay}
              dataSource={list}
              total={total} page={query.page} size={query.size} onPageChange={props.onPageChange('$getList')}
              activity={activity} edit={edit} del={del} reset={reset}
            />
          </div>
          {modal && <Form parentPageNeedUpdate={props.parentPageNeedUpdate} />}
        </FullContainer>
      </div>
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    roleName: state[globalNS].roleName,
    loading: getLoading('$getList'),
    treeLoading: getLoading('$getTree'),
    language: state.global.language
  }
}

export default makeConnect(r_u_user_list, mapStateToProps)(UserList)
