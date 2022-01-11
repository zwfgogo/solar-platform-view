import createServices from '../../../../util/createServices';

const services = {
    getSelect: function (params) {
        return createServices<{}>(
            "get",
            "/api/enums",
            params
        );
    },
    getHealth: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getBatteryInfoHealthScore",
            params
        );
    },
    getSingelHealth: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getCellByTitle",
            params
        );
    },
};

export default services;
