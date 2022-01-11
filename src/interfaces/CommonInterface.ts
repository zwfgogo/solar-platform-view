import { CancelToken, Method } from 'axios'
import { FormInstance, Rule } from 'antd/lib/form'
import { TableProps } from 'antd/lib/table'
import { Tree } from 'antd'
import { TreeProps } from 'antd/lib/tree'
import { ColumnType } from 'antd/lib/table/interface'


export interface Data<T> {
  errorCode: number
  errorMsg: string
  results: T
  pageInfo: {
    page: number
    size: number
    totalCount: number
    totalPages: number
  }
}

export interface List<T> {

}

export interface Info<T> {
  loaded: boolean
  loading: boolean
  data: T
}

export interface Status {
  success: boolean
  loading: boolean

}

export interface ValueName {
  value: string | number
  name: string
}

/**
 * 接口请求参数
 */
export interface HttpProps {
  method: Method;
  url: string;
  data?: any;
  bodyData?: any
  rawUrl?: string
  mockData?: any
  results?: boolean
  convert?: (results) => any
  timeout?: number
  showError?: boolean
  cancelToken?: CancelToken
}

/**
 * 导出列定义
 */
export interface ExportColumn {
  title: string
  dataIndex?: string
  width?: number
  renderE?: (value, index, record) => string
  children?: ExportColumn[]
  exportFormat?: (text, record) => void
}

/**
 * form属性类型
 */
export interface FormComponentProps {
   form: FormInstance
}

/**
 * Table的Column定义
 */
export interface Column<T> extends ColumnType<T> {
  children?: any[]
}

export type ValidationRule = Rule

export interface PageTableProps extends Pick<TableProps<any>, 'dataSource' | 'rowSelection'> {
  page: number
  size: number
  total: number
  onPageChange: (page: number, size: number) => void
  singleCheck?: boolean
  checkedList?: any[]
  onCheckChange?: (ids: (string | number) []) => void
  loading?: boolean
  disableColumnOperation?: (record) => boolean
  x?: number
  draggable?: boolean
  moveRow?: (dragIndex, hoverIndex) => void
}


/**
 * Tree的声明
 */
type TreeRefPropsTool<T> = T extends React.ForwardRefExoticComponent<infer R> ? Omit<R, keyof TreeProps> : never;
type TreeRefTool<T> = T extends React.RefAttributes<infer RR> ? RR : never;
type TreeRefProps = TreeRefPropsTool<typeof Tree>;
export type AntdTreeRef = TreeRefTool<TreeRefProps>
