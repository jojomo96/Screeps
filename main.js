var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleRepairer = require('role.repairer');

const roleConfig = {
    harvester: {max: 3, body: [WORK, WORK, CARRY, MOVE], run: roleHarvester.run},
    builder: {max: 3, body: [WORK, CARRY, CARRY, MOVE, MOVE], run: roleBuilder.run},
    upgrader: {max: 5, body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE], run: roleUpgrader.run},
    fighter: {max: 0, body: [RANGED_ATTACK, MOVE, TOUGH], run: roleFighter.run},
    repairer: {max: 1, body: [WORK, CARRY, CARRY, MOVE], run: roleRepairer.run}
}

function runCreeps() {
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        let role = creep.memory.role;

        // Check if the role exists in roleConfig, then run the corresponding function
        if (roleConfig[role] && roleConfig[role].run) {
            roleConfig[role].run(creep);
        } else {
            console.log(`Unknown role: ${role} for creep: ${name}`);
        }
    }
}

function clearDeadCreeps() {
    // Clear non-existing creeps from memory
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

function spawnMessage() {
    if (Game.spawns['Spawn1'].spawning) {
        let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

module.exports.loop = function () {
    clearDeadCreeps();

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
    spawnMessage();

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
    runCreeps();
}
