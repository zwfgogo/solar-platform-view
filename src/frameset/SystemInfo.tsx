import React, { useEffect } from 'react'
import classnames from 'classnames'
import { Drawer, Popconfirm } from 'wanke-gui'
import { history } from 'umi'
import TipSettingCompany from './system-info-tabs/TipSettingCompany'
import ContactUs from './system-info-tabs/ContactUs'
import ChangePassword from './system-info-tabs/ChangePassword'
import ChangeUserSetting from './system-info-tabs/ChangeUserSetting'
import { getAction } from '../pages/umi.helper'
import { globalNS, settingNS } from '../pages/constants'
import { SettingState } from '../models/setting'
import { GlobalState } from '../models/global'
import { makeConnect } from '../pages/umi.helper'
import MakeConnectProps from '../interfaces/MakeConnectProps'
import TipSettingSelf from './system-info-tabs/TipSettingSelf'
import Warning from './Warning'
import { FirmEnumState } from '../models/firm-enums'
import { LogoutOutlined } from "wanke-icon"
import { WankeSettingOutlined } from "wanke-icon"
import utils from '../public/js/utils'
import { traverseTree } from '../pages/page.helper'
import { isMicrogrid, isPvSystem, isStorageSystem } from '../core/env'
import { isTerminalSystem } from '../core/env'
import { isBatterySystem } from '../core/env'

interface Props extends GlobalState, SettingState, MakeConnectProps<SettingState>, Pick<FirmEnumState, 'userList'> {
  onlySelf: boolean
  tabList: number[]
  loading: boolean
  currency: string
  timeZone: string
  updateWarningLoading: boolean
  menu: any[]
  theme: string
}

class SystemInfo extends React.Component<Props> {
  addWarning = (onlySelf) => {
    this.props.dispatch(getAction(settingNS, 'addWarning', { onlySelf }))
  }

  updateWarning = (onlySelf) => {
    this.props.dispatch(getAction(settingNS, 'updateWarning', { onlySelf }))
  }

  onDeleteWarning = (id) => {
    this.props.dispatch(getAction(settingNS, 'deleteWarning', { id }))
  }

  logout = () => {
    if (isTerminalSystem()) {
      document.title = '万克储能平台';
    }
    // const theme = sessionStorage.getItem('theme')
    sessionStorage.clear()
    // sessionStorage.setItem('theme', theme)
    this.props.dispatch(getAction(globalNS, 'updateState', { userId: null }))
    history.push('/')
    this.props.dispatch(getAction(globalNS, 'closeSocket'))
  }

  fetchWarningCount = () => {
    this.props.dispatch(getAction(globalNS, 'fetchWarningCount', { dispatch: this.props.dispatch }))
  }

  close = () => {
    this.props.updateState({ showSetting: false })
    this.props.dispatch(getAction(settingNS, 'reset'))
    this.props.updateState({
      activeKey: this.props.tabList[0],
      currency: sessionStorage.getItem('currency') ? sessionStorage.getItem('currency') : '',
      timeZone: sessionStorage.getItem('timeZone') ? sessionStorage.getItem('timeZone') : ''
    })
    this.props.dispatch(getAction(settingNS, 'fetchUserList'))
  }

  changePassword = (oldPassword, newPassword) => {
    this.props.dispatch(getAction(settingNS, 'changePassword', { oldPassword, newPassword }))
  }

  changeUserSetting = (currency, timeZone) => {
    sessionStorage.setItem('currency', currency)
    sessionStorage.setItem('timeZone', timeZone)
    this.props.dispatch(getAction(settingNS, 'changeUserSetting', { currency, timeZone }))
  }

  handleVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch(getAction(settingNS, 'fetchWarningList'))
    }
  }

  componentDidMount() {
    this.props.action('reset')
    this.props.updateState({ activeKey: this.props.tabList[0], currency: sessionStorage.getItem('currency') ? sessionStorage.getItem('currency') : '', timeZone: sessionStorage.getItem('timeZone') ? sessionStorage.getItem('timeZone') : '' });
    this.props.dispatch(getAction(settingNS, 'fetchUserList'))
    if (isPvSystem() || isStorageSystem() || isMicrogrid()) this.props.dispatch(getAction(globalNS, 'initSocket', { dispatch: this.props.dispatch }))
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.tabList) !== JSON.stringify(this.props.tabList)) {
      this.props.updateState({ activeKey: this.props.tabList[0], currency: sessionStorage.getItem('currency') ? sessionStorage.getItem('currency') : '', timeZone: sessionStorage.getItem('timeZone') ? sessionStorage.getItem('timeZone') : '' })
    }
  }
  changeLanguage = (language) => {
    // this.props.dispatch(getAction(globalNS, 'updateState', { language: language }))
    console.log(language)
    localStorage.setItem('language', language)
    window.location.reload();
  }

  render() {
    const {
      userList,
      activeKey,
      onlySelf, updateWarningSuccess, query, warningList, warningCount, showUpdateWarning,
      warningId, account, mobile, internationalCode, period, remind, createdByAdmin, language, menu
    } = this.props
    const warningMenuItem = !isPvSystem() || traverseTree(menu, item => item.key === '/alert-service/abnormal' ? item : null)
    return (
      <div className="system-info">
        <Drawer
          width={500}
          placement="right"
          closable={false}
          className="system-info-drawer"
          onClose={this.close}
          visible={this.props.showSetting}
          afterVisibleChange={this.handleVisibleChange}
          destroyOnClose={true}
        >
          <div className="d-flex-c" style={{ height: '100%', paddingBottom: 60 }}>
            <div className="flex1 d-flex-c">
              <div className="tabs">
                {
                  this.props.tabList.map(item => {
                    if (item == 1) {
                      return (
                        <div key={item} className={classnames('tab', { active: activeKey == 1 })}
                          onClick={() => this.props.updateState({ activeKey: 1 })}>{utils.intl('提醒设置')}</div>
                      )
                    }
                    if (item == 2) {
                      return (
                        <div key={item} className={classnames('tab', { active: activeKey == 2 })}
                          onClick={() => this.props.updateState({ activeKey: 2 })}>{utils.intl('修改密码')}
                        </div>
                      )
                    }
                    if (item == 3) {
                      return (
                        <div key={item} className={classnames('tab', { active: activeKey == 3 })}
                          onClick={() => this.props.updateState({ activeKey: 3 })}>{utils.intl('个人设置')}
                        </div>
                      )
                    }
                    if (item == 4) {
                      return (
                        <div key={item} className={classnames('tab', { active: activeKey == 4 })}
                          onClick={() => this.props.updateState({ activeKey: 4 })}>{utils.intl('联系我们')}
                        </div>
                      )
                    }
                  })
                }
              </div>
              <div className="flex1">
                {
                  this.props.tabList.indexOf(1) != -1 && activeKey == 1 && onlySelf && (
                    <TipSettingSelf
                      loading={this.props.updateWarningLoading}
                      updateWarningSuccess={updateWarningSuccess}
                      query={query}
                      userList={userList}
                      warningId={warningId}
                      remind={remind}
                      mobile={mobile}
                      internationalCode={internationalCode || '+86'}
                      period={period}
                      createdByAdmin={createdByAdmin}
                      fetchSelfWarning={() => this.props.action('fetchSelfWarning')}
                      addWarning={() => this.addWarning(true)}
                      updateWarning={() => this.updateWarning(true)}
                      onDelete={this.onDeleteWarning}
                      showUpdateWarning={showUpdateWarning}
                      updateState={this.props.updateState}
                      updateQuery={this.props.updateQuery}
                    />
                  )
                }
                {
                  this.props.tabList.indexOf(1) != -1 && activeKey == 1 && !onlySelf && (
                    <TipSettingCompany
                      loading={this.props.loading}
                      updateWarningLoading={this.props.updateWarningLoading}
                      fetchWarningList={() => this.props.dispatch(getAction(settingNS, 'fetchWarningList'))}
                      updateWarningSuccess={updateWarningSuccess}
                      query={query}
                      warningList={warningList}
                      userList={userList}
                      totalCount={warningCount}
                      warningId={warningId}
                      account={account}
                      mobile={mobile}
                      internationalCode={internationalCode || '+86'}
                      period={period}
                      addWarning={() => this.addWarning(false)}
                      updateWarning={() => this.updateWarning(false)}
                      onDelete={this.onDeleteWarning}
                      showUpdateWarning={showUpdateWarning}
                      updateState={this.props.updateState}
                      updateQuery={this.props.updateQuery}
                      action={this.props.action}
                    />
                  )
                }
                {
                  activeKey == 2 && (
                    <ChangePassword
                      oldPassword={this.props.oldPassword}
                      newPassword={this.props.newPassword}
                      newPassword1={this.props.newPassword1}
                      changePassword={this.changePassword}
                      updateState={this.props.updateState} />
                  )
                }
                {
                  activeKey == 3 && (
                    <ChangeUserSetting
                      currency={this.props.currency}
                      timeZone={this.props.timeZone}
                      changeUserSetting={this.changeUserSetting}
                      updateState={this.props.updateState}
                    />
                  )
                }
                {
                  activeKey == 4 && (<ContactUs theme={this.props.theme} />)
                }
              </div>
            </div>
            <div className="logout" onClick={this.logout}>
              <LogoutOutlined style={{ fontSize: 20, marginRight: 15 }} />
              <span>{utils.intl('退出登录')}</span>
            </div>
          </div>
        </Drawer>
        {!isBatterySystem() && (
          <Popconfirm
            title={`${utils.intl('确认切换')}?`}
            onConfirm={() => this.changeLanguage(language === 'zh' ? 'en' : 'zh')}
            okText={utils.intl('中英文切换确定')}
            cancelText={utils.intl('取消')}
          >
            <img
              className="i18n"
              src={require('./internationalize.png')}
              style={{ marginRight: 25, cursor: 'pointer' }}
            />
          </Popconfirm>
        )}
        <WankeSettingOutlined
          onClick={() => this.props.updateState({ showSetting: true })}
          style={{ color: '#92929d', marginRight: isBatterySystem() ? 0 : 20, fontSize: 28, cursor: 'pointer' }}
        />
        {warningMenuItem && !isBatterySystem() && <Warning
          warningMenuItem={warningMenuItem}
          fetchWarningCount={this.fetchWarningCount}
          moderateWarningCount={this.props.moderateWarningCount}
          seriousWarningCount={this.props.seriousWarningCount}
        />}

        <div className="user-info">
          <div className="user-picture">
            <img src={require('./head.png')} />
          </div>
          <div className="user-name">
            {this.props.showName}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    showName: state[globalNS].showName,
    onlySelf: state[globalNS].roleName != 'Admin',
    moderateWarningCount: state[globalNS].moderateWarningCount,
    seriousWarningCount: state[globalNS].seriousWarningCount,
    loading: getLoading('fetchWarningList'),
    updateWarningLoading: getLoading('updateWarning') | getLoading('addWarning'),
    language: state[globalNS].language,
    menu: state[globalNS].menu
  }
}

export default makeConnect(settingNS, mapStateToProps)(SystemInfo)
