import createServices from '../../../../util/createServices';

const services = {
    getAbnormal: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/topology-analysis/abnormal",
            params
        );
    },
    getSelect: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/enums",
            params
        );
    },
};

export default services;
