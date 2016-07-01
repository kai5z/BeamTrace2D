QUnit.test( "generate path_array", function( assert ) {

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

    assert.ok(path_array !== null, "is not null");
    assert.ok(path_array.constructor === Array, "is an array");
    assert.equal(path_array.length, 16, "has length 16");
});