var Circle = function(circleData) {
    var self = this;
    self.x = circleData.x;
    self.y = circleData.y;
    self.square = circleData.square;
    self.speedX = circleData.speedX;
    self.speedY = circleData.speedY;
    self.userId = circleData.userId;

    self.updateRadius = function() {
        self.radius = Utils.circleRadius(self.square);
    };

    self.draw = function(ctx, currentUser, scale) {
        ctx.beginPath();
        let screenX = self.x * scale;
        let screenY = self.y * scale;
        let screenRadius = self.radius * scale;
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

    self.absorb = function(intersectionSquare){
        self.square += intersectionSquare * (Config.clientTickInterval / Config.serverTickInterval);
        self.updateRadius();
    };

    self.init();
};