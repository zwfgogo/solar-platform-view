import React from 'react'
import { Button, Row, Col, Input, Radio, Table2 } from 'wanke-gui'
import NotificationModal from './component/notificationFrom'
import Page from "../../components/Page"
import { makeConnect } from "../umi.helper"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { AlarmNotification } from './model'
import PageProps from "../../interfaces/PageProps"
import FullContainer from "../../components/layout/FullContainer"
import Tools from "../../components/layout/Tools"
import Export from "../../components/layout/Export"
import ListItemDelete from "../../components/ListItemDelete/index"
import utils from "../../public/js/utils";

interface Props extends MakeConnectProps<AlarmNotification>, AlarmNotification, PageProps {
  loading: boolean;
}

class operationList extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.action('reset')
    this.props.action('getList')
  }

  search = () => {
    const { query } = this.props
    this.pageChange(1, query.size, 2)
  }
  pageChange = (page, size, e) => {
    const { dispatch } = this.props
    dispatch({ type: 'alarmNotification/pageChange', payload: { page, size, listType: e } })
  }

  sizeChange = (page, size, e) => {
    const { dispatch } = this.props
    dispatch({ type: 'alarmNotification/pageChange', payload: { page, size, listType: e } })
  }
  //搜索框的值改变
  searchChange = (type, data) => {
    const { dispatch } = this.props
    dispatch({ type: 'alarmNotification/stringChange', payload: { [type]: data } })
  }
  showXz = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alarmNotification/updateState',
      payload: {
        record: {},
        notificationModal: true,
        modalTitle: utils.intl('新增成员')
      },
    });
  };
  showBj = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alarmNotification/updateState',
      payload: {
        record: record,
        notificationModal: true,
        modalTitle: utils.intl('编辑成员')
      },
    });
  }
  delete = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alarmNotification/deleteRecord',
      payload: {
        id: id,
      },
    });
  };
  render() {
    const { list, loading, query, total, notificationModal } = this.props
    const columns = [
      {
        title: utils.intl('短信接收人姓名'), dataIndex: 'receiveName', key: 'jsrxm', width: '20%',
      },
      {
        title: utils.intl('手机号'), dataIndex: 'phone', key: 'sjh', width: '20%'
      },
      {
        title: utils.intl('短信接收时间'), dataIndex: 'dtime', key: 'dxjssj', width: '40%',
      },
      {
        title: utils.intl('操作'), dataIndex: 'operation', key: 'cz',
        render: (text, record, index) => {
          return (
            <span>
              <a onClick={this.showBj.bind(this, record)}>{utils.intl('编辑')}</a>
              <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                <a style={{ marginLeft: '10px' }}>删除</a>
              </ListItemDelete>
            </span>
          )
        }
      },
    ]
    return (
      <Page className="e-p10">
        <FullContainer>
          <Row className="e-mt10 e-pl10">
            <Col span={12}>
              <Input.Search placeholder={utils.intl('请输入关键字')}
                onChange={(e) => this.searchChange('queryStr', e.target.value)}
                onPressEnter={this.search}
                onSearch={this.search}
                style={{ width: '400px' }}
              />
            </Col>
            <Col span={12} className="f-tar">
              <Button type="primary" onClick={this.showXz}>{utils.intl('新增')}</Button>
            </Col>
          </Row>
          <div className="flex1 e-pt10 f-pr">
            <Table2 dataSource={list} columns={columns}
              loading={loading}
              rowKey="num"
              page={query.page}
              size={query.size}
              total={total}
              onPageChange={(page, size) => this.pageChange(page, size, 1)}
            />
          </div>
          <Tools>
            <Export onExport={() => this.props.action('onExport')} />
          </Tools>
          {notificationModal ? <NotificationModal /> : ''}
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('getList'),
  }
}

export default makeConnect('alarmNotification', mapStateToProps)(operationList)
