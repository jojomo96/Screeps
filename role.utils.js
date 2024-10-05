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
    },

    collectStoredEnergy: function (creep) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType === STRUCTURE_CONTAINER
                    || structure.structureType === STRUCTURE_EXTENSION
                    || structure.structureType === STRUCTURE_SPAWN
                ) && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 50;
            }
        });

        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.say('waiting');
        }
    },

    collectDroppedEnergy: function (creep) {
        let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount > 200
        });

        if (droppedEnergy) {
            if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            creep.say('waiting');
        }
    },

    depositEnergy: function (creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION
                    || structure.structureType === STRUCTURE_SPAWN
                    || structure.structureType === STRUCTURE_TOWER
                    || structure.structureType === STRUCTURE_CONTAINER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (targets.length > 0) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.say('🔄');
        }
    }

};

module.exports = utils;