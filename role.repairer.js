var utils = require('role.utils');

var roleRepairer = {

    run: function (creep) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            utils.findAndMineClosestResource(creep);
        } else {

            let roads = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax
            });

            if (roads.length) {
                roads.sort((a, b) => a.hits - b.hits); // Prioritize roads with the least hits

                if (creep.repair(roads[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(roads[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleRepairer;