import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/analysis-query/performance/details',
            params
        );
    },
};

export default services;
