import createServices from '../../../../util/createServices';

const services = {
    getDetail: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/record/summary",
            params
        );
    },
    getCurve: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/record/power-curve",
            params
        );
    },
};

export default services;
