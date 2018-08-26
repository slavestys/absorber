document.addEventListener("DOMContentLoaded", function(){
    var canvas = document.getElementById("osmos");
    var field = new Field(canvas);
    field.setUsers([
        {
            square: 250,
            id: 1
        }
    ]);
    field.setCurrentUserId(1);
    field.fill();
    field.start();
});
