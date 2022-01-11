import React from 'react'

import { UpdateStateAction } from '../interfaces/MakeConnectProps'
import ChangePassword from './system-info-tabs/ChangePassword'
import styles from './must-reset-password.less';
import utils from '../public/js/utils';
import classnames from 'classnames';
import { isBatterySystem } from '../core/env';

/**
 *
 */
interface Props extends UpdateStateAction<any> {
  theme: string;
  username: string;
  oldPassword: string
  newPassword: string
  newPassword1: string
  mustChangePassword: (oldPassword, newPassword1) => void
}

class MustChangePasswordPage extends React.Component<Props> {
  getImgUrl = () => {
    if (isBatterySystem()) {
      return require('./system-icon-battery.svg')
    }
    return this.props.theme === 'dark' ? require('./must-reset-password-dark.png') : require('./must-reset-password.png')
  }
  
  render() {
    return (
      <div className={classnames(styles['page-container'], 'must-change-password')}>
        <aside className={styles['aside']}>
          <img src={this.getImgUrl()} style={{ minWidth: '50%' }} />
          <div className={styles['desc']}>{utils.intl('让能源的使用更加安全，高效，清洁')}</div>
        </aside>
        <article className={styles['article']}>
          <section className={styles['form-container']}>
            <header>
              <img src={require('../static/img/header-icon.png')} />
              <div className={styles['user-name']}>{this.props.username}</div>
            </header>
            <div className={styles['message']}>{utils.intl('您的密码过于简单，为了账号安全，请先修改您的密码！')}</div>
            <ChangePassword
              isMustRestPage
              oldPassword={this.props.oldPassword}
              newPassword={this.props.newPassword}
              newPassword1={this.props.newPassword1}
              updateState={this.props.updateState}
              changePassword={this.props.mustChangePassword}
            />
          </section>
        </article>
      </div>
    )
  }
}

export default MustChangePasswordPage
