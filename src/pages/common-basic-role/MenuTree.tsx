import { Checkbox } from 'antd'
import React, { useEffect, useState } from 'react'
import './menu-tree.less'

interface MenuItem {
  id: number
  title: string
  children?: MenuItem[]
}

interface Props {
  list: MenuItem[]
  value: number[]
  disabled: (list: MenuItem[], item: MenuItem) => boolean
  onChange: (key: number[]) => void
}

const MenuTree: React.FC<Props> = (props) => {
  const { list, value } = props

  const handleChange = (checkList) => {
    props.onChange(checkList)
  }

  const handleCheck = (id, checked) => {
    let newValue = value.filter(target => target !== id)
    if (checked) {
      newValue = newValue.concat(id)
    }
    props.onChange(newValue)
  }

  const renderItem = (item: MenuItem) => {
    if (item.children && item.children.length) {
      return (
        <MenuSubItem
          key={item.id}
          item={item}
          selected={value}
          onChange={handleChange}
          disabled={(target) => props.disabled(list, target)}
        />
      )
    } else {
      return (
        <div className="menu-item">
          <Checkbox
            key={item.id}
            value={item.id}
            checked={value.includes(item.id)}
            onChange={(e) => handleCheck(item.id, e.target.checked)}
            disabled={props.disabled(list, item)}
          >{item.title}</Checkbox>
        </div>
      )
    }
  }

  return (
    <div className="wanke-menu-tree">
      {list.map((item) => {
        return renderItem(item)
      })}
    </div>
  )
}

export default MenuTree

interface MenuItemProps {
  item: MenuItem
  selected: number[]
  disabled: (item: MenuItem) => boolean
  onChange?: (checklist) => void
}

const MenuSubItem: React.FC<MenuItemProps> = ({ item, selected = [], onChange, disabled }) => {
  const [value, setValue] = useState([])
  const [indeterminate, setIndeterminate] = useState(false)
  const [checkAll, setCheckAll] = useState(false)

  const triggerChange = (checklist: number[]) => {
    const idMap = { [item.id]: true }
    item.children.forEach(son => {
      idMap[son.id] = true
    })
    let newChecked = selected.filter(target => !idMap[target]).concat(checklist)
    onChange?.(newChecked)
  }

  const handleChange = (e) => {
    if (e.target.checked) {
      setValue(item.children.map(son => son.id))
      setIndeterminate(false)
      setCheckAll(true)
      triggerChange([item.id].concat(item.children.map(son => son.id)))
    } else {
      setValue([])
      setIndeterminate(false)
      setCheckAll(false)
      triggerChange([])
    }
  }

  const handleChildrenChange = (checkList) => {
    const isCheckAll = checkList.length === item.children.length
    setValue(checkList)
    setIndeterminate(!!checkList.length && checkList.length < item.children.length)
    setCheckAll(isCheckAll)
    triggerChange(checkList.length ? checkList.concat(item.id) : checkList)
  }

  useEffect(() => {
    const value = []
    item.children.forEach(son => {
      const flag = selected.includes(son.id)
      if (flag) {
        value.push(son.id)
      }
    })
    const isAll = value.length === item.children.length
    setValue(value)
    setIndeterminate(!isAll && !!value.length)
    setCheckAll(isAll)
  }, [JSON.stringify(selected)])

  return (
    <div className="menu-item">
      <div className="menu-item-sub">
        <Checkbox
          key={item.id}
          value={item.id}
          checked={checkAll}
          indeterminate={indeterminate}
          onChange={handleChange}
          disabled={disabled(item)}
        >{item.title}</Checkbox>
      </div>
      <div className="menu-item-list">
        <Checkbox.Group onChange={handleChildrenChange} value={value}>
          {item.children.map(son => (
            <Checkbox
              key={son.id}
              value={son.id}
              checked={value.includes(son.id)}
              disabled={disabled(son)}
            >{son.title}</Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    </div>
  )
}
