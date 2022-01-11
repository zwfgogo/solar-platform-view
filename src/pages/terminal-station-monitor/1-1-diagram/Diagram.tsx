import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import PageProps from '../../../interfaces/PageProps'
import Page from '../../../components/Page'
import Tools from '../../../components/layout/Tools'
import Back1 from '../../../components/layout/Back1'
import styles from './diagram.less'

interface Props extends PageProps {
}

const Diagram: React.FC<Props> = function (this: null, props) {
  const [xml, setXml] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  // svg全局方法集合
  const setSvgFn = () => {
    let that = this;
    return {
      toDetail: function (index) {
        let detailXml
        let stationId = sessionStorage.getItem('station-id')
        if (index == 1) {
          detailXml = require('../../../../public/svg/' + stationId + '/syt_1.svg')
        }
        if (index == 2) {
          detailXml = require('../../../../public/svg/' + stationId + '/syt_2.svg')
        }
        if (index == 3) {
          detailXml = require('../../../../public/svg/' + stationId + '/syt_3.svg')
        }
        if (index == 0) {
          detailXml = require('../../../../public/svg/' + stationId + '/syt_4.svg')
        }
        d3.text(detailXml).then((xml) => {
          setPage(2)
          setXml(xml)
        })
      }
    }
  };
  useEffect(() => {
    let stationId = sessionStorage.getItem('station-id');
    //绑定window方法
    const svgFn = setSvgFn();
    for (let i in svgFn) {
      if (svgFn.hasOwnProperty(i)) {
        window[i] = svgFn[i]
      }
    }
    try {
      d3.text(require('../../../../public/svg/' + stationId + '/syt.svg')).then((xml) => {
        setXml(xml)
      })
    } catch (e) {
    }
  }, [])

  const zoomed = () => {
    let dom = document.querySelector('#diagram-svg-container svg')
    let svg = d3.select(dom)
    svg.select('g').attr('transform', d3.event.transform)
  }

  const back = () => {
    let stationId = sessionStorage.getItem('station-id');
    setPage(1)
    d3.text(require('../../../../public/svg/' + stationId + '/syt.svg')).then((xml) => {
      setXml(xml)
    })
  }

  let zoom = d3.zoom().scaleExtent([0.5, 20]).on('zoom', zoomed)

  useEffect(() => {
    let dom = document.querySelector('#diagram-svg-container svg')
    let svg = d3.select(dom)
    svg.call(zoom)
  }, [xml])

  return (
    <Page pageId={props.pageId} pageTitle="示意图" className={styles['diagram-page']}>
      <div id="diagram-svg-container" style={{ overflow: 'hidden', height: '100%', width: '100%' }}
        dangerouslySetInnerHTML={{ __html: xml }}>

      </div>
      {
        page == 2 && (
          <Tools>
            <Back1 back={back} />
          </Tools>
        )
      }
    </Page>
  )
}

export default Diagram
