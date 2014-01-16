//Script for demonstrating BeamTrace2D.js

$(function() {
    //Basic drawing stuff
    var canvas = document.getElementById('beamCanvas');
    var ctx;
    if (canvas.getContext)
    {
        ctx = canvas.getContext('2d');
    }
    else
    {
        //Canvas not supported
        console.log("Error: canvas not supported");
    }

    //First init the walls
    var walls = new Array();
    walls.push(new BeamTrace2D.Wall([100,130],[120,220])); //Wall id 0
    walls.push(new BeamTrace2D.Wall([50,55],[220,60])); //Wall id 1
    walls.push(new BeamTrace2D.Wall([220,60],[250,220])); //Wall id 2...
    walls.push(new BeamTrace2D.Wall([50,220],[200,220])); //etc
    walls.push(new BeamTrace2D.Wall([50,220],[50,55]));
    walls.push(new BeamTrace2D.Wall([200,220],[40,230]));
    walls.push(new BeamTrace2D.Wall([40,230],[30,290]));
    walls.push(new BeamTrace2D.Wall([30,290],[60,270]));
    walls.push(new BeamTrace2D.Wall([60,270],[290,270]));
    walls.push(new BeamTrace2D.Wall([290,270],[250,220]));

    //Then a listener and a source
    var listener = new BeamTrace2D.Listener([80,100]);
    var source = new BeamTrace2D.Source([200,80]);

    //Pass the walls and the source to the solver, which does pre-calculations for fast solving
    var reflection_order = 4; //How many reflections do we want to calculate?
    var solver = new BeamTrace2D.Solver(walls,source,reflection_order); //Init the solver

    //**This is stupid, but my chrome works much faster if I do this again (?? some optimization thing ??)**
    solver = new BeamTrace2D.Solver(walls,source,reflection_order);
    //**

    //path_tree will contain the reflection paths according to: [ [[x,y,wall index],[x,y,wall index],[x,y,wall index],...],[path2],... ]
    var path_array = solver.getPaths(listener);

    //A function for painting the solution
    function redraw()
    {
        if(!ctx) return;
        ctx.clearRect(0,0,300,300);
        ctx.lineWidth = 2.0;
        walls.forEach(function(wall){
            wall.draw(ctx);
        });
        ctx.lineWidth = 1.0;
        listener.draw(ctx);
        source.draw(ctx);

        //Draw the paths
        if(path_array)
        {
            for(var i = 0; i < path_array.length; i++) //Go through all reflection paths
            {
                //Draw each path
                var first = true;
                ctx.strokeStyle = "rgba(0,0,255,0.2)";
                ctx.beginPath();
                ctx.lineWidth = 2;
                path_array[i].forEach(function(p){
                    if(first) { ctx.moveTo(p[0],p[1]); first = false; }
                    else { ctx.lineTo(p[0],p[1]); }
                });
                ctx.stroke();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
            }
        }
    }

    //If the walls or source position are updated, the solver needs to be initialized again
    $('#beamCanvas').click(function(e) {
        source.p0 = [e.pageX - $(this).offset().left, e.pageY - $(this).offset().top]; //Change the source position
        solver = new BeamTrace2D.Solver(walls,source,reflection_order); //Init the solver with the new source position
        path_array = solver.getPaths(listener); //Update reflection paths
        redraw();
    });

    //Update the listener position
    $('#beamCanvas').mousemove(function(e) {
        listener.p0 = [e.pageX - $(this).offset().left, e.pageY - $(this).offset().top]; //Change the listener position
        path_array = solver.getPaths(listener); //Update reflection paths
        redraw();
    });

    redraw(); //First redraw
});