
var utils = require("xelos-pixel-texturepack/utils");
var atlas = require("xelos-pixel-texturepack/atlas");

function siliconSmelter()
{
    Blocks.siliconSmelter.drawer = extend(DrawBlock,
		{
			topreg:null,
			botreg:null,
			heatreg:null,
			flameColor: Color.valueOf("ffc999"),
			randpos:[],

			load(block)
			{
				let alt = utils.Load("xelos-pixel-texturepack-silicon-smelter");
				this.topreg = utils.getRegion(alt,0,2,2);
				this.botreg = utils.getRegion(alt,1,2,2);
				this.heatreg = utils.getRegion(alt,2,2,2);
				for(var i = 0;i<=20;i++){
					this.randpos[i] = {x: Mathf.random(3,5)-8,y: Mathf.random(3,12)-8};
				}
			},
			draw(build)
			{
				if (!this.topreg) this.load(build.block);
				Draw.rect(this.botreg, build.x, build.y);
				
				if (build.warmup > 0 && this.flameColor.a > 0.001)
				{
					var g = 0.3;
					var r = 0.06;
					var cr = Mathf.random(0.1);	    
					var a = (((1 - g) + Mathf.absin(Time.time, 8, g) + Mathf.random(r) - r) * build.warmup);
					Draw.color(utils.heatColor(Pal.turretHeat,a*2));
					Draw.rect(this.heatreg,build.x, build.y);
					Draw.color();
				}
				if (Core.settings.getBool("seethrough"))
				{
					utils.drawItemClusterInventory(build.x  ,build.y,Items.coal,build.items,this.randpos,0);
					utils.drawItemClusterInventory(build.x+8,build.y,Items.sand,build.items,this.randpos,10);
				}
				Draw.rect(this.topreg, build.x, build.y);
			}
		});
}

module.exports = () => 
{
    siliconSmelter();
	
	atlas.setupIcon("block","silicon-smelter",Blocks.siliconSmelter.region);
}
