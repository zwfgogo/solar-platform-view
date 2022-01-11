import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { DispatchProp } from 'dva'
import zhCN from 'wanke-gui/es/locale/zh_CN'
import enUS from 'wanke-gui/es/locale/en_US'
import WKConfigProvider from 'wanke-gui/es/config-provider'
import styles from './login.less'
import utils from '../../util/utils'
import { LoadingOutlined, WankeAndroidFilled, WankeAppleFilled, WankeI18NOutlined, WankeNextOutlined } from 'wanke-icon'
import appIOS from '../../static/img/app-ios.png'
import appAndroid from '../../static/img/app-android.png'
import { Button, Form, Input, message, SlideVerifyImage } from 'wanke-gui'
import { isBatterySystem, isBigScreenSystem, isMicrogrid, isMultiScreen, isPvSystem, isStorageSystem, isZh } from '../../core/env'
import { getAction, makeConnect } from '../umi.helper'
import { LoginModel, LoginStep } from './model'
import PageProps from '../../interfaces/PageProps'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import { loginNS } from '../constants'
import { getImageList } from './verify-img'
import icon from '../../static/img/icon.png'

const FormItem = Form.Item
const Password = Input.Password
const imgList = getImageList()

interface Props extends LoginModel, PageProps, MakeConnectProps<LoginModel>, DispatchProp {
  isInLogin: boolean
  userStatusLoading: boolean
}

const Login: React.FC<Props> = (props) => {
  const { loginStep, name, password, isVerified, isInLogin, errorTip, nameLoss, passwordLoss } = props
  const isChinese = isZh()

  const renderTitle = () => {
    return (
      <>
        {
          isBigScreenSystem() && utils.intl('欢迎登录综合能源大屏')
        }
        {
          isPvSystem() && utils.intl('欢迎登录光伏管理运维平台')
        }
        {
          isStorageSystem() && utils.intl('欢迎登录综合能源智慧运营服务平台')
        }
        {
          isBatterySystem() && utils.intl('欢迎登录电池健康管理系统')
        }
        {
          isMultiScreen() && utils.intl('欢迎登录综合能源智慧运营服务平台')
        }
        {
          isMicrogrid() && utils.intl('欢迎登录微电网能量管理平台')
        }
      </>
    )
  }

  const renderLogo = () => {
    return (
      <>
        {
          isBigScreenSystem() && (
            <div className={styles.systemTitle} style={{ padding: 0 }}>
              <span>{isChinese ? '综合能源大屏' : 'Screen System'}</span>
            </div>
          )
        }
        {
          isPvSystem() && (
            <div className={styles.systemTitle}>
              <div className={styles.systemTitleImg}></div>
            </div>
          )
        }
        {
          isStorageSystem() && (
            <div className={styles.systemTitle} style={{ padding: 0 }}>
              <span>{isChinese ? '综合能源智慧运营服务平台' : 'Microgrid Energy Management System'}</span>
            </div>
          )
        }
        {
          isBatterySystem() && (
            <div className={styles.systemTitle}>
              <div className={styles.systemTitleImg}></div>
            </div>
          )
        }
        {
          isMultiScreen() && (
            <div className={styles.systemTitle} style={{ padding: 0 }}>
              <span>{isChinese ? '综合能源智慧运营服务平台' : 'Microgrid Energy Management System'}</span>
            </div>
          )
        }
        {
          isMicrogrid() && (
            <div className={styles.systemTitle} style={{ padding: 0 }}>
              <div className={classnames(styles.systemTitleImg, styles.microgrid)}></div>
            </div>
          )
        }
      </>
    )
  }

  const onSlideVerifyImageSuccess = () => {
    props.updateState({
      loginStep: LoginStep.step_1,
      isVerified: true,
      errorTip: ''
    })
  }

  const onSlideVerifyImageClose = () => {
    props.updateState({
      loginStep: LoginStep.step_1
    })
  }

  const renderForm = () => {
    let errorMsg = ''
    if (nameLoss) {
      errorMsg = utils.intl('login.请输入用户名')
    }
    if (passwordLoss) {
      errorMsg = utils.intl('请输入密码')
    }
    if (nameLoss && passwordLoss) {
      errorMsg = utils.intl('请输入用户名和密码')
    }

    if (loginStep === LoginStep.step_1) {
      return (
        <Form layout="vertical" colon={false}>
          <div className={styles['form-line']}>
            <FormItem label={utils.intl('账号')}>
              <Input
                size="large"
                name="name"
                style={{ border: 'none', background: 'rgba(61,126,255,0.05)' }}
                placeholder={utils.intl('请输入账号')}
                value={name}
                onChange={onChange}
              />
            </FormItem>
          </div>
          <div className={styles['form-line']}>
            <FormItem label={utils.intl('密码')}>
              <Password
                size="large"
                name="password"
                style={{ border: 'none', background: 'rgba(61,126,255,0.05)' }}
                placeholder={utils.intl('请输入密码')}
                value={password}
                onChange={onChange}
              />
            </FormItem>
          </div>
          <VerifyStatus isSuccess={isVerified} onClick={handleVerifyStatusClick} loading={props.userStatusLoading} />
          <div className={styles['error-message']}>{errorMsg || errorTip}</div>
          <Button
            type="primary"
            style={{ width: 200, height: 46 }}
            loading={isInLogin}
            onClick={handleLogin}
          >{utils.intl('登录')}</Button>
        </Form>
      )
    }

    return (
      <div>
        <SlideVerifyImage
          imageList={imgList}
          imageWidth={460}
          imageHeight={255}
          onSuccess={onSlideVerifyImageSuccess}
          onClose={onSlideVerifyImageClose}
        />
      </div>
    )
  }

  const renderQRImage = () => {
    return (
      <div className={styles['qr-image']}>
        <div className={styles['qr']}>
          <img src={appAndroid} alt={utils.intl("Android二维码")} style={{ width: 70, height: 70 }}></img>
        </div>
        <div className={styles['qr']}>
          <img src={appIOS} alt={utils.intl("IOS二维码")} style={{ width: 70, height: 70 }}></img>
        </div>
      </div>
    )
  }

  const changeLanguage = () => {
    const language = localStorage.getItem('language');
    if (language) {
      if (language == 'zh') {
        localStorage.setItem('language', 'en')
      } else if (language == 'en') {
        localStorage.setItem('language', 'zh')
      }
    } else {
      localStorage.setItem('language', 'en')
    }
    location.reload()
  }

  const handleVerifyStatusClick = () => {
    if (!props.isVerified && !props.userStatusLoading) {
      props.action('getVerifyStatus')
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    const payload = {
      [name]: value,
      [`${name}Loss`]: false,
      errorTip: ''
    }
    if (name === 'name') {
      payload.isVerified = false
    }
    props.dispatch(getAction(loginNS, 'updateState', payload))
  }

  const handleLogin = () => {
    if (!isVerified) {
      props.updateState({ errorTip: utils.intl('请先完成点击验证') })
      return
    }
    props.action('getLogin', { name, password })
  }

  const language = localStorage.getItem('language');

  useEffect(() => {
    const $favicon = document.querySelector('link[rel="icon"]');
      if ($favicon !== null) {
        $favicon.href = icon;
      } else {
        $favicon = document.createElement("link");
        $favicon.rel = "icon";
        $favicon.href = icon;
        document.head.appendChild($favicon);
      }
    return () => {
      props.action('reset')
    }
  }, [])

  return (
    <WKConfigProvider locale={language === 'zh' ? zhCN : enUS} language={language}>
      <div className={classnames(styles.login, 'light-theme')}>
        <div className={styles['login-logo']}>
          {renderLogo()}
        </div>
        <section className={styles['login-body']}>
          {(isPvSystem() || isStorageSystem() || isBatterySystem() || isMicrogrid()) && (
            <div className={styles.language} onClick={changeLanguage}>
              <img
                style={{ height: 24, marginRight: 8 }}
                src={language == 'zh' ? require('../../static/img/icon-en.svg') : require('../../static/img/icon-zh.svg')}
              />
              <span className={styles.label}>{language == 'zh' ? 'English' : '中文'}</span>
            </div>
          )}
          <header className={styles['login-form']}>
            <div className={styles['login-form-body']}>
              <p>Hello!</p>
              <p>{renderTitle()}</p>
              {renderForm()}
            </div>
          </header>
          {!isBatterySystem() ? (
            <footer style={{ flexShrink: 0 }}>
              <p className={styles['qr-desc']}>{utils.intl("还没有使用万克云能App，赶紧扫描二维码下载")}</p>
              {renderQRImage()}
            </footer>
          ) : null}
        </section>
      </div>
    </WKConfigProvider>
  )
}

interface VerifyStatusProps {
  isSuccess: boolean
  loading?: boolean
  onClick?: () => void
}

const VerifyStatus: React.FC<VerifyStatusProps> = ({ onClick, isSuccess, loading }) => {
  return (
    <div className={classnames(styles['verify-status'], { [styles['success']]: isSuccess })} onClick={onClick}>
      {isSuccess ? (
        <>
          <img src={require('../../static/img/icon-success.svg')} style={{ marginRight: 8 }} />
          <span>{utils.intl('验证成功')}</span>
        </>
      ) : (
        <>
          {loading ? (
            <LoadingOutlined style={{ fontSize: 24, marginRight: 8 }} />
          ) : (
            <div className={styles['verify-status-icon-circle']} style={{ marginRight: 8 }}></div>
          )}
          <span>{utils.intl('点击开始验证')}</span>
        </>
      )}
    </div>
  )
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model,
    isInLogin: getLoading('getLogin'),
    userStatusLoading: getLoading('getVerifyStatus')
  }
}
export default makeConnect('login', mapStateToProps)(Login)
