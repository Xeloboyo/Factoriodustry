
var utils = require("utils");

module.exports = {
    weldspark: new Effect(12, cons(e=>{
        Draw.color(Color.white, Pal.turretHeat, e.fin());
        Lines.stroke(e.fout() * 0.6 + 0.6);

        Angles.randLenVectors(e.id, 3, 15 * e.finpow(), e.rotation, 3, new Floatc2(){get: (x, y) => {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 5 + 0.5);
        }});
    })),
    weldglow: new Effect(20, cons(e=>{
        Draw.color(Color.white, Pal.turretHeat, e.fin());
        Fill.square(e.x,e.y,e.fout() * 0.6 + 0.6);
    })),
    type_point_welder: 0,
    type_line_welder: 1,
    type_large_welder: 2
}