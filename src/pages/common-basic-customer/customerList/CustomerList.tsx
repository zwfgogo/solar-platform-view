import React, { useEffect } from 'react'
import { Button, Row, Col, SearchInput, Input } from 'wanke-gui'
import Form from './Form'
import gdata from '../../../public/js/gdata'
import { c_list, globalNS } from '../../constants'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { CustomerListState } from '../models/customer-list'
import List1 from './List1'
import Export from '../../../components/layout/Export'
import Tools from '../../../components/layout/Tools'
import FullContainer from '../../../components/layout/FullContainer'
import utils from '../../../public/js/utils'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import FormLayout from '../../../components/FormLayout'

const { Search } = Input
const { FieldItem } = FormLayout
interface Props extends PageProps, CustomerListState, MakeConnectProps<CustomerListState> {
  loading: boolean
  updateLoading: boolean
  loginFirmId: number
  changeValidAuthority: boolean
  theme: any;
}

function CustomerList(this: null, props: Props) {
  const { list, loading, query, total } = props

  const handleSearch = () => {
    props.action('pageChange', { page: 1 })
  }

  const New = () => {
    gdata('fileList', {
      fileList: ''
    })

    props.updateState({
      modal: true,
      modalTitle: utils.intl('新增客户'),
      id: null,
      title: '',
      firmTypeId: null,
      abbreviation: '',
      contact: '',
      phone: { code: '+86', phone: '' },
      individual: 1,
      activity: 1,
      imageUrl: null,
      logoUrl: null,
      platformTitle: null,
      activityCanUpdate: false,
      lightLogoUrl: null,
      darkLogoUrl: null
    })
    props.action('getSelection', {
      title: utils.intl('新增')
    })
  }
  const edit = record => {
    gdata('fileList', {
      fileList: ''
    })
    props.action('onEdit', { record })
    props.action('getSelection', { title: utils.intl('编辑') })
  }

  useEffect(() => {
    props.action('reset')
    props.action('$getList')
  }, [])

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('客户管理')} className={'customer-list'} style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal pageName='customerList'>
        <Button onClick={New} type="primary">
          {utils.intl('新增')}
        </Button>
        <Button style={{ marginLeft: 16 }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FormLayout
        onSearch={handleSearch}
        onReset={() => {
          props.updateQuery({
            queryStr: '',
          })
        }}>
        <FieldItem label={utils.intl('关键字')}>
          <Input
            name="search"
            value={query.queryStr}
            placeholder={utils.intl('请输入关键字查询')}
            onChange={e => {
              props.action('updateQuery', {
                queryStr: e.target.value
              })
            }}
          />
        </FieldItem>
      </FormLayout>
      <FullContainer className="page-sub-container">
        <div className="flex1">
          <List1
            dataSource={list} loading={loading}
            total={total} page={query.page} size={query.size} onPageChange={props.onPageChange('$getList')}
            edit={edit}
          />
        </div>
      </FullContainer>
      <Form
        loginFirmId={props.loginFirmId}
        changeValidAuthority={props.changeValidAuthority}
        modalTitle={props.modalTitle}
        modal={props.modal}
        customerType={props.customerType}
        operationRes={props.operationRes}
        imageUrl={props.imageUrl}
        showRes={props.showRes}
        id={props.id}
        individual={props.individual}
        title={props.title}
        abbreviation={props.abbreviation}
        firmTypeId={props.firmTypeId}
        firmTypeTitle={props.firmTypeTitle}
        contact={props.contact}
        phone={props.phone}
        activity={props.activity}
        activityCanUpdate={props.activityCanUpdate}
        updateState={props.updateState}
        action={props.action}
        loading={props.updateLoading}
        theme={props.theme}
        editDetail={props.editDetail}
        platformTitle={props.platformTitle}
        lightLogoUrl={props.lightLogoUrl}
        darkLogoUrl={props.darkLogoUrl}
      />
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  const changeValidAuthority = state[globalNS].firmType == 'Platform' && state[globalNS].roleName == 'Admin'
  return {
    ...model,
    loading: getLoading('$getList'),
    updateLoading: getLoading('$save'),
    loginFirmId: state[globalNS].firmId,
    changeValidAuthority,
    theme: state.global.theme
  }
}

export default makeConnect(c_list, mapStateToProps)(CustomerList)
