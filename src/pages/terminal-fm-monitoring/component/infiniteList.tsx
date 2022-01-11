import React from 'react';
import styles from './infiniteList.less';
import { List, message, Avatar, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import PropTypes from 'prop-types';

const stateColor = {
    '充电中': '#0062FF',
    '调试中': '#d6c322',
    '故障中': '#d62237',
    '放电中': '#22d62f',
    '蓄电中': '#859fff',
    '离线中': '#999999',
    '储能参与中': '#22d63b',
    '储能未参与': '#999999'
};
let socketClient;
export default class InfiniteList extends React.Component<any> {
    static propTypes = {
        devCode: PropTypes.string,
        transformRatio: PropTypes.number
    };

    static defaultProps = {
        devCode: '',
        transformRatio: 0
    };
    state = {
        data: [],
        loading: false,
        hasMore: true,
        pageSize: 0,
        orderNumberArr: [],
        orderNumberObj: {}
    };

    componentWillUnmount() {
        // 关闭socket连接
        if (socketClient) {
            socketClient.close();
        }
        this.setState = () => {
        };
    }
    handleInfiniteOnLoad = () => {
        return;
        // if (!this.state.hasMore) {
        //     return;
        // }
        // this.setState({
        //     loading: true
        // });
        // if (this.state.data.length > 14) {
        //     message.warning('已经全部加载完毕');
        //     this.setState({
        //         hasMore: false,
        //         loading: false
        //     });
        //     return;
        // }

        // let data = this.state.data;
        // let pageSize = this.state.pageSize;
        // this.setState({
        //     pageSize: pageSize + 1//后期如果列表过多想做下拉分页
        // });
        // this.fetchData(res => {
        //     data = data.concat(res);
        //     this.setState({
        //         data,
        //         loading: false
        //     });
        // });
    };
    renderItem = (item2, index) => {
        const { data } = this.props;
        const item = data[index];
        let className = item.WorkStatus === '故障中' ? 'redCardListItem' : 'cardListItem';
        let color = item.WorkStatus === '故障中' ? '#d62237' : '#0062FF';
        return (
            <div className={styles["cardList"]} key={index}>
                <span className={styles["cardListTitle"]} style={{ color: color }}>{item.title}</span>
                <div className={styles["cardListItems"]}>
                    <div className={`${styles[className]}`} style={{ fontSize: '28px', display: 'block' }}>
                        {item.AGCInstruction ? item.AGCInstruction : ''}
                        <span className={styles["fontSize-14"]}>MW</span>
                    </div>
                    <div className={styles["cardListItem"]} style={{ color: stateColor[item.WorkStatus] }}>
                        {item.WorkStatus}
                        {/* <br/>{item.time === '' ? '' : `已持续${item.time ? item.time:''}分钟`} */}
                    </div>
                    <div className={styles[className]}>SOC：</div>
                    <div className={`${styles[className]}`}>{item.SOC || item.SOC === 0 ? parseFloat(item.SOC.toFixed(2)) : ''}%</div>
                    <div className={styles[className]}>SOH：</div>
                    <div className={styles[className]}>{item.SOC || item.SOC === 0 ? parseFloat(item.SOH.toFixed(2)) : ''}%</div>
                </div>
            </div>
        );
    };

    render() {
        const { data } = this.props;
        return (
            <div className={styles['demo-infinite-container']}>
                <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    hasMore={false}
                    useWindow={false}
                    loadMore={this.handleInfiniteOnLoad}
                >
                    <List
                        dataSource={data}
                        renderItem={this.renderItem}
                    >
                    </List>
                </InfiniteScroll>
            </div>
        );
    }
}
