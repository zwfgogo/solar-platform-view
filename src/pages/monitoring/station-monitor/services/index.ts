import createServices from '../../../../util/createServices';

const services = {
    getAbnormal: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/overview/abnormal",
            params
        );
    },
};

export default services;
