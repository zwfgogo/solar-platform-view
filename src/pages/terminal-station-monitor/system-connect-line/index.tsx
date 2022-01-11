import React from 'react';

import moment from 'moment';
import Page from "../../../components/Page";
import styles from './index.less'
import { makeConnect } from '../../umi.helper'
import utils from '../utils';

import DragDiv from '../../../components18/dragDiv/dragDiv'
import { notification, Spin } from 'antd';
import Card from '../../../components18/card/card'
import SvgChart from '../../../components18/svgChart/SvgChart'
import { MultiLineChart, DatePicker, Select, LineChart, Modal } from 'wanke-gui'
import { getColorDefault } from '../../../util/chartUtil'
import { Socket_Port } from '../../constants'
import _ from 'lodash'
import SocketClient from 'socket.io-client';
import { disabledDateAfterToday } from '../../../util/dateUtil'
import DeviceDetailModal from './components/deviceDetail'
import util from '../../../util/utils';
import { WankeClearOutlined } from 'wanke-icon';
import CommandDialog from './components/CommandDialog';

let socketClient;

export enum CommandType {
    Breaker = 'Breaker',
}

declare global {
    interface Window { svgTimer: any; }
    interface Document {
        pageY: number;
        pageX: number;
    }
}
window.svgTimer = window.svgTimer || {};

// export interface Props{
//     changeShow: () => void
// }

class Index extends React.Component<any> {
    svgDataObj = { analogValueArr: {}, disconnectorsValueArr: {}, estimateValueArr: {}, timeStampValueArr: {} };
    svgResults = {};
    refs: {
        [key: string]: any;
    };
    commandParam: any = {}
    // svg全局方法集合
    setSvgFn = () => {
        let that = this;
        // let updata = () => {
        //     this.setLogicalRealData(this.props.valueGather);
        // }
        return {
            // 打开指令下发框
            openCommandDialog: function (type: CommandType, ...args: string[]) {
                switch(type) {
                    case CommandType.Breaker: {
                        that.commandParam.type = type
                        that.commandParam.args = args
                        that.props.dispatch({
                            type: 'connect-line/updateState',
                            payload: {
                                commandModal: true,
                            }
                        })
                        break
                    }
                    default: {
                    }
                }
            },
            //切换svg
            changeSvgPath: function (filename = 'overview') {
                const { selectedStationCode, svgPath, oldSvgPath, dispatch } = that.props;
                dispatch({ type: "connect-line/closeSocket" })
                socketClient?.close();
                const language = localStorage.getItem('language')
                const newSvgPath = '/svg/' + selectedStationCode + '/' + language + '/' + filename + '.svg';
                if (svgPath !== newSvgPath) {
                    oldSvgPath.push(svgPath);
                    window.clearInterval(window.svgTimer);
                }
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        svgPath: newSvgPath,
                        chartCardVisual: false,
                        switchCardVisual: false,
                        dataCardVisual: false,
                        switchVisual: false,
                        spinning: true,
                    }
                }).then(res => {
                    window.setTimeout(function () {
                        dispatch({
                            type: 'connect-line/updateState', payload: {
                                spinning: false,
                            }
                        })
                    }, 200)
                })
                document.body.style.cursor = '';
            },
            //鼠标悬停点击事件
            showPointer: function (event) {
                document.body.style.cursor = 'pointer';

            },
            hidePointer: function () {
                document.body.style.cursor = '';
            },
            //ups校时
            timing: function (pointNumber) {
                // updateTime({analog: pointNumber})
                //     .then(res => {
                //         if (res.data.errorCode) {
                //             notification.open({
                //                 message: res.data.errorMsg,
                //                 description: ''
                //             });
                //         } else {
                //             updata();
                //         }
                //     })
            },
            //鼠标点击获取点号数据
            getCode: (pointNumber, fix = 2, defaultLock = false) => {
                const { dhdb, dispatch, nowDate } = that.props;
                that.refs.DragDiv.changeShow();
                let dhdbArr = [...dhdb];
                let numberLock = 0;
                let exist = false;
                let pointNumberArr = pointNumber.split(',');
                if (pointNumberArr.length > 0) {
                    for (let i = 0; i < dhdbArr.length; i++) {
                        if (dhdbArr[i].lock === true) {
                            numberLock++;
                        }
                        if (dhdbArr[i].value === pointNumberArr[0]) {
                            exist = true
                        }
                    }
                    if (exist) {
                        /*	notification.open({
                                message:utils.intl('页面上已存在该点号'),
                                description: ''
                            });*/
                        return
                    }
                    if (numberLock >= 6) {
                        notification.open({
                            message: '最多选择6项',
                            description: ''
                        });
                        return
                    }
                    for (let i = 0; i < dhdbArr.length; i++) {
                        if (dhdbArr[i].lock === false) {
                            dhdbArr.splice(i, 1);
                        }
                    }
                    dispatch({
                        type: 'connect-line/getEchart', payload: {
                            analogArr: [...dhdbArr, {
                                value: pointNumberArr[0],
                            }], dateTime: nowDate, fix
                        }
                    })
                    dispatch({ type: 'connect-line/getTheDotName', payload: { analog: pointNumberArr[0] } })
                        .then(res => {
                            dispatch({
                                type: 'connect-line/updateState', payload: {
                                    dhdb: [...dhdbArr, {
                                        name: res,
                                        value: pointNumberArr[0],
                                        lock: defaultLock || pointNumberArr.length > 1 ? true : false,
                                        show: false,
                                        fix
                                    }]
                                }
                            }).then(res => {
                                window.onresize
                                let newArr = pointNumberArr.splice(1);
                                if (newArr.length !== 0) {
                                    window.getCode(newArr.join(','), true)
                                }
                            })
                        })
                }
            },
            //显示组件信息框悬浮框
            showSvgElementDialog: function (id, name) {
                that.setState({
                    chartPostData: { id },
                    sbName: name,
                    chartCardVisual: true,
                });
                document.body.style.cursor = 'pointer';
            },
            //显示告警点号数据
            dataSvgElementDialog: function (data) {
                // that.setState({
                //   alarmArray: data,
                //   dataCardVisual: true,
                //   switchCardX: document.pageX,
                //   switchCardY: document.pageY < 650 ? document.pageY + 440 : document.pageY,//判断返回高度是否过高
                // });
                document.body.style.cursor = 'pointer';
            },
            //隐藏组件信息框悬浮框
            hideSvgElementDialog: function () {
                that.setState({
                    chartCardVisual: false,
                    dataCardVisual: false,
                })
                document.body.style.cursor = '';
            },
            //电池检测点击按钮切换svg
            buttonSvgChange: function (data) {
                // const svgPath = '/svg/' + that.state.currentStationCode + '/' + data + '.svg' ;
                // that.setState({
                //     spinning: true,
                //     svgPath: svgPath,
                //     chartCardVisual: false,
                //     switchCardVisual: false,
                //     dataCardVisual: false,
                // },()=>{
                //     window.setTimeout(function(){
                //         that.setState({
                //             spinning: false,
                //         });
                //     },200)
                // })
            },
            //电池检测点击按钮切换svg
            changeSvgModule: function (i, data) {
                window.location.href = '/#/index/' + i + '?filename=' + data;
                // const svgPath = '/svg/' + that.state.currentStationCode + '/' + data + '.svg';
                that.setState({
                    // svgPath: svgPath,
                    chartCardVisual: false,
                    switchCardVisual: false,
                    dataCardVisual: false,
                    switchVisual: false,
                    spinning: true,
                }, () => {
                    window.setTimeout(function () {
                        that.setState({
                            spinning: false,
                        });
                    }, 200)
                })
                document.body.style.cursor = '';
            },
            //移入电池鼠标变化
            batteryOver: function () {
                document.body.style.cursor = 'pointer';
            },
            batteryOut: function (data) {
                document.body.style.cursor = '';
            },
            //显示开关数据
            dataSvgElementSwitch: function (data) {
                const { dispatch } = that.props;
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        switchArray: data,
                        switchVisual: true,
                        switchX: document.pageX,
                        switchY: document.pageY < 1150 ? document.pageY + 440 : document.pageY,//判断返回高度是否过高
                    }
                })
                document.body.style.cursor = 'pointer';
            },
            dataSvgElementPoint: function (name, title, data) {
                const { dispatch } = that.props;
                dispatch({
                    type: 'connect-line/getRealData', payload: {
                        pointNumber: data
                    }
                })
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        pointVisual: true,
                        pointX: document.pageX,
                        pointY: document.pageY < 1150 ? document.pageY + 440 : document.pageY,//判断返回高度是否过高
                        pointTitle: title,
                        pointName: name,
                    }
                })
            },
            hideSvgElementSwitch: function () {
                const { dispatch } = that.props;
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        switchVisual: false,
                    }
                })
                document.body.style.cursor = '';
            },
            //显示切换开关弹窗
            showSvgSwitchDialog: function (id) {
                that.setState({
                    switchId: id,
                    switchCardVisual: true,
                    switchCardX: document.pageX,
                    switchCardY: document.pageY,
                })
            },
            //显示设备详情弹框
            showDeviceDetailModal: function (devId) {
                const { dispatch } = that.props;
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        deviceDetailModal: true,
                        devId
                    }
                })
                dispatch({
                    type: 'connect-line/getDevInfo', payload: {
                        devId
                    }
                })
                dispatch({
                    type: 'connect-line/getList', payload: {
                        devId
                    }
                })
            },
            //显示设备曲线弹框
            showDeviceCurveModal: function () {
                const { dispatch } = that.props;
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        deviceCurveModal: true,
                    }
                })
            },
        }
    };

    UNSAFE_componentWillMount() {
        this.props.dispatch({
            type: 'connect-line/updateState',
            payload: {
                switchVisual: false,
                pointVisual: false
            }
        })
    }

    // //通过点号集合请求点号所对应的数据
    // setLogicalRealData = (valueGather) => {
    //     const { dispatch } = this.props;
    //     if (valueGather) {
    //         if (valueGather.switchArr.length !== 0 || valueGather.breakerArr.length !== 0 || valueGather.analogArr.length !== 0 || valueGather.disconnectorsArr.length !== 0) {
    //             dispatch({ type: 'connect-line/topologicalRealData', payload: { valueGather } })
    //         }
    //     }
    // };
    // svg组件的回调,用于获得点号集合
    dataHandler = (valueGather) => {
        const { dispatch } = this.props;
        const that = this;
        dispatch({ type: 'connect-line/updateState', payload: { valueGather } }).then(res => {
            // this.socketStart();
        });
        dispatch({ type: 'connect-line/init', payload: { valueGather, dispatch } }).then(res => {
        });
    };
    objToArr = (o, name) => {
        const { dispatch } = this.props;
        let svgResults = _.clone(this.svgResults)
        let arr = []
        Object.assign(this.svgDataObj[name], o)
        for (let prop in this.svgDataObj[name]) {
            arr.push({
                name: prop,
                value: this.svgDataObj[name][prop]
            })
        }
        svgResults[name] = arr;
        this.svgResults = svgResults;
        dispatch({
            type: 'connect-line/updateState',
            payload: {
                svgData: this.svgResults
            }
        });
    }
    socketStart = () => {
        const { detail, dispatch, valueGather, svgData } = this.props;
        socketClient = SocketClient(Socket_Port + '/system-wiring', {
            transports: ['websocket'],
            'query': 'token=' + sessionStorage.getItem('token') + '&language=zh',
            reconnectionDelayMax: 10000,
            reconnectionDelay: 10000,
            reconnectionAttempts: 5
        });

        // socketClient.emit('realtime', { pointNumberObj: valueGather });
        // 监听发送消息
        socketClient.on('realtime', (data) => {
            let res = JSON.parse(data);
            for (let i in res) {
                if (i !== 'errorCode' && i !== 'errorMsg') {
                    if (JSON.stringify(res[i]) !== "{}") {
                        this.objToArr(res[i], i)
                    }
                }
            }
        });
        // socketClient.on('error', (err) => {});
        socketClient.on('serverError', (err) => { });
        // socketClient.on('connect_error', (err) => {
        // });
        socketClient.on('reconnect', (data) => {
            //  .emit('updateUser', localStorage.getItem('access-token'));
            // this.props.showSpin();
            // socketClient.emit('server', this.cellsubmit);
            // this.socketStart();
        });
        socketClient.on('connect', (data) => {
            socketClient.emit('realtime', { pointNumberObj: valueGather });
        });
        socketClient.on('connect_timeout', (err) => {
        });
        socketClient.on('authenticated', function () {
            //token校验成功
        });
        socketClient.on('unauthorized', function (msg) {
            //token校验失败
        });
    }
    //监听鼠标移动,从而设置悬浮框的位置
    listenMouse = (e) => {
        document.pageX = e.pageX;
        document.pageY = e.pageY;
        const offsetRight = window.innerWidth - e.pageX;//鼠标右边存在的px值
        if (offsetRight < 240) {
            document.pageX = e.pageX - (240 - offsetRight);
        }
    };
    //全屏事件
    // handleFullScreen = () => {
    //     this.setState({
    //         fullScreen: !this.state.fullScreen
    //     })
    // };
    //返回事件
    handleBack = () => {
        const { oldSvgPath, dispatch } = this.props;
        dispatch({ type: "connect-line/closeSocket" })
        socketClient?.close();
        dispatch({
            type: 'connect-line/updateState', payload: {
                svgPath: oldSvgPath.pop()
            }
        })
        window.clearInterval(window.svgTimer);
    };

    componentWillMount() {
        // this.mounted = true;
        const { dispatch, selectedStationId, selectedStationCode, filename, backgroundColor } = this.props;
        let that = this;
        // 获得当前页面的文件目录code
        // 根据url参数获取svg文件名
        const newFilename = filename || 'overview';
        const language = localStorage.getItem('language')
        dispatch({
            type: 'connect-line/updateState', payload: {
                svgPath: '/svg/' + selectedStationCode + '/' + language + '/' + newFilename + '.svg',
                currentStationCode: selectedStationCode,
                newFilename: newFilename,
                spinning: true,
                nowDate: moment().format('YYYY-MM-DD')
            }
        }).then(res => {
            window.setTimeout(function () {
                dispatch({
                    type: 'connect-line/updateState', payload: {
                        spinning: false,
                    }
                })
            }, 200)
        });
        if (!backgroundColor) {
            dispatch({
                type: 'connect-line/updateState', payload: {
                    actionColor: this.props.defaultBg || '#fff'
                }
            })
        }
    }

    componentDidMount() {
        let { dispatch } = this.props;
        let that = this;
        if (document.hidden !== undefined) {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    dispatch({ type: 'connect-line/init', payload: { valueGather: this.props.valueGather, dispatch } })
                } else {
                    dispatch({ type: "connect-line/closeSocket" })
                }
            })
        }

        //绑定window方法
        const svgFn = this.setSvgFn();
        for (let i in svgFn) {
            if (svgFn.hasOwnProperty(i)) {
                window[i] = svgFn[i]
            }
        }
    }


    componentDidUpdate() {
        let { dispatch, svgPath, newFilename, filename, oldSvgPath, valueGather, selectedStation, selectedStationId, backgroundColor } = this.props;
        let that = this;
        let oldFilename = newFilename || 'overview'
        // 获得当前页面的文件目录code

        const stationCode = this.props.selectedStationCode;
        const changeFilename = filename || 'overview';
        const language = localStorage.getItem('language')
        const newSvgPath = '/svg/' + stationCode + '/' + language + '/' + changeFilename + '.svg';
        if (svgPath !== newSvgPath && oldFilename !== changeFilename) {
            dispatch({
                type: 'connect-line/updateState', payload: {
                    svgPath: newSvgPath,
                    newFilename: changeFilename,
                    switchVisual: false,
                    spinning: true,
                    pointVisual: false
                }
            }).then(res => {
                window.setTimeout(function () {
                    dispatch({
                        type: 'connect-line/updateState', payload: {
                            spinning: false,
                        }
                    })
                }, 200)
            });
            oldSvgPath.pop();
        }
        for (let i in window.svgTimer) {
            window.clearInterval(window.svgTimer[i])
        }
    }

    componentWillUnmount() {
        // this.mounted = false;
        let { dispatch } = this.props;
        socketClient?.close();
        dispatch({ type: "connect-line/closeSocket" })
        window.clearInterval(window.svgTimer);
        this.setState = (state, callback) => {
            return
        }
        this.props.dispatch({
            type: 'connect-line/updateState', payload: {
                svgPath: '',
                deviceDetailModal: false,
                actionColor: '#cbe8cd',
                dhdb: []
            }
        })
    }

    handleClick = (value) => {
        const { dhdb, dispatch, nowDate } = this.props;
        let changeLock = [...dhdb]
        changeLock.forEach(v => {
            if (v.value === value) {
                v.lock = true
            }
        })
        dispatch({
            type: 'connect-line/updateState', payload: {
                dhdb: changeLock
            }
        })
        // .then(res=>{
        //     dispatch({type: 'connect-line/getEchart', payload: {analogArr:changeLock,dateTime:nowDate}})
        // })
    }
    handleX = (value) => {
        const { dhdb, dispatch, nowDate, fix } = this.props;
        let changeHasSelect = [...dhdb]
        changeHasSelect.forEach((v, i) => {
            if (v.value === value) {
                changeHasSelect.splice(i, 1);
            }
        })
        dispatch({
            type: 'connect-line/updateState', payload: {
                dhdb: changeHasSelect
            }
        }).then(res => {
            dispatch({ type: 'connect-line/getEchart', payload: { analogArr: changeHasSelect, dateTime: nowDate, fix } })
        })
        if (changeHasSelect.length === 0) {
            this.refs.DragDiv.changeNotShow()
        }

    }

    onDateChange = (v, dateString) => {
        const { dispatch, dhdb, fix } = this.props;
        dispatch({
            type: 'connect-line/updateState', payload: {
                nowDate: dateString
            }
        }).then(res => {
            dispatch({ type: 'connect-line/getEchart', payload: { analogArr: [...dhdb], dateTime: dateString, fix } })
        })
    }

    shutSwitch = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'connect-line/updateState', payload: {
                switchVisual: false,
                pointVisual: false
            }
        })
    }
    //鼠标移入div显示锁的标记和x的标记
    mouseOver = (i) => {
        const { dhdb, dispatch } = this.props;
        let dhdbArr = [...dhdb]
        dhdbArr[i].show = true
        dispatch({
            type: 'connect-line/updateState', payload: {
                dhdb: dhdbArr
            }
        })
    }
    //鼠标移出div显示锁的标记和x的标记
    mouseOut = (i) => {
        const { dhdb, dispatch } = this.props;
        let dhdbArr = [...dhdb]
        dhdbArr[i].show = false
        dispatch({
            type: 'connect-line/updateState', payload: {
                dhdb: dhdbArr
            }
        })
    }
    changeColor = (e) => {
        const { dispatch } = this.props;
        dispatch({
            //需要调用对于namespace下effects中的该函数
            type: 'connect-line/updateState',
            payload: {
                actionColor: e
            }
        })
    };

    render() {
        const { runStatus, labelArr, nowCode, runEnvironment, monitorDate, switchArray, dhdb, oldSvgPath, color, svgData, svgPath,
            switchVisual, switchY, switchX, echartList, colorArr, pointVisual, pointY, pointX, pointTitle, pointValue, pointName,
            actionKey, actionColor, currentStationCode, dispatch, echartLoading, valueGather, deviceDetailModal, deviceCurveModal, backgroundColor, filename } = this.props;
        let that = this
        let analogArr = dhdb.map(obj => {
            return obj.value
        })
        let selectButton = dhdb.map((obj, i) => {
            if (obj.lock) {
                return <div key={i} className={styles.dh} onMouseOver={(e) => {
                    this.mouseOver(i)
                }} onMouseOut={(e) => {
                    this.mouseOut(i)
                }}>
                    <div className={styles.goodButton} style={{ backgroundColor: getColorDefault(dhdb.length, i) }}>{obj.name}</div>
                    <img style={{ visibility: obj.show ? 'visible' : 'hidden' }}
                        onClick={() => { this.handleX(obj.value) }}
                        className={styles.x}
                        src={require('../../../static/img/x.png')} alt={'无法显示图片'} />
                    <img className={styles.suo} src={require('../../../static/img/suoshang.png')} alt={'无法显示图片'} /></div>
            } else {
                return <div key={i} className={styles.dh} onMouseOver={(e) => {
                    this.mouseOver(i)
                }} onMouseOut={(e) => {
                    this.mouseOut(i)
                }}>
                    <div className={styles.goodButton} style={{ backgroundColor: getColorDefault(dhdb.length, i) }}>{obj.name}</div>
                    <img className={styles.danSuo} src={require('../../../static/img/suokai.png')}
                        style={{ visibility: obj.show ? 'visible' : 'hidden' }}
                        onClick={() => {
                            this.handleClick(obj.value)
                        }} alt={'无法显示图片'} /></div>
            }
        })
        let colorContent = colorArr.map((o, i) => {
            return (
                <span key={i} onClick={this.changeColor.bind(this, o)} style={{
                    backgroundColor: o.value,
                    border: actionKey === i ? '1px solid #3d7eff' : '1px solid transparent'
                }} className={styles.content}>{o.name}</span>
            )
        })
        let svgUrl

        try {
            if (this.props.__testSvgUrl) {
                svgUrl = this.props.__testSvgUrl
            } else {
                svgUrl = svgPath ? require('../../../../public' + svgPath) : ''
            }
        } catch (e) {
            if (filename === ' syt') {
                return (
                    <div className="wh100 vh-center no-data-tip">{utils.intl('当前电站无对应的示意图')}</div>
                )
            } else {
                return (
                    <div className="wh100 vh-center no-data-tip">{utils.intl('当前电站无对应的接线图')}</div>
                )
            }
        }

        return (
            <div className={styles.tpt} style={{ backgroundColor: actionColor }}>
                <div className={`f-df f-pr ${styles.changeColor}`} style={{ float: 'right', top: '5px', height: '38px', right: '5px', position: 'relative', backgroundColor: 'transparent', borderRadius: '10px' }}>
                    {/* <span className={styles.title}>背景色：</span> */}
                    {backgroundColor ?
                        <Select value={actionColor} onChange={this.changeColor} dataSource={colorArr}
                            label="" style={{ minWidth: '120px' }} />
                        : ''}
                </div>
                <div className={styles.content_right}
                    onMouseMove={this.listenMouse} onClick={this.shutSwitch}>
                    <div className={styles.back_handle} onClick={this.handleBack}
                        style={{ display: oldSvgPath.length > 0 ? 'flex' : 'none', zIndex: 999 }}>
                        <img src={require('../../../static/img/back1.png')} alt={'返回'} />
                        <span>{utils.intl('返回')}</span>
                    </div>
                    <Spin className='spin' size='large' spinning={false}>
                        <SvgChart
                            svgData={svgData}
                            path={svgUrl}
                            scaleId='g'
                            callBack={this.dataHandler}
                            dispatch={this.props.dispatch}
                        />
                    </Spin>
                </div>
                <div className={styles.cfd_model}
                    style={{
                        visibility: switchVisual ? 'visible' : 'hidden',
                        top: switchY ? switchY - 530 : '0px',
                        left: switchX ? switchX - 280 : '0px'
                    }}
                >
                    <ul>
                        {
                            switchArray.length > 0 ?
                                switchArray.split(' ').map(function (alarm, index) {
                                    return (
                                        <div>
                                            <div style={{
                                                position: 'relative', width: '10px', height: '10px',
                                                background: actionColor, float: 'left', borderRadius: '50px',
                                                top: '7px', boxShadow: '0px 0px 5px 2px ' + actionColor
                                            }}></div>
                                            <span style={{ marginLeft: '10px' }} key={index}>{alarm}</span>
                                        </div>
                                    )
                                })
                                : ''
                        }
                    </ul>
                </div>
                <div className={styles.cfd_model}
                    style={{
                        visibility: pointVisual ? 'visible' : 'hidden',
                        top: pointY ? pointY - 530 : '0px',
                        left: pointX ? pointX - 280 : '0px'
                    }}
                >
                    <ul>
                        <div>
                            <p style={{ marginBottom: 0, marginLeft: '10px', color: '#000' }}>{pointName}</p>
                            <span style={{ marginLeft: '10px', color: '#000' }}>{pointTitle}：{pointValue}</span>
                        </div>
                    </ul>
                </div>
                <DragDiv ref='DragDiv' dragId="chart-dialog">
                    <WankeClearOutlined className={'out'} onClick={() => {
                        dispatch({
                            type: 'connect-line/updateState', payload: {
                                dhdb: []
                            }
                        })
                        that.refs.DragDiv.changeNotShow();
                    }} />
                    {/* <img className={'out'} src={require('../../../static/img/x.png')} onClick={() => {
                        dispatch({
                            type: 'connect-line/updateState', payload: {
                                dhdb: []
                            }
                        })
                        that.refs.DragDiv.changeNotShow();
                    }} alt={'无法显示图片'} /> */}
                    <Card title={util.intl("曲线数据查询")}>
                        <div className={styles.one}>
                            <DatePicker disabledDate={disabledDateAfterToday}
                                allowClear={false}
                                defaultValue={moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')}
                                onChange={this.onDateChange}
                            />
                        </div>
                        <div className={styles.two}>
                            {selectButton}
                        </div>
                        <div className={styles.three}>
                            {
                                dhdb.length > 0 ?
                                    (
                                        <MultiLineChart
                                            series={echartList.series}
                                            xData={echartList.xData}
                                            yData={echartList.yData}
                                            loading={echartLoading}
                                            options={{ showSeries: false, yAxisScale: true }}
                                        />
                                    ) : ''
                            }
                        </div>
                    </Card>
                </DragDiv>
                {/* <DragDiv ref='CommandDragDiv' dragId="command-dialog" className="command-dialog">
                    <WankeClearOutlined
                        className={'out'}
                        onClick={() => {
                            that.commandParam = {}
                            that.refs.CommandDragDiv.changeNotShow();
                            this.forceUpdate()
                        }}
                    />
                    <Card title={util.intl("指令下发")}>
                        <CommandDialog
                            type={this.commandParam.type}
                            args={this.commandParam.args || []}
                            onClose={() => {
                                that.commandParam = {}
                                that.refs.CommandDragDiv.changeNotShow();
                                this.forceUpdate()
                            }}
                        />
                    </Card>
                </DragDiv> */}
                <Modal
                    centered
                    maskClosable={false}
                    width={380}
                    visible={this.props.commandModal}
                    title={utils.intl('指令下发')}
                    footer={null}
                    onCancel={() => {
                        that.commandParam = {}
                        that.props.dispatch({
                            type: 'connect-line/updateState',
                            payload: {
                                commandModal: false,
                            }
                        })
                    }}
                >
                    <CommandDialog
                        type={this.commandParam.type}
                        args={this.commandParam.args || []}
                        onClose={() => {
                            that.commandParam = {}
                            that.props.dispatch({
                                type: 'connect-line/updateState',
                                payload: {
                                    commandModal: false,
                                }
                            })
                        }}
                    />
                </Modal>
                {deviceDetailModal ? <DeviceDetailModal /> : ''}
            </div>
        );
    }
}

function mapStateToProps(model, getLoading) {
    const { list } = model
    return {
        ...model, loading: getLoading('getList'), echartLoading: getLoading('getEchart')
    }
}

export default makeConnect('connect-line', mapStateToProps)(Index);
