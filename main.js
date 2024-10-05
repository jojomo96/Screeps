var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleRepairer = require('role.repairer');

const roleConfig = {
    harvester: {max: 3, body: [WORK, WORK, CARRY, MOVE]},
    builder: {max: 3, body: [WORK, CARRY, CARRY, MOVE, MOVE]},
    upgrader: {max: 3, body: [WORK, WORK, CARRY, MOVE, MOVE]},
    fighter: {max: 0, body: [RANGED_ATTACK, MOVE, TOUGH]}, // Example fighter config
    repairer: {max: 1, body: [WORK, CARRY, CARRY, MOVE]}
}

module.exports.loop = function () {

    // Clear non-existing creeps from memory
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    // Loop through each role in the roleConfig
    for (const role in roleConfig) {
        const maxAmount = roleConfig[role].max;
        const bodyParts = roleConfig[role].body;

        // Filter creeps based on their role
        const creepsOfRole = _.filter(Game.creeps, (creep) => creep.memory.role === role);
        //console.log(`${role.charAt(0).toUpperCase() + role.slice(1)}s: ${creepsOfRole.length}`);

        // If the number of creeps for this role is less than the max amount, spawn a new one
        if (creepsOfRole.length < maxAmount) {
            const newName = `${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
            //console.log(`Spawning new ${role}: ${newName}`);
            Game.spawns['Spawn1'].spawnCreep(bodyParts, newName, {memory: {role: role}});
        }
    }

    // Display spawning creep info
    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    // Tower logic for repairing and attacking
    // var tower = Game.getObjectById('9b1b384d824e5000cfcd0057');
    // if(tower) {
    //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < structure.hitsMax
    //     });
    //     if(closestDamagedStructure) {
    //         tower.repair(closestDamagedStructure);
    //     }
    //
    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if(closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }

    // Creep role execution
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role === 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role === 'fighter') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role === 'repairer') {
            roleRepairer.run(creep);
        }
    }
}
