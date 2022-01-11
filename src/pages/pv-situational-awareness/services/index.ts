import createServices from '../../../util/createServices';

const services = {
    getCurve: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/situational-awareness",
            params
        );
    },
};

export default services;
