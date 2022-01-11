import createServices from '../../../../util/createServices';

const services = {
    getDeviceTab: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/topology-analysis/type",
            params
        );
    },
    
};

export default services;
