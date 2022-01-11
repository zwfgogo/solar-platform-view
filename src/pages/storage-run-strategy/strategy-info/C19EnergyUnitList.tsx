import React from 'react';
import { Form, Row, Col, Select, Input } from 'wanke-gui';
import { MinusCircleOutlined, PlusOutlined, WankeAddOutlined } from 'wanke-icon';
import { FormInstance } from 'antd'
import classnames from 'classnames';
import utils from '../../../public/js/utils';
import { C19StrategyControlTypeOptions } from '../strategy.constant';
import { numberStringPrecisionRule } from '../../../util/ruleUtil';

const FormItem = Form.Item

interface Props {
  name: string;
  form: FormInstance<any>
  energyUnitList: any[];
  selectedEnergyIds: number[]
}

const C19EnergyUnitList: React.FC<Props> = ({ name, energyUnitList = [], form, selectedEnergyIds }) => {
  const filterEnergyOptions = (field) => {
    const value = form.getFieldValue('configList')[field.name]?.energyUnitId
    return energyUnitList.filter(opt => {
      return opt.value === value || selectedEnergyIds.indexOf(opt.value) === -1
    })
  }

  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => {
        return (
          <div>
            {
              fields.map((field, index) => (
                <div className="c19-form-line">
                  <div className="c19-form-line-item">
                    <FormItem
                      name={[field.name, 'energyUnitId']}
                      label={utils.intl('strategy.选择对象')}
                      rules={[{ required: true, message: utils.intl('strategy.请选择选择对象') }]}
                    >
                      <Select dataSource={filterEnergyOptions(field)} />
                    </FormItem>
                  </div>
                  <div className="c19-form-line-item">
                    <FormItem
                      name={[field.name, 'type']}
                      label={utils.intl('strategy.模式选择')}
                      rules={[{ required: true, message: utils.intl('strategy.请选择模式选择') }]}
                    >
                      <Select dataSource={C19StrategyControlTypeOptions} />
                    </FormItem>
                  </div>
                  <div className="c19-form-line-item">
                    <FormItem
                      name={[field.name, 'value']}
                      label={utils.intl('strategy.功率值')}
                      rules={[
                        { required: true, message: utils.intl('strategy.请输入功率值') },
                        numberStringPrecisionRule(0, 9999999, 2)
                      ]}
                    >
                      <Input addonAfter={'kW'} />
                    </FormItem>
                  </div>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className={classnames("c19-form-line-icon", "basic-icon-delete")}
                      onClick={() => { remove(field.name) }}
                    />
                  ) : null}
                </div>
              ))
            }
            <a onClick={() => add()}>
              <PlusOutlined style={{ marginRight: 8 }} />
              {utils.intl('strategy.增加参数')}
            </a>
          </div>
        )
      }}
    </Form.List>
  );
};

export default C19EnergyUnitList;
