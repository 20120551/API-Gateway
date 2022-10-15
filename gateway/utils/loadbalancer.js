class LoadBalancer {
    constructor(service) {
        this.service = service;
    }

    ROUND_ROBIN = () => {
        const index = ++this.service.index < this.service.instances.length ? this.service.index : 0;
        this.service.index = index;
        return this.findEnableInstance(index, this.ROUND_ROBIN);
    }

    findEnableInstance = (index, loadBalancerStrategy) => {
        return this.service.instances[index].isEnable ? index : loadBalancerStrategy();
    }
}

module.exports = LoadBalancer;