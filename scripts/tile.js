
const _dirs = [
	{ x: 1,  y: 0  },
	{ x: 0,  y: 1  },
	{ x: -1, y: 0  },
	{ x: 0,  y: -1 }
]
const tilechkdirs = [
	{x:-1,y: 1},{x:0,y: 1},{x:1,y: 1},
	{x:-1,y: 0},/*[tile]*/ {x:1,y: 0},
	{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},
]

const tileMap = [//not sure how to format this.
	39,39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,39,
	39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,3,
	3,15,15,3,3,15,15,5,5,29,31,5,5,29,31,4,
	4,40,40,4,4,20,20,28,28,10,11,28,28,23,32,3,
	3,15,15,3,3,15,15,2,2,9,14,2,2,9,14,4,
	4,40,40,4,4,20,20,30,30,47,44,30,30,22,6,39,
	39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,39,
	39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,3,
	3,15,15,3,3,15,15,5,5,29,31,5,5,29,31,0,
	0,42,42,0,0,12,12,8,8,35,34,8,8,33,7,3,
	3,15,15,3,3,15,15,2,2,9,14,2,2,9,14,0,
	0,42,42,0,0,12,12,1,1,45,18,1,1,19,13
]
function _getRegion(region, tile) {
    if (!region) {
        print("oh no there is no texture");
        return;
    }
    let nregion = new TextureRegion(region);
    let tilew = (nregion.u2 - nregion.u)/12.0;
	let tileh = (nregion.v2 - nregion.v)/4.0;
	let tilex = (tile%12)/12.0;
	let tiley = Math.floor(tile/12)/4.0;
	
	nregion.u = Mathf.map(tilex,0,1,nregion.u,nregion.u2)+tilew*0.02;
	nregion.v = Mathf.map(tiley,0,1,nregion.v,nregion.v2)+tileh*0.02; //y is flipped h 
	nregion.u2 = nregion.u+tilew*0.96;
	nregion.v2 = nregion.v+tileh*0.96;
	nregion.width = 32;
	nregion.height = 32;
    return nregion;
}

function drawConnectedTile(region, x, y, w, h, rot, tile) {
    Draw.rect(utils.getRegion(region, tile) , x, y, w, h, w * 0.5, h * 0.5, rot);
}

function init(shadowRegion){
	return {
		index: [],
		shadowreg:[],
		onProximityUpdate(){
			this.super$onProximityUpdate();
			if(this.block.size==1){
				let ind = 0;
				for(let i =0;i<8;i++){
					let b = this.nearby(tilechkdirs[i].x, tilechkdirs[i].y);
					if(b && b instanceof Wall.WallBuild){
						ind+= 1<<i;
					}
				}
				this.shadowreg[0] = _getRegion(shadowRegion,tileMap[ind]);
			}else{
				let offsetx = -Math.floor((this.block.size - 1) / 2);
				let offsety = -Math.floor((this.block.size - 1) / 2);
				let regind = 0;
				for(let a =0;a<this.block.size;a++){
					for(let b =0;b<this.block.size;b++){
						let wx = b + offsetx + this.tile.x;
						let wy = a + offsety + this.tile.y;
						
						let ind = 0;
						for(let i =0;i<8;i++){
							let b =  Vars.world.build(wx+tilechkdirs[i].x, wy+tilechkdirs[i].y);
							if(b && b instanceof Wall.WallBuild){
								ind+= 1<<i;
							}
						}
						this.shadowreg[regind] = _getRegion(shadowRegion,tileMap[ind]);
						regind++;
					}
				}
			}
			
		},
		draw(){
			this.super$draw();
			if(this.block.size==1){
				Draw.rect(this.shadowreg[0],this.x,this.y,0);
			}else{
				let off = (this.block.size - 1) / 2.0;
				for(let a =0;a<this.block.size;a++){
					for(let b =0;b<this.block.size;b++){
						let ind = b+a*this.block.size;
						Draw.rect(this.shadowreg[ind],this.x + (b-off)*8,this.y + (a-off)*8,0);
					}
				}
			}
		}
	};
}


module.exports = {

initConnectableWall: (a) => init(a)
		
}
