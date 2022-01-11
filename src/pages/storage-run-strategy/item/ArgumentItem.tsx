import React, {useEffect, useRef, useState} from 'react'
import moment from 'moment'
import {FormContainer, message, MonthDayPicker, Select} from 'wanke-gui'

import {copy, getUid} from '../../../util/utils'
import Label from '../../../components/Label'
import {Button, Input, Tabs} from 'antd'
import ControlCommandDialog from '../dialog/ControlCommandDialog'
import LsControlArgumentWithEdit from './LsControlArgumentWithEdit'
import {useForm} from 'antd/es/form/Form'
import {DateTypeOptions} from '../run-strategy.constants'
import {Mode} from '../../constants'
import {CloseOutlined} from 'wanke-icon'
import SelectCopyEnergyUnitDialog from '../dialog/SelectCopyEnergyUnitDialog'
import PreviewCurveDialog from '../dialog/PreviewCurveDialog'
import ImportCommandDialog from '../dialog/ImportCommandDialog'

import utils from '../../../public/js/utils'

export class TypeStrategyItem {
  id: number
  title: string
  applicableDateType: any = 'NaturalDay'
  applicableDate: string[][] = []
  details: any[] = []
}

interface Props {
  inEdit: boolean
  energyUnitList: any[]
  priceInfo: any
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  detail?: TypeStrategyItem
  isLocal?: boolean
  cancelEdit: () => void
  saveArgument: (data) => void
  updateArgument?: (data) => void
}

const ArgumentItem: React.FC<Props> = function (this: null, props) {
  const firstUnitValue = props.energyUnitList?.[0]?.value
  const [unitId, setUnitId] = useState(firstUnitValue ? firstUnitValue + '' : firstUnitValue)
  const [value, setValue] = useState<TypeStrategyItem>(props.detail || new TypeStrategyItem())
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showSelectCopyDialog, setShowSelectCopyDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const currentEditIdRef = useRef(null)

  const [form] = useForm()

  const onNameChange = (name) => {
    let newV = copy(value)
    newV.title = name.trim()
    setValue(newV)
  }

  const handleDateTypeChange = (v) => {
    let newV = copy(value)
    newV.applicableDateType = v
    setValue(newV)
  }

  const onAdd = (command) => {
    let value1 = copy(value)
    value1.details.push({
      ...command,
      crud: Mode.add,
      id: 'local_' + getUid(),
      energyUnitId: unitId
    })
    _sortCommand(value1.details)
    setValue(value1)
    setShowAdd(false)
  }

  const handleImportCommands = (commands) => {
    let value1 = copy(value)
    value1.details = []
    commands.forEach(command => {
      value1.details.push({
        ...command,
        crud: Mode.add,
        id: 'local_' + getUid(),
        energyUnitId: unitId
      })
    })
    _sortCommand(value1.details)
    setValue(value1)
    setShowImport(false)
  }

  const handleEdit = (index) => {
    currentEditIdRef.current = index
    setShowEdit(true)
  }

  const _sortCommand = (commands: any[]) => {
    commands.sort((a, b) => {
      if (a.startTime == b.startTime) {
        return a.endTime - b.endTime
      }
      return a.startTime > b.startTime ? 1 : -1
    })
  }

  const onEdit = (command) => {
    let value1 = copy(value)
    let index = value1.details.findIndex((item, index) => index == currentEditIdRef.current)
    value1.details[index] = {
      ...value1.details[index],
      ...command
    }
    _sortCommand(value1.details)
    setValue(value1)
    setShowEdit(false)
  }

  const onDelete = (index) => {
    let value1 = copy(value)
    // let index = value1.details.findIndex(item => item.id == id)
    value1.details.splice(index, 1)
    setValue(value1)
  }

  const addRange = () => {
    let value1 = copy(value)
    value1.applicableDate.push(['', ''])
    setValue(value1)
  }

  const handleRangeChange = (index, v) => {
    let value1 = copy(value)
    value1.applicableDate[index] = v
    setValue(value1)
  }

  const deleteMonthDay = (index) => {
    let value1 = copy(value)
    value1.applicableDate.splice(index, 1)
    setValue(value1)
  }

  const copyCommand = (from) => {
    let commandFromList = value.details.filter(item => item.energyUnitId == from).map(item => {
      return {...item, crud: Mode.add, id: 'local_' + getUid(), energyUnitId: unitId}
    })
    let value1 = copy(value)
    value1.details = value1.details.filter(item => item.energyUnitId != unitId)
    value1.details.push(...commandFromList)
    setValue(value1)
    setShowSelectCopyDialog(false)
  }

  const saveArgument = () => {
    if (!value.title) {
      message.error(utils.intl('请输入控制参数名称'))
      return
    }
    if (value.applicableDate.length == 0) {
      message.error(utils.intl('请添加时段'))
      return
    }
    for (let item of value.applicableDate) {
      if (!item[0]) {
        message.error(utils.intl('请选择开始、结束时段'))
        return
      }
    }
    if (value.applicableDate && value.applicableDate.length > 1 && isOverlap(value.applicableDate)) {
      message.error(utils.intl('适用季节/时段不能重合'))
      return
    }
    if (value.details && value.details.length > 1 && isDetailsOverlap(value.details)) {
      message.error(utils.intl('执行时段不能重合'))
      return
    }
    doSaveArgument()
  }

  const doSaveArgument = () => {
    if (props.detail && !props.isLocal) {
      props.updateArgument({
        id: props.detail.id,
        title: value.title.trim(),
        applicableDateType: value.applicableDateType,
        applicableDate: value.applicableDate,
        details: value.details.map(item => {
          let id = item.id
          if (item.crud == Mode.add) {
            id = null
          }
          return {...item, id}
        })
      })
    } else {
      props.saveArgument({
        title: value.title.trim(),
        applicableDateType: value.applicableDateType,
        applicableDate: value.applicableDate,
        details: value.details.map(item => ({...item, id: null}))
      })
    }
  }

  let item
  if (currentEditIdRef.current !== undefined && currentEditIdRef.current !== null) {
    item = value.details.find((item, index) => index == currentEditIdRef.current)
  }
  let copys = props.energyUnitList.filter(unit => unit.value != unitId)
    .filter(unit => value.details.filter(c => c.energyUnitId == unit.value).length > 0)

  return (
    <div className="argument-item">
      <FormContainer form={form}>
        {
          showAdd && (
            <ControlCommandDialog
              commandTypeOptions={props.commandTypeOptions}
              controlTypeOptions={props.controlTypeOptions}
              endControlOptions={props.endControlOptions}
              visible={showAdd}
              onCancel={() => setShowAdd(false)}
              onConfirm={onAdd}
            />
          )
        }
        {
          showEdit && (
            <ControlCommandDialog
              detail={item}
              commandTypeOptions={props.commandTypeOptions}
              controlTypeOptions={props.controlTypeOptions}
              endControlOptions={props.endControlOptions}
              visible={showEdit}
              onCancel={() => setShowEdit(false)}
              onConfirm={onEdit}
            />
          )
        }
        {
          showSelectCopyDialog && (
            <SelectCopyEnergyUnitDialog
              options={copys}
              visible={showSelectCopyDialog}
              onCancel={() => setShowSelectCopyDialog(false)}
              onConfirm={copyCommand}
            />
          )
        }
        {
          showPreview && (
            <PreviewCurveDialog
              applicableDate={value.applicableDate}
              currentCommandList={value.details.filter(item => item.energyUnitId == unitId)}
              scale={props.energyUnitList.find(item => item.value == unitId)?.scale}
              visible={showPreview}
              priceInfo={props.priceInfo}
              onCancel={() => setShowPreview(false)}
            />
          )
        }
        {
          showImport && (
            <ImportCommandDialog
              commandTypeOptions={props.commandTypeOptions}
              controlTypeOptions={props.controlTypeOptions}
              endControlOptions={props.endControlOptions}
              onImport={handleImportCommands}
              visible={showImport}
              onCancel={() => setShowImport(false)}
            />
          )
        }
        <div className="argument-header">
          <div style={{ flexShrink: 0 }}>
            <Input
              placeholder={utils.intl('请输入控制参数名称')}
              value={value.title}
              maxLength={32}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div className="argument-header-range edit" style={{}}>
            <Label horizontal={true}>{utils.intl('适用季节/时段')}</Label>
            <div style={{width: 120, marginRight: 5}}>
              <Select style={{width: '100%'}} dataSource={DateTypeOptions} value={value.applicableDateType}
                      onChange={handleDateTypeChange}></Select>
            </div>
            {
              value.applicableDate?.map((range, index) => {
                if (range[0] != '') {
                  return (
                    <div key={index} className="month-day">
                      {moment('2000-' + range[0]).format(utils.intl('MM月DD日'))}
                      <span style={{margin: '0 5px'}}>~</span>
                      {moment('2000-' + range[1]).format(utils.intl('MM月DD日'))}
                      <div className="remove-month-day">
                        <CloseOutlined onClick={() => deleteMonthDay(index)}/>
                      </div>
                    </div>
                  )
                }
                return (
                  <div className="v-center" style={{width: 260}} key={index}>
                    {index != 0 && (<span>，</span>)}
                    <MonthDayPicker
                      format={'MM-DD'}
                      defaultPickerValue={[moment('2000-01-01'), null]}
                      value={range.map(item => item == '' ? null : moment('2000-' + item))}
                      onChange={v => handleRangeChange(index, v.map(item => item == null ? '' : item.format('MM-DD')))}
                    />
                  </div>
                )
              })
            }
            {
              value.applicableDate?.filter(item => item[0] == '').length == 0 && (
                <Button
                  style={{marginLeft: 8 }}
                  type="default"
                  onClick={addRange}
                >{utils.intl('添加')}</Button>
              )
            }
          </div>
          <div style={{ flexShrink: 0, marginTop: 6 }}>
            <a style={{color: 'gray'}} onClick={props.cancelEdit}>{utils.intl('取消')}</a>
            <a style={{marginLeft: 10}} onClick={saveArgument}>{utils.intl('保存')}</a>
          </div>
        </div>
        <section className="argument-item-table-container">
        <header>
          <Select
            style={{ width: 150 }}
            dataSource={props.energyUnitList}
            value={unitId ? Number(unitId) : unitId}
            onChange={setUnitId}
          />
          <div className="v-center">
            <Button
              type="default"
              disabled={copys.length == 0}
              onClick={() => setShowSelectCopyDialog(true)}
            >{utils.intl('复制')}</Button>
            <Button
              type="default"
              style={{ marginLeft: 7 }}
              disabled={value.applicableDate.length == 0 || value.details.filter(command => command.energyUnitId == unitId).length == 0}
              onClick={() => setShowPreview(true)}
            >{utils.intl('预览')}</Button>
            <Button
              style={{marginLeft: 7}}
              type="default"
              onClick={() => setShowImport(true)}
            >{utils.intl('导入')}</Button>
            <Button
              style={{marginLeft: 7 }}
              type="primary"
              onClick={() => setShowAdd(true)}
            >{utils.intl('新增')}</Button>
          </div>
        </header>
        <footer>
          <LsControlArgumentWithEdit
            commandTypeOptions={props.commandTypeOptions}
            controlTypeOptions={props.controlTypeOptions}
            endControlOptions={props.endControlOptions}
            dataSource={value.details?.filter(item => item.energyUnitId == unitId) || []}
            onEdit={handleEdit}
            onDelete={onDelete}
            isLocal={false}
          />
        </footer>
        </section>
      </FormContainer>
    </div>
  )
}

export default ArgumentItem

function isOverlap(applicableDate) {
  if (applicableDate.length < 2) return false

  const _list = applicableDate.slice()
  _list.sort((a, b) => {
    if (a[0] > b[0]) return 1
    if (a[0] < b[0]) return -1
    return 0
  })

  let last = _list[0]
  return _list.some((item, index) => {
    if (index === 0) return false
    const flag =  last[1] >= item[0]
    last = item
    return flag
  })
}

function isDetailsOverlap(details) {
  if (details.length < 2) return false

  const _list = details.map(item => ([item.startTime, item.endTime === '00:00' ? '24:00' : item.endTime])).slice()
  _list.sort((a, b) => {
    if (a[0] > b[0]) return 1
    if (a[0] < b[0]) return -1
    return 0
  })

  let last = _list[0]
  return _list.some((item, index) => {
    if (index === 0) return false
    const flag =  last[1] > item[0]
    last = item
    return flag
  })
}
