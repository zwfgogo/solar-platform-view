import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Input, Radio, RadioGroupItem, RangePicker, Row, Table } from 'wanke-gui'
import { FormInstance } from 'antd'
import utils from '../../../public/js/utils'
import { StrategyControlWay } from '../strategy.constant'
import RangeInput from '../../../components/RangeInput'
import { numberStringPrecisionRule } from '../../../util/ruleUtil'
import { exportCSV, exportExcel } from '../../../util/fileUtil'
import UploadCsv from '../../../components/UploadCsv'

const FormItem = Form.Item

function getDefaultValues() {
  return {
    type: undefined,
    timeRange: undefined,
    targetVoltage: undefined,
    deviationRange: [],
    maxReactivePowerOutput: undefined,
    maxReactivePowerInput: undefined,
  }
}

const gutter = 32

interface Props {
  data: any
  form: FormInstance<any>
  onChange: (values) => void
}

const C07ControlParamsForm: React.FC<Props> = (props) => {
  const { data = {}, form } = props
  let language = localStorage.getItem('language');

  const columns: any = [{
    title: utils.intl('strategy.时间点'),
    dataIndex: 'dtime'
  }, {
    title: utils.intl('strategy.无功功率') + '(kVar)',
    dataIndex: 'value'
  }]

  const handleExport = () => {
    exportExcel(columns, data.details || [], `导出`);
  }

  const handleImport = (data) => {
    const details = data.map(item => {
      return {
        dtime: item[utils.intl('strategy.时间点')],
        value: item[utils.intl('strategy.无功功率') + '(kVar)'],
      }
    })
    props.onChange({ details })
  }

  useEffect(() => {
    form.setFieldsValue({
      ...getDefaultValues(),
      ...data
    })
  }, [JSON.stringify(data)])

  return (
    <Form form={form} layout={language === 'zh' ? 'horizontal' : 'vertical'}>
      <Row gutter={gutter}>
        <Col span={6}>
          <FormItem
            name="type"
            label={utils.intl('strategy.控制方式')}
            rules={[{ required: true, message: utils.intl('strategy.请选择控制方式') }]}
          >
            <Radio.Group onChange={(e) => props.onChange({ type: e.target.value })}>
              <Radio value={StrategyControlWay.Automatic}>{utils.intl('strategy.自动控制')}</Radio>
              <Radio value={StrategyControlWay.Manual}>{utils.intl('strategy.手动控制')}</Radio>
            </Radio.Group>
          </FormItem>
        </Col>
      </Row>
      <Row gutter={gutter}>
        <Col span={6}>
          <FormItem
            name="timeRange"
            label={utils.intl('strategy.执行日期')}
            rules={[{ required: true, message: utils.intl('strategy.请选择执行日期') }]}
          >
            <RangePicker
              onChange={(val) => props.onChange({ timeRange: val })}
            />
          </FormItem>
        </Col>
      </Row>
      {data.type === StrategyControlWay.Automatic && (
        <>
          <Row gutter={gutter}>
            <Col span={6}>
              <FormItem
                name="targetVoltage"
                label={utils.intl('strategy.电压目标')}
                rules={[
                  { required: true, message: utils.intl('strategy.请输入电压目标') },
                  numberStringPrecisionRule(0, 9999999, 2)
                ]}
              >
                <Input
                  onChange={(e) => props.onChange({ targetVoltage: e.target.value })}
                  addonAfter={'V'}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name="deviationRange"
                label={utils.intl('strategy.允许偏差')}
                rules={[getDeviationRangeValidator(-100, 100, 2)]}
              >
                <RangeInput
                  onChange={(val) => props.onChange({ deviationRange: val })}
                  unit={'%'}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name="maxReactivePowerOutput"
                label={utils.intl('strategy.发出无功功率最大值')}
                rules={[
                  { required: true, message: utils.intl('strategy.请输入发出无功功率最大值') },
                  numberStringPrecisionRule(0, 9999999, 2)
                ]}
              >
                <Input
                  onChange={(e) => props.onChange({ maxReactivePowerOutput: e.target.value })}
                  addonAfter={'kVar'}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name="maxReactivePowerInput"
                label={utils.intl('strategy.吸收无功功率最大值')}
                rules={[
                  { required: true, message: utils.intl('strategy.请输入吸收无功功率最大值') },
                  numberStringPrecisionRule(0, 9999999, 2)
                ]}
              >
                <Input
                  onChange={(e) => props.onChange({ maxReactivePowerInput: e.target.value })}
                  addonAfter={'kVar'}
                />
              </FormItem>
            </Col>
          </Row>
        </>
      )}
      {data.type === StrategyControlWay.Manual && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <UploadCsv onImport={handleImport} />
            <Button type="primary" style={{ marginLeft: 16 }} onClick={handleExport}>{utils.intl('导出')}</Button>
          </div>
          <Table
            pagination={false}
            columns={columns}
            dataSource={data.details || []}
            scroll={{ y: 400 }}
          />
        </>
      )}
    </Form>
  )
}

export default C07ControlParamsForm

function getDeviationRangeValidator(min, max, precision) {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!value[0] || !value[1]) {
        return Promise.reject(utils.intl('strategy.请输入允许偏差'))
      }

      if (!/^-?\d+(\.\d+)?$/.test(value[0]) || !/^-?\d+(\.\d+)?$/.test(value[1])) {
        return Promise.reject(utils.intl('请输入数字'))
      }
      const num1 = Number(value[0])
      const num2 = Number(value[1])
      if (num1 > num2) {
        return Promise.reject(utils.intl('rule.请输入正确的取值范围'))
      }
      if (num1 < min || num1 > max || num2 < min || num2 > max) {
        return Promise.reject(utils.intl('rule.取值范围[{0}-{1}]', min, max))
      }
      let parts1 = value[0].split('.')
      let parts2 = value[1].split('.')
      if (parts1[1] && parts1[1].length > precision) {
        return Promise.reject(utils.intl('rule.保留{0}位小数', precision))
      }
      if (parts2[1] && parts2[1].length > precision) {
        return Promise.reject(utils.intl('rule.保留{0}位小数', precision))
      }
      return Promise.resolve()
    }
  }
}
