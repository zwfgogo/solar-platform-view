import React from 'react'
import Trigger from 'rc-trigger'
import Item from '../../../../components/SelectItem'
import { connect } from 'dva'
import utils from '../../../../public/js/utils'
import gdata from '../../../../public/js/gdata'
import styles from '../../index.less'

interface MonthProps {
  dispatch?: any;
  onSelected?: any;
  onChange?: any;
  value?: Array<any>;
}

interface ContentProps {
  value: Array<any>;
  onSelected: any;
  monthSelected?: any;
}

const builtinPlacements = {
  left: {
    points: ['cr', 'cl']
  },
  right: {
    points: ['cl', 'cr']
  },
  top: {
    points: ['bc', 'tc']
  },
  bottom: {
    points: ['tc', 'bc']
  },
  topLeft: {
    points: ['bl', 'tl']
  },
  topRight: {
    points: ['br', 'tr']
  },
  bottomRight: {
    points: ['tr', 'br']
  },
  bottomLeft: {
    points: ['tl', 'bl']
  }
}

function getPopupContainer(trigger) {
  return trigger.parentNode
}

const months = gdata('months')

interface itemstyle {
  marginLeft?: any;
}

function Content(props: ContentProps) {
  const {value, onSelected, monthSelected} = props
  return (
    <div className={styles.monthContainer}>
      {months.map((item, key) => {
        const style: itemstyle = {}

        if (item.value === '11') {
          style.marginLeft = '18px'
        }

        if (item.value === '12') {
          style.marginLeft = '12px'
        }
        const disabled = !!(monthSelected.indexOf(item.value) > -1)
        const selected = value.indexOf(item.value) > -1
        return (
          <Item
            className="panel-month"
            style={style}
            selected={selected}
            disabled={disabled}
            onClick={() => {
              if (selected || !disabled) {
                onSelected(item.value, !(value.indexOf(item.value) > -1))
              }
            }}
            key={item.value}
          >
            {utils.intl(item.name)}
          </Item>
        )
      })}
    </div>
  )
}

const ContentCon = connect(state => state.priceEdit)(Content)
const monthMapKey = utils.transformKey({data: months, key: 'value', names: ['name']})

function getMonth(value) {
  const newValue = value.map(item => {
    item = monthMapKey[item].name
    return utils.intl(item)
  })
  return newValue.join('，')
}

class Month extends React.Component<MonthProps> {
  render() {
    const {value, onChange, dispatch} = this.props
    const newValue = getMonth(value)
    const change = (val, selectd) => {
      let updateValue = [...value]
      if (selectd) {
        updateValue.push(val)
        updateValue.sort((a, b) => {
          return parseInt(a) - parseInt(b)
        })
        dispatch({type: 'priceEdit/selectMonth', payload: {value: val}})
      } else {
        updateValue = utils.delFromArrByIndex(updateValue, updateValue.indexOf(val))
        dispatch({type: 'priceEdit/unselectMonth', payload: {value: val}})
      }
      onChange(utils.unique(updateValue))
    }
    return (
      <Trigger
        className="trigger-select-month"
        getPopupContainer={getPopupContainer}
        stretch="width"
        popupPlacement="bottom"
        popupAlign={{
          offset: [0, 4],
          overflow: {
            adjustX: 1,
            adjustY: 1
          }
        }}
        popup={<ContentCon onSelected={change} value={value}/>}
        action={['click']}
        destroyPopupOnHide
        builtinPlacements={builtinPlacements}
      >
        <div className={styles.monthTheme} style={{minHeight: 33, padding: '4px 7px', borderRadius: 5}}>
          {newValue}
        </div>
      </Trigger>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.priceEdit
  }
}

export default connect(mapStateToProps)(Month)