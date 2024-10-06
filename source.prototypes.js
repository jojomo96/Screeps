/**
 * Counts the number of empty spaces around the source.
 *
 * This method calculates the number of non-wall terrain tiles surrounding the source.
 * It checks a 3x3 grid centered on the source's position.
 *
 * @returns {number} The number of empty spaces around the source.
 */
Source.prototype.countEmptySpacesAround = function () {
    const terrain = new Room.Terrain(this.room.name);
    const {x, y} = this.pos;
    let emptySpaces = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (terrain.get(x + i, y + j) !== TERRAIN_MASK_WALL) {
                emptySpaces++;
            }
        }
    }

    return emptySpaces;
}



