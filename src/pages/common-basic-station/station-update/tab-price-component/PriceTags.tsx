/** 电价卡片组件 */
import React, { Component } from "react";
import { Empty, Form } from "antd";
import { Tabs, Select, Button, DatePicker, Row, Col, Spin, Modal, SelectItem, Input, message } from "wanke-gui";
import classNames from "classnames";
import { rangeType } from "./dataCfg";
import "./index.less";
import { DeleteOutlined, EditOutlined } from "wanke-icon";
import moment, { Moment } from "moment";
import FormList from "./FormList";
import utils from '../../../../util/utils'
import { getTargetSystemTime } from "../../../../util/dateUtil";
import { unitValueChange } from "../../../page.helper";
import PriceLook from "../PriceLook";

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;

// const test = new Array(50).fill(0); //TODO:

interface Props {
  isNow: boolean; // 是否是当前的电价
  handleDelete: () => void; // 打开删除
  maps: any; // 枚举集合
  price: any;
  nowPrice?: any;
  basicInfo: any;
  energyUnitInfo?: any; // 设备树点击的能量单元对象（用于判断能量单元和电站的展示）
  energyUnitListCost: any[]; // 能量单元集合
  energyUnitListGenerate: any[]; // 能量单元集合
  onEditChange: (isEdit: boolean) => void; // 是否编辑状态下的change事件
  addInitPlanPrice: () => void; // 初始化添加
  addLoading: boolean;
  handleSave: (form: any, callBack: () => {}) => void
  clickRealInfo: (id: any) => void,
  loading: boolean;
  time: any;
}
interface State {
  isEdit: boolean; // 是否可编辑
  tabKey: "generate" | "cost",
  visible: boolean,
  rangeTypeValue: string
  type: 1 | 2; // 1: 全电站和能量单元切换时验证 2: 计划添加验证弹出框
  isCopy: boolean; // 是否是复制后的数据
  modalType: 'cost' | 'generation'
}

export default class PriceTags extends Component<Props, State> {
  static defaultProps: Partial<Props> = {
    isNow: true,
  };

  form: any;

  state = {
    isEdit: true,
    tabKey: "generate",
    visible: false,
    rangeTypeValue: null,
    type: 1,
    isCopy: false,
    isStationPrice: false, // 是否需要电站电价
  };

  componentDidMount() {
    if (this.form) {
      this.form.resetFields();
    }
    this.setState({ tabKey: this.props.modalType === 'cost' ? "cost" : "generate" })
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.price, this.props.price)) if (this.form) this.form.resetFields();
    if (preProps.modalType !== this.props.modalType) {
      this.setState({ tabKey: this.props.modalType === 'cost' ? "cost" : "generate" })
    }
  }

  // 重置
  reset = () => {
    const { onEditChange } = this.props;
    // const { resetFields } = this.form;
    this.form?.resetFields();
    this.props.onCancel && this.props.onCancel();
    // this.setState({ isEdit: false, isCopy: false });
    // onEditChange && onEditChange(false);
  };

  // 适用范围
  changeRangeType = (val, type) => {
    this.setState({
      visible: true,
      type: 1,
      rangeTypeValue: val
    })
  }

  // 复制当前电价
  copyNowPrice = () => {
    const { nowPrice } = this.props
    this.setState({ isCopy: true, isEdit: true })
  }

  // 判断电价是否不为空 
  checkPriceIsNotNull = (price) => {
    return price.generate && JSON.stringify(price.generate) !== '{}' || price.cost && JSON.stringify(price.cost) !== '{}'
  }

  getElectricityPriceDetails = (electricityPriceDetails) => {
    // console.log('this.props.energyUnitInfo', this.props.energyUnitInfo)
    if (this.props.energyUnitInfo) {
      return electricityPriceDetails || undefined ? electricityPriceDetails.map(item => ({ ...item, energyUnits: [this.props.energyUnitInfo.id] })) : undefined
    }
    return electricityPriceDetails || undefined
  }

  reusedStationPriceChange = (reusedStationPrice) => {
    const { stationPrice } = this.props
    if (reusedStationPrice) {
      // console.log(this.form)
      this.form.setFieldsValue({
        title: stationPrice?.title,
        // reusedStationPrice: stationPrice?.reusedStationPrice === 1 ? true : false,
        effectiveDate: stationPrice.effectiveDate
          ? moment(stationPrice.effectiveDate, "YYYY-MM-DD HH:mm:ss")
          : undefined,
        failureDate: stationPrice.failureDate
          ? moment(stationPrice.failureDate, "YYYY-MM-DD HH:mm:ss")
          : moment("9999-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss"),
        generate: {
          rangeType: 1,
          electricityPriceDetails: this.getElectricityPriceDetails(stationPrice.generate?.electricityPriceDetails)
        },
        cost: {
          rangeType: 1,
          electricityPriceDetails: this.getElectricityPriceDetails(stationPrice.cost?.electricityPriceDetails)
        },
      })
    }
  }

  render() {
    const {
      isNow,
      maps,
      price,
      handleDelete,
      onEditChange,
      energyUnitListGenerate,
      energyUnitListCost,
      addInitPlanPrice,
      addLoading,
      handleSave,
      clickRealInfo,
      loading,
      basicInfo,
      nowPrice,
      time,
      energyUnitInfo,
      modalType,
      isNoStationPrice,
      theme
    } = this.props;
    const { isEdit, tabKey, visible, rangeTypeValue, type, isCopy } = this.state;
    // console.log('nowPrice', nowPrice);
    const formValue =
      isCopy ? {
        title: nowPrice?.title,
        reusedStationPrice: nowPrice?.reusedStationPrice ? 1 : 0,
        effectiveDate: nowPrice.effectiveDate
          ? moment(nowPrice.effectiveDate, "YYYY-MM-DD HH:mm:ss")
          : undefined,
        failureDate: nowPrice.failureDate
          ? moment(nowPrice.failureDate, "YYYY-MM-DD HH:mm:ss")
          : moment("9999-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss"),
        generate: {
          rangeType: nowPrice.generate?.rangeType || 0,
          electricityPriceDetails: this.getElectricityPriceDetails(nowPrice.generate?.electricityPriceDetails)
        },
        cost: {
          rangeType: nowPrice.cost?.rangeType || 0,
          electricityPriceDetails: this.getElectricityPriceDetails(nowPrice.cost?.electricityPriceDetails)
        },
      } : {
        title: price?.title,
        reusedStationPrice: price?.reusedStationPrice ? 1 : 0,
        effectiveDate: price.effectiveDate
          ? moment(price.effectiveDate, "YYYY-MM-DD HH:mm:ss")
          : undefined,
        failureDate: price.failureDate
          ? moment(price.failureDate, "YYYY-MM-DD HH:mm:ss")
          : moment("9999-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss"),
        generate: {
          rangeType: price.generate?.rangeType || 0,
          electricityPriceDetails: this.getElectricityPriceDetails(price.generate?.electricityPriceDetails)
        },
        cost: {
          rangeType: price.cost?.rangeType || 0,
          electricityPriceDetails: this.getElectricityPriceDetails(price.cost?.electricityPriceDetails)
        },
      }

    const serviceTime = getTargetSystemTime(basicInfo.timeZone)
    // console.log('price', price)
    let language = localStorage.getItem('language');
    return (
      <div className="tab-price-new">
        {
          loading ? <Spin spinning size="large" style={{ height: '100%', display: "flex", alignItems: "center", justifyContent: "center" }} /> :
            this.checkPriceIsNotNull(price) || isCopy ?
              (isEdit ?
                (
                  <Form
                    layout="inline"
                    initialValues={formValue}
                    // onFinishFailed={this.onFinishFailed}
                    ref={(form) => (this.form = form)}
                  >
                    <div className="tab-price-new-sub">
                      <div className="tab-price-new-sub-title">
                        {//isEdit ? 
                          (
                            <Row gutter={18} style={{ width: 900 }}>
                              <Col span={12}>
                                <FormItem name="title" label={utils.intl("电价名称")} rules={[
                                  { required: true, message: utils.intl("请输入") }
                                ]}>
                                  <Input style={{ width: 260 }} disabled={!isEdit} />
                                </FormItem>
                              </Col>
                              {
                                energyUnitInfo ?
                                  (<Col span={12}>
                                    <FormItem
                                      name="reusedStationPrice"
                                      label={utils.intl("电价复用")}
                                      rules={[
                                        { required: true, message: utils.intl("请选择") }
                                      ]}>
                                      <Select
                                        style={{ width: 260 }}
                                        disabled={!isEdit}
                                        onChange={this.reusedStationPriceChange}
                                        dataSource={isNoStationPrice ? [{ name: utils.intl('不复用'), value: 0 }] : [{ name: utils.intl('与电站电价一致'), value: 1 }, { name: utils.intl('不复用'), value: 0 }]}
                                      />
                                    </FormItem>
                                  </Col>) : null
                              }
                              <Col span={12}>
                                <FormItem name="effectiveDate" label={utils.intl("生效时间")} validateFirst rules={[
                                  { required: true, message: utils.intl("请选择生效时间") },
                                  {
                                    validator: (_, value) => {
                                      return value && moment().isBefore(value, 'm') ? Promise.resolve() : Promise.reject(utils.intl("生效时间需要在当前时间之后"))
                                    }
                                  }
                                ]}>
                                  <DatePicker style={{ width: 260 }} disabled={!isEdit} format="YYYY-MM-DD HH:00" showTime disabledDate={(currentDate: Moment) => serviceTime.isAfter(currentDate, 'd')} disabledTime={(date: Moment) => {
                                    const hours = new Array(24).fill(0).map((_, index) => index)
                                    return {
                                      disabledHours: () => date && date.format('YYYY-MM-DD') === serviceTime.format('YYYY-MM-DD') ? hours.filter(item => item <= serviceTime.hour()) : []
                                    }
                                  }} />
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem name="failureDate" label={utils.intl("失效时间")}>
                                  <DatePicker style={{ width: 260 }} format="YYYY-MM-DD HH:00" disabled />
                                </FormItem>
                              </Col>
                            </Row>
                          )

                          // : (
                          //   <>
                          //     <span
                          //       className={
                          //         isNow
                          //           ? "tab-price-new-sub-title-primary"
                          //           : "tab-price-new-sub-title-warn"
                          //       }
                          //     >
                          //       {utils.intl("生效时间")}：
                          //       {price.effectiveDate
                          //         ? moment(
                          //           price.effectiveDate,
                          //           "YYYY-MM-DD HH:mm:ss"
                          //         ).format("YYYY/MM/DD HH:mm")
                          //         : "--"}
                          //     </span>
                          //     <span
                          //       className={
                          //         isNow
                          //           ? "tab-price-new-sub-title-warn"
                          //           : "tab-price-new-sub-title-primary"
                          //       }
                          //     >
                          //       {utils.intl("失效时间")}：
                          //       {price.failureDate
                          //         ? moment(
                          //           price.failureDate,
                          //           "YYYY-MM-DD HH:mm:ss"
                          //         ).format("YYYY/MM/DD HH:mm")
                          //         : "9999-01-01 00:00"}
                          //     </span>
                          //   </>
                          // )
                        }
                      </div>
                    </div>
                    {
                      modalType === 'generation' ?
                        <div className="tab-box">
                          <FormItem name={["generate", "rangeType"]} style={{ display: 'none' }} label={utils.intl("适用范围")}>
                            <Select
                              options={rangeType}
                              style={{ width: 250 }}
                              disabled={!isEdit}
                            // onChange={val => this.changeRangeType(val, 'generate')}
                            />
                          </FormItem>
                          <FormList
                            isNow={isNow}
                            name={["generate", "electricityPriceDetails"]}
                            price={price}
                            isEdit={isEdit}
                            prefixTitle={energyUnitInfo ? "售电" : '上网'}
                            objTitle={utils.intl("发电单元")}
                            isGridPrice={!energyUnitInfo}
                            energyUnitList={energyUnitListGenerate}
                            realTimePriceList={maps?.realTimePriceMap_Generate || []}
                            multipleTypeList={maps?.multipleTypeMap || []}
                            priceObjMap={maps?.priceObjMap || []}
                            initValue={formValue}
                            clickRealInfo={clickRealInfo}
                          />
                        </div>
                        :
                        modalType === "cost" ?
                          <div className="tab-box">
                            <FormItem name={["cost", "rangeType"]} style={{ display: 'none' }} label={utils.intl("适用范围")}>
                              <Select
                                options={rangeType}
                                style={{ width: 250 }}
                                disabled={!isEdit}
                              // onChange={val => this.changeRangeType(val, 'cost')}
                              />
                            </FormItem>
                            <FormList
                              isNow={isNow}
                              name={["cost", "electricityPriceDetails"]}
                              price={price}
                              isEdit={isEdit}
                              prefixTitle={energyUnitInfo ? "购电" : "用电"}
                              objTitle={utils.intl(energyUnitInfo ? "购电来源" : "用电来源")}
                              energyUnitList={energyUnitListCost}
                              isGridPrice={!energyUnitInfo}
                              realTimePriceList={maps?.realTimePriceMap_Cost || []}
                              multipleTypeList={maps?.multipleTypeMap || []}
                              priceObjMap={maps?.priceObjMap || []}
                              initValue={formValue}
                              clickRealInfo={clickRealInfo}
                            />
                          </div>
                          : null
                    }
                    {/* <Tabs activeKey={tabKey} onChange={activeKey => this.setState({ tabKey: activeKey })}>
                      {modalType === 'generation' ? (<TabPane tab={utils.intl(energyUnitInfo ? "售电电价" : "上网电价")} key="generate" forceRender>
                        <div className="tab-box">
                          <FormItem name={["generate", "rangeType"]} style={{ display: 'none' }} label={utils.intl("适用范围")}>
                            <Select
                              options={rangeType}
                              style={{ width: 250 }}
                              disabled={!isEdit}
                            // onChange={val => this.changeRangeType(val, 'generate')}
                            />
                          </FormItem>
                          <FormList
                            isNow={isNow}
                            name={["generate", "electricityPriceDetails"]}
                            price={price}
                            isEdit={isEdit}
                            prefixTitle={energyUnitInfo ? "售电" : '上网'}
                            objTitle={utils.intl("发电单元")}
                            isGridPrice={!energyUnitInfo}
                            energyUnitList={energyUnitListGenerate}
                            realTimePriceList={maps?.realTimePriceMap_Generate || []}
                            multipleTypeList={maps?.multipleTypeMap || []}
                            priceObjMap={maps?.priceObjMap || []}
                            initValue={formValue}
                            clickRealInfo={clickRealInfo}
                          />
                        </div>
                      </TabPane>) : null}
                      {
                        modalType === "cost" ? (<TabPane tab={utils.intl(energyUnitInfo ? "购电电价" : "用电电价")} key="cost" forceRender>
                          <div className="tab-box">
                            <FormItem name={["cost", "rangeType"]} style={{ display: 'none' }} label={utils.intl("适用范围")}>
                              <Select
                                options={rangeType}
                                style={{ width: 250 }}
                                disabled={!isEdit}
                              // onChange={val => this.changeRangeType(val, 'cost')}
                              />
                            </FormItem>
                            <FormList
                              isNow={isNow}
                              name={["cost", "electricityPriceDetails"]}
                              price={price}
                              isEdit={isEdit}
                              prefixTitle={energyUnitInfo ? "购电" : "用电"}
                              objTitle={utils.intl(energyUnitInfo ? "购电来源" : "用电来源")}
                              energyUnitList={energyUnitListCost}
                              isGridPrice={!energyUnitInfo}
                              realTimePriceList={maps?.realTimePriceMap_Cost || []}
                              multipleTypeList={maps?.multipleTypeMap || []}
                              priceObjMap={maps?.priceObjMap || []}
                              initValue={formValue}
                              clickRealInfo={clickRealInfo}
                            />
                          </div>
                        </TabPane>) : null
                      }
                    </Tabs> */}
                  </Form>
                ) : (
                  <PriceLook
                    price={isCopy ? {
                      ...nowPrice,
                      ...(nowPrice[modalType] ?? {})
                    } : price} // 电价对象
                    // priceTitle={props.text_Generate} // 电价名称
                    priceTypeTitle={modalType === 'generation' ? utils.intl(energyUnitInfo ? "售电电价" : "上网电价") : utils.intl(energyUnitInfo ? "购电电价" : "用电电价")} // 电价类型名称
                    extraTitle={`${utils.intl('查看计划电价')}>`}
                    maps={{
                      multipleTypeMap: maps.multipleTypeMap,
                      realTimePriceMap: modalType === 'generation' ? maps.realTimePriceMap_Generate : maps.realTimePriceMap_Cost
                    }}
                  // onExtraTitleClick={() => addPrice("generation")}
                  />
                )) : <div className="tab-price-new-empty">
                <Empty
                  image={theme === 'light-theme' ? require('../../../../static/img/no-data-table-light.svg') : require('../../../../static/img/no-data-table-dark.svg')}
                  imageStyle={{
                    marginTop: 120
                  }}
                  description={
                    <>{utils.intl("暂无1")}{isNow ? utils.intl("“当前执行电价”") : utils.intl("“计划执行电价”")}{
                      !isNow ? (<span>，{utils.intl("请1")}<span onClick={() => {
                        // if (energyUnitListCost?.length || energyUnitListGenerate?.length) {
                        addInitPlanPrice && addInitPlanPrice();
                        this.setState({ isEdit: true });
                        onEditChange && onEditChange(true);
                        // } else {
                        //   // this.setState({ visible: true, type: 2 })
                        // }
                      }}>{utils.intl("添加1")}</span></span>) : null
                    }
                      <div>
                        {!isNow ? <Button className="blue-btn" disabled={!this.checkPriceIsNotNull(nowPrice)} onClick={() => this.checkPriceIsNotNull(nowPrice) && this.copyNowPrice()}>{utils.intl("复制当前电价")}</Button> : null}
                        <Button style={{ marginLeft: 8 }} className="blue-btn" onClick={() => {
                          addInitPlanPrice && addInitPlanPrice();
                          this.setState({ isEdit: true });
                          onEditChange && onEditChange(true);
                        }}>{utils.intl(`添加计划电价`)}</Button>
                      </div>
                    </>
                  } />
              </div>
        }
        <Modal
          visible={visible}
          onOk={() => {
            if (type === 1) {
              const { setFieldsValue, getFieldsValue } = this.form;
              const value = getFieldsValue();
              setFieldsValue({
                [tabKey]: {
                  ...value[tabKey],
                  rangeType: rangeTypeValue
                }
              })
            }
            this.setState({ visible: false })
          }}
          onCancel={() => {
            this.setState({ visible: false })
          }}
        >
          <div>{type === 1 ? utils.intl('当前维护的电价数据将清空且无法还原，确认切换？') : utils.intl('请先维护能量单元')}</div>
        </Modal>
        {!isNow && formValue[modalType === 'cost' ? 'cost' : 'generate']?.electricityPriceDetails && (
          <span className="tab-price-new-sub-btn" style={{ position: "absolute", bottom: 16, right: 16 }}>
            {isEdit ? (
              <>
                <Button onClick={this.reset} style={{ marginRight: 8 }}>{utils.intl("取消")}</Button>
                <Button type="primary" loading={addLoading} onClick={() => {
                  this.form.validateFields().catch(({ errorFields }) => {
                    const reTabKey = tabKey === 'generate' ? 'cost' : 'generate'
                    if (!errorFields.find(item => item.name[0] === tabKey) && errorFields.find(item => item.name[0] === reTabKey)) this.setState({ tabKey: reTabKey })
                  });
                  handleSave && handleSave(this.form, () => { this.setState({ isEdit: false, isCopy: false }) })
                }}>{utils.intl("保存")}</Button>
              </>
            ) : (
              <>
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  style={{ marginRight: 8 }}
                >
                  {utils.intl("删除")}
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    this.setState({ isEdit: true });
                    onEditChange && onEditChange(true);
                  }}
                >
                  {utils.intl("编辑")}
                </Button>
              </>
            )}
          </span>
        )}
      </div>
    );
  }
}
