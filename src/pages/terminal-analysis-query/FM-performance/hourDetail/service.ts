import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/analysis-query/performance/hour',
            params
        );
    },
};

export default services;
