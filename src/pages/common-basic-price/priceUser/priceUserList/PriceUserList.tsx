import React, { useEffect } from 'react'
import { Row, Col, Button, Input, Table2 } from 'wanke-gui'
import DeleteConfirmPopover from '../../../../components/ListItemDelete'

import Forward from '../../../../public/components/Forward/index'

import { makeConnect } from '../../../umi.helper'
import utils from '../../../../public/js/utils'

const { Search: SearchInput } = Input

const Layout = ({ list, dispatch, detailId, loading, query, total }) => {
  const columns = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65,
      align: 'center',
    },
    {
      title: utils.intl('电价名称'),
      dataIndex: 'title'
    },
    {
      title: utils.intl('适用地区'),
      dataIndex: 'area'
    },
    {
      title: utils.intl('用电性质'),
      dataIndex: 'property',
      width: 180
    },
    {
      title: utils.intl('适用电压等级'),
      dataIndex: 'voltageLevelsTitle'
    },
    {
      title: utils.intl('操作'),
      dataIndex: 'action',
      width: 150,
      render(text, record) {
        return (
          <React.Fragment>
            <Forward to="priceUserDetail">
              <span onClick={viewDetail.bind(this, record.id)}>{utils.intl('查看')}</span>
            </Forward>
            <Forward to="priceUserEdit">
              <span className="e-ml10" onClick={viewEdit.bind(this, record.id)}>{utils.intl('编辑')}</span>
            </Forward>
            <DeleteConfirmPopover
              onConfirm={() => {
                dispatch({
                  type: 'priceUser/del',
                  payload: {
                    id: record.id
                  }
                })
              }}
              className="e-ml10"
            >
              <a>{utils.intl('删除')}</a>
            </DeleteConfirmPopover>
          </React.Fragment>
        )
      }
    }
  ]
  const viewDetail = (id) => {
    dispatch({
      type: 'price/updateState',
      payload: {
        id: id,
        priceType: 'detail'
      }
    }).then(res => {
      dispatch({
        type: 'priceDetail/getPriceType'
      })
      dispatch({
        type: 'priceDetail/getVolType'
      })
    })
  }
  const viewEdit = (id) => {

    dispatch({
      type: 'price/updateState',
      payload: {
        id: id,
        priceType: 'edit'
      }
    }).then(res => {
      dispatch({
        type: 'priceEdit/getPriceType'
      })
      dispatch({
        type: 'priceEdit/getVolType'
      })
      dispatch({
        type: 'priceEdit/getDetail',
        payload: {
          id: id
        }
      })
    })
    dispatch({
      type: 'priceEdit/getIsbind',
      payload: {
        id: id,
      }
    })
  }
  const viewAdd = () => {
    dispatch({
      type: 'price/updateState',
      payload: {
        priceType: ''
      }
    })
    dispatch({
      type: 'priceEdit/updateState',
      payload: {
        id: '',
      }
    }).then(res => {
      dispatch({
        type: 'priceEdit/getPriceType'
      })
      dispatch({
        type: 'priceEdit/getVolType'
      })
      dispatch({
        type: 'priceEdit/getDetail'
      })
    })
  }
  const pageChange = (page, size) => {
    dispatch({ type: 'priceUser/pageChange', payload: { page, size } })
  }

  const search = () => {
    pageChange(1, query.size)
  }

  useEffect(() => {
    return () => {
      dispatch({ type: 'priceUser/reset' })
    }
  }, [])

  return (
    <React.Fragment>
      <div className="e-p10 bf-br10 f-df flex-column e-p10">
        <Row className="e-mb10">
          <Col span={6}>
            <SearchInput
              searchSize="small"
              onChange={e => {
                dispatch({ type: 'priceUser/updateQuery', payload: { queryStr: e.target.value } })
              }}
              placeholder={utils.intl('请输入关键字查询')}
              style={{ width: '300px' }}
              onSearch={search}
            />
          </Col>
          <Col span={18} className="f-tar">
            <Forward to="priceUserEdit">
              <Button type="primary" onClick={viewAdd}>{utils.intl('新增')}</Button>
            </Forward>
          </Col>
        </Row>
        <div className="flex1">
          <Table2 columns={columns} dataSource={list}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={pageChange}
            total={total}
          />
        </div>
      </div>
    </React.Fragment>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('getList')
  }
}

export default makeConnect('priceUser', mapStateToProps)(Layout)
