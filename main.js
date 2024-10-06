var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');


// Include the role.prototypes.js file to ensure prototype methods are available
require('role.prototypes');
require('source.prototypes');

const roleConfig = {
    harvester: {max: 0, body: [WORK, WORK, CARRY, MOVE], run: roleHarvester.run},
    miner: {max: 8, body: [WORK, WORK, MOVE], run: roleMiner.run},
    transporter: {max: 15, body: [CARRY, CARRY, MOVE, MOVE], run: roleTransporter.run},
    builder: {max: 2, body: [WORK, CARRY, CARRY, MOVE, MOVE], run: roleBuilder.run},
    repairer: {max: 2, body: [WORK, CARRY, CARRY, MOVE], run: roleRepairer.run},
    upgrader: {max: 10, body: [WORK, CARRY, CARRY, MOVE, MOVE], run: roleUpgrader.run},
    fighter: {max: 0, body: [RANGED_ATTACK, MOVE, TOUGH], run: roleFighter.run},
}

const CARRY_CAPACITY_TRANSPORTER = 100;

function assignTransporters() {
    const hasNoTarget = (creep) => !creep.memory.target;
    const hasNoEnergy = (creep) => creep.store[RESOURCE_ENERGY] === 0;
    const isAlreadySpawned = (creep) => !creep.spawning;

    let availableTransporters = filterCreepsByRoleAndConditions('transporter', hasNoTarget, hasNoEnergy, isAlreadySpawned);

    if (availableTransporters.length === 0) {
         // console.log('No available transport creeps');
        return;
    }

    const hasEnergy = (resource) => resource.amount > 100;
    const isEnergy = (resource) => resource.resourceType === RESOURCE_ENERGY;

    // Initialize Memory for assigned resources if it doesn't exist
    if (!Memory.assignedRessources) {
        Memory.assignedRessources = {};
    }

    // Loop through each room to find dropped resources
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        let droppedResources = findDroppedResourcesWithConditions(room, hasEnergy, isEnergy);

        if (droppedResources.length === 0) {
            console.log(`No dropped resources found in room ${roomName}`);
            continue;
        }

        for (let resource of droppedResources) {
            const requiredTransporters = Math.floor(resource.amount / CARRY_CAPACITY_TRANSPORTER);

            // Initialize tracking for the resource in memory if not present
            if (!Memory.assignedRessources[resource.id]) {
                Memory.assignedRessources[resource.id] = {
                    assignedTransporters: 0
                };
            }

            let alreadyAssigned = Memory.assignedRessources[resource.id].assignedTransporters;

            // Calculate remaining transporters needed
            const remainingCreepsNeeded = Math.min(requiredTransporters - alreadyAssigned, availableTransporters.length);

            for (let i = 0; i < remainingCreepsNeeded; i++) {
                let closestCreep = null;
                let closestDistance = Infinity;

                // Find the closest transporter that has no target
                for (let transporter of availableTransporters) {
                    let distance = transporter.pos.getRangeTo(resource.pos);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestCreep = transporter;
                    }
                }

                // Assign the closest transporter and remove it from available list
                if (closestCreep && !closestCreep.memory.target) {
                    closestCreep.memory.target = resource.id; // Store only the resource ID
                    Memory.assignedRessources[resource.id].assignedTransporters += 1;

                    // Remove the transporter from available list
                    availableTransporters = availableTransporters.filter(t => t.id !== closestCreep.id);
                    console.log(`Assigned ${closestCreep.name} to resource ${resource.id}`);
                }
            }

            // If the resource is gone (collected or disappeared), clean up memory
            if (!Game.getObjectById(resource.id)) {
                console.log(`Resource ${resource.id} is gone`);
                delete Memory.assignedRessources[resource.id];
            }
        }
    }
    if (availableTransporters.length > 0) {
        console.log(`Transporters ${availableTransporters.map(t => t.name)} have no target`);
    }
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
            align: 'left', opacity: 0.8
        });
    }
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
                        miners: 0, maxCapacity: source.countEmptySpacesAround(), distanceToSpawn: distanceToSpawn
                    };
                    console.log(`Initialized memory for source ${source.id} with distance to spawn: ${distanceToSpawn}`);
                }
            });
        }
    });
}

/**
 * Retrieves creeps by their role and optional conditions.
 *
 * This method filters the creeps based on their role and additional conditions provided.
 * If no role is specified, it will return creeps that meet the conditions regardless of their role.
 *
 * @param {string|null} role - The role of the creeps to filter. If null, role is ignored.
 * @param {...Function} conditions - Additional conditions to filter the creeps. Each condition is a function that takes a creep as an argument and returns a boolean.
 * @returns {Array} An array of creeps that match the specified role and conditions.
 */
function filterCreepsByRoleAndConditions(role, ...conditions) {
    return _.filter(Game.creeps, (creep) => {
        return (role === null || creep.memory.role === role) && conditions.every(condition => condition(creep));
    });
}

/**
 * Retrieves all dropped resources in the given room that meet the specified conditions.
 *
 * @param {Room} room - The room to search for dropped resources.
 * @param {...Function} conditions - Additional conditions to filter the dropped resources. Each condition is a function that takes a resource as an argument and returns a boolean.
 * @returns {Array} An array of dropped resources that match the specified conditions.
 */
function findDroppedResourcesWithConditions(room, ...conditions) {
    // Find and filter the resources based on the conditions
    let resources = room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => {
            return conditions.every(condition => condition(resource));
        }
    });

    // Sort the resources by amount of energy in descending order
    resources.sort((a, b) => b.amount - a.amount);

    return resources;
}

module.exports.loop = function () {
    clearDeadCreeps();
    initializeSourceMemory();

// Check if a spawn is scheduled
    if (Memory.scheduledSpawn) {
        const {role, bodyParts, newName} = Memory.scheduledSpawn;

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
                    Memory.scheduledSpawn = {role, bodyParts, newName};
                    console.log(`Scheduled new ${role}: ${newName} for next tick`);
                    break; // Exit the loop after scheduling a spawn
                }
            }
        }
    }

    // Display spawning creep info
    spawnMessage();
    // Creep role execution
    assignTransporters();

    runCreeps();
};



