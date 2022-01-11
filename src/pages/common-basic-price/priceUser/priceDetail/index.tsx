import React, { FC } from 'react';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { Button, Col, Row, Popover, Table } from 'wanke-gui';
import Content from './components/Content';
import utils from '../../../../util/utils';
import { connect } from 'dva';
import { history } from 'umi';
import Page from "../../../../components/Page";
import Forward from "../../../../public/components/Forward/index";

interface OwnProps { }
interface StateProps {
  source: any;
  detail: any;
}
// @ts-ignore
const Detail: FC<OwnProps & Dispatch & StateProps> = props => {
  const { source, dispatch, detail, priceType, pageId, id, back } = props;
  const { season, area, property, title, voltageLevelsTitle,currency } = detail;
  const changeToEdit = () => {
    // history.push('/basic-data/electricity-price/Edit?id='+id);
    // dispatch({ type: 'updateState', payload: { editable: true } });
    dispatch({
      type: 'priceEdit/getDetail',
      payload: {
        id: id
      },
    });
    dispatch({
      type: 'priceEdit/getPriceType',
    })
    dispatch({
      type: 'priceEdit/getVolType',
    })
  };
  const backPage = () => {
    back();
  };
  return (
    <Page className="bf-br10" pageId={pageId} pageTitle={utils.intl('查看电价')}>
      <div className="f-df flex-column bf-br10">
        <Header title={title}></Header>
        <div className="flex-grow e-mt15 e-m10 e-mr10 e-mb15 f-oa">
          <div className="boxshadow">
            <Row>
              <Col span={10} className="fontDark" style={{ display: 'flex' }}>
                <span className="flex-shrink">{utils.intl('适用地区')}{utils.intl('：')}</span>
                <span className="fontLight">{area}</span>
              </Col>
              <Col span={10} className="fontDark" style={{ display: 'flex' }} offset={1}>
                <span className="flex-shrink">{utils.intl('用电性质')}{utils.intl('：')}</span>
                <span className="fontLight">{property}</span>
              </Col>
            </Row>
          </div>
          <div className="boxshadow e-mt20 fontDark">
            {utils.intl('适用电压等级')}{utils.intl('：')} <span className="fontLight">{voltageLevelsTitle}</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }} className="e-mt20">
            {utils.intl('季节电价信息')}
          </div>
          {season.map((item, key) => {
            const columns1 = [
              {
                title: utils.intl('电价名称'),
                dataIndex: 'seasonTitle',
                width: 177,
                render() {
                  return item.title;
                },
              },
              {
                title: utils.intl('适用月份'),
                dataIndex: 'runMonth',
                width: 185,
                bubble: true,
                render() {
                  let str = item.runMonth.map(k => {
                    return utils.intl(utils.enumeration('months')[k].name);
                  });
                  return str.join(',');
                },
              },
              {
                title: utils.intl('费率名称'),
                dataIndex: 'priceRateId',
                width: 177,
                render(text) {
                  console.log(utils.enumeration('priceType')[text])
                  return utils.enumeration('priceType')[text].name;
                },
              },
              {
                title: utils.intl('时段'),
                dataIndex: 'time',
                bubble: true,
                render(text) {
                  return (
                    <Popover content={<Content str={text} />} placement="topRight">
                      {text}
                    </Popover>
                  );
                },
              },
              {
                title: `${utils.intl('电价库电价')}(${utils.intl(currency)}/kWh)`,
                dataIndex: 'price',
                width: 177,
                align: 'right',
              },
            ];
            return (
              <div className="e-mt20" key={key} style={{ width: '99%' }}>
                <Table columns={columns1} dataSource={item.seasonPriceDetails} rowKey={'id'} pagination={false} />
              </div>
            );
          })}
        </div>
        {source ? (
          ''
        ) : (
            <Footer>
              <Button onClick={backPage}>{utils.intl('返回')}</Button>
              <Forward to="priceUserEdit">
                <Button type="primary" onClick={changeToEdit} className="e-ml10">
                  {utils.intl('编辑')}
                </Button>
              </Forward>

            </Footer>
          )}
      </div>
    </Page>
  );
};

function mapStateToProps(state) {
  return {
    ...state.priceDetail
  };
}
export default connect(mapStateToProps)(Detail);
