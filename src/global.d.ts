declare module '*.less'
declare module '*.png'
declare module '*.svg'

declare var BMap: any;
declare var google: any;
declare var googlePromise: Promise<any>;
declare var googleMapAble: boolean;

interface Window {
  imagePrefix: string
  BMAP_ANCHOR_TOP_LEFT: any;
  BMAP_STATUS_SUCCESS: any;
  myTimer: any
  onresizeArr: any
  zoomGrow: any
  publicPath: string
}
