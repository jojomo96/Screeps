var utils = {


    /**
     * Finds the closest resource to the given creep and attempts to mine it.
     * If the resource is not in range, the creep will move towards it.
     *
     * @function
     * @param {Creep} creep - The creep that will find and mine the closest resource.
     */
    findAndMineClosestResource: function (creep) {
        var source = creep.pos.findClosestByPath(FIND_SOURCES); // Use the updated findClosestResource function
        if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};

module.exports = utils;