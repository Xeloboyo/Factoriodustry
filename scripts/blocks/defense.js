
var tile = require("xelos-pixel-texturepack/tile");
var utils = require("xelos-pixel-texturepack/utils");

function forceProjector()
{
    Blocks.forceProjector.buildType = () => extend(ForceProjector.ForceBuild, Blocks.forceProjector,
		{
			draw(){
				if(!Core.settings.getBool("seethrough")){
					this.super$draw();
					return;
				}
				Draw.rect(this.block.region, this.x, this.y);
				let hp = 1.0-(this.buildup / this.block.shieldHealth);
				
				if(this.liquids.currentAmount() > 0.001){
					Drawf.liquid(this.block.topRegion, this.x, this.y, this.liquids.currentAmount() / this.block.liquidCapacity, this.liquids.current().color);
				}
				
				if(hp>0){
					let bottomlerp = Mathf.clamp(hp*2);
					let toplerp = Mathf.clamp(hp*2-1);
					const size = 3.2;
					
					Draw.blend(Blending.additive);
					Draw.color(this.team.color,this.efficiency)
					Lines.stroke(0.8);
					
					Lines.line(this.x,this.y-size , this.x + bottomlerp*size, this.y-size + (bottomlerp*size));
					Lines.line(this.x,this.y-size , this.x - bottomlerp*size, this.y-size + (bottomlerp*size));
					
					Lines.line(this.x+size,this.y , this.x+size - (toplerp*size), this.y + (toplerp*size));
					Lines.line(this.x-size,this.y , this.x-size + (toplerp*size), this.y + (toplerp*size));
					
					Draw.blend();
					Draw.reset();
				}
				this.drawShield();
			}
			
		});
}

module.exports = () =>
{
    forceProjector();
    
	var wallB = tile.initConnectableWall(utils.Load("xelos-pixel-texturepack-connected-shadows"));
	var wallBN = tile.initConnectableWall(utils.Load("xelos-pixel-texturepack-connected-shadows-norivet"));
	
	utils.eachType(ContentType.block, block=>{
		if (block instanceof Wall){		
			if (block == Blocks.scrapWall || block == Blocks.scrapWallLarge || block == Blocks.scrapWallHuge){
				block.buildType = () => extend(Wall.WallBuild, Blocks.scrapWall,utils.deepCopy(wallB));
			}else{
				block.buildType = () => extend(Wall.WallBuild, Blocks.scrapWall,utils.deepCopy(wallBN));
			}
		}
	});
}
