import React from 'react'
import { Tabs } from 'wanke-gui'
import classnames from 'classnames'
import { WKTabsProps } from 'wanke-gui/lib/tabs'

const { TabPane } = Tabs

interface Props extends WKTabsProps {}

const OriginTabs: React.FC<Props> & { TabPane: typeof TabPane } = (props) => {
  const { className, children, ...rest } = props

  return (
    <Tabs className={classnames("origin-tab", className)} {...rest}>
      {children}
    </Tabs>
  )
}

OriginTabs.TabPane = TabPane

export default OriginTabs
