import createServices from '../../../../util/createServices';

const services = {
    getDetail: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/summary",
            params
        );
    },
    getCurve: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/power-curve",
            params
        );
    },
};

export default services;
