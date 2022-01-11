import React from 'react'
import { Table1 } from 'wanke-gui'
import utils from '../../../public/js/utils';
import { accuracyEnum } from '../../constants';

interface Props {
  loading: boolean,
  dataSource: any[],
  valueMap: any,
  pointDataTypeMap: any,
  columns?: any[],
}

const List: React.FC<Props> = function (this: null, props) {
  const { valueMap, pointDataTypeMap, columns } = props;
  const tableColumns: any = columns || [
    {
      title: utils.intl('序号'),
      width: 75,
      // align: 'center',
      render: (text, record, index) => {
        return index + 1;
      }
    },
    {
      title: utils.intl('数据项名称'),
      dataIndex: 'title',
    },
    {
      title: utils.intl('输入/输出端名称'),
      dataIndex: 'terminalTitle',
      render: (text, record, index) => {
        return text ? text : utils.intl('无')
      },
    },
    {
      title: utils.intl('实时值'),
      render: (text, record, index) => {
        if(record.name === 'BreakerStatus'){
          if(pointDataTypeMap[record.id] && valueMap[pointDataTypeMap[record.id].pointNumber]) return !valueMap[pointDataTypeMap[record.id].pointNumber].val ? utils.intl('关闭') : utils.intl('打开')
          return ''
        }else{
          return pointDataTypeMap[record.id] && valueMap[pointDataTypeMap[record.id].pointNumber] && (valueMap[pointDataTypeMap[record.id].pointNumber].val || valueMap[pointDataTypeMap[record.id].pointNumber].val === 0)
          ? Number(valueMap[pointDataTypeMap[record.id].pointNumber].val).toFixed(Number(accuracyEnum[record.accuracy] ?? 2)) : ''
        }
      },
    },
    {
      title: utils.intl('单位'),
      render: (text, record, index) => {
        return record.unit ? record.unit : null
      },
    },
    {
      title: utils.intl('数据时间'),
      render: (text, record, index) => {
        // return ''
        return pointDataTypeMap[record.id] && valueMap[pointDataTypeMap[record.id].pointNumber] && valueMap[pointDataTypeMap[record.id].pointNumber].dtime
          ? valueMap[pointDataTypeMap[record.id].pointNumber].dtime
          : null
      },
      // align: 'center'
    }
  ];

  return <Table1
    loading={props.loading}
    dataSource={props.dataSource}
    columns={tableColumns}
  />
};

export default List;