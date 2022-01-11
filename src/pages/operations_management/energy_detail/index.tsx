import React from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Table, Tabs, Button, Row, Col, Pagination } from 'wanke-gui';
import styles from './index.less';
import Header from '../../../components/Header';
import PlanForm from './component/plan_form';
import LevelForm from './component/level_form';
import ListItemDelete from '../../../components/ListItemDelete/index'

import { WankeReturnOutlined } from "wanke-icon";
import { WankeEditOutlined } from "wanke-icon";
import { WankeNewOutlined } from "wanke-icon";

const { TabPane } = Tabs;

class EnergyDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch, selectKey, page, size } = this.props;
    if (selectKey === 0) {
      history.push('/operation/power_management');
    } else {
      dispatch({
        type: 'energyDetail/getEnergyDetail',
        payload: { id: selectKey }
      });
      this.getPlan(selectKey, page, size);
    }
  }

  getEnergyDetail = (energyId) => {
    const { dispatch, size } = this.props;
    dispatch({
      type: 'energyDetail/getEnergyDetail',
      payload: {
        id: energyId,
      }
    });
    // 切换标签页时page为1
    this.getPlan(energyId, 1, size);
  }

  getPlan = (energyId, page, size) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'energyDetail/getPlan',
      payload: {
        page,
        size,
        deviceId: energyId
      }
    });
  }

  changeLevel = () => {
    const { dispatch, curEnergy } = this.props;
    dispatch({
      type: 'energyDetail/updateToView',
      payload: {
        levelFormDisplay: true,
        record: {
          class: curEnergy.class,
          level: curEnergy.level
        }
      }
    });
  }

  back = () => {
    history.goBack();
  }

  edit = (e) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'energyDetail/updateToView',
      payload: {
        editDisplay: true,
        formTitle: '编辑检修计划',
        record: e
      }
    });
  }

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'energyDetail/updateToView',
      payload: {
        editDisplay: true,
        formTitle: '新增检修计划',
        record: ''
      }
    });
  }

  delete = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'energyDetail/deletePlan',
      payload: {
        id: record.id
      }
    });
  }

  changeFixStatus = (fixStatus) => {
    // 修改检修状态 0 挂牌 1 摘牌
    let status = 1;
    if (fixStatus.includes('摘牌')) {
      status = 0;
    }
    this.props.dispatch({
      type: 'energyDetail/updateStatus',
      payload: {
        id: this.props.selectKey,
        status
      }
    })
  }

  changePage = (page) => {
    const { size, selectKey } = this.props;
    this.getPlan(selectKey, page, size);
  }

  changeSize = (current, pageSize) => {
    const { selectKey } = this.props;
    this.getPlan(selectKey, current, pageSize);
  }

  render() {
    const {
      energyList,
      selectKey,
      curEnergy,
      planList,
      editDisplay,
      formTitle,
      levelFormDisplay,
      loading,
      page,
      size,
      totalCount,
      buttonLoading
    } = this.props;
    let fixStatus;
    // 检修按钮是否可以点击
    let isFix = false;
    let capacityUnit = 'MW';
    if (curEnergy.energyUnitType && curEnergy.energyUnitType.name === 'storage') {
      capacityUnit = 'MWh';
    } else if (curEnergy.energyUnitType && (curEnergy.energyUnitType.name === 'photovoltaic' || curEnergy.energyUnitType.name === 'windPower')) {
      capacityUnit = 'MWp';
    }
    if (JSON.stringify(curEnergy) !== '{}') {
      if (curEnergy.status === 0) {
        fixStatus = '检修挂牌';
      } else if (curEnergy.status === 1) {
        fixStatus = '检修摘牌';
      } else {
        fixStatus = '检修挂牌';
        isFix = true;
      }
    }
    const columns = [{
      title: '序号',
      key: 'num',
      dataIndex: 'num',
      width: 70,
      align: 'center'
    }, {
      title: '计划开始时间',
      key: 'startPlanTime',
      dataIndex: 'startPlanTime',
      width: 170,
      align: 'center'
    }, {
      title: '计划结束时间',
      key: 'endPlanTime',
      dataIndex: 'endPlanTime',
      width: 170,
      align: 'center'
    }, {
      title: '检修内容',
      key: 'content',
      bubble: true,
      dataIndex: 'content',
      align: 'left'
    }, {
      title: '影响容量',
      key: 'impactCapacity',
      width: 100,
      dataIndex: 'impactCapacity',
      align: 'right',
      render: (text) => {
        return <span>{text}{text !== null ? capacityUnit : ''}</span>
      }
    }, {
      title: '检修挂牌时间',
      key: 'startActualTime',
      dataIndex: 'startActualTime',
      width: 170,
      align: 'center'
    }, {
      title: '检修摘牌时间',
      key: 'endActualTime',
      dataIndex: 'endActualTime',
      width: 170,
      align: 'center'
    }, {
      title: '操作',
      key: 'control',
      dataIndex: 'control',
      align: 'left',
      width: 100,
      render: (text, record, index) => {
        return (
          <div className="editable-row-operations">
            {
              !record.endActualTime
                ? <a onClick={this.edit.bind(this, record)}>编辑</a>
                : null
            }
            {
              !record.startActualTime
                ? <ListItemDelete onConfirm={this.delete.bind(this, record)} tip="确定删除吗？">
                  <a style={{ marginLeft: '5px' }}>删除</a>
                </ListItemDelete>
                : null
            }

          </div>
        );
      }
    }];
    return (
      <div className={styles['energy-detail'] + " f-df flex-column"}>
        <div onClick={this.back} className={styles.return + " vh-center"}>
          <WankeReturnOutlined style={{ fontSize: 25, color: "#fff" }} />
        </div>
        {
          energyList.length && JSON.stringify(curEnergy) !== '{}'
            ? <Tabs
              activeKey={selectKey.toString()}
              onChange={this.getEnergyDetail}>
              {
                energyList.map((item) => {
                  return (
                    <TabPane key={item.id.toString()} style={{ paddingLeft: 10, paddingRight: 10 }} tab={item.title} ></TabPane>
                  );
                })
              }
            </Tabs>
            : null
        }
        {
          JSON.stringify(curEnergy) !== '{}'
            ? <div className={styles.content + " f-df flex-column"}>
              <Row className="e-pr10">
                <Col span={24} className={"f-tar"}>
                  <Button loading={buttonLoading} disabled={isFix} onClick={this.changeFixStatus.bind(this, fixStatus)} type="primary">{fixStatus}</Button>
                </Col>
              </Row>
              <div className={styles.basic}>
                <Header title={'基础信息'}></Header>
                <div className={styles.row}>
                  <span className={styles.border}>单元名称：{curEnergy.title}</span>
                  <span className={styles.border}>单元类型：{curEnergy.energyUnitType.title}</span>
                  <span>额定容量：{curEnergy.scale}</span>
                </div>
                <p style={{ marginBottom: 20 }}></p>
                <div className={styles.row}>
                  <span className={styles.border}>额定功率：{curEnergy.ratedPower}{curEnergy.ratedPower ? 'kW' : ''}</span>
                  <span>投产时间：2019-11-11</span>
                </div>
              </div>
              <div className={styles.basic}>
                <Header title={'电源分级'} btnsStyle={styles['fix-btn']}>
                  <WankeEditOutlined onClick={this.changeLevel} style={{ color: "#3d7eff", fontSize: 25 }} />
                </Header>
                <div className={styles.row}>
                  <span className={styles.border}>电源性质：{curEnergy.class === 0 ? '主电源' : '备用电源'}</span>
                  <span>电源等级：{curEnergy.level}</span>
                </div>
              </div>
              <div className={"f-df flex-column"} style={{ paddingLeft: 10, paddingRight: 10, overflow: "auto" }}>
                <Header title={'检修计划'} btnsStyle={styles['fix-btn']}>
                  <WankeNewOutlined onClick={this.add} style={{ color: "#3d7eff", fontSize: 25 }} />
                </Header>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <Table
                    rowKey={"id"}
                    columns={columns}
                    dataSource={planList}
                    download={false}
                    pagination={false}
                    loading={loading}
                  ></Table>
                </div>
              </div>
            </div>
            : null
        }
        {editDisplay ? <PlanForm title={formTitle} /> : null}
        {levelFormDisplay ? <LevelForm title={"编辑电源等级"} /> : null}
        {/* 保证返回按钮的空间 */}
        <div style={{ height: 70 }}></div>
        {
          totalCount
            ? <Pagination
              style={{ position: "absolute", bottom: 10, right: 10 }}
              showSizeChanger
              onShowSizeChange={this.changeSize}
              showQuickJumper
              pageSize={size}
              pageSizeOptions={['20', '30', '50', '100']}
              current={page}
              total={totalCount}
              onChange={this.changePage} />
            : null
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let results = {
    ...state.energyDetail,
    selectKey: state.energyManagement ? state.energyManagement.selectKey : 0,
    loading: state.loading.models.energyDetail,
    energyList: state.energyManagement ? state.energyManagement.energyList : [],
    buttonLoading: state.loading.effects['energyDetail/updateStatus']
  };
  return results;
}

export default connect(mapStateToProps)(EnergyDetail);
