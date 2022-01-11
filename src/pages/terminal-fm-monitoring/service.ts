import createServices from '../../util/createServices';

const services = {
    getCrews: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/enums/crews',
            params
        );
    },
    getEnergyUnitAll: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/analysis-query/monitoring',
            params
        );
    },
};

export default services;
