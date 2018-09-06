const Utils = require('../utils');
const Config = require('../config');

class Circle{
    constructor(x, y, square)  {
        this.x = x;
        this.y = y;
        this.square = square;
        this.speedX = Utils.randomInInterval(Config.minSpeed, Config.maxSpeed);
        this.speedY = Utils.randomInInterval(Config.minSpeed, Config.maxSpeed);
        this.userId = null;
        this.id = null;
        this.updateRadius();
    }

    updateRadius() {
        this.radius = Utils.circleRadius(this.square);
    };

    absorb(intersectionSquare) {
        this.square += intersectionSquare;
        this.updateRadius();
    };
}

module.exports = Circle;