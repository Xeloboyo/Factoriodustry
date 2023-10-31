
function drawItemCluster(x,y,item,am,randpos,startp)
{
	if (am>0)
    {
		am = Math.min(am,100);
		for (var i = 0;i<am;i++)
        {
			Draw.rect(item.fullIcon, x+randpos[(i+startp)%randpos.length].x, y+randpos[(i+startp)%randpos.length].y, 5,5);
		}
	}
}

function drawItemClusterRotated(x,y,item,am,randpos,startp,ang)
{
	if (am>0)
	{
		am = Math.min(am,100);
		let s = Mathf.sin(ang);
		let c = Mathf.cos(ang);

		for (var i = 0;i<am;i++)
		{
			let rx = randpos[(i+startp)%randpos.length].x;
			let ry = randpos[(i+startp)%randpos.length].y;
			Draw.rect(item.fullIcon, x+s*rx-c*ry, y+s*ry+c*rx, 5,5);
		}
	}
}

function deepCopy(obj)
{
	var clone = {};
	for (var i in obj) {
		if (Array.isArray(obj[i])) {
			clone[i] = [];
			for (var z in obj[i]) {
				if (typeof(obj[i][z]) == "object" && obj[i][z] != null) {
					clone[i][z] = deepCopy(obj[i][z]);
				} else {
					clone[i][z] = obj[i][z];
				}
			}
		} else if (typeof(obj[i]) == "object" && obj[i] != null)
			clone[i] = deepCopy(obj[i]);
		else
			clone[i] = obj[i];
	}
	return clone;
}

module.exports = {

readString: (path) =>
{
    return Vars.tree.get(path, true).readString();
},

eachType: (type, lamb) =>
{
    Vars.content.getBy(type).each(lamb);
},

Cbezierlerp2: (x,y,x2,y2,x3,y3,x4,y4,t) =>
{
	var te3 = t*t*t;
	var t3 = 3*t;
	var t32 = t3*t;
	var a1 = -te3   +t32 - t3 + 1;
	var a2 = te3*3  -2*t32 + t3;
	var a3 = -te3*3 + t32;
	var a4 = te3;
	var t6 = 6*t;
	var b1 = -t32 + t6 - 3;
	var b2 = t32*3 - t6*2 + 3;
	var b3 = -t32*3 + t6;
	var b4 = t32;
	
	return [a1*x + a2*x2 + a3*x3 + a4*x4, a1*y + a2*y2 + a3*y3 + a4*y4, 
			b1*x + b2*x2 + b3*x3 + b4*x4, b1*y + b2*y2 + b3*y3 + b4*y4];
},

Load: (name) =>
{
    return Core.atlas.find(name);
},

heatColor: (heatcolor, a) =>
{
	if (a < 0.01) return new Color(Color.clear);
	let fcol = new Color(heatcolor.r,heatcolor.g,heatcolor.b,a);
	if (a > 1)
    {
		fcol.add(0,0,0.01*a);
		fcol.mul(a);
	}
	return fcol;
},

drawOrientedRect: (tex,x,y,ox,oy,rotdeg,rot) =>
{
	Draw.rect(tex,x + Mathf.cosDeg(rotdeg-90)*ox + Mathf.sinDeg(rotdeg-90)*oy,y + Mathf.sinDeg(rotdeg-90)*ox - Mathf.cosDeg(rotdeg-90)*oy,rot+rotdeg);
},

drawOrientedLine: (tex,x,y,ox,oy,ox2,oy2,rotdeg) =>
{
	let c = Mathf.cosDeg(rotdeg-90);
	let s = Mathf.sinDeg(rotdeg-90);
	Lines.line(tex,   x + c*ox + s*oy,y + s*ox - c*oy,   x + c*ox2 + s*oy2,y + s*ox2 - c*oy2,   false);
},

createOrientedEffect: (eff,x,y,ox,oy,rotdeg,rot) =>
{
	eff.at(x + Mathf.cosDeg(rotdeg-90)*ox + Mathf.sinDeg(rotdeg-90)*oy,y + Mathf.sinDeg(rotdeg-90)*ox - Mathf.cosDeg(rotdeg-90)*oy,rot);
},

drawItemCluster: drawItemCluster,
drawItemClusterRotated: drawItemClusterRotated,

drawItemClusterInventory: (x,y,item,items,randpos,startp) => drawItemCluster(x,y,item,items.get(item),randpos,startp),

getRegion: (region, tile,sheetw,sheeth) =>
{
    if (!region) {
        print("oh no there is no texture");
        return;
    }
    let nregion = new TextureRegion(region);
    let tilew = (nregion.u2 - nregion.u)/sheetw;
	let tileh = (nregion.v2 - nregion.v)/sheeth;
	let tilex = (tile%sheetw)/sheetw;
	let tiley = Math.floor(tile/sheetw)/sheeth;
	
	nregion.u = Mathf.map(tilex,0,1,nregion.u,nregion.u2);
	nregion.v = Mathf.map(tiley,0,1,nregion.v,nregion.v2); 
	nregion.u2 = nregion.u+tilew;
	nregion.v2 = nregion.v+tileh;
	nregion.width = region.width/sheetw;
	nregion.height = region.height/sheeth;
    return nregion;
},

deepCopy: (b) => deepCopy(b)

}
