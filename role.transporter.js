
var roleTransporter = {

    run: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.collectDroppedEnergy(creep);
        } else {
            creep.depositEnergy(creep, [
                {type: STRUCTURE_SPAWN, priority: 1},
                {type: STRUCTURE_EXTENSION, priority: 2},
                {type: STRUCTURE_TOWER, priority: 3},
                {type: STRUCTURE_CONTAINER, priority: 4}
            ]);
        }
    }
};

module.exports = roleTransporter;