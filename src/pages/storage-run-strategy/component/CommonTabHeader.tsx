import React from 'react'
import { Tabs } from 'wanke-gui'
import utils from '../../../public/js/utils'

interface TabItem {
  title: string
  key: string
}

interface Props {
  activeKey: any
  tabList: TabItem[]
  onChange: (key: string) => void
}

const CommonTabHeader: React.FC<Props> = (props) => {
  return (
    <Tabs activeKey={props.activeKey} onChange={props.onChange}>
      {props.tabList.map(tab => (
        <Tabs.TabPane key={tab.key} tab={tab.title}>
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

export default CommonTabHeader
