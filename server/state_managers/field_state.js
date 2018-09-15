Circle = require('../models/circle');
Config = require('../config');
Utils = require('../utils');

class FieldState{
    constructor(width, height, usersCount){
        this.width = width;
        this.height = height;
        this.usersCount = usersCount;
        this.usedUserPoints = {};
        this.userPoints = [];
        this.initUserPoints();
        this.nextCircleId = 1;
        this.users = {};
        this.circles = {};
        this.biggest = null;
        this.squareSum = 0;
        this.state = Config.game_states.starting;
        this.createdAt = new Date();
        this.currentTime = new Date();
        this.owner = null;
    }

    start_game(){
        this.fill();
        this.state = Config.game_states.process
    }

    takeUserPoint(x1, y1, x2, y2){
        let userPoint = null;
        for(let i in this.usedUserPoints){
            let x = this.usedUserPoints[i].x;
            let y = this.usedUserPoints[i].y;
            if(x1 <= x && x2 >= x && y1 <= y && y2 >= y){
                userPoint = this.usedUserPoints[i];
            }
        }
        return userPoint;
    }

    initUserPoints(){
        var rows = Math.ceil(Math.sqrt(this.usersCount));
        var pointSizeX = this.width / rows;
        var pointSizeY = this.height / rows;
        for(var i = 0; i < rows; i++){
            for(var j = 0; j < rows; j++){
                if(this.userPoints.length >= this.usersCount){
                    break;
                }
                if(i * j + j > this.usersCount){
                    break;
                }
                var x = pointSizeX * i + pointSizeX / 2;
                var y = pointSizeY * j + pointSizeY / 2;
                this.userPoints.push({
                    x: x,
                    y: y
                })
            }
        }
    }

    addCircle(x, y, square){
        var circle = new Circle(x, y, square);
        this.circles[this.nextCircleId] = circle;
        circle.id = this.nextCircleId;
        this.nextCircleId += 1;
        return circle;
    };

    fillZone(x1, y1, x2, y2){
        var maxDiameterX = x2 - x1 - Config.interval;
        var maxDiameterY = y2 - y1 - Config.interval;
        var maxDiameter = (maxDiameterX > maxDiameterY) ? maxDiameterY : maxDiameterX;
        if(maxDiameter < Config.minDiameter){
            return
        }
        var radus = Math.round(Utils.randomInInterval(Config.minDiameter, maxDiameter) / 2);
        var userPoint = this.takeUserPoint(x1, y1, x2, y2);
        if(userPoint){
            return;
        }

        var x = x1 + radus + Config.interval;
        var y = y1 + radus + Config.interval;
        var square = radus * radus * Math.PI;
        this.addCircle(x, y, square);
        this.fillZone(x + radus, y1 + Config.interval, x2, y + radus);
        this.fillZone(x1 + Config.interval, y + radus, x2, y2);
    }

    fill(){
        for(var i = 0; i < this.width; i += Config.maxDiameter){
            for(var j = 0; j < this.height; j += Config.maxDiameter){
                var i2 = i + Config.maxDiameter;
                i2 = (i2 > this.width) ? this.width : i2;
                var j2 = j + Config.maxDiameter;
                j2 = (j2 > this.height) ? this.height : j2;
                this.fillZone(i, j, i2, j2);
            }
        }
    }

    addUser(userId){
        if(!this.userPoints.length){
            return
        }
        let userPoint = this.userPoints.splice(0, 1)[0];
        this.usedUserPoints[userId] = userPoint;
        let circle = this.addCircle(userPoint.x, userPoint.y, 2500);
        circle.userId = userId;
        if(!Object.keys(this.users).length){
            this.owner = userId;
        }
        this.users[userId] = circle.id;
    }

    dropUser(userId){
        var circleId = this.users[userId];
        var circle = this.circles[circleId];
        this.userPoints.push({x: circle.x, y: circle.y});
        delete this.circles[circleId];
        delete this.users[userId];
        delete this.usedUserPoints[userId];
        if(this.owner == userId){
            let newOwnerId = Object.keys(this.users)[0];
            if(newOwnerId){
                this.owner = newOwnerId;
            }
        }
    }

    tick(){
        this.updateCurrentTime();
        let tickIntervalSeconds = Config.serverTickInterval / 1000;
        this.squareSum = 0;
        this.biggest = null;
        for(let i in this.circles){
            let circle = this.circles[i];
            this.squareSum += circle.square;
            if(!this.biggest || circle.square > this.biggest.square){
                this.biggest = circle;
            }
            let dx = circle.speedX * tickIntervalSeconds;
            let dy = circle.speedY * tickIntervalSeconds;
            let x = circle.x + dx;
            let y = circle.y + dy;
            if(x - circle.radius < 0){
                x = -(x - circle.radius) + circle.radius;
                circle.speedX = -circle.speedX;
            }
            if(y - circle.radius < 0)
            {
                y = -(y - circle.radius) + circle.radius;
                circle.speedY = -circle.speedY;
            }
            if(x + circle.radius > this.width){
                x = this.width - circle.radius - (x + circle.radius - this.width);
                circle.speedX = -circle.speedX;
            }
            if(y + circle.radius > this.height){
                y = this.height - circle.radius - (y + circle.radius - this.height);
                circle.speedY = -circle.speedY;
            }
            circle.x = x;
            circle.y = y;
        }

        let forDelete = [];
        let deletedUsers = [];
        let circlesArray = Object.values(this.circles);
        for(let i = 0; i < circlesArray.length; i++){
            for(let j = circlesArray.length - 1; j > i; j--){
                let circle1 = circlesArray[i];
                let circle2 = circlesArray[j];
                let dx = Math.abs(circle1.x - circle2.x);
                let dy = Math.abs(circle1.y - circle2.y);
                let dest = Math.sqrt(dx * dx + dy * dy);
                if(dest < circle1.radius + circle2.radius){
                    if(circle1.square < circle2.square){
                        let buf = circle1;
                        circle1 = circle2;
                        circle2 = buf;
                    }
                    let intersection = Utils.circleIntersection(circle1.radius, circle2.radius, dest);
                    circle1.absorb(intersection);
                    if(circle1.square > this.biggest.square){
                        this.biggest = circle1.square;
                    }
                    circle2.absorb(-intersection);
                    if(circle2.square < Config.circleSquareMin){
                        if(!forDelete.includes(circle2.id)){
                            forDelete.push(circle2.id);
                            if(circle2.userId){
                                deletedUsers.push(circle2.userId);
                            }
                        }
                    }
                }
            }
        }

        for(let i = 0; i < forDelete.length; i++){
            if(!this.circles[forDelete[i]].userId){
                delete this.circles[forDelete[i]];
            }
        }

        return deletedUsers;
    }

    click(userId, x, y){
        let currentCircleId = this.users[userId];
        if(!currentCircleId){
            return;
        }

        let currentCircle = this.circles[currentCircleId];
        if(!currentCircle){
            return;
        }

        let len = Math.sqrt(x * x + y * y);
        let a = Math.acos(x / len) * y / Math.abs(y);
        let newCircleSquare = currentCircle.square * Config.speedChangeSquarePercent;
        let newCircleRadius = Utils.circleRadius(newCircleSquare);
        let dest = currentCircle.radius + newCircleRadius + 1;
        let newCircleX = currentCircle.x + dest * Math.cos(a);
        let newCircleY = currentCircle.y + dest * Math.sin(a);
        let circle = this.addCircle(newCircleX, newCircleY, newCircleSquare);
        circle.speedX = Math.cos(a) * currentCircle.square / newCircleSquare;
        circle.speedY = Math.sin(a) * currentCircle.square / newCircleSquare;
        currentCircle.speedX -= Math.cos(a);
        currentCircle.speedY -= Math.sin(a);
        currentCircle.square -= newCircleSquare;
        currentCircle.updateRadius();
    }

    winner(){
        if(this.biggest.square / this.squareSum > Config.winTrigger){
            return this.biggest;
        }
        else{
            return null;
        }
    }

    updateCurrentTime(){
        this.currentTime = new Date();
    }
}

module.exports = FieldState;