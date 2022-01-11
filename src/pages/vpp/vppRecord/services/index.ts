import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/vpp/dispatch-records",
            params
        );
    },
};

export default services;
