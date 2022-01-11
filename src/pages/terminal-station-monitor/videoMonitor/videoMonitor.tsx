import React from 'react';
import { connect } from 'dva';
import { Icon, Pagination } from 'wanke-gui';
import styles from './video.less'
import router from 'umi/router';
import videojs from 'video.js'
import Link from 'umi/link';
import Page from '../../../components/Page'

class Tpt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'video_',
            fls: '',
        }
    };

    componentDidMount() {
        const { dispatch } = this.props;
        let that = this;
        dispatch({
            type: 'videoMonitor/init',
        }).then(res => {
            this.play(false);
        });
    }
    play = (o) => {
        const { videoArr, videoNum, totalCount } = this.props;
        //设置资源路径
        if (videoArr.length) {
            let fls = this.flashChecker();

            for (let i = 0; i < (videoArr.length <= videoNum ? videoArr.length : videoNum); i++) {
                this['myVideo' + i] = videojs(this.state.id + i, {}, function () {
                });
                if (fls.f) {
                    videojs(this.state.id + i).src(videoArr[i].urlAddress);
                    videojs(this.state.id + i).play();
                }
            }
            if (totalCount > 4 && o) {
                for (let i = videoArr.length; i < videoNum; i++) {
                    this['myVideo' + i].dispose()
                }
            }
            this.setState({
                fls: fls
            })
        }
    }
    componentWillUnmount() {
        const { videoArr, videoNum } = this.props;
        if (videoArr.length) {
            for (let i = 0; i < (videoArr.length <= videoNum ? videoArr.length : videoNum); i++) {
                this['myVideo' + i].dispose()
            }
        }
    }

    // toConfigure = () => {
    //     router.push('/monitoring/video/configure');
    // };

    changeVideo = async (num) => {
        const { dispatch, videoArr, oldVideoArr, videoNum } = this.props;
        if (num === 9) {
            await dispatch({
                type: 'videoMonitor/updateState',
                payload: {
                    videoNum: 9,
                    videoWidth: '33.3%',
                    videoHeight: '33.3%',
                    videoArr: oldVideoArr,
                    page: 1
                },
            }).then(res => {
                this.play(true);
            });
            // this.getList(1);
        } else if (num === 4) {
            for (let i = num; i < (videoArr.length <= videoNum ? videoArr.length : videoNum); i++) {
                this['myVideo' + i].dispose();
            }
            dispatch({
                type: 'videoMonitor/updateState',
                payload: {
                    videoNum: 4,
                    videoWidth: '50%',
                    videoHeight: '50%',
                    videoArr: oldVideoArr,
                    page: 1
                },
            }).then(res => {
                this.play(true);
            });
            // this.getList(1);
        } else if (num === 1) {
            for (let i = num; i < (videoArr.length <= videoNum ? videoArr.length : videoNum); i++) {
                this['myVideo' + i].dispose()
            }
            await dispatch({
                type: 'videoMonitor/updateState',
                payload: {
                    videoNum: 1,
                    videoWidth: '100%',
                    videoHeight: '100%',
                    page: 1
                },
            });
            // this.play(true);
            // this.getList(1);
        }
    };
    flashChecker = () => {
        var hasFlash = 0;         //是否安装了flash
        var flashVersion = 0; //flash版本
        var isIE = /*@cc_on!@*/0;      //是否IE浏览器

        if (isIE) {
            var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (swf) {
                hasFlash = 1;
                VSwf = swf.GetVariable("$version");
                flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
            }
        } else {
            if (navigator.plugins && navigator.plugins.length > 0) {
                var swf = navigator.plugins["Shockwave Flash"];
                if (swf) {
                    hasFlash = 1;
                    var words = swf.description.split(" ");
                    for (var i = 0; i < words.length; ++i) {
                        if (isNaN(parseInt(words[i]))) continue;
                        flashVersion = parseInt(words[i]);
                    }
                }
            }
        }
        return { f: hasFlash, v: flashVersion };
    };
    changePage = (page) => {
        const { oldVideoArr, videoNum, dispatch, totalCount } = this.props
        dispatch({
            //需要调用对于namespace下effects中的该函数
            type: 'videoMonitor/updateState',
            payload: { size: videoNum, page: page, videoArr: oldVideoArr.slice((page - 1) * videoNum, (page - 1) * videoNum + videoNum) }
        }).then(res => {
            this.play(true);
        })
    };
    render() {
        const { videoArr, videoNum, videoHeight, videoWidth, totalCount, page } = this.props;
        let video = [];
        if (videoArr.length) {
            for (let i = 0; i < (videoArr.length <= videoNum ? videoArr.length : videoNum); i++) {
                video.push(
                    <div ref={'mywrap'} key={i + 'have'} className={styles.videoDiv} style={{ width: videoWidth, height: videoHeight }}>
                        <embed style={{ display: this.state.fls.f ? 'none' : 'block' }} width="300" height="70" className={styles.openFlash} type="application/x-shockwave-flash" />
                        <video ref={'myVideo'} id={this.state.id + i} style={{ color: 'black', width: '100%', height: '100%' }}
                            className="video-js" autoPlay controls={false} data-setup='{}'>
                            <source src={videoArr[i].urlAddress} type="rtmp/flv" />
                        </video>
                    </div>
                )
            }
        }
        for (let i = 0; i < videoNum - videoArr.length; i++) {
            video.push(
                <div key={i + 'none'} className={styles.videoDiv} style={{ width: videoWidth, height: videoHeight }}>
                    <div className={styles.videoContent} onClick={this.toConfigure}>
                        {/*<div style={{ top: '45%', transform: 'translate(0,-50%)', position: 'relative' }}>*/}
                        {/*<Icon style={{ fontSize: '60px', color: '#b2b2b2' }} type={'wanke-add'}></Icon>*/}
                        {/*</div>*/}
                        <p style={{ top: '45%', transform: 'translate(0,-50%)', position: 'relative' }}>
                            无视频信号</p>
                    </div>

                </div>
            )
        }
        return (
            <Page className="e-p10">
                <div className="f-df flex-column e-p10 bf-br10" style={{ height: '100%' }}>
                    <div className="flex-grow f-pr f-df" style={{ flexWrap: 'wrap' }}>
                        {video.length ? video : ''}
                    </div>
                    {videoArr.length ?
                        <div className="f-pr" style={{ height: '80px' }}>
                            <div className="flex-grow f-pr f-df" style={{ flexWrap: 'wrap' }}>
                                {/*<div className={styles.operation}>*/}
                                {/*<div style={{ cursor: 'pointer' }} onClick={this.toConfigure}>*/}
                                {/*<img src={require('../../../static/img/setting.png')} />*/}
                                {/*<p>配置</p>*/}
                                {/*</div>*/}
                                {/*</div>*/}
                                <div className={styles.operation}>
                                    <div style={{ cursor: 'pointer' }} onClick={this.changeVideo.bind(this, 1)}>
                                        <img src={require('../../../static/img/one.png')} />
                                        <p>一屏</p>
                                    </div>
                                </div>
                                <div className={styles.operation}>
                                    <div style={{ cursor: 'pointer' }} onClick={this.changeVideo.bind(this, 4)}>
                                        <img src={require('../../../static/img/four.png')} />
                                        <p>四屏</p>
                                    </div>
                                </div>
                                <div className={styles.operation}>
                                    <div style={{ cursor: 'pointer' }} onClick={this.changeVideo.bind(this, 9)}>
                                        <img src={require('../../../static/img/nine.png')} />
                                        <p>九屏</p>
                                    </div>
                                </div>
                                <Pagination
                                    style={{ position: "absolute", bottom: 10, right: 10 }}
                                    defaultCurrent={1} total={totalCount}
                                    onChange={this.changePage}
                                    pageSize={videoNum}
                                    current={page}
                                />
                            </div>
                        </div>
                        : ''}

                </div>
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.videoMonitor
    };
}

export default connect(mapStateToProps)(Tpt);
