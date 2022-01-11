import React, { useState } from 'react'
import { Modal, Table, Pagination } from 'wanke-gui'
import classnames from 'classnames'
import styles from './styles/data-modal.less'
import ExportButton from '../../../../components/ExportButton'
import { WankeClearOutlined } from 'wanke-icon'
import { exportFile } from "../../../../util/fileUtil";
import useLocalTablePage from '../../../../hooks/useLocalTablePage'
import utils from '../../../../public/js/utils';

interface Props {
  className?: string
  columns?: any[]
  tableData?: any[]
  onOpen?: () => boolean
  getExportFileName?: () => string
}

const DataModal: React.FC<Props> = (props) => {
  const [visible, setVisible] = useState(false)
  const {
    className,
    children,
    columns,
    tableData,
    onOpen,
    getExportFileName = () => utils.intl('导出')
  } = props
  const {
    list,
    page,
    pageSize,
    onPageChange
  } = useLocalTablePage({
    data: tableData,
    defaultPageSize: 20
  })

  const toggleVisible = () => {
    setVisible(!visible)
  }

  const onClick = () => {
    const flag = onOpen ? onOpen() : true
    if(flag) {
      toggleVisible()
    }
  }

  return (
    <>
      <div
        className={className}
        onClick={onClick}
      >
        {children}
      </div>
      <Modal
        wrapClassName={styles['data-modal']}
        visible={visible}
        title={null}
        footer={null}
        width="70vw"
      >
        <section className={styles['page-modal']}>
          <header className={styles['header']}>
            <span className={styles['left']}>{utils.intl('数据表')}</span>
            <div className={styles['right']}>
              <ExportButton onExport={() => exportFile(columns, tableData, null, { filename: getExportFileName() })} />
              <WankeClearOutlined
                onClick={toggleVisible}
                style={{ fontSize: 16, marginLeft: 10, cursor: 'pointer' }}
              />
            </div>
          </header>
          <footer className={styles['footer']}>
            <Table
              columns={columns}
              dataSource={list}
              loading={false}
              pagination={false}
              scroll={{ y: 370, x: '70vw' }}
            />
            <div className={styles['pagination']}>
              {
                list?.length > 0 && (
                  <Pagination
                    showQuickJumper
                    showSizeChanger
                    current={page}
                    pageSizeOptions={['20', '30', '50', '100']}
                    pageSize={pageSize}
                    total={tableData.length}
                    onChange={onPageChange}
                    onShowSizeChange={onPageChange}
                  />
                )
              }
            </div>
          </footer>
        </section>
      </Modal>
    </>
  )
}

export default DataModal