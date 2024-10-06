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

Creep.prototype.collectDroppedEnergy = function () {
    // Check if the creep is already full
    if (this.store.getFreeCapacity() === 0 || (this.memory.target && !Game.getObjectById(this.memory.target).amount)) {
        this.memory.target = null;
        console.log('Something went wrong!');
        return;
    }

    let target = Game.getObjectById(this.memory.target);

    if (target) {
        if (this.pickup(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 10});
        } else {
            Memory.assignedRessources[this.memory.target]--;
            this.memory.target = null;

        }
    } else {
        // Reset target if it's no longer valid
        this.memory.target = null;
        this.say('waiting');
    }
};


function printError(errorMessage) {
    console.log(`<span style="color: red;">Error: ${errorMessage}</span>`);
}

// Improved depositEnergy function with type checking
Creep.prototype.depositEnergy = function (structureTypes) {
    if (this.store[RESOURCE_ENERGY] === 0) {
        this.memory.target = null;
        return;
    }

    // Ensure structureTypes is an array with proper objects
    if (!Array.isArray(structureTypes) || !structureTypes.every(typeObj => typeObj.type && typeObj.priority)) {
        console.error('depositEnergy(structureTypes): must be an array of objects with type and priority properties.');
        return;
    }

    // If the creep has no energy, clear the target and return
    if (this.store[RESOURCE_ENERGY] === 0) {
        this.memory.target = null;
        this.say('Empty');
        return;
    }

    // Retrieve target from memory if it exists
    // let target = this.memory.target ? Game.getObjectById(this.memory.target) : null;

    let targets = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structureTypes.some(typeObj => typeObj.type === structure.structureType) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 100;
        }
    });
    let target = targets.length > 0 ? targets[0] : null;

    // If the target is invalid or full, clear it from memory
    if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        this.memory.target = null;
        target = null;
    }

    // If no valid target, find a new one
    if (!target) {
        let targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structureTypes.some(typeObj => typeObj.type === structure.structureType) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (targets.length > 0) {
            // Sort targets by priority
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

            // Find the closest highest priority target
            target = this.pos.findClosestByPath(highestPriorityTargets);

            // If we found a target, store its ID in memory
            if (target) {
                this.memory.target = target.id;
            } else {
                this.say('No valid target');
                this.memory.target = null;
                return;
            }
        } else {
            this.say('🔄 No targets');
            this.memory.target = null;
            return;
        }
    }

    // Try transferring energy to the target
    if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
    } else {
        // Clear target if the creep is out of energy
        if (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            this.memory.target = null;
        }
    }

    // Clear target if the creep is out of energy
    if (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        this.memory.target = null;
    }
};

