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

    var startX_o = 50, startY_o = 300,
        endX_o = 50, endY_o = 300;

    //First init the walls
    var walls = new Array();
    walls.push(new BeamTrace2D.Wall([startX_o + 299.64,startY_o + -230.96600000000012], [endX_o + 299.64,endY_o + 378.7939999999999]));
    walls.push(new BeamTrace2D.Wall([startX_o + 299.64,startY_o + 378.7939999999999], [endX_o + 708.9939999999999,endY_o + 378.7939999999999]));
    walls.push(new BeamTrace2D.Wall([startX_o + 718.9939999999999,startY_o + 378.7939999999999], [endX_o + 844.8840000000001,endY_o + 216.2339999999999]));
    walls.push(new BeamTrace2D.Wall([startX_o + 844.8840000000001,startY_o + 216.2339999999999], [endX_o + 844.8840000000001,endY_o + -72.47000000000014]));
    walls.push(new BeamTrace2D.Wall([startX_o + 844.8840000000001,startY_o + -72.47000000000014], [endX_o + 718.9939999999999,endY_o + -230.96600000000012]));
    walls.push(new BeamTrace2D.Wall([startX_o + 708.9939999999999,startY_o + -230.96600000000012], [endX_o + 299.64,endY_o + -230.96600000000012]));
    walls.push(new BeamTrace2D.Wall([startX_o + 636.0923579850919,startY_o + -40.27243042306405], [endX_o + 788.492357985092,endY_o + -40.27243042306405]));
    walls.push(new BeamTrace2D.Wall([startX_o + 788.492357985092,startY_o + -40.27243042306405], [endX_o + 788.492357985092,endY_o + 203.56756957693597]));
    walls.push(new BeamTrace2D.Wall([startX_o + 788.492357985092,startY_o + 203.56756957693597], [endX_o + 636.0923579850919,endY_o + 203.56756957693597]));
    walls.push(new BeamTrace2D.Wall([startX_o + 636.0923579850919,startY_o + 203.56756957693597], [endX_o + 636.0923579850919,endY_o + -40.27243042306405]));
    walls.push(new BeamTrace2D.Wall([startX_o + 310.48514219945184,startY_o + 273.02427986267463], [endX_o + 382.74914219945185,endY_o + 273.02427986267463]));
    walls.push(new BeamTrace2D.Wall([startX_o + 382.74914219945185,startY_o + 273.02427986267463], [endX_o + 382.74914219945185,endY_o + 311.2110798626746]));
    walls.push(new BeamTrace2D.Wall([startX_o + 382.74914219945185,startY_o + 311.2110798626746], [endX_o + 310.48514219945184,endY_o + 311.2110798626746]));
    walls.push(new BeamTrace2D.Wall([startX_o + 310.48514219945184,startY_o + 311.2110798626746], [endX_o + 310.48514219945184,endY_o + 273.02427986267463]));
    walls.push(new BeamTrace2D.Wall([startX_o + 303.369187006568,startY_o + -110.64402554010387], [endX_o + 354.18217481144603,endY_o + -110.64402554010387]));
    walls.push(new BeamTrace2D.Wall([startX_o + 354.18217481144603,startY_o + -110.64402554010387], [endX_o + 354.18217481144603,endY_o + -59.22500114985996]));
    walls.push(new BeamTrace2D.Wall([startX_o + 354.18217481144603,startY_o + -59.22500114985996], [endX_o + 303.369187006568,endY_o + -59.22500114985996]));
    walls.push(new BeamTrace2D.Wall([startX_o + 303.369187006568,startY_o + -59.22500114985996], [endX_o + 303.369187006568,endY_o + -110.64402554010387]));
    walls.push(new BeamTrace2D.Wall([startX_o + 356.6813189393755,startY_o + 48.24394768920634], [endX_o + 537.3700901258161,endY_o + 48.24394768920634]));
    walls.push(new BeamTrace2D.Wall([startX_o + 537.3700901258161,startY_o + 48.24394768920634], [endX_o + 537.3700901258161,endY_o + 108.78639472310464]));
    walls.push(new BeamTrace2D.Wall([startX_o + 537.3700901258161,startY_o + 108.78639472310464], [endX_o + 356.6813189393755,endY_o + 108.78639472310464]));
    walls.push(new BeamTrace2D.Wall([startX_o + 356.6813189393755,startY_o + 108.78639472310464], [endX_o + 356.6813189393755,endY_o + 48.24394768920634]));
    walls.push(new BeamTrace2D.Wall([startX_o + 567.0735990696775,startY_o + -152.28846869204065], [endX_o + 582.4276190696775,endY_o + -152.28846869204065]));
    walls.push(new BeamTrace2D.Wall([startX_o + 582.4276190696775,startY_o + -152.28846869204065], [endX_o + 582.4276190696775,endY_o + -90.61326869204066]));
    walls.push(new BeamTrace2D.Wall([startX_o + 582.4276190696775,startY_o + -90.61326869204066], [endX_o + 567.0735990696775,endY_o + -90.61326869204066]));
    walls.push(new BeamTrace2D.Wall([startX_o + 567.0735990696775,startY_o + -90.61326869204066], [endX_o + 567.0735990696775,endY_o + -152.28846869204065]));
    walls.push(new BeamTrace2D.Wall([startX_o + 691.9219126297223,startY_o + 57.47733355551917], [endX_o + 737.8063697725795,endY_o + 57.47733355551917]));
    walls.push(new BeamTrace2D.Wall([startX_o + 737.8063697725795,startY_o + 57.47733355551917], [endX_o + 737.8063697725795,endY_o + 108.84110498409059]));
    walls.push(new BeamTrace2D.Wall([startX_o + 737.8063697725795,startY_o + 108.84110498409059], [endX_o + 691.9219126297223,endY_o + 108.84110498409059]));
    walls.push(new BeamTrace2D.Wall([startX_o + 691.9219126297223,startY_o + 108.84110498409059], [endX_o + 691.9219126297223,endY_o + 57.47733355551917]));
    walls.push(new BeamTrace2D.Wall([startX_o + 333.4243443110612,startY_o + -229.1807623437545], [endX_o + 377.82214431106115,endY_o + -229.1807623437545]));
    walls.push(new BeamTrace2D.Wall([startX_o + 377.82214431106115,startY_o + -229.1807623437545], [endX_o + 377.82214431106115,endY_o + -171.42956234375453]));
    walls.push(new BeamTrace2D.Wall([startX_o + 377.82214431106115,startY_o + -171.42956234375453], [endX_o + 333.4243443110612,endY_o + -171.42956234375453]));
    walls.push(new BeamTrace2D.Wall([startX_o + 333.4243443110612,startY_o + -171.42956234375453], [endX_o + 333.4243443110612,endY_o + -229.1807623437545]));
    walls.push(new BeamTrace2D.Wall([startX_o + 242.45422323749582,startY_o + 29.910551657927165], [endX_o + 459.6542232374958,endY_o + 29.910551657927165]));
    walls.push(new BeamTrace2D.Wall([startX_o + 459.6542232374958,startY_o + 29.910551657927165], [endX_o + 459.6542232374958,endY_o + 124.32895165792718]));
    walls.push(new BeamTrace2D.Wall([startX_o + 459.6542232374958,startY_o + 124.32895165792718], [endX_o + 242.45422323749582,endY_o + 124.32895165792718]));
    walls.push(new BeamTrace2D.Wall([startX_o + 242.45422323749582,startY_o + 124.32895165792718], [endX_o + 242.45422323749582,endY_o + 29.910551657927165]));
    walls.push(new BeamTrace2D.Wall([startX_o + 181.94767466798783,startY_o + 75.29138574408614], [endX_o + 426.9696746679879,endY_o + 75.29138574408614]));
    walls.push(new BeamTrace2D.Wall([startX_o + 426.9696746679879,startY_o + 75.29138574408614], [endX_o + 426.9696746679879,endY_o + 84.92870574408614]));
    walls.push(new BeamTrace2D.Wall([startX_o + 426.9696746679879,startY_o + 84.92870574408614], [endX_o + 181.94767466798783,endY_o + 84.92870574408614]));
    walls.push(new BeamTrace2D.Wall([startX_o + 181.94767466798783,startY_o + 84.92870574408614], [endX_o + 181.94767466798783,endY_o + 75.29138574408614]));
    walls.push(new BeamTrace2D.Wall([startX_o + 396.0292461218313,startY_o + -230.966003438797], [endX_o + 641.0512461218314,endY_o + -230.966003438797]));
    walls.push(new BeamTrace2D.Wall([startX_o + 641.0512461218314,startY_o + -230.966003438797], [endX_o + 641.0512461218314,endY_o + -221.32868343879701]));
    walls.push(new BeamTrace2D.Wall([startX_o + 641.0512461218314,startY_o + -221.32868343879701], [endX_o + 396.0292461218313,endY_o + -221.32868343879701]));
    walls.push(new BeamTrace2D.Wall([startX_o + 396.0292461218313,startY_o + -221.32868343879701], [endX_o + 396.0292461218313,endY_o + -230.966003438797]));
    walls.push(new BeamTrace2D.Wall([startX_o + 742.8867633572285,startY_o + 40.75093956612989], [endX_o + 862.8867633572285,endY_o + 40.75093956612989]));
    walls.push(new BeamTrace2D.Wall([startX_o + 862.8867633572285,startY_o + 40.75093956612989], [endX_o + 862.8867633572285,endY_o + 123.22253956612988]));
    walls.push(new BeamTrace2D.Wall([startX_o + 862.8867633572285,startY_o + 123.22253956612988], [endX_o + 742.8867633572285,endY_o + 123.22253956612988]));
    walls.push(new BeamTrace2D.Wall([startX_o + 742.8867633572285,startY_o + 123.22253956612988], [endX_o + 742.8867633572285,endY_o + 40.75093956612989]));

    //Then a listener and a source
    // var listener = new BeamTrace2D.Listener([80,100]);
    // var source = new BeamTrace2D.Source([200,80]);

    var listener = new BeamTrace2D.Listener([682.3710000000002,235.45799999999986]);
    var source = new BeamTrace2D.Source([460.88300000000015,103.88600000000008]);

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
        ctx.clearRect(0,0,1000,1000);
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