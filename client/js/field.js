var Field = function(canvas) {
    var self = this;
    self.canvas = canvas;
    self.ctx = self.canvas.getContext('2d');
    self.circles = [];
    self.timer_id = null;
    self.currentUserId = null;
    self.currentUser = null;
    self.userPoints = [];
    self.canvasPos = Utils.getPosition(canvas);

    self.addCircle = function(x, y, square){
        var circle = new Circle(x, y, square);
        self.circles.push(circle);
        return circle;
    };

    self.draw = function(){
      self.ctx.fillStyle = '#FFFFFF';
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
      for(var i = 0; i < self.circles.length; i++){
          var circle = self.circles[i];
          circle.draw(self.ctx, self.currentUser);
      }
    };

    function takeUserPoint(x1, y1, x2, y2){
        var userPoint = null;
        var userPointIndex = null;
        for(var i = 0; i < self.userPoints.length; i++){
            var x = self.userPoints[i].x;
            var y = self.userPoints[i].y;
            if(x1 <= x && x2 >= x && y1 <= y && y2 >= y){
                userPoint = self.userPoints[i];
                userPointIndex = i;
            }
        }
        if(userPoint){
            self.userPoints.splice(userPointIndex, 1)
        }
        return userPoint;
    }

    function fillZone(x1, y1, x2, y2){
        var maxDiameterX = x2 - x1 - Config.interval;
        var maxDiameterY = y2 - y1 - Config.interval;
        var maxDiameter = (maxDiameterX > maxDiameterY) ? maxDiameterY : maxDiameterX;
        if(maxDiameter < Config.minDiameter){
            return
        }
        var radus = Math.round(Utils.randomInInterval(Config.minDiameter, maxDiameter) / 2);
        var userPoint = takeUserPoint(x1, y1, x2, y2);
        var x = null;
        var y = null;
        if(userPoint){
            x = userPoint.x;
            y = userPoint.y;
            var circle = self.addCircle(x, y, userPoint.data.square);
            circle.userId = userPoint.data.id;
            if(userPoint.data.id == self.currentUserId){
                self.currentUser = circle;
            }
        }
        else
        {
            x = x1 + radus + Config.interval;
            y = y1 + radus + Config.interval;
            var square = radus * radus * Math.PI;
            self.addCircle(x, y, square);
        }
        fillZone(x + radus, y1 + Config.interval, x2, y + radus);
        fillZone(x1 + Config.interval, y + radus, x2, y2);
    }

    self.fill = function(){
        for(var i = 0; i < self.canvas.width; i += Config.maxDiameter){
            for(var j = 0; j < self.canvas.height; j += Config.maxDiameter){
                var i2 = i + Config.maxDiameter;
                i2 = (i2 > self.canvas.width) ? self.canvas.width : i2;
                var j2 = j + Config.maxDiameter;
                j2 = (j2 > self.canvas.height) ? self.canvas.height : j2;
                fillZone(i, j, i2, j2);
            }
        }
    };

    self.tick = function(){
        var tickIntervalSeconds = Config.tickInterval / 1000;
        for(var i = 0; i < self.circles.length; i++){
            var circle = self.circles[i];
            var dx = circle.speedX * tickIntervalSeconds;
            var dy = circle.speedY * tickIntervalSeconds;
            var x = circle.x + dx;
            var y = circle.y + dy;
            if(x - circle.radius < 0){
                x = -(x - circle.radius) + circle.radius;
                circle.speedX = -circle.speedX;
            }
            if(y - circle.radius < 0)
            {
                y = -(y - circle.radius) + circle.radius;
                circle.speedY = -circle.speedY;
            }
            if(x + circle.radius > self.canvas.width){
                x = self.canvas.width - circle.radius - (x + circle.radius - self.canvas.width);
                circle.speedX = -circle.speedX;
            }
            if(y + circle.radius > self.canvas.height){
                y = self.canvas.height - circle.radius - (y + circle.radius - self.canvas.height);
                circle.speedY = -circle.speedY;
            }
            circle.x = x;
            circle.y = y;
        }

        var forDelete = [];
        for(var i = 0; i < self.circles.length; i++){
            for(var j = self.circles.length - 1; j > i; j--){
                var circle1 = self.circles[i];
                var circle2 = self.circles[j];
                var dx = Math.abs(circle1.x - circle2.x);
                var dy = Math.abs(circle1.y - circle2.y);
                var dest = Math.sqrt(dx * dx + dy * dy);
                if(dest < circle1.radius + circle2.radius){
                    var deleteIndex = j;
                    if(circle1.square < circle2.square){
                        var buf = circle1;
                        circle1 = circle2;
                        circle2 = buf;
                        deleteIndex = i;
                    }
                    var intersection = Utils.circleIntersection(circle1.radius, circle2.radius, dest);
                    circle1.absorb(intersection);
                    circle2.absorb(-intersection);
                    if(circle2.square < Config.circleSquareMin){
                        if(!forDelete.includes(deleteIndex)){
                            forDelete.push(deleteIndex);
                            if(circle2.userId == self.currentUserId){
                                self.currentUser = null;
                            }
                        }
                    }
                }
            }
        }

        forDelete.sort(function (a, b) { return a - b });
        for(var i = 0; i < forDelete.length; i++){
            self.circles.splice(forDelete[i] - i, 1);
        }

        self.draw();
    };

    self.start = function(){
        self.draw();
        for(var i = 0; i < self.circles.length; i++){
            var circle = self.circles[i];
            if(circle.userId){
                continue;
            }
            circle.speedX = Utils.randomInInterval(Config.minSpeed, Config.maxSpeed);
            circle.speedY = Utils.randomInInterval(Config.minSpeed, Config.maxSpeed);
        }
        self.timer_id = setInterval(self.tick, Config.tickInterval)
    };

    self.setUsers = function(users){
        var rows = Math.ceil(Math.sqrt(users.length));
        var pointSizeX = self.canvas.width / rows;
        var pointSizeY = self.canvas.height / rows;
        for(var i = 0; i < rows; i++){
            for(var j = 0; j < rows; j++){
                if(i * j + j > users.length){
                    break;
                }
                var x = pointSizeX * i + pointSizeX / 2;
                var y = pointSizeY * j + pointSizeY / 2;
                self.userPoints.push({
                    x: x,
                    y: y,
                    data: users[i * j + j]
                })
            }
        }
    };

    self.setCurrentUserId = function(userId){
        self.currentUserId = userId;
    };

    self.mouseClick = function(event){
        if(!self.currentUser){
            return;
        }

        var x = event.clientX - self.canvasPos.x - self.currentUser.x;
        var y = event.clientY - self.canvasPos.y - self.currentUser.y;
        var len = Math.sqrt(x * x + y * y);
        var a = Math.acos(x / len) * y / Math.abs(y);
        var newCircleSquare = self.currentUser.square * Config.speedChangeSquarePercent;
        var newCircleRadius = Utils.circleRadius(newCircleSquare);
        var dest = self.currentUser.radius + newCircleRadius + 1;
        var newCircleX = self.currentUser.x + dest * Math.cos(a);
        var newCircleY = self.currentUser.y + dest * Math.sin(a);
        var circle = self.addCircle(newCircleX, newCircleY, newCircleSquare);
        circle.speedX = Math.cos(a) * self.currentUser.square / newCircleSquare;
        circle.speedY = Math.sin(a) * self.currentUser.square / newCircleSquare;
        self.currentUser.speedX -= Math.cos(a);
        self.currentUser.speedY -= Math.sin(a);
        self.currentUser.square -= newCircleSquare;
        self.currentUser.updateRadius();
    };

    self.init = function(){
        self.canvas.addEventListener("click", self.mouseClick, false);
    };

    self.init();
};