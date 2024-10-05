let roleMiner = {
    hasCapacityLeft: function (sourceMemory) {
        return sourceMemory.miners < sourceMemory.maxCapacity;
    },

    setSourceIfNull: function (creep) {
        if (!creep.memory.source) {
            let sources = creep.room.find(FIND_SOURCES);
            let closestSource = null;
            let minDistance = Infinity;

            for (let i = 0; i < sources.length; i++) {
                if (!Memory[sources[i].id]) {
                    console.log(`Memory for source ${sources[i].id} does not exist`);
                    continue;
                }
                let memorySource = Memory[sources[i].id];

                if (!closestSource && hasCapacityLeft(memorySource)) {
                    closestSource = sources[i];
                    minDistance = memorySource.distanceToSpawn;
                    console.log(`Setting closest source to ${sources[i].id}`);
                } else if (closestSource && hasCapacityLeft(memorySource)) {
                    let closestSourceMemory = Memory[closestSource.id];
                    if(memorySource.miners < closestSourceMemory.miners ||
                        (memorySource.miners === closestSourceMemory.miners && memorySource.distanceToSpawn < closestSourceMemory.distanceToSpawn )){
                        closestSource = sources[i];
                        minDistance = memorySource.distanceToSpawn;
                        console.log(`asdasd Setting closest source to ${sources[i].id}`);
                    }
                } else {
                    console.log('No closest source');
                }
            }
            // if (memorySource.miners < memorySource.maxCapacity &&
            //     (distance < minDistance || (closestSource && memorySource.miners < Memory[closestSource.id].miners))) {
            //     if (!closestSource) {
            //         closestSource = sources[i];
            //         minDistance = distance;
            //     } else {
            //         if (memorySource.miners < Memory[closestSource.id].miners ||
            //             (memorySource.miners === Memory[closestSource.id].miners && distance < minDistance)) {
            //             console.log(`Setting closest source to ${sources[i].id}`);
            //             closestSource = sources[i];
            //             minDistance = distance;
            //         }
            //     }
            // }
            if (closestSource) {
                if (!Memory[closestSource.id]) {
                    console.log(`Memory for source ${closestSource.id} does not exist`);
                } else {
                    Memory[closestSource.id].miners++;
                    creep.memory.source = closestSource.id;
                }
            } else {
                console.log(`No available source found for creep ${creep.name}`);
            }
        }
    },

    run: (creep) => {
        setSourceIfNull(creep);

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

// Destructure methods from roleMiner
const { hasCapacityLeft, setSourceIfNull } = roleMiner;

module.exports = roleMiner;