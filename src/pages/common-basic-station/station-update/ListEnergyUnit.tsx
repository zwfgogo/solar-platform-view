import React, { FC } from 'react'
import { Table } from 'wanke-gui'
import Forward from '../../../public/components/Forward'
import { renderTitle } from '../../page.helper'
import { ColumnsType } from 'antd/lib/table/interface'
import utils from '../../../public/js/utils'

interface Props {
  editable: boolean;
  stationId: number
  energyUnitList: any;
  stationTypeId: any;
}

const ListEnergyUnit: FC<Props> = props => {
  const { stationId, energyUnitList, editable, stationTypeId } = props

  const columns: ColumnsType<any> = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65,
      align: 'center'
    },
    {
      title: utils.intl('能量单元名称'),
      dataIndex: 'title',
      width: 200,
      render: (text, record) => {
        return (
          <Forward
            to="energyUnit"
            title={text}
            data={{
              editable: editable,
              stationId: stationId,
              selectEnergyUnitId: record.id,
              stationTypeId: stationTypeId
            }}
          >
            {text}
          </Forward>
        )
      }
    },
    {
      title: utils.intl('能量单元类型'),
      dataIndex: 'energyUnitType',
      width: 150,
      render: renderTitle
    },
    {
      title: utils.intl('容量规模'),
      dataIndex: 'scaleDisplay',
      width: 150,
      align: 'right'
    },
    {
      title: utils.intl('额定功率'),
      dataIndex: 'ratedPowerDisplay',
      width: 150,
      align: 'right'
    },
    {
      title: utils.intl('有效性'),
      dataIndex: 'activity',
      width: 150,
      align: 'center',
      render(text) {
        if (text === true) {
          return utils.intl('是')
        }
        if (text === false) {
          return utils.intl('否')
        }
        return ''
      }
    }
  ]
  return (
    <div>
      <Table rowKey="id" columns={columns} dataSource={energyUnitList} pagination={false} />
    </div>
  )
}

export default ListEnergyUnit
