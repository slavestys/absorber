var Circle = function(x, y, square) {
    var self = this;
    self.x = x;
    self.y = y;
    self.square = square;
    self.speedX = 0;
    self.speedY = 0;

    self.updateRadius = function() {
        self.radius = Math.ceil(Math.sqrt(self.square / Math.PI));
    };

    self.draw = function(ctx) {
        ctx.beginPath();
        ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
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