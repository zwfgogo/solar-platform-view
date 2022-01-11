import React from "react";
import { Table2 } from 'wanke-gui'
import {PageTableProps} from '../../../../interfaces/CommonInterface'
import { DATE_TYPE, addUnit, timeMap } from "../../models/vppBillDetail";

interface Props extends PageTableProps {
  dateType: DATE_TYPE;
  headerUnit: any;
  onTimeClick: (time: string) => void;
}

const VppBillDetailTable: React.FC<Props> = function(this: null, props) {
  const { dateType, headerUnit = {}, onTimeClick } = props;
  const columns: any = [
    {
      title: dateType ? timeMap[dateType] : "",
      width: 180,
      dataIndex: "date",
      render: text => {
        if (text === "合计" || dateType === DATE_TYPE.DAY)
          return <span>{text}</span>;
        return <a onClick={() => onTimeClick && onTimeClick(text)}>{text}</a>;
      }
    },
    {
      title: "电力交易",
      children: [
        {
          title: addUnit("售电", headerUnit.energySold),
          dataIndex: "energySold"
        },
        {
          title: addUnit("收益", headerUnit.energySoldProfit),
          dataIndex: "energySoldProfit"
        },
        {
          title: addUnit("购电", headerUnit.energyBought),
          dataIndex: "energyBought"
        },
        {
          title: addUnit("收益", headerUnit.energyBoughtProfit),
          dataIndex: "energyBoughtProfit"
        }
      ]
    },
    {
      title: "辅助服务",
      children: [
        {
          title: addUnit("响应电量", headerUnit.demandResponse),
          dataIndex: "demandResponse"
        },
        {
          title: addUnit("收益", headerUnit.demandResponseProfit),
          dataIndex: "demandResponseProfit"
        }
      ]
    },
    { title: addUnit("总收益", headerUnit.profit), dataIndex: "profit" }
  ];

  return (
    <Table2
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
};

export default VppBillDetailTable;
