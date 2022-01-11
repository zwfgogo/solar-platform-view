import React from 'react'
import { WankePhoneOutlined } from 'wanke-icon'
import { WankeWebUrlOutlined } from 'wanke-icon'
import utils from '../../public/js/utils'

interface Props {
  theme: string
}

class ContactUs extends React.Component<Props> {
  render() {
    return (
      <div className="contact-us-tab">
        <section>
          <div className="company-name" style={{fontSize: 24}}>{utils.intl('万克能源科技有限公司')}</div>
          <div style={{fontSize: 12, marginTop: 10}}>{utils.intl('杭州市滨江区滨盛路1786号汉氏大厦（国能中心）17层')}</div>
        </section>
        <section style={{marginTop: 30}}>
          <div className="title">电话/phone</div>
          <div style={{marginTop: 7}}>
            <WankePhoneOutlined/>
            <span style={{marginLeft: 10}}>
              <span>0571-8732</span>
              <span style={{marginLeft: 5}}>5158/8732</span>
              <span style={{marginLeft: 5}}>5812</span>
            </span>
          </div>
        </section>
        <section style={{marginTop: 25}}>
          <div className="title">官网/official</div>
          <div style={{marginTop: 7}}>
            <WankeWebUrlOutlined/>
            <a style={{marginLeft: 10}} href="http://www.wankeauto.com/" target="_blank">http://www.wankeauto.com/</a>
          </div>
        </section>
        <section>
        </section>
        <section style={{marginTop: 30}}>
          <img src={this.props.theme ==='dark' ? require('./qcode-dark.png') : require('./qcode.png')} style={{width: 120, height: 120}}/>
          <div>（{utils.intl('微信公众号')})</div>
        </section>
      </div>
    )
  }
}

export default ContactUs
