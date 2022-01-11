/**
 * 自定义级联(目前只支持2级)
 */
import React, { useCallback, useEffect, useState } from 'react'
import { Menu } from 'antd';
import { Checkbox, Select, Switch, Input } from 'wanke-gui'
import { DataSource } from 'wanke-gui/lib/select/Select';
import _ from 'lodash'
import "./customCascader.less"
import utils from '../../../public/js/utils';
import { LoadingOutlined, RightOutlined } from 'wanke-icon';

const { SubMenu, ItemGroup, Item, Divider } = Menu;
const { Search } = Input

interface Options {
  value: number | string;
  name: string;
  groupName?: string;
  disabled?: boolean;
  selectable?: boolean;
  children?: Options[];
}

interface CustomCascaderProps {
  dataSource: Options[],
  type?: 'multiple' | 'single',
  loading?: { [key: string]: boolean }, // 异步数据加载时的loading
  onChange?: (value: string) => void,
  handleSubMenuClick?: (item: any, key: string | number) => void,
  filterable?: boolean,
  [key: string]: any
}

const CustomCascader: React.FC<CustomCascaderProps> = (props) => {

  const { dataSource: propsDataSource, style, type = 'single', filterable = true, value: propsValue, loading, onChange, handleSubMenuClick, ...restProps } = props

  const [value, setValue] = useState(type === 'multiple' ? [] : undefined);
  const [dataSource, setDataSource] = useState(propsDataSource ?? []);
  const [filterValue, setFilterValue] = useState({});
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (type === 'multiple') {

    } else {
      const list = valueToObj(propsValue?.split('-'), dataSource)
      const { groupName, name } = list?.[list.length - 1] ?? {}
      setValue(groupName ? `${groupName}：${name}` : name)
    }
  }, [propsValue, JSON.stringify(propsDataSource)])

  useEffect(() => {
    window.onerror = function (err) {
      if (err.toString().indexOf('error on purpose') !== -1) {
        // console.log(err);
        return true
      }
    }

    document.body.addEventListener('click', globalClick)
    return () => {
      window.onerror = undefined;
      document.body.removeEventListener('click', globalClick)
    }
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [value])


  useEffect(() => {
    setDataSource(propsDataSource)
  }, [JSON.stringify(propsDataSource)]);

  const globalClick = (e) => {
    // console.log('e.path', e.path)
    if (!e.path.find(target => {
      return target.className && `${target.className}`.indexOf('ant-menu-vertical') > -1 
      || target.className && `${target.className}`.indexOf('customCascader-dropdown') > -1
      || target.className && `${target.className}`.indexOf('customCascader-box') > -1
    })){
      setOpen(false);
    }else{
      setOpen(true);
    }
  }

  const dropdownRender = useCallback(() => {

    return (<Menu
      mode="vertical"
      multiple={type === 'multiple'}
      triggerSubMenuAction="click"
      onClick={handleClick}
      expandIcon={(props) => {
        return loading[props.eventKey] ? <LoadingOutlined /> : <RightOutlined />
      }}
      onOpenChange={(openKeys) => {
        setFilterValue({})
        setDataSource(propsDataSource)
      }}>
      {
        type === 'multiple' ?
          dataSourceMultipleToJSX(dataSource)
          : dataSourceToJSX(dataSource)
      }
    </Menu>)
  }, [JSON.stringify(dataSource), JSON.stringify(propsDataSource), JSON.stringify(loading)])

  const dataSourceToJSX = useCallback(
    (dataSource, superKey?) => {
      if (dataSource?.length) {
        const obj = _.groupBy(dataSource, 'groupName')
        return Object.keys(obj).map(key => {
          const menu = obj[key];
          if (key && key !== 'undefined') {
            return (
              <ItemGroup title={key}>
                {
                  menu.map(m => {
                    const { children, hasChild } = m
                    const sKey = superKey ? `${superKey}-${m.value}` : m.value
                    if (children?.length || hasChild) {
                      return (
                        <SubMenu key={sKey} title={m.name} disabled={m.disabled} onTitleClick={() => handleSubMenuClick && handleSubMenuClick(m, sKey)}>
                          {dataSourceToJSX(children, sKey)}
                        </SubMenu>
                      )
                    }
                    return (<Item key={sKey} disabled={m.disabled}>{m.name}</Item>)
                  })
                }
              </ItemGroup>
            )
          }
          return menu.map(m => {
            const { children, hasChild } = m
            const sKey = superKey ? `${superKey}-${m.value}` : m.value
            if (children?.length || hasChild) {
              return (
                <SubMenu key={sKey} title={m.name} disabled={m.disabled} onTitleClick={() => handleSubMenuClick && handleSubMenuClick(m, sKey)}>
                  {dataSourceToJSX(children, sKey)}
                </SubMenu>
              )
            }
            return (<Item key={sKey} disabled={m.disabled}>{m.name}</Item>)
          })
        })
      }
      return null
    }, []);

  const dataSourceMultipleToJSX = useCallback(
    (dataSource, superKey?) => {
      if (dataSource?.length) {
        const obj = _.groupBy(dataSource, 'groupName');

        const jsx = Object.keys(obj).map(key => {
          const menu = obj[key];
          if (key && key !== 'undefined') {
            return (
              <ItemGroup title={
                <div className="menu-multiple-name">
                  <span style={{ lineHeight: 0.9 }}><Checkbox onChange={e => handleCheck(e, { groupName: key })}/><span className="menu-multiple-title" title={key} style={{ marginLeft: 8, maxWidth: 180, marginTop: 6 }}>{key}</span></span>
                  <span>{utils.intl('全部适用')}<Switch /></span>
                </div>
              }>
                {
                  menu.map(m => {
                    const { children } = m
                    const sKey = superKey ? `${superKey}-${m.value}` : m.value
                    if (children?.length) {
                      return (
                        <SubMenu key={sKey} title={
                          <div className="menu-multiple-name">
                            <span title={m.name} className="menu-multiple-title">{m.name}</span>
                            <span>{utils.intl('全部适用')}<Switch disabled={m.disabled} /></span>
                          </div>
                        } disabled={m.disabled}>
                          {dataSourceMultipleToJSX(children, sKey)}
                        </SubMenu>
                      )
                    }
                    return (<Item
                      key={sKey}
                      className="customCascader-subMenu"
                      disabled={m.disabled}
                      onClick={({ domEvent }) => {
                        domEvent.preventDefault();
                        domEvent.stopPropagation();
                        throw Error('error on purpose');
                      }}
                    ><Checkbox disabled={m.disabled} onChange={e => handleCheck(e, { key: sKey })} /><span className="menu-multiple-title" style={{ marginLeft: 8, maxWidth: 200 }}>{m.name}</span></Item>)
                  })
                }
              </ItemGroup>
            )
          }
          return menu.map(m => {
            const { children } = m
            const sKey = superKey ? `${superKey}-${m.value}` : m.value
            if (children) {
              return (
                <SubMenu key={sKey} title={
                  <div className="menu-multiple-name">
                    <span title={m.name} className="menu-multiple-title">{m.name}</span>
                    <span>{utils.intl('全部适用')}<Switch /></span>
                  </div>
                } disabled={m.disabled}>
                  {dataSourceMultipleToJSX(children, sKey)}
                </SubMenu>
              )
            }
            return (<Item key={sKey} className="customCascader-subMenu" disabled={m.disabled}><Checkbox onChange={e => handleCheck(e, { key: sKey })}/><span className="menu-multiple-title" style={{ marginLeft: 8, maxWidth: 200 }}>{m.name}</span></Item>)
          })
        })

        if (superKey && filterable) { // 添加过滤
          return (
            <>
              <ItemGroup className="search-box" title={<Search style={{ width: '100%' }} value={filterValue[superKey]} onSearch={value => handleSearch(value, superKey)} />}>
                {jsx}
              </ItemGroup>
              <Divider />
              <ItemGroup title={
                <footer>
                  {utils.intl('全选')}
                  <span className="select-text">({utils.intl(`已选 {0} 个`, 0)})</span>
                </footer>
              }>
              </ItemGroup>
            </>
          );
        }
        return jsx;
      }
      return null
    }, [JSON.stringify(dataSource), JSON.stringify(propsDataSource), JSON.stringify(filterValue)]);

  const valueToObj = useCallback(
    (values, dataSource) => {
      let ds = dataSource;
      if (values?.length) {
        return values.map(v => {
          const obj = ds?.find(d => `${d.value}` === `${v}`)
          ds = obj?.children ?? [];
          return obj
        })
      }
      return []
    }, []);

  const handleClick = useCallback(({ item, key }) => {
    if (type === 'single') { // 单选
      const list = valueToObj(key?.split('-'), dataSource)
      const { groupName, name } = list?.[list.length - 1] ?? {}
      setValue(groupName ? `${groupName}：${name}` : name)
      // console.log('key', key)
      onChange && onChange(key);
    }

  }, [JSON.stringify(dataSource)]);

  const handleSearch = (value, superKey) => {
    // const superKeys = superKey.split('-');
    setFilterValue({[superKey]: value});
    const newDataSource = _.cloneDeep(propsDataSource).map(item => {
      if (`${item.value}` === `${superKey}`) {
        item.children = item.children.filter(cItem => `${cItem.groupName}`.indexOf(value) > -1 || `${cItem.name}`.indexOf(value) > -1)
      }
      return item
    })
    setDataSource(newDataSource);
  }

  const handleCheck = (e, params: { key?:string, groupName?: string }) => {
    const { checked } = e.target
    const { key, groupName } = params

    if(key){

    }else if(groupName){

    }
  }

  return (
    <div className="customCascader-box" style={style}>
      <Select
        {...restProps}
        value={value}
        mode={type === 'multiple' ? 'multiple' : undefined}
        dataSource={dataSource}
        dropdownClassName="customCascader-dropdown"
        dropdownRender={dropdownRender}
        // open={type === 'multiple' ? open : undefined}
        open={open}
        onClick={(e) => { 
          e.stopPropagation();
          setOpen(open);
        }}
      />
    </div>
  )
}

export default CustomCascader