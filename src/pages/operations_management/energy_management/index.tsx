import React from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { Table, Pagination } from 'wanke-gui';

class EnergyManagement extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { page, size } = this.props;
    this.getEnergyList(page, size);
  }

  getEnergyList = (page, size) => {
    this.props.dispatch({
      type: 'energyManagement/getEnergyList',
      payload: {
        page,
        size
      }
    });
  }

  jumpDetail = (record) => {
    const { dispatch, energyList } = this.props;
    const energy = energyList.find(item => {
      return item.id === record.id;
    });
    dispatch({
      type: 'energyManagement/jumpDetail',
      payload: { selectKey: energy.id }
    });
  }

  changePage = (page) => {
    const { size } = this.props;
    this.getEnergyList(page, size);
  }

  changeSize = (current, pageSize) => {
    this.getEnergyList(current, pageSize);
  }

  render() {
    const columns = [{
      title: '序号',
      key: 'num',
      dataIndex: 'num',
      width: 75,
      align: 'center'
    }, {
      title: '单元名称',
      key: 'title',
      dataIndex: 'title',
      align: 'left',
      render: (text, record) => {
        return <a onClick={this.jumpDetail.bind(this, record)}>{text}</a>;
      }
    }, {
      title: '单元类型',
      key: 'energyUnitType',
      dataIndex: 'energyUnitType',
      align: 'left',
      width: 120,
      render: (text) => {
        return <span>{text.title}</span>;
      }
    }, {
      title: '额定容量',
      key: 'scale',
      dataIndex: 'scale',
      align: 'right',
      width: 120
    }, {
      // 0 主电源 1 备用电源
      title: '电源分类',
      key: 'class',
      dataIndex: 'class',
      align: 'left',
      width: 120,
      render: text => {
        return <span>{text === 0 ? '主电源' : '备用电源'}</span>;
      }
    }, {
      title: '电源等级',
      key: 'level',
      dataIndex: 'level',
      align: 'right',
      width: 120
    }, {
      // 0 待检修 1 检修中 -1代表无
      title: '检修状态',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: text => {
        let color = '';
        let content = '无';
        if (text === 0) {
          color = '#ff7725';
          content = '待检修';
        }
        if (text === 1) {
          color = '#e41515';
          content = '检修中';
        }
        return <span style={{ color: `${color}` }}>{content}</span>;
      }
    }];
    const { energyList, totalCount, loading, size, page } = this.props;
    return (
      <div className={styles['energy-management']}>
        <div className={styles.table}>
          <Table
            rowKey={"id"}
            columns={columns}
            dataSource={energyList}
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
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ ...state.energyManagement, loading: state.loading.models.energyManagement });
export default connect(mapStateToProps)(EnergyManagement);
