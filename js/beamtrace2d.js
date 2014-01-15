/****
 * BeamTrace2D v 1.0
 *
 * =======
 *
 * Copyright (C) 2014 Kai Saksela
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * TLDR; Feel free to play with the code, as long as you mention my name if you publish it somewhere.
 *
 * =======
 *
 * This code is for testing different beam tracing techniques in a simplified 2D environment. The basic principles are very loosely based on the (much more complicated) EVERT beam tracing library:
 * - BSP trees (in this case the splitting planes are not aligned) for accelerated ray tracing
 * - Beam trees with polygon ID's
 * - The optimization techniques are absent in this version, so it's not nearly as fast as it would be with them
 *
 */

var BeamTrace2D = {};

/* The class for a wall */
BeamTrace2D.Wall = function(p1,p2)
{
    this.p1 = p1;
    this.p2 = p2;
};
BeamTrace2D.Wall.prototype.draw = function(ctx)
{
    ctx.beginPath();
    ctx.moveTo(this.p1[0], this.p1[1]);
    ctx.lineTo(this.p2[0], this.p2[1]);
    ctx.stroke();
};

/* The class for the listener */
BeamTrace2D.Listener = function(p0)
{
    this.p0 = p0;
}
BeamTrace2D.Listener.prototype.draw = function(ctx)
{
    var old_fill = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(this.p0[0], this.p0[1], 10, 0, 2*Math.PI);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = old_fill;
}

/* The class for the source */
BeamTrace2D.Source = function(p0)
{
    this.p0 = p0;
}
BeamTrace2D.Source.prototype.draw = function(ctx)
{
    var old_fill = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(this.p0[0],this.p0[1],10,0,2*Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = old_fill;
}

/* The solver */
BeamTrace2D.Solver = function(b_walls,b_source,reflection_order) {
    "use strict";
    this.MAX_ORDER = typeof reflection_order !== 'undefined' ? reflection_order : 4; //Max order of reflections, default 4

    //Private variables (if these are changed the solution will be invalid, source movement requires init)
    var walls = b_walls;
    var source = b_source;
    var bsp;
    var beams;

    /* SOME GENERAL FUNCTIONS */

    /* Returns the intersection point of two lines along with some additional information */
    /* This function is a modified version of: http://jsfiddle.net/justin_c_rounds/Gd2S2/light/ */
    function lineIntersection(x11, y11, x12, y12, x21, y21, x22, y22)
    {
        var denominator, a, b, numerator1, numerator2;
        var result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false,
            onRay1: false,
            onRay2: false
        };
        denominator = ((y22 - y21) * (x12 - x11)) - ((x22 - x21) * (y12 - y11));
        if (denominator == 0) {
            return null;
        }
        a = y11 - y21;
        b = x11 - x21;
        numerator1 = ((x22 - x21) * a) - ((y22 - y21) * b);
        numerator2 = ((x12 - x11) * a) - ((y12 - y11) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;
        result.x = x11 + (a * (x12 - x11));
        result.y = y11 + (a * (y12 - y11));
        if (a > 0)
        {
            result.onRay1 = true;
            if(a < 1){
                result.onLine1 = true;
            }
        }
        if(b > 0){
            result.onRay2 = true;
            if(b < 1) {
                result.onLine2 = true;
            }
        }
        return [result.x, result.y, result.onLine1, result.onLine2, result.onRay1, result.onRay2];
    }

    /* Returns true if p0 is in front of line defined by p1,p2 */
    /* The most important thing is that we have a convention for defining the normal */
    function inFrontOf(p0,p1,p2)
    {
        //Line normal
        var n1 = [-(p2[1]-p1[1]),(p2[0]-p1[0])];
        //Dot product for distance after translating so dist is relative to origo
        return n1[0]*(p0[0]-p1[0])+n1[1]*(p0[1]-p1[1]) > 0;
    }

    /* Mirrors point p0 along line defined by p1 and p2*/
    function pointMirror(p0,p1,p2)
    {
        //Line normal
        var n1 = [-(p2[1]-p1[1]),(p2[0]-p1[0])];
        var n1_len = Math.sqrt(n1[0]*n1[0]+n1[1]*n1[1]);
        n1 = [n1[0]/n1_len,n1[1]/n1_len];
        //Dot product for distance after translating so dist is relative to origo
        var dist = 2*(n1[0]*(p0[0]-p1[0])+n1[1]*(p0[1]-p1[1]));
        //New point is negative normal x distance added to original position
        return [p0[0] - n1[0]*dist, p0[1] - n1[1]*dist];
    }

    /* THE LOGIC FOR BSP */

    /* The class for a BSP node */
    var BSPNode = function(id,p1,p2)
    {
        this.id = id; //Wall ID
        this.front = new Array(); //Front BSPs
        this.back = new Array(); //Back BSPs
        this.p1 = p1; //Point 1
        this.p2 = p2; //Point 2
    }
    /* Checks if the points in w2 are in front of w1. Normal is defined as: ([-(w1.p2[1]-w1-p1[1]),(w1.p2[0]-w1.p1[0)]) ) () */
    /* Note, we're using two sided walls here so the normal direction doesn't really matter */
    function BSPDivide(w1,w2)
    {
        //Check if the points in w2 are in front of or behind w1
        var w2_n = [inFrontOf(w2.p1,w1.p1,w1.p2), inFrontOf(w2.p2,w1.p1,w1.p2)];

        if(w2_n[0] && w2_n[1])
        {
            return 1;//Both line points are in front of section (w1)
        }
        if(!w2_n[0] && !w2_n[1])
        {
            return -1;//Both line points are behind section (w1)
        }
        //We need to divide the lines.
        var p3 = lineIntersection(w1.p1[0],w1.p1[1],w1.p2[0],w1.p2[1],w2.p1[0],w2.p1[1],w2.p2[0],w2.p2[1]);
        //Return the divided lines
        if(w2_n[0] > 0)
        {
            //First line point is in front and second behind
            return [{p1:w2.p1, p2:p3},
                    {p1:p3, p2:w2.p2}];
        }
        else
        {
            //First line point is behind and second in front
            return [{p1:p3, p2:w2.p2},
                    {p1:w2.p1, p2:p3}];
        }
    }
    /* Builds a BSP tree from the given array of BSPNodes */
    function BSPBuilder(recursiveArray)
    {
        if(recursiveArray.length == 0)
        {
            return null;
        }

        var node;
        var retval;
        while(recursiveArray.length > 1)
        {
            node = recursiveArray.pop();

            retval = BSPDivide(recursiveArray[0],node);
            if(retval == 1)
            {
                //In front
                recursiveArray[0].front.push(new BSPNode(node.id,node.p1,node.p2));
            }
            else if(retval == -1)
            {
                //Behind
                recursiveArray[0].back.push(new BSPNode(node.id,node.p1,node.p2));
            }
            else
            {
                //Split into two
                recursiveArray[0].front.push(new BSPNode(node.id,retval[0].p1,retval[0].p2));
                recursiveArray[0].back.push(new BSPNode(node.id,retval[1].p1,retval[1].p2));
            }
        }

        recursiveArray[0].front = BSPBuilder(recursiveArray[0].front);
        recursiveArray[0].back = BSPBuilder(recursiveArray[0].back);

        return recursiveArray[0]; //Array with one element, remove array and keep element
    }
    /* The class for a BSP tree */
    var BSPTree = function(walls)
    {
        //0) All walls have an ID, which is defined as their index in the array
        var recursiveArray = new Array();
        for(var i = 0; i < walls.length; i++)
        {
            recursiveArray.push(new BSPNode(i,walls[i].p1,walls[i].p2));
        }
        this.mainNode = BSPBuilder(recursiveArray);
    }

    /* BEAMS AND BEAMTREES */

    /* The class for a beam in 2d. The beam 2D "window" is defined by p1 and p2 */
    var Beam = function(vs, p1, p2)
    {
        this.vs = vs; //Virtual source point
        this.p1 = p1; //Window point 1
        this.p2 = p2; //Window point 2
    }
    /* The class for a node in the beam tree */
    var BeamNode = function(id,parent,vs)
    {
        this.id = id;
        this.parent = parent;
        this.vs = vs;
        this.children = new Array();
    }
    /* Build the beams reflected because of the beam given by parameter "beam" */
    function beamBuild(beam,node,walls,order,MAX_ORDER) //We could apparently also utilize the BSP tree here...?
    {
        if(order > MAX_ORDER)
            return;

        //Make sure the source is mathematically behind the wall; makes things clearer
        if(inFrontOf(beam.vs, beam.p1, beam.p2))
        {
            var temp = beam.p2;
            beam.p2 = beam.p1;
            beam.p1 = temp;
        }

        var hidden;
        for(var i = 0; i < walls.length; i++)
        {
            if(node.id == i)
                continue;
            var new_line;
            //Three segments A, B (inside) and C
            // A_\___/_C
            //     B
            //  <source>
            var p1_b = !inFrontOf(walls[i].p1, beam.p1, beam.p2);
            var p2_b = !inFrontOf(walls[i].p2, beam.p1, beam.p2);
            if(p1_b && p2_b)
                continue; //No way it's intersecting
            var p1_a = !inFrontOf(walls[i].p1, beam.vs, beam.p2);
            var p2_a = !inFrontOf(walls[i].p2, beam.vs, beam.p2);
            if(p1_a && p2_a)
                continue; //No way it's intersecting
            var p1_c = inFrontOf(walls[i].p1, beam.vs, beam.p1);
            var p2_c = inFrontOf(walls[i].p2, beam.vs, beam.p1);
            if(p1_c && p2_c)
                continue; //No way it's intersecting

            //Ok, we might have a hit
            var p1_in = !p1_a && !p1_b && !p1_c;
            var p2_in = !p2_a && !p2_b && !p2_c;

            var A = false;
            var B = false;
            var C = false;
            var int;

            if(p1_in && p2_in)
            {
                //The whole thing's visible
                new_line = {p1: walls[i].p1, p2: walls[i].p2};
            }
            else if(p1_in)
            {
                //p1 is inside the volume, which means p2 is outside
                new_line = {p1: walls[i].p1, p2:-1}; //Define p2 later
                if(p2_a && !p2_b)
                {
                    //Intersection with line next to A
                    A = true;
                }
                else if(p2_a && p2_b && p2_c)
                {
                    //Intersection with A OR B OR C
                    A = true;
                    B = true;
                    C = true;
                }
                else if(p2_a && p2_b)
                {
                    //Intersection with line next to A OR line next to B
                    A = true;
                    B = true;
                }
                else if(!p2_a && p2_b && !p2_c)
                {
                    B = true;
                }
                else if(p2_c && p2_b)
                {
                    B = true;
                    C = true;
                }
                else if(p2_c && !p2_b)
                {
                    C = true;
                }

            }
            else if(p2_in)
            {
                //p2 is inside the volume, which means p1 is outside
                new_line = {p1: walls[i].p2, p2: -1}; //Define p2 later
                if(p1_a && !p1_b)
                {
                    //Intersection with line next to A
                    A = true;
                }
                else if(p1_a && p1_b && p1_c)
                {
                    //Intersection with A OR B OR C
                    A = true;
                    B = true;
                    C = true;
                }
                else if(p1_a && p1_b)
                {
                    //Intersection with line next to A or line next to B
                    A = true;
                    B = true;
                }
                else if(!p1_a && p1_b && !p1_c)
                {
                    //Intersection with line next to B
                    B = true;
                }
                else if(p1_c && p1_b)
                {
                    //Intersection with line next to B or line next to C
                    B = true;
                    C = true;
                }
                else if(p1_c && !p1_b)
                {
                    //Intersetion with line next to C
                    C = true;
                }
            }
            else
            {
                //All points are outside boundaries (two intersections or none)
                if(p1_a && p2_b || p2_a && p1_b)
                {
                    //MAYBE: Intersection with line next to A AND line next to B
                    var int_a = lineIntersection(beam.p2[0],beam.p2[1],beam.p2[0]+(beam.p2[0]-beam.vs[0])*2,beam.p2[1]+(beam.p2[1]-beam.vs[1])*2,walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                    if(int_a[4])
                    {
                        var int_b = lineIntersection(beam.p1[0],beam.p1[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                        new_line = {p1: int_a, p2: int_b};
                    }
                }
                else if(p1_b && p2_c || p2_b && p1_c)
                {
                    //MAYBE: Intersection with line next to B AND line next to C
                    var int_b = lineIntersection(beam.p1[0],beam.p1[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                    if(int_b[4])
                    {
                        var int_c = lineIntersection(beam.p1[0],beam.p1[1],beam.p1[0]+(beam.p1[0]-beam.vs[0])*2,beam.p1[1]+(beam.p1[1]-beam.vs[1])*2,walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                        new_line = {p1: int_b, p2: int_c};
                    }
                }
                else if((p1_a && p2_c || p2_a && p1_c) && (!p1_b && !p2_b))
                {
                    //Intersection with A and C
                    var int_a = lineIntersection(beam.p2[0],beam.p2[1],beam.p2[0]+(beam.p2[0]-beam.vs[0])*2,beam.p2[1]+(beam.p2[1]-beam.vs[1])*2,walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                    var int_c = lineIntersection(beam.p1[0],beam.p1[1],beam.p1[0]+(beam.p1[0]-beam.vs[0])*2,beam.p1[1]+(beam.p1[1]-beam.vs[1])*2,walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                    new_line = {p1: int_a, p2: int_c};
                }
            }

            //Intersection with line next to A
            if(A && !B && !C) int = lineIntersection(beam.vs[0],beam.vs[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
            else if(A && B && C)
            {
                //Intersection with line next to A OR line next to B OR line next to C
                int = lineIntersection(beam.p2[0],beam.p2[1],beam.p2[0]+(beam.p2[0]-beam.vs[0]),beam.p2[1]+(beam.p2[1]-beam.vs[1]),walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                if(!int[4])
                    int = lineIntersection(beam.p1[0],beam.p1[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                if(!int[4])
                    int = lineIntersection(beam.p1[0],beam.p1[1],beam.p1[0]+(beam.p1[0]-beam.vs[0])*2,beam.p1[1]+(beam.p1[1]-beam.vs[1])*2,walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
            }
            else if(A && B)
            {
                //Intersection with line next to A OR line next to B
                int = lineIntersection(beam.p2[0],beam.p2[1],beam.p2[0]+(beam.p2[0]-beam.vs[0]),beam.p2[1]+(beam.p2[1]-beam.vs[1]),walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                if(!int[4])
                    int = lineIntersection(beam.p1[0],beam.p1[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
            }
            else if(!A && B && !C) int = lineIntersection(beam.p1[0],beam.p1[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
            else if(B && C)
            {
                //Intersection with line next to B OR line next to C
                int = lineIntersection(beam.p1[0],beam.p1[1],beam.p2[0],beam.p2[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
                if(!int[4])
                    int = lineIntersection(beam.p1[0],beam.p1[1],beam.p1[0]+(beam.p1[0]-beam.vs[0]),beam.p1[1]+(beam.p1[1]-beam.vs[1]),walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);
            }
            else if(!A && !B && C) int = lineIntersection(beam.vs[0],beam.vs[1],beam.p1[0],beam.p1[1],walls[i].p1[0],walls[i].p1[1],walls[i].p2[0],walls[i].p2[1]);

            if(int)
            {
                new_line.p2 = int;
            }

            if(new_line)
            {
                var new_beam = new Beam(pointMirror(beam.vs, walls[i].p1, walls[i].p2),new_line.p1,new_line.p2);
                node.children.push(new BeamNode(i,node,new_beam.vs));
                beamBuild(new_beam, node.children[node.children.length - 1], walls, order + 1, MAX_ORDER);
            }

        }
    }
    /* The class for a Beam tree */
    var BeamTree = function(source,walls,MAX_ORDER)
    {
        this.mainNode = new BeamNode(-1,-1,source.p0); //Wall id -1 represents the real source

        //While constructing the beam tree, we always need to remember the beams at the leafs and can forget the rest
        var beams = new Array();
        for(var i = 0; i < walls.length; i++)
        {
            var vs = pointMirror(source.p0, walls[i].p1, walls[i].p2);
            beams.push(new Beam(vs, walls[i].p1, walls[i].p2));
            this.mainNode.children.push(new BeamNode(i,this.mainNode,vs)); //Create the first generation of beams (first leafs)

            //Recursively do the children.
            var order = 0;
            beamBuild(beams[beams.length - 1], this.mainNode.children[this.mainNode.children.length - 1], walls, order, MAX_ORDER);
        }
    }

    /* RAY TRACING */


    /* Returns the intersection point of the wall with id valid_id, looking from p1 towards p2, otherwise null */
    function rayTrace(p1,p2,bsp_node,ignore_id,valid_id,order) //The pedantic person might point out that these are not rays, but lines, we're testing
    {
        if(isNaN (order-0) || order == null)
            order=0;

        if(!bsp_node) return null; //We reached the end of the BSP tree

        //Ray tracing utilizing front-to-back ordering of the BSP tree
        var int = null;
        if(inFrontOf(p1,bsp_node.p1,bsp_node.p2))//positive_side_of(bsp_node,p1))
        {
            int = rayTrace(p1,p2,bsp_node.front,ignore_id,valid_id,order);
            if(!int || !int[2] || !int[3]) {
                order++;
                int = lineIntersection(p1[0],p1[1],p2[0],p2[1],bsp_node.p1[0],bsp_node.p1[1],bsp_node.p2[0],bsp_node.p2[1]);//RAYTRACE current node
                if(bsp_node.id == ignore_id) int = null;
                if(int) int.push(bsp_node.id);
            }
            if((!int || !int[2] || !int[3]))// //No intersection found yet
                int = rayTrace(p1,p2,bsp_node.back,ignore_id,valid_id,order);
        }
        else
        {
            int = rayTrace(p1,p2,bsp_node.back,ignore_id,valid_id,order);
            if(!int || !int[2] || !int[3]) {
                order++;
                int = lineIntersection(p1[0],p1[1],p2[0],p2[1],bsp_node.p1[0],bsp_node.p1[1],bsp_node.p2[0],bsp_node.p2[1]);//RAYTRACE current node
                if(bsp_node.id == ignore_id) int = null;
                if(int) int.push(bsp_node.id);
            }
            if((!int || !int[2] || !int[3]))// No intersection found yet
                int = rayTrace(p1,p2,bsp_node.front,ignore_id,valid_id,order);
        }

        return int;
    }

    /* Traverse the beam at the given node recursively while testing for intersections. */
    /* Don't use parameters prev_node,p_tree when calling from another function! These are used for recursion */
    function traverseBeam(p0,walls,bsp,node,prev_node,p_tree)
    {
        if(arguments.length == 4) //First call
        {
            prev_node = {id: -1}; //No walls to ignore in ray tracing yet
            p_tree = [p0]; //Add the listener location to the path
        }

        //1) Find intersection from location to next image source
        // - Ignore prev_node.id (the wall with the previous intersection)
        var int = rayTrace(p0,node.vs,bsp.mainNode,prev_node.id,node.id);
        if(!int || (node.id != -1 && int[int.length - 1] != node.id) || !int[2] || !int[3])
            int = null; //Intersection with something else than the beam window or the intersection wasn't inside the window

        if(node.id == -1) //The path to the source -> require no line intersections
        {
            if(!int) //If there are no intersection points, we are done and everything is good
            {
                p_tree.push(node.vs); //Finally add the original source to the path
                return p_tree; // all done!
            }
            else{
                return null; //The path to the source is blocked
            }
        }
        else
        {
            //If there are no valid intersection points, the path isn't valid
            if(!int) return null;
            else
            {
                //We found an intersection, continue on to the parent node in the beam tree
                p_tree.push(int);
                p_tree = traverseBeam(int,walls,bsp,node.parent,node,p_tree);
                return p_tree;
            }
        }
    }

    /* Recursive function for going through all beams. All beam paths are tested against the listener. node should first be beamTree's mainNode */
    /* Returns the reflection paths according to: [ [[x,y,wall index],[x,y,wall index],[x,y,wall index],...],[path2],... ] */
    function findPaths(listener,walls,bsp,node)
    {
        var path_array = [];
        for(var i = 0; i < node.children.length; i++) //Go through all nodes recursively
        {
            path_array = path_array.concat(findPaths(listener,walls,bsp,node.children[i]));
        }
        var p_tree = traverseBeam(listener.p0,walls,bsp,node);//Find all valid paths to current beam node
        if(p_tree) //If we found a valid path...
            path_array.push(p_tree); //...add it to the path array
        return path_array; //An array of arrays
    }

    /* Initialization */
    bsp = new BSPTree(walls);
    beams = new BeamTree(source,walls,this.MAX_ORDER);

    /* Public stuff */
    this.getPaths = function(listener) {
        if(typeof listener !== 'undefined')
        {
            return findPaths(listener,walls,bsp,beams.mainNode);
        }
        else
        {
            console.log("BeamTrace2D update error: no listener defined!");
            return;
        }
    };
};