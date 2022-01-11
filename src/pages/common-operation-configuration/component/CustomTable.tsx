import React, { useCallback, useMemo, useState } from 'react'
import { Button, Empty, Tabs, Modal, Select, InputNumber, notification } from 'wanke-gui';
import { Form } from 'antd';
import utils from '../../../public/js/utils'
import CustomCard from './CustomCard';
import "./customTable.less"
import CustomInputNumber from './CustomInputNumber';
import data from '../../storage-run-strategy/models/data';
import CustomSlider from './CustomSlider';
import { triggerEvent } from '../../../util/utils';
import { ExclamationCircleOutlined, InfoCircleFilled } from 'wanke-icon';

const { TabPane } = Tabs
const { Item: FormItem } = Form

interface CustomTableProps {
  dataSource: any[];
  strategyList: any[];
  handleSave: (formValue: any, callBack: () => void) => void; // 保存方法 
  handleEnergySave: (formValue: any, callBack: () => void) => void; // 保存方法 
}

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const noKey = 'updatable';


const CustomTable: React.FC<CustomTableProps> = (props) => {
  const { dataSource, strategyList, handleSave, handleEnergySave } = props;

  const [form] = Form.useForm();

  const [historyIds, setHistoryIds] = useState([]);
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState(1); // 1: 编辑|新增 2：缺失信息录入
  const [energyUnit, setEnergyUnit] = useState({});
  const [tabsKey, setTabsKey] = useState([]);

  const columns = useMemo(() => [
    { title: utils.intl('序号'), dataIndex: 'num', style: { width: '5%', flex: 'inherit' }, render: (text, record, index) => index < 9 ? `0${index + 1}` : index + 1 },
    { title: utils.intl('单元名称'), dataIndex: 'title' },
    { title: utils.intl('单元类型'), dataIndex: 'type', style: { width: '13%', flex: 'inherit' }, render: (text, record, index) => record.energyUnitType?.title ?? '--' },
    { title: utils.intl('额定功率'), dataIndex: 'ratedPower', style: { width: '13%', flex: 'inherit' } },
    { title: utils.intl('额定容量'), dataIndex: 'scale', style: { width: '13%', flex: 'inherit' } },
    { title: utils.intl('初始容量'), dataIndex: 'startCapacity', style: { width: '13%', flex: 'inherit' } },
    { title: utils.intl('初始SoH'), dataIndex: 'startSoh', style: { width: '13%', flex: 'inherit' }, render: text => `${text ?? '--'}%` },
    { title: utils.intl('初始循环次数'), dataIndex: 'startCycles', style: { width: '13%', flex: 'inherit' }, render: text => text ?? '--' },
  ], []);

  const handleOk = useCallback(() => {
    form.validateFields().then((values) => {
      if (modalType === 1) {
        handleSave && handleSave({
          ...(energyUnit.operationNow ?? {}),
          energyUnitId: energyUnit.id,
          ...values,
        }, () => {
          setVisible(false);
        })
      } else {
        // console.log('energyUnit', energyUnit, values)
        handleEnergySave && handleEnergySave({
          id: energyUnit.id,
          ...values
        }, () => {
          setVisible(false);
        })
      }
    })
  }, [JSON.stringify(energyUnit), modalType])


  // 打开modal框（新增或者编辑）
  const openModal = useCallback((energyUnit) => {
    if(!energyUnit['startSoh'] && energyUnit['startSoh'] !== 0 || !energyUnit['startCycles'] && energyUnit['startCycles'] !== 0){
      notification.open({
        key: noKey,
        duration: null,
        message: (
          <div>
            <ExclamationCircleOutlined style={{ color: "rgba(250,173,20,0.85)", marginRight: 8 }}/>
            {utils.intl('操作提示')}
          </div>
        ),
        // icon: <InfoCircleFilled color="rgba(250,173,20,0.85)" />,
        className: "not-box",
        style: {
          top: 'calc(50vh - 41px)',
          right: 'calc(50vw - 192px)'
        },
        description: (<div>
          {utils.intl('录入指标前，请先补充台账信息。')}
          <span style={{ cursor: "pointer", color: "#3D7EFF" }} onClick={() => {
            notification.destroy();
            openInfoModal(energyUnit);
          }}>{`${utils.intl('点击录入')} >`}</span>
        </div>)
      });
      return
    }

    setEnergyUnit(energyUnit);
    setModalType(1);
    setVisible(true);
    if (energyUnit.operationNow) { // 编辑
      form.setFieldsValue(energyUnit.operationNow)
    } else { // 新增
      form.setFieldsValue({
        runStrategyId: strategyList[0]?.id
      })
    }
  }, [JSON.stringify(strategyList)]);

  // 打开modal框（录入）
  const openInfoModal = useCallback((energyUnit) => {
    // console.log('energyUnit', energyUnit);
    setEnergyUnit(energyUnit);
    setModalType(2);
    setVisible(true);
    form.resetFields();
  }, [JSON.stringify(strategyList)]);



  return (
    <div className="customTable-box">
      <div className="customTable-header">
        {
          columns.map(column => (<div className="customTable-td" style={{ flex: 1, ...(column.style ?? {}) }}>
            {column.title}
          </div>))
        }
      </div>
      {
        dataSource?.length ? dataSource.map((data, dataIndex) => (<div className="customTable-body">
          <div className="customTable-body-data">
            {
              columns.map(column => {
                if (column.dataIndex === 'startCapacity' && !data['startSoh'] && data['startSoh'] !== 0 && !data['startCycles'] && data['startCycles'] !== 0) {
                  return ((<div
                    className="customTable-td"
                    style={{ flexGrow: 3, flexShrink: 0, ...(column.style ?? {}), cursor: "pointer", color: '#3D7EFF', textAlign: "center" }}
                    onClick={() => openInfoModal(data)}
                  >
                    {`${utils.intl('缺失信息请点击录入')} >`}
                  </div>))
                } else if ((column.dataIndex === 'startSoh' || column.dataIndex === 'startCycles') && !data[column.dataIndex] && data[column.dataIndex] !== 0) {
                  return null
                }
                return (<div className="customTable-td" style={{ flexGrow: 1, flexShrink: 0, ...(column.style ?? {}) }}>
                  {column.render ? column.render(data[column.dataIndex], data, dataIndex) : data[column.dataIndex]}
                </div>)
              })
            }
          </div>
          <div className="customTable-chart-box">
            <Tabs
              // defaultActiveKey="1"
              activeKey={tabsKey[dataIndex]}
              type="card"
              onChange={(activeKey) => {
                if (activeKey === '1') {
                  setHistoryIds(historyIds.filter(i => i !== data.id))
                } else {
                  setHistoryIds([...historyIds, data.id])
                }
                tabsKey[dataIndex] = activeKey;
                setTabsKey(tabsKey)
                setTimeout(() => {
                  triggerEvent('resize', window)
                }, 0)
              }}
              tabBarExtraContent={
                historyIds.indexOf(data.id) > -1 ? null :
                  <Button type="primary" size="small" onClick={() => openModal(data)}>{utils.intl(data.operationNow ? '编辑' : '新增')}</Button>
              }

            >
              <TabPane tab={utils.intl('当前指标参数')} key="1">
                {
                  data.operationNow && tabsKey[dataIndex] !== "2" ? (
                    <>
                      <header className="header">{utils.intl('削峰填谷')}</header>
                      <CustomCard
                        dataSource={data.operationNow}
                        energyUnit={data}
                      />
                    </>
                  ) : <Empty description={
                    <>
                      {utils.intl('当前暂无数据，去')}
                      <span style={{ margin: '0px 4px', color: '#3D7EFF', cursor: 'pointer' }} onClick={() => openModal(data)}>{utils.intl('新增')}</span>
                      {utils.intl('吧')}
                    </>
                  } />
                }
              </TabPane>
              <TabPane tab={utils.intl('历史指标参数')} key="2">
                {
                  data.operationHistory?.length && tabsKey[dataIndex] === "2" ? (
                    <>
                      <header className="header">{utils.intl('削峰填谷')}</header>
                      {
                        data.operationHistory.map(dataItem => (
                          <CustomCard
                            dataSource={dataItem}
                            energyUnit={data}
                          />
                        ))
                      }
                    </>
                  ) : <Empty />
                }
              </TabPane>
            </Tabs>
          </div>
        </div>)) : <Empty />
      }
      <Modal
        visible={visible}
        width={480}
        bodyStyle={{ padding: '24px 32px' }}
        wrapClassName="customTable-modal"
        title={modalType === 1 ? utils.intl('运营指标参数配置') : `${energyUnit.title} - ${utils.intl('信息录入')}`}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        onOk={handleOk}
      >
        {
          modalType === 1 ? (
            <Form
              {...formLayout}
              className="customTable-form"
              form={form}
            >
              <FormItem label={utils.intl('单元名称')}>
                {energyUnit.title}
              </FormItem>
              <FormItem label={utils.intl('控制策略')} name="runStrategyId">
                <Select disabled style={{ width: 260 }} dataSource={strategyList.map(i => ({ value: i.id, name: i.title }))} />
              </FormItem>
              {/* <FormItem
            label={utils.intl('系统损耗率')}
            name="systemLoss"
            rules={[
              { required: true, type: 'integer', min: 0, max: 100, message: utils.intl('请输入不小于0且不大于100的整数') },
            ]}
          >
            <CustomInputNumber addonAfter="%" style={{ width: 260 }} placeholder={utils.intl('请输入系统理论损耗率')} />
          </FormItem> */}
              <FormItem
                label={utils.intl('充电效率')}
                name="chargeEfficiency"
                rules={[
                  { required: true, type: 'integer', min: 0, max: 100, message: utils.intl('请输入不小于0且不大于100的整数') },
                ]}
              >
                <CustomInputNumber addonAfter="%" style={{ width: 260 }} placeholder={`${utils.intl('请输入{0}', '理论充电效率')}(%)`} />
              </FormItem>
              <FormItem
                label={utils.intl('放电效率')}
                name="dischargeEfficiency"
                rules={[
                  { required: true, type: 'integer', min: 0, max: 100, message: utils.intl('请输入不小于0且不大于100的整数') },
                ]}
              >
                <CustomInputNumber addonAfter="%" style={{ width: 260 }} placeholder={`${utils.intl('请输入{0}', '理论放电效率')}(%)`} />
              </FormItem>
              <FormItem noStyle>
                <div className="form-sub-title" style={{ marginBottom: 16 }}>{utils.intl('衰减参数')}</div>
              </FormItem>
              {/* <FormItem
            label="DoD"
            name="dod"
            rules={[
              { required: true, type: 'integer', min: 0, max: 100, message: utils.intl('请输入不小于0且不大于100的整数') },
            ]}
          >
            <CustomInputNumber addonAfter="%" style={{ width: 260 }} placeholder={utils.intl('请输入DoD 0～100')} />
          </FormItem> */}
              <FormItem
                label={utils.intl('最低可用SoH')}
                name="soh"
                validateFirst
                rules={[
                  { required: true, type: 'integer', min: 0, max: (energyUnit.startSoh || 100) - 1, message: utils.intl(`请输入不小于0且不大于{0}的整数`, (energyUnit.startSoh || 100) - 1) },
                ]}
              >
                <CustomInputNumber addonAfter="%" style={{ width: 260 }} min={0} max={99} placeholder={utils.intl(`请输入最低可用SoH 0～{0}`, energyUnit.startSoh || 100)} />
              </FormItem>
              <FormItem noStyle shouldUpdate={(prevValues, curValues) => prevValues.soh !== curValues.soh}>
                {
                  ({ getFieldValue }) => {
                    const soh = getFieldValue('soh')
                    return (
                      <FormItem
                        label={utils.intl('SoH/循环次数关系')}
                        name="cycles"
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 24 }}
                        style={{ flexDirection: "column" }}
                        labelAlign="left"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value || !value.length) {
                                return Promise.reject(new Error(utils.intl(`请至少选择一个的关系点`)))
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <CustomSlider
                          max={{ soh: energyUnit.startSoh || 100, cycles: energyUnit.startCycles ?? 0 }}
                          min={{ soh: soh || 0, cycles: null }}
                        />
                      </FormItem>
                    )
                  }
                }
              </FormItem>
            </Form>
          ) : (<Form
            {...formLayout}
            className="customTable-form"
            form={form}
          >
            <FormItem
              label={utils.intl('初始容量')}
              name="startCapacity"
              validateFirst
              rules={[
                { required: true, message: utils.intl('请输入正确的{0}', '初始容量') },
                { type: 'number', max: 9999,  message: utils.intl('请不要超过{0}', 9999) },
              ]}
            >
              <CustomInputNumber addonAfter="kWh" style={{ width: 260 }} placeholder={`${utils.intl('请输入{0}', '初始容量')}`} />
            </FormItem>
            <FormItem
              label={utils.intl('起始SoH')}
              name="startSoh"
              validateFirst
              rules={[
                { required: true, type: 'integer', min: 0, max: 100, message: utils.intl('请输入正确的{0}', '起始SoH') },
              ]}
            >
              <CustomInputNumber addonAfter="%" style={{ width: 260 }} placeholder={utils.intl('请输入{0}', '起始SoH')} />
            </FormItem>
            <FormItem
              label={utils.intl('初始循环次数')}
              name="startCycles"
              rules={[
                { required: true, type: 'integer', message: utils.intl('请输入正确的{0}', '初始循环次数') },
                { type: 'number', min: 0, message: utils.intl('请不要低于{0}', 0) },
              ]}
            >
              <CustomInputNumber addonAfter={utils.intl('次')} style={{ width: 260 }} placeholder={utils.intl('请输入{0}', '初始循环次数')} />
            </FormItem>
          </Form>)
        }
      </Modal>
    </div>
  )
}

export default CustomTable