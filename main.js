var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');

const roleConfig = {
    harvester: {max: 0, body: [WORK, WORK, CARRY, MOVE], run: roleHarvester.run},
    builder: {max: 0, body: [WORK, CARRY, CARRY, MOVE, MOVE], run: roleBuilder.run},
    upgrader: {max: 4, body: [WORK, CARRY, CARRY, MOVE, MOVE], run: roleUpgrader.run},
    fighter: {max: 0, body: [RANGED_ATTACK, MOVE, TOUGH], run: roleFighter.run},
    repairer: {max: 1, body: [WORK, CARRY, CARRY, MOVE], run: roleRepairer.run},
    miner: {max: 3, body: [WORK, WORK, MOVE], run: roleMiner.run},
    transporter: {max: 3, body: [CARRY, CARRY, MOVE, MOVE], run: roleTransporter.run},
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
    if (Game.spawns['Spawn1'] && Game.spawns['Spawn1'].spawning) {
        let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text('🛠️' + spawningCreep.memory.role, Game.spawns['Spawn1'].pos.x + 1, Game.spawns['Spawn1'].pos.y, {
            align: 'left',
            opacity: 0.8
        });
    }
}

function countEmptySpacesAroundSource(source) {
    const terrain = new Room.Terrain(source.room.name);
    const {x, y} = source.pos;
    let emptySpaces = 0;

    // Loop through the 3x3 area around the source
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue; // Skip the source's own position

            const terrainType = terrain.get(x + dx, y + dy);
            if (terrainType === TERRAIN_MASK_SWAMP || terrainType === 0) {
                emptySpaces++;
            }
        }
    }

    return emptySpaces;
}

function initializeSourceMemory() {
    _.forEach(Game.rooms, function (room) {
        if (room && room.controller && room.controller.my) {
            let sources = room.find(FIND_SOURCES);
            let spawns = room.find(FIND_MY_SPAWNS);

            if (spawns.length === 0) {
                console.log(`No spawns found in room ${room.name}`);
                return;
            }

            let spawn = spawns[0]; // Assuming there's only one spawn per room

            _.forEach(sources, function (source) {
                if (!Memory[source.id]) {
                    // TODO: Update when room layout changes
                    const path = PathFinder.search(spawn.pos, {pos: source.pos, range: 1});
                    let distanceToSpawn = path.cost;
                    Memory[source.id] = {
                        miners: 0, maxCapacity: countEmptySpacesAroundSource(source), distanceToSpawn: distanceToSpawn
                    };
                    console.log(`Initialized memory for source ${source.id} with distance to spawn: ${distanceToSpawn}`);
                }
            });
        }
    });
}

module.exports.loop = function () {
    clearDeadCreeps();
    initializeSourceMemory();

// Check if a spawn is scheduled
    if (Memory.scheduledSpawn) {
        const { role, bodyParts, newName } = Memory.scheduledSpawn;

        // Attempt to spawn the creep
        let spawnCreep = Game.spawns['Spawn1'].spawnCreep(bodyParts, newName, {memory: {role: role}});
        if (spawnCreep === OK) {
            console.log(`Spawned new ${role}: ${newName}`);
            delete Memory.scheduledSpawn; // Clear the flag after successful spawn
        }
    } else {
        // Loop through each role in the roleConfig
        for (const role in roleConfig) {
            const maxAmount = roleConfig[role].max;
            const bodyParts = roleConfig[role].body;

            // Filter creeps based on their role
            const creepsOfRole = _.filter(Game.creeps, (creep) => creep.memory.role === role);

            // If the number of creeps for this role is less than the max amount, schedule a new spawn
            if (creepsOfRole.length < maxAmount) {
                const newName = `${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
                if (Game.spawns['Spawn1'] && !Game.spawns['Spawn1'].spawning) {
                    // Schedule the spawn for the next tick
                    Memory.scheduledSpawn = { role, bodyParts, newName };
                    console.log(`Scheduled new ${role}: ${newName} for next tick`);
                    break; // Exit the loop after scheduling a spawn
                }
            }
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
};
