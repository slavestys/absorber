document.addEventListener("DOMContentLoaded", function(){
    var canvas = document.getElementById("osmos");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    var field = new Field(canvas);
    var userInterface = new UserInterface(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);

    document.addEventListener('start_game', function (e) {
        field.start();
    }, false);

    document.addEventListener('game_over', function (e) {
        userInterface.onGameOver(e.detail.code)
    }, false);
});
