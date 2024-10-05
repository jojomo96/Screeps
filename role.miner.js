let roleMiner = {
    hasCapacityLeft: (sourceMemory) => {
        return sourceMemory.miners < sourceMemory.maxCapacity;
    },

    setSourceIfNull: (creep) => {
        if (!creep.memory.source) {
            let sources = creep.room.find(FIND_SOURCES);
            let closestSource = null;
            let minDistance = Infinity;

            sources.forEach((source) => {
                let memorySource = Memory[source.id];
                if (!memorySource) {
                    console.log(`Memory for source ${source.id} does not exist`);
                    return;
                }

                if (roleMiner.hasCapacityLeft(memorySource)) {
                    if (!closestSource ||
                        memorySource.miners < Memory[closestSource.id].miners ||
                        (memorySource.miners === Memory[closestSource.id].miners && memorySource.distanceToSpawn < Memory[closestSource.id].distanceToSpawn)) {
                        closestSource = source;
                        minDistance = memorySource.distanceToSpawn;
                        console.log(`Setting closest source to ${source.id}`);
                    }
                }
            });

            if (closestSource) {
                Memory[closestSource.id].miners++;
                creep.memory.source = closestSource.id;
            } else {
                console.log(`No available source found for creep ${creep.name}`);
            }
        }
    },

    run: (creep) => {
        roleMiner.setSourceIfNull(creep);

        let source = Game.getObjectById(creep.memory.source);
        if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else {
            creep.drop(RESOURCE_ENERGY);
        }

        if (creep.ticksToLive < 100 && !creep.memory.dying) {
            Memory[source.id].miners--;
            console.log('Miner died');
            console.log(Memory[source.id].miners);
            creep.memory.dying = true;
        }
    }
};

module.exports = roleMiner;