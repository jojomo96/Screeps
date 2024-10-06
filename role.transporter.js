
var roleTransporter = {

    run: function (creep) {

        if (creep.memory.target) {
            let target = Game.getObjectById(creep.memory.target);
            if (!target){
                console.log('Target is gone');
                creep.memory.target = null;
            }
        }

        // If the creep has free capacity, collect energy
        if (creep.store.getFreeCapacity() === 100) {
            creep.collectDroppedEnergy(); // Will find a new target if one is not set
        } else {
            // Otherwise deposit energy into prioritized structures
            creep.depositEnergy([
                {type: STRUCTURE_SPAWN, priority: 1},
                {type: STRUCTURE_EXTENSION, priority: 2},
                {type: STRUCTURE_TOWER, priority: 3},
                {type: STRUCTURE_CONTAINER, priority: 4}
            ]);
        }
    }

};

module.exports = roleTransporter;