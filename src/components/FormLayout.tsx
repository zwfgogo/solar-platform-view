import React, { Component } from 'react'
import { Form, validator, AutoSizer, Button } from 'wanke-gui'
import classNames from 'classnames'
import './style/formLayout.less'
import utils from '../public/js/utils'
import { DownOutlined, UpOutlined } from 'wanke-icon'

const { checkStr } = validator
interface Props {
  children: any;
  noEllipsis?: boolean
  mode?: "single" | "super";
  onReset?: () => void;
  onSearch?: () => void
}
interface State {
  isClose: boolean,
  height: number
}

class FormLayout extends Component<Props, State> {

  static defaultProps = {
    mode: "single"
  }

  static FieldItem: any
  maxFontNumber: number
  constructor(props) {
    super(props)
    this.state = {
      isClose: false,
      height: 0
    };
    this.maxFontNumber = getMaxFontNumber(React.Children.map(this.props.children, child => child.props?.label || ''));
  }

  render() {
    const { children, mode, onReset, onSearch } = this.props
    const { isClose, height } = this.state
    return (
      <div className="formLayout" style={{
        height: isClose ? 48 : 'auto'
      }}>
        <AutoSizer>
          {
            ({ width, height }) => {
              return (
                <>
                  {
                    React.Children.map(children, (child, index) => {
                      return child && React.cloneElement(child, {
                        className: classNames(child?.props.className, "form-item", `form-item-col-${Math.min(6, this.maxFontNumber)}`, { "form-item-ellipsis": !this.props.noEllipsis && getMaxFontNumberByString(child?.props.label) > (isExistCH(child?.props.label) ? 6 : 7) })
                      })
                    })
                  }
                  {
                    onSearch ? (
                      <FormLayout.FieldItem
                        className={classNames("form-item", "form-item-last", { [`form-item-col-${Math.min(6, this.maxFontNumber)}`]: isClose, "form-item-close-last": isClose, "form-item-last-left": !children.length || children.length <= 4 })}
                        style={isClose ? {
                          position: "absolute",
                          right: 0,
                          top: 0
                        } : undefined} >
                        <>
                          {onReset && children.length > 4 ? <Button style={{ marginRight: 8 }} onClick={onReset}>{utils.intl("重置")}</Button> : null}
                          <Button type="primary" onClick={onSearch}>{utils.intl("查询")}</Button>
                          {
                            mode === "super" ? <div
                              className="form-item-open"
                              onClick={() => this.setState({ isClose: !isClose })}>{isClose ? "展开" : "收起"}{isClose ? <DownOutlined style={{ marginLeft: 8 }} /> : <UpOutlined style={{ marginLeft: 8 }} />}</div> : null
                          }
                        </>
                      </FormLayout.FieldItem>
                    ) : null
                  }
                </>
              )
            }
          }
        </AutoSizer>
      </div>
    )
  }
}

const getMaxFontNumber = function (stringList: string[]): number {
  return stringList.reduce((pre, str) => {
    if (!str?.length) {
      return pre
    } else {
      const strLenCH = str.split('').filter(item => /[\u4E00-\u9FA5]/.test(item)).length
      const strLenEN = str.length - strLenCH;
      const len = Math.ceil((strLenCH * 2 + strLenEN) / 2)
      return Math.max(len, pre)
    }
  }, 0)
}

const getMaxFontNumberByString = function (str: string): number {
  if (!str?.length) return 0
  const strLenCH = str.split('').filter(item => /[\u4E00-\u9FA5]/.test(item)).length
  const strLenEN = str.length - strLenCH;
  return Math.ceil((strLenCH * 2 + strLenEN) / 2)
}


const isExistCH = function (str: string): boolean {
  if (!str?.length) return false
  return !!str.split('').find(item => /[\u4E00-\u9FA5]/.test(item))
}


FormLayout.FieldItem = Form.Item

export default FormLayout