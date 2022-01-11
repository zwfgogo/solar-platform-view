import React from 'react'
import Flow from '../../public/components/Flow'

import DeveceModel from './deviceModel/Index'
import Index from './Index'
import StationModel from './stationModel/Index'
import EnergyUnitModel from './energyUnitModel/Index'
import DeveceParameter from './deviceParameter/Index'
import DataItemView from './data-item-view/DataItemView'
import BatchAddition from './batch-addition/BatchAddition'
import ParameterLibrary from './parameter-library/ParameterLibrary'
import ContentType from './contentType/Index'

const ModelConfig = ({ pageId }) => {
    return (
        <>
            <Flow pageName="index" component={Index} default={true} pageId={pageId} />
            <Flow pageName="deveceModel" component={DeveceModel} />
            <Flow pageName="stationModel" component={StationModel} />
            <Flow pageName="energyUnitModel" component={EnergyUnitModel} />
            <Flow pageName="deveceParameter" component={DeveceParameter} />
            <Flow pageName="detail" component={DataItemView} />
            <Flow pageName="batch" component={BatchAddition} />
            <Flow pageName="library" component={ParameterLibrary} />
            <Flow pageName="contentType" component={ContentType} />
        </>
    )
}

export default ModelConfig
