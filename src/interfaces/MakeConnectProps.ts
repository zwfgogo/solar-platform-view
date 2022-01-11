import { DispatchProp } from 'dva'

export interface ActionProp {
  action: (type, payload?: { [key: string]: any }, onlyFirst?) => void
}

export interface UpdateStateAction<T> {
  updateState: (state: Partial<T>) => void
}

export interface UpdateQueryAction {
  updateQuery: (query: any, queryKey?: string) => void
}

export interface UpdateAction<T> extends UpdateStateAction<T>, UpdateQueryAction {
}

export interface PageChangeAction {
  onPageChange: (key: string) => (page, size) => void
}

interface MakeConnectProps<T> extends DispatchProp, UpdateAction<T>, ActionProp, PageChangeAction {

}

export default MakeConnectProps
