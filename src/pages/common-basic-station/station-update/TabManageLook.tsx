import React from 'react'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import FullContainer from '../../../components/layout/FullContainer'
import DetailItem2 from '../../../components/layout/DetailItem2'
import Tools from '../../../components/layout/Tools'
import Edit1 from '../../../components/layout/Edit1'
import Back1 from '../../../components/layout/Back1'
import utils from '../../../public/js/utils'
import styles from './styles/tab-manage-look.less'
import CommonHeader from '../../../components/CommonHeader'
import { Row, Col, FullLoading } from 'wanke-gui'
import classnames from 'classnames';
import CheckboxGroup from '../../../components/input-item/CheckboxGroup'
import { RemindNoTimeMap } from './tab-manage-form/RemindForm'
import { RemindTimeMap } from './tab-manage-form/RemindConstant'
import moment, { Moment } from 'moment'

//电站管理信息页签查看
interface Props extends ActionProp {
  editable: boolean
  fetchStationManageInfoLoading: boolean
  user1Title: string
  user2Title: string
  user3Title: string
  toEdit: () => void
  back: () => void
  formData: any
}

const TabManageLook: React.FC<Props> = function (this: null, props) {
  return (
    <FullContainer className="flex1">
      {props.fetchStationManageInfoLoading && <FullLoading />}
      <section className={styles["body"]}>
        <CommonHeader className={styles["title"]} title={utils.intl('tabManageLook.单位信息')} />
        <Row gutter={30} className={classnames(styles["form-container"], "basic-border-color")}>
          <Col span={6}>
            <DetailItem2 label={utils.intl("电站运营商")}>
              {props.user1Title}
            </DetailItem2>
          </Col>
          <Col span={6}>
            <DetailItem2 label={utils.intl("电站运维商")}>
              {props.user2Title}
            </DetailItem2>
          </Col>
          <Col span={6}>
            <DetailItem2 label={utils.intl("电站终端用户")}>
              {props.user3Title}
            </DetailItem2>
          </Col>
        </Row>
      </section>
      <Tools height={50} style={{ flexShrink: 0 }}>
        {
          props.editable && (
            <Edit1 onEdit={props.toEdit} />
          )
        }
      </Tools>
    </FullContainer>
  )
}

export default TabManageLook
