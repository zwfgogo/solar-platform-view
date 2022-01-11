/** 仪表盘组件 */
import React, { Component, CSSProperties } from 'react'
import { AutoSizer } from 'wanke-gui'

export interface PanelChartProps{
 boxClassName?:string;
 boxStyle?: CSSProperties
 value?:number;// 0~1
}

export default class PanelChart extends Component<PanelChartProps> {

  countNumber: number = 28;

  static defaultProps = {
    boxStyle: { width: '100%', height: 150, textAlign: "center" },
    value: 0.5
  }
  myCanvas: HTMLCanvasElement
  componentDidMount(){
    this.windowResize();
    window.addEventListener('resize', this.windowResize)
  }

  componentDidUpdate(perProps){
    if(perProps.value !== this.props.value){
      this.windowResize();
    }
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.windowResize)
  }

  // 窗口改变重绘
  windowResize = () => {
    setTimeout(() => {
      if(this.myCanvas){
        const { width, height } = this.myCanvas
        const ctx = this.myCanvas.getContext('2d');
        ctx.clearRect(0,0,width, height)
        // 裁剪相关区域
        const clipNum = Math.min(width, height)/ 2 - 10
        this.clipArea(clipNum, 2, clipNum/1.7 + 3, undefined);
        this.clipArea(clipNum/1.7 - 1,1 , clipNum/1.7 - 3, "#0062ff" );
      }
    }, 800)
  }

  // 裁剪相关区域
  clipArea = (rWidth, rHeight, cr, color) => {
    const { width, height } = this.myCanvas
    const { value } = this.props
    const ctx = this.myCanvas.getContext('2d');
    const p0 = [width/2, height/2] // 圆心
    const maxNum = parseInt(`${value * this.countNumber}`)
    ctx.globalCompositeOperation = "source-over"
    ctx.save();
    ctx.translate(p0[0], p0[1])
    ctx.beginPath();
    ctx.rotate(Math.PI * 160/180)
    ctx.fillStyle = color || (maxNum>0? '#0062ff' : "rgba(100,120,120,0.45)")
    ctx.fillRect(0,0, rWidth, rHeight)
    ctx.closePath();

    for(let i=0; i<this.countNumber; i++){
      ctx.beginPath();
      ctx.rotate(Math.PI * 220/this.countNumber/180)
      ctx.fillStyle = color || (maxNum>i? '#0062ff' : "rgba(100,120,120,0.45)")
      ctx.fillRect(0,0, rWidth, rHeight)
      ctx.closePath();
    }

    ctx.restore();
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath();
    ctx.arc(p0[0], p0[1], cr, 0, 2* Math.PI)
    ctx.closePath();
    ctx.fill();
  }

  render() {
    const { boxClassName, boxStyle } = this.props
    return (
      <div className={boxClassName} style={boxStyle}>
        <AutoSizer>
          {
            ({width, height}) => {
              return <canvas ref={canvas => this.myCanvas = canvas} width={width} height={height}></canvas>
            }
          }
        </AutoSizer>
      </div>
      
    )
  }
}
