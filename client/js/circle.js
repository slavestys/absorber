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
        ctx.arc(self.x * scale, self.y * scale, self.radius * scale, 0, 2 * Math.PI, false);
        if(currentUser && self.userId == currentUser.userId){
            ctx.fillStyle = 'blue';
        }
        else{
            ctx.fillStyle = currentUser && currentUser.square > self.square ? 'green' : 'red';
        }
        ctx.fill();
    };

    self.init = function(){
        self.updateRadius();
    };

    self.absorb = function(intersectionSquare){
        self.square += intersectionSquare;
        self.updateRadius();
    };

    self.init();
};