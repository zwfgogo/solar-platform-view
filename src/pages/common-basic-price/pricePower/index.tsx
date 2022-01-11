import React, { useEffect } from 'react'
import { Row, Col, Button, Input, Table2 } from 'wanke-gui'
import Form from './components/Form'
import DeleteConfirmPopover from '../../../components/ListItemDelete'
import { makeConnect } from '../../umi.helper'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils'

const { Search: SearchInput } = Input

const Layout = ({ list, dispatch, visible, total, query, loading }) => {
  const columns: Column<any>[] = [
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
      dataIndex: 'area',
      width: 300
    },
    {
      title: utils.intl('光伏上网电价'),
      dataIndex: 'pvPrice',
      width: 180,
      align: 'right', render: (text, record, index) => {
        return (text + ' ' + utils.intl(record.currency) + '/kWh')
      }
    },
    {
      title: utils.intl('风电上网电价'),
      dataIndex: 'windPrice',
      width: 200,
      align: 'right', render: (text, record, index) => {
        return (text + ' ' + utils.intl(record.currency) + '/kWh')
      }
    },
    {
      title: utils.intl('操作'),
      dataIndex: 'action',
      width: 145,
      render(text, record) {
        const { province, city, district, country } = record
        return (
          <React.Fragment>
            <a
              onClick={() => {
                dispatch({
                  type: 'pricePower/getIsbind',
                  payload: {
                    id: record.id,
                  }
                })
                dispatch({
                  type: 'pricePower/updateState',
                  payload: {
                    detailId: record.id,
                    visible: true,
                    record: {
                      ...record,
                      area: {
                        values: [country ? country.id : '', province ? province.id : '', city ? city.id : '', district ? district.id : ''],
                        isSelected: true
                      }
                    }
                  }
                })
              }}
            >
              {utils.intl('编辑')}
            </a>
            <DeleteConfirmPopover
              onConfirm={() => {
                dispatch({
                  type: 'pricePower/$delete',
                  payload: {
                    id: record.id
                  }
                })
              }}
            >
              <a className="e-ml10">{utils.intl('删除')}</a>
            </DeleteConfirmPopover>
          </React.Fragment>
        )
      }
    }
  ]
  const pageChange = (page, size) => {
    dispatch({ type: 'pricePower/pageChange', payload: { page, size } })
  }
  const search = () => {
    pageChange(1, query.size)
  }
  const add = () => {
    dispatch({ type: 'pricePower/updateState', payload: { visible: true, record: {} } })
  }
  useEffect(() => {
    return () => {
      dispatch({ type: 'pricePower/reset' })
    }
  }, [])

  return (
    <React.Fragment>
      <div className="f-df flex-column e-p10">
        <Row className="e-mb10">
          <Col span={6}>
            <SearchInput
              searchSize="small"
              onChange={e => {
                dispatch({ type: 'pricePower/updateQuery', payload: { queryStr: e.target.value } })
              }}
              placeholder={utils.intl('请输入关键字查询')}
              style={{ width: '300px' }}
              onSearch={search}
            />
          </Col>
          <Col span={18} className="f-tar">
            <Button type="primary" onClick={add}>
              {utils.intl('新增')}
            </Button>
          </Col>
        </Row>
        <div className="flex1">
          <Table2
            columns={columns} dataSource={list} loading={loading}
            page={query.page}
            size={query.size}
            total={total}
            onPageChange={pageChange}
          />
        </div>
      </div>
      {visible ? <Form /> : ''}
    </React.Fragment>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('getList')
  }
}

export default makeConnect('pricePower', mapStateToProps)(Layout)
