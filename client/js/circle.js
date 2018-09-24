var Circle = function(circleData) {
    var self = this;
    self.square = circleData.square;
    self.speedX = circleData.speedX * Config.clientAnimationKoef;
    self.speedY = circleData.speedY * Config.clientAnimationKoef;
    self.x = circleData.x - circleData.speedX;
    self.y = circleData.y - circleData.speedY;
    self.toSquare = self.square;
    self.squareChangeSpeed = 0;
    self.userId = circleData.userId;

    self.updateRadius = function() {
        self.radius = Utils.circleRadius(self.square);
    };

    self.draw = function(ctx, currentUser, scale) {
        ctx.beginPath();
        let screenX = self.x * scale;
        let screenY = self.y * scale;
        let screenRadius = self.radius * scale;
        if(isNaN(screenRadius)){
            return;
        }
        var radgrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenRadius);
        ctx.arc(screenX, screenY, screenRadius, 0, 2 * Math.PI, false);
        let color1, color2;
        if(currentUser && self.userId == currentUser.userId){
            color1 = '#0000FF';
            color2 = '#000099';
            radgrad.addColorStop(1, '#0000FF');
        }
        else{
            if(currentUser && currentUser.square > self.square){
                color1 = '#00FF00';
                color2 = '#009900';
            }
            else{
                color1 = '#FF0000';
                color2 = '#990000';
            }
        }
        radgrad.addColorStop(1, color1);
        radgrad.addColorStop(0.5, color2);
        radgrad.addColorStop(0, '#FFFFFF');
        ctx.fillStyle = radgrad;
        ctx.fill();
    };

    self.init = function(){
        self.updateRadius();
    };

    self.update =  function(circleData){
        let toX = circleData.x;
        let toY = circleData.y;
        self.speedX = (toX - self.x) * Config.clientAnimationKoef;
        self.speedY = (toY - self.y) * Config.clientAnimationKoef;
        self.toSquare = circleData.square;
        self.squareChangeSpeed = (self.toSquare - self.square) * Config.clientAnimationKoef;
    };

    self.tick = function(){
        self.x += self.speedX;
        self.y += self.speedY;
        if(self.squareChangeSpeed){
            let squareWas = self.square;
            self.square += self.squareChangeSpeed;
            self.updateRadius();
            if((squareWas - self.toSquare) * (self.square - self.toSquare) <= 0){
                self.squareChangeSpeed = 0;
                self.square = self.toSquare;
            }
        }
    };

    self.init();
};