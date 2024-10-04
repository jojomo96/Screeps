var roleFighter = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Find the closest hostile creep in the room
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        // If there's a hostile target, attack it
        if(target) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                // Move towards the target if it's not in range
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                creep.say('⚔️ Attack!');
            } else if (creep.attack(target) == OK) {
                creep.say('💥 Fight!');
            }
        } else {
            // If no hostile creeps are found, patrol to a point or rest
            var flag = Game.flags['PatrolFlag']; // Place a flag named 'PatrolFlag' in the room for patrolling
            if(flag) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🚶 Patrol');
            } else {
                // If no flag exists, move to the center of the room
                creep.moveTo(25, 25, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = roleFighter;
