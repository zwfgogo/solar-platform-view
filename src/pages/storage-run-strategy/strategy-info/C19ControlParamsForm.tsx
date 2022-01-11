import React, { useEffect } from 'react'
import { FormInstance } from 'antd'
import { Form } from 'wanke-gui'
import C19EnergyUnitList from './C19EnergyUnitList'

interface Props {
  data: any
  form: FormInstance<any>
  onChange: (values) => void
  energyUnitList: any[]
}

const C19ControlParamsForm: React.FC<Props> = (props) => {
  const { data = {}, form } = props
  let language = localStorage.getItem('language');

  const selectedEnergyIds = (data.configList || [])
    .map(row => row?.energyUnitId)
    .filter(item => !!item)

  const handleChange = () => {
    const val = form.getFieldValue('configList')
    props.onChange({ configList: val })
  }

  useEffect(() => {
    form.setFieldsValue({
      ...data
    })
  }, [JSON.stringify(data)])

  return (
    <Form
      form={form}
      layout={language === 'zh' ? 'horizontal' : 'vertical'}
      onValuesChange={handleChange}
    >
      <C19EnergyUnitList
        form={form}
        name="configList"
        energyUnitList={props.energyUnitList}
        selectedEnergyIds={selectedEnergyIds}
      />
    </Form>
  )
}

export default C19ControlParamsForm
