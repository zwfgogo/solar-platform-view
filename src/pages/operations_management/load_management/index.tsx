import React from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { Table, Pagination, Button, Row, Col } from 'wanke-gui';
import ListItemDelete from '../../../components/ListItemDelete/index';
import LoadForm from './component/load_form';

class loadManagement extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { page, size } = this.props;
    this.getLoadList(page, size);
    this.getBreaker();
  }

  getLoadList = (page, size) => {
    this.props.dispatch({
      type: 'loadManagement/getLoadList',
      payload: {
        page,
        size
      }
    });
  }

  add = () => {
    this.props.dispatch({
      type: 'loadManagement/updateToView',
      payload: {
        addFormDisplay: true,
        record: {
          controlTimes: [{
            controlStartTime: '00:00',
            controlEndTime: '00:00'
          }]
        }
      }
    })
  }

  delete = (record) => {
    this.props.dispatch({
      type: 'loadManagement/deleteLoad',
      payload: {
        id: record.id
      }
    });
  }

  jumpDetail = (text) => {
    const { dispatch, loadList } = this.props;
    const load = loadList.find(item => {
      return item.title === text;
    });
    dispatch({
      type: 'loadManagement/jumpDetail',
      payload: { selectKey: load.id }
    });
  }

  changePage = (page) => {
    const { size } = this.props;
    this.getLoadList(page, size);
  }

  changeSize = (current, pageSize) => {
    this.getLoadList(current, pageSize);
  }

  getBreaker = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'loadManagement/getBreaker'
    })
  }

  render() {
    const columns = [{
      title: '序号',
      key: 'num',
      dataIndex: 'num',
      width: 75,
      align: 'center'
    }, {
      title: '负荷名称',
      bubble: true,
      key: 'title',
      dataIndex: 'title',
      align: 'left',
      render: text => {
        return <a onClick={this.jumpDetail.bind(this, text)}>{text}</a>;
      }
    }, {
      title: '开关对象',
      bubble: true,
      key: 'breaker',
      dataIndex: 'breaker',
      align: 'left',
      render: text => {
        return <span>{text.title}</span>;
      }
    }, {
      title: '负荷代号',
      key: 'name',
      dataIndex: 'name',
      align: 'left',
      width: 100
    }, {
      title: '保电级别',
      key: 'level',
      dataIndex: 'level',
      align: 'right',
      width: 100
    }, {
      title: '控制轮次',
      key: 'controlRound',
      dataIndex: 'controlRound',
      align: 'right',
      width: 100
    }, {
      title: '功率定值(kW)',
      key: 'powerThreshold',
      dataIndex: 'powerThreshold',
      align: 'right',
      width: 150,
      render: text => {
        return <span>{text}</span>;
      }
    }, {
      title: '控制时段',
      bubble: true,
      key: 'controlTimes',
      dataIndex: 'controlTimes',
      align: 'center',
      render: text => {
        const time = [];
        for (let item of text) {
          time.push(`${item.controlStartTime}～${item.controlEndTime}`);
        }
        let str = time.length ? time.join(';') : '无'
        return <span>{str}</span>;
      }
    }, {
      title: '操作',
      key: 'control',
      dataIndex: 'control',
      align: 'left',
      width: 100,
      render: (text, record, index) => {
        return (<div className="editable-row-operations">
          <ListItemDelete onConfirm={this.delete.bind(this, record)} tip="确定删除吗？">
            <a style={{ marginLeft: '5px' }}>删除</a>
          </ListItemDelete>
        </div>);
      }
    }];
    const { loadList, totalCount, addFormDisplay, loading, page, size } = this.props;
    return (
      <div className={styles['load-management'] + " f-df flex-column"}>
        <Row className="e-mt10 e-pl10 e-mb10" style={{ height: 32 }}>
          <Col span={24} className={"f-tar"}>
            <Button onClick={this.add} type="primary">新增</Button>
          </Col>
        </Row>
        <div style={{ height: "calc(100% - 120px)" }}>
          <Table
            rowKey={"id"}
            columns={columns}
            dataSource={loadList}
            download={false}
            pagination={false}
            loading={loading}
          ></Table>
        </div>
        <Pagination
          style={{ position: "absolute", bottom: 10, right: 10 }}
          showSizeChanger
          onShowSizeChange={this.changeSize}
          showQuickJumper
          pageSize={size}
          pageSizeOptions={['20', '30', '50', '100']}
          current={page}
          total={totalCount}
          onChange={this.changePage} />
        {addFormDisplay ? <LoadForm></LoadForm> : null}
      </div >
    );
  }
}

const mapStateToProps = (state) => ({ ...state.loadManagement, loading: state.loading.models.loadManagement });
export default connect(mapStateToProps)(loadManagement);
