/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react'
import { Input, Table, Row, Col, Form, Button, Modal } from 'wanke-gui'
import styles from './index.less'
import ListItemDelete from "../../../components/ListItemDelete/index"
import { makeConnect } from "../../umi.helper"
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from '../../../public/js/utils'

const FormItem = Form.Item

const _ResForm = props => {
  const {dispatch, resModal, record, type, selectStatus, button, reasonTable} = props
  const cancel = () => {
    dispatch({
      type: 'electricDifference/updateState',
      payload: {
        resModal: false
      }
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
        dispatch({
          type: 'orderlist/updateState',
          payload: {
            values
          }
        })
    })
  }

  //提交表单
  const bc = (index) => {
    let data = [...reasonTable][index]
    if (data.change && data.title && data.title.trim()) {
      dispatch({
        type: 'electricDifference/editResList',
        payload: {
          id: data.id, reasonTitle: data.title
        }
      })

    }
  }
  const theGetReason = () => {
    dispatch({
      type: 'electricDifference/getResList'
    }).then(res => {
      dispatch({
        type: 'electricDifference/updateState',
        payload: {
          button: true
        }
      })
    })
  }
  //提交表单
  const xz = () => {
    let data = [...reasonTable].pop()
    if (data.add && data.title && data.title.trim()) {
      dispatch({
        type: 'electricDifference/addResList',
        payload: {
          id: data.id, reasonTitle: data.title
        }
      })
    }
  }
  const sc = (record) => {
    dispatch({
      type: 'electricDifference/deleteResList',
      payload: {
        id: record.id
      }
    })
  }
  const reasonColumns = [
    {
      title: utils.intl('序号'), dataIndex: 'number', key: 'number', render: (text, record, index) => {
        return <span>{reasonTable.indexOf(record) + 1}</span>
      }
    },
    {
      title: utils.intl('原因标题'), dataIndex: 'title', key: 'title', render: (text, record, index) => {
        if (record.change || record.add) {
          return <Input autoFocus maxLength={16} onChange={(v) => {
            let data = [...reasonTable]
            data[index]['title'] = v.target.value
            dispatch({
              type: 'electricDifference/updateState',
              payload: {reasonTable: data}
            })
          }} value={text ? text : ''}/>
        } else {
          return text
        }
      }
    },
    {
      title: utils.intl('操作'),
      dataIndex: '',
      key: 'operation',
      align: 'right',
      width: '20%',
      render: (text, record, index) => {
        if (record.change) {
          return <div>
            <a onClick={() => {
              bc(index)
            }}>{utils.intl('保存')}</a>
            <a style={{marginLeft: '10px'}} onClick={() => {
              theGetReason()
            }}>{utils.intl('取消')}</a>
          </div>
        } else if (record.add) {
          return <div>
            <a onClick={() => {
              xz()
            }}>{utils.intl('保存')}</a>
            <a style={{marginLeft: '10px'}} onClick={() => {
              theGetReason()
            }}>{utils.intl('取消')}</a>
          </div>
        } else {
          return (
            <div>
              <a onClick={() => {
                let data = [...reasonTable]
                data[index]['change'] = true
                dispatch({
                  type: 'electricDifference/updateState',
                  payload: {reasonTable: data}
                })
              }}>{utils.intl('编辑')}</a>
              <ListItemDelete onConfirm={sc.bind(this, record)}>
                <a style={{marginLeft: '8px'}}>{utils.intl('删除')}</a>
              </ListItemDelete>
            </div>
          )
        }
      }
    }
  ]
  return (
    <Modal centered maskClosable={false} bodyStyle={{color: 'white'}} width={'700px'} visible={resModal}
           title={utils.intl('原因配置')} onOk={handleSubmit} onCancel={cancel} wrapClassName={`customerModal ${styles['res-form-modal']}`}
           footer={null}
    >
      <div className="f-df flex-column" style={{height: '500px', paddingTop: 0}}>
        <Row>
          <Col span={20}>
            <Button
              type="primary"
              disabled={button ? false : true}
              onClick={
                () => {
                  let data = [...reasonTable]
                  data.push({add: true})
                  dispatch({
                    type: 'electricDifference/updateState',
                    payload: {reasonTable: data, button: false}
                  }).then(res => {
                    let div = document.getElementsByClassName('ant-table-body')[document.getElementsByClassName('ant-table-body').length - 1]
                    div.scrollTop = div.scrollHeight
                  })
                }
              }
            >{utils.intl('新增')}</Button>
          </Col>
        </Row>
        {resModal ?
          <div className="flex-grow e-pt10 f-pr">
            <Table columns={reasonColumns} dataSource={reasonTable}
                  loading={props.loading}
                   pagination={false} scroll={{ y: 400 }}
            >
            </Table>
          </div>
          : ''}

      </div>
    </Modal>

  )
}

//绑定layout model ，获取title
function mapStateToProps(model,getLoading) {
  return {
    ...model,
    loading: getLoading('getResList')
  }
}

const _FormRes = FormContainer.create()(_ResForm)
export default makeConnect('electricDifference', mapStateToProps)(_FormRes)
