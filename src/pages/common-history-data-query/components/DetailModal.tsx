import React, { useEffect } from 'react';
import { Button, Modal, Table2 } from 'wanke-gui';
import useLocalTablePage from '../../../hooks/useLocalTablePage';
import utils from '../../../public/js/utils';
import { triggerEvent } from '../../../util/utils';

interface Props {
  listData: any[]
  columns: any[]
  closeModal: () => void
  exportCsv: () => void
}

const DetailModal: React.FC<Props> = (props) => {
  const { listData, columns } = props
  const {
    list,
    page,
    pageSize,
    onPageChange,
  } = useLocalTablePage({
    data: listData,
    defaultPageSize: 20
  })

  const width = columns.length * 250

  useEffect(() => {
    if (list.length) {
      setTimeout(() => {
        triggerEvent('resize', window)
      }, 300)
    }
  }, [(JSON.stringify(list))])
  
  return (
    <Modal
      visible={true}
      title={<div style={{ fontWeight: 'bold' }}>{utils.intl('数据表')}</div>}
      onCancel={props.closeModal}
      footer={null}
      width={1100}
    >
      <div style={{ marginBottom: 10, textAlign: 'right' }}>
        <Button className={'e-mr10'} onClick={props.exportCsv} type='primary'>
          {utils.intl('导出')}
        </Button>
      </div>
      <div style={{ width: '100%', height: listData.length ? 600 : 'auto' }}>
        <Table2
          x={width > 580 ? width : 580}
          columns={columns}
          dataSource={list}
          page={page}
          size={pageSize}
          total={listData.length}
          onPageChange={onPageChange}
        />
      </div>
    </Modal>
  );
};

export default DetailModal;