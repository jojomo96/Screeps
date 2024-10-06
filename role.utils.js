/**
 * Finds the closest resource to the given creep and attempts to mine it.
 * If the resource is not in range, the creep will move towards it.
 *
 * @function
 * @param {Creep} creep - The creep that will find and mine the closest resource.
 */
Creep.prototype.findAndMineClosestResource = function (creep) {
    var source = creep.pos.findClosestByPath(FIND_SOURCES); // Use the updated findClosestResource function
    if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
};

Creep.prototype.collectStoredEnergy = function (creep) {
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
    };

Creep.prototype.collectDroppedEnergy = function (creep) {
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
};

function printError(errorMessage) {
    console.log(`<span style="color: red;">Error: ${errorMessage}</span>`);
}

// Improved depositEnergy function with type checking
Creep.prototype.depositEnergy = function (structureTypes) {
    // Ensure structureTypes is an array
    if (!Array.isArray(structureTypes) || !structureTypes.every(typeObj => typeObj.type && typeObj.priority)) {
        printError('depositEnergy(structureTypes): must be an array of objects with type and priority properties.');
        return;
    }

    // Find all structures that match the given types and have free capacity
    let targets = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structureTypes.some(typeObj => typeObj.type === structure.structureType) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    if (targets.length > 0) {
        // Sort targets based on the priority of their structure type
        targets.sort((a, b) => {
            let aPriority = structureTypes.find(typeObj => typeObj.type === a.structureType).priority;
            let bPriority = structureTypes.find(typeObj => typeObj.type === b.structureType).priority;
            return aPriority - bPriority;
        });

        // Get the highest priority
        let highestPriority = structureTypes.find(typeObj => typeObj.type === targets[0].structureType).priority;

        // Filter targets to only include those with the highest priority
        let highestPriorityTargets = targets.filter(target => {
            return structureTypes.find(typeObj => typeObj.type === target.structureType).priority === highestPriority;
        });

        // Find the closest target among the highest priority targets
        let closestTarget = this.pos.findClosestByPath(highestPriorityTargets);

        // Transfer energy to the closest highest priority target
        if (this.transfer(closestTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    } else {
        this.say('🔄 No targets');
    }
};

