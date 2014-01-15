//Script for demonstrating BeamTrace2D.js

$(function() {
    var walls = new Array();
    walls.push(new BeamTrace2D.Wall([100,130],[120,220]));
    walls.push(new BeamTrace2D.Wall([50,55],[220,60]));
    walls.push(new BeamTrace2D.Wall([220,60],[250,220]));
    walls.push(new BeamTrace2D.Wall([50,220],[200,220]));
    walls.push(new BeamTrace2D.Wall([50,220],[50,55]));
    walls.push(new BeamTrace2D.Wall([200,220],[40,230]));
    walls.push(new BeamTrace2D.Wall([40,230],[30,290]));
    walls.push(new BeamTrace2D.Wall([30,290],[60,270]));
    walls.push(new BeamTrace2D.Wall([60,270],[290,270]));
    walls.push(new BeamTrace2D.Wall([290,270],[250,220]));
    var listener = new BeamTrace2D.Listener([80,100]);
    var source = new BeamTrace2D.Source([200,80]);

    var solver = new BeamTrace2D.Solver(walls,source,4); //Init the solver
    solver = new BeamTrace2D.Solver(walls,source,4); //Init the solver again.. this is stupid, but chrome works much faster this way (?? some optimization thing ??)

    var canvas = document.getElementById("beamCanvas");
    if(canvas.getContext)
    {
        var ctx = canvas.getContext("2d");

        ctx.lineWidth = 2.0;
        walls.forEach(function(wall){
            wall.draw(ctx);
        });
        ctx.lineWidth = 1.0;
        listener.draw(ctx);
        source.draw(ctx);
    }

    $('#beamCanvas').click(function(e) {
        source.p0 = [e.offsetX, e.offsetY];
        solver = new BeamTrace2D.Solver(walls,source,4); //Init the solver

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,300,300);
        solver.update(listener);
        ctx.lineWidth = 2.0;
        walls.forEach(function(wall){
            wall.draw(ctx);
        });
        ctx.lineWidth = 1.0;
        listener.draw(ctx);
        source.draw(ctx);
    });


    $('#beamCanvas').mousemove(function(e) {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,300,300);

        listener.p0 = [e.offsetX, e.offsetY];
        solver.update(listener);

        ctx.lineWidth = 2.0;
        walls.forEach(function(wall){
            wall.draw(ctx);
        });
        ctx.lineWidth = 1.0;
        listener.draw(ctx);
        source.draw(ctx);
    });

});