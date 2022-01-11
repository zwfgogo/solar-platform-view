import createServices from '../../../../util/createServices';

const services = {
    getDeviceList: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/device-type",
            params
        );
    },
    getEnergyUnitList: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/energy-unit",
            params
        );
    },
    deleteEnergyUnitType: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/station/:id/unbind-energyUnitTypes",
            params
        );
    },
    deleteDeviceType: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/energy-unit/:id/unbind-device-types",
            params
        );
    },
    editDeviceList: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/energy-unit/:id/device-types-property",
            params
        );
    },
    editEnergyUnitList: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/station/:id/energyUnitType-property",
            params
        );
    },
    energyUnitDeviceType: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/energy-unit/:id/device-types",
            params
        );
    },
    stationEnergyUnitType: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/station/:id/energyUnitTypes",
            params
        );
    },
    addEnergyUnitList: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/energy-unit/:id/bind-device-types",
            params
        );
    },
    addStationList: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/station/:id/bind-energyUnitTypes",
            params
        );
    },
};

export default services;
