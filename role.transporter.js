var utils = require('role.utils')

var roleTransporter = {

    run: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            utils.collectDroppedEnergy(creep);
        } else {
           utils.depositEnergy(creep);
        }
    }
};

module.exports = roleTransporter;