document.addEventListener("DOMContentLoaded", function(){
    var canvas = document.getElementById("absorber");
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

    document.addEventListener('game_starting', function (e) {
        userInterface.onGameStarting(e.detail);
    }, false);

    document.addEventListener('game_started', function(e) {
        userInterface.onGameStarted();
    });

    document.addEventListener('begin_game', function(e) {
        field.beginGame();
    });
});
