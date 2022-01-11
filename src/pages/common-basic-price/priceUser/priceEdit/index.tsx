import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Spin } from 'wanke-gui'
import Header from '../../../../components/Header'
import Footer from '../../../../components/Footer'
import Season from './Season'
import Base from './Base'
import classnames from 'classnames'
import styles from './edit.less'
import Page from '../../../../components/Page'
import { makeConnect } from '../../../umi.helper'
import { FullLoading, Modal } from "wanke-gui"
import utils from '../../../../public/js/utils'
import { Currency, currency } from '../../../../pages/constants'

function PriceEdit(props) {
  const { editSeason, detail, dispatch, pageId, back, priceType, pricesBind } = props
  const [unit, setUnit] = useState('')
  const [area, setArea] = useState('')
  const backPage = () => {
    dispatch({
      type: 'priceEdit/updateState',
      payload: {
        detail: {
          season: []
        }
      }
    })
    back()
  }

  const selectNation = (arr, e) => {
    setArea(e)
    setUnit(currency[arr.find(item => item.value === e).mark])
  }
  useEffect(() => {
    setUnit(Currency[detail?.currency] ?? '')
    setArea(detail?.country?.id)
  }, [detail])
  return (
    <Page className="bf-br10" pageId={pageId} pageTitle={detail.title || utils.intl('新增电价')}>
      {props.detailLoading && (<FullLoading />)}
      {
        !props.detailLoading && (
          <div className="f-df flex-column">
            <Header title={detail.title || utils.intl('新增电价')}></Header>
            <div className="flex1 e-mt15 e-m10 e-mr10 e-mb15">

              <div style={{ height: '100%', overflow: 'auto' }}>
                <Base selectNation={selectNation} />
                {editSeason.map((item, index) => {
                  return (
                    <div key={item.id} className="boxshadow">
                      <i
                        className={classnames('iconfont boxclose p-pointer', { 'f-dn': editSeason.length === 1 ? false : false })}
                        onClick={() => {
                          // 删除块
                          dispatch({
                            type: 'priceEdit/deleteSeason',
                            payload: {
                              index,
                              id: item.id
                            }
                          })
                        }}
                      >
                        &#xe64c;
                      </i>
                      <Season seasonPer={item} index={index} key={item.id} currency={unit} />
                    </div>
                  )
                })}
                <div>
                  <a
                    onClick={() => {
                      dispatch({ type: 'priceEdit/addSeason' })
                    }}
                  >
                    <i className="iconfont e-mr5">&#xe648;</i>
                    <span>{utils.intl('新增季节电价')}</span>
                  </a>
                </div>
              </div>

            </div>
            <Footer>
              <Button onClick={backPage}>{utils.intl('返回')}</Button>
              <Button
                type="primary"
                className="e-ml10"
                loading={props.loading}
                onClick={() => {
                  let areaChange = detail?.country?.id === area;
                  if (detail.title && !areaChange && pricesBind) {
                    Modal.error({
                      title: utils.intl('提示'),
                      content: utils.intl('该电价已被电站绑定，无法修改适用地区')
                    })
                  } else {
                    dispatch({ type: 'priceEdit/save' }).then(res => {
                      if (res) {
                        if (priceType === 'detail') {
                          dispatch({
                            type: 'priceUser/getList'
                          })
                          back(2)
                        } else {
                          dispatch({
                            type: 'priceUser/getList'
                          })
                          back()
                        }
                      }
                    })
                  }
                }}
              >
                {utils.intl('保存')}
              </Button>
            </Footer>
          </div>
        )
      }
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    ...state.price,
    detailLoading: getLoading('getDetail'),
    loading: getLoading('save')
  }
}

export default makeConnect('priceEdit', mapStateToProps)(PriceEdit)
