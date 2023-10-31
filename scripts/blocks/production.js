
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
			},
			drawPlan(block, plan, list){
				block.drawDefaultPlanRegion(plan, list);
			}
		});
}

const ValueStore = new IntMap();

function siliconCrucible()
{
	Blocks.siliconCrucible.drawer = extend(DrawBlock,
		{
			topreg:null,
			botreg:null,
			heatreg:null,
			effreg:null,
			flameColor: Color.valueOf("ffc999"),
			randpos:[],
			rot:0,

			load(block)
			{
				let alt = utils.Load("xelos-pixel-texturepack-silicon-crucible");
				this.topreg = utils.getRegion(alt,1,2,2);
				this.botreg = utils.getRegion(alt,0,2,2);
				this.heatreg = utils.getRegion(alt,2,2,2);
				this.effreg = utils.getRegion(alt,3,2,2);
				for(var i = 0;i<=10;i++){
					this.randpos[i] = {x: Mathf.random(-4,4),y: Mathf.random(-4,4)};
				}
			},
			draw(build)
			{
				if (!this.topreg) this.load(build.block);
				Draw.rect(this.botreg, build.x, build.y);

				if(ValueStore.get(build.id) === null){
					ValueStore.put(build.id,0);
				}
				if (Core.settings.getBool("seethrough"))
				{
					let rot = ValueStore.get(build.id);
					utils.drawItemClusterRotated(build.x,build.y+4,Items.coal,build.items.get(Items.coal)/3.0,this.randpos,0,rot+1);
					utils.drawItemClusterRotated(build.x-4,build.y-4,Items.pyratite,build.items.get(Items.pyratite)/3.0,this.randpos,0,rot);
					utils.drawItemClusterRotated(build.x+4,build.y-4,Items.sand,build.items.get(Items.sand)/3.0,this.randpos,0,rot+2);
				}
				Draw.rect(this.topreg, build.x, build.y);
				Draw.blend(Blending.additive);
				if (build.warmup > 0 && this.flameColor.a > 0.001)
				{
					var g = 0.3;
					var r = 0.06;
					var cr = Mathf.random(0.1);
					var a = (((1 - g) + Mathf.absin(Time.time, 8, g) + Mathf.random(r) - r) * build.warmup);
					Draw.color(utils.heatColor(Pal.turretHeat,a*2));

					Draw.rect(this.heatreg,build.x, build.y);

					Draw.color();

					ValueStore.put(build.id, ValueStore.get(build.id) + Time.delta * build.warmup * a * 0.1);
				}
				if(build.attrsum>0){
					Draw.color(utils.heatColor(Pal.turretHeat,build.attrsum*0.5));
					Draw.rect(this.effreg,build.x, build.y);
					Draw.color();
				}
				Draw.blend();
			},
			drawPlan(block, plan, list){
				block.drawDefaultPlanRegion(plan, list);
			}
		});
}


function mixer()
{
	let baseMixer = {
		topreg:null,
		botreg:null,
		rotorreg:null,
		liquidreg:null,
		flameColor: Color.valueOf("ffc999"),
		randpos:[],
		rot:0,

		load(block)
		{
			let alt = utils.Load("xelos-pixel-texturepack-"+block.name);
			this.topreg = utils.getRegion(alt,1,2,2);
			this.botreg = utils.getRegion(alt,0,2,2);
			this.rotorreg = utils.getRegion(alt,2,2,2);
			this.liquidreg = utils.getRegion(alt,3,2,2);
			for(var i = 0;i<=10;i++){
				let r = Mathf.random(3,4);
				this.randpos[i] = {x: r*Mathf.sin(Mathf.random(0,6.28)),y: r*Mathf.cos(Mathf.random(0,6.28))};
			}
		},
		draw(build)
		{
			if (!this.topreg) this.load(build.block);
			Draw.rect(this.botreg, build.x, build.y);

			if(ValueStore.get(build.id) === null){
				ValueStore.put(build.id,0);
			}
			let rot = ValueStore.get(build.id);
			ValueStore.put(build.id, rot + Time.delta * build.warmup * 10.0/build.block.craftTime);
			Draw.rect(this.liquidreg, build.x, build.y);
			Draw.rect(this.rotorreg, build.x, build.y,rot*1.2);
			if (Core.settings.getBool("seethrough"))
			{
				build.items.each(i=>{
					utils.drawItemClusterRotated(build.x,build.y,i,build.items.get(i),this.randpos,0,rot+i.id);
				});
			}

			Draw.rect(this.topreg, build.x, build.y);
		},
		drawPlan(block, plan, list){
			block.drawDefaultPlanRegion(plan, list);
		}
	}
	Blocks.blastMixer.drawer = extend(DrawBlock, utils.deepCopyToDepth(baseMixer,1));
	Blocks.pyratiteMixer.drawer = extend(DrawBlock, utils.deepCopyToDepth(baseMixer,1));
}

function kiln()
{
	Blocks.kiln.drawer = extend(DrawBlock,
		{
			topreg:null,
			botreg:null,
			heatreg:null,
			flameColor: Color.valueOf("ffc999"),
			randpos:[],
			randpos2:[],
			load(block)
			{
				let alt = utils.Load("xelos-pixel-texturepack-kiln");
				this.topreg = utils.getRegion(alt,0,3,1);
				this.botreg = utils.getRegion(alt,2,3,1);
				this.heatreg = utils.getRegion(alt,1,3,1);
				for(var i = 0;i<=10;i++){
					this.randpos[i] = {x: -Mathf.random(3,5),y: Mathf.random(3,5)};
				}
				for(var i = 0;i<=10;i++){
					this.randpos2[i] = {x: Mathf.random(3,5),y: -Mathf.random(3,5)};
				}
			},
			draw(build)
			{
				if (!this.topreg) this.load(build.block);
				Draw.rect(this.botreg, build.x, build.y);
				if (Core.settings.getBool("seethrough"))
				{
					utils.drawItemClusterInventory(build.x,build.y,Items.sand,build.items,this.randpos,0);
					utils.drawItemClusterInventory(build.x,build.y,Items.lead,build.items,this.randpos2,0);
				}
				if (build.warmup > 0 && this.flameColor.a > 0.001)
				{
					var g = 0.3;
					var r = 0.06;
					var cr = Mathf.random(0.1);
					var a = (((1 - g) + Mathf.absin(Time.time, 8, g) + Mathf.random(r) - r) * build.warmup);
					Draw.color(utils.heatColor(Pal.turretHeat,a*2));
					Draw.blend(Blending.additive);
					Draw.rect(this.heatreg,build.x, build.y);
					Draw.blend();
					Draw.color();
				}
				Draw.rect(this.topreg, build.x, build.y);
			},
			drawPlan(block, plan, list){
				block.drawDefaultPlanRegion(plan, list);
			}
		});
}

module.exports = () => 
{
    siliconSmelter();
	siliconCrucible();
	kiln();
	mixer();
	
	atlas.setupIcon("block","silicon-smelter",Blocks.siliconSmelter.region);
	atlas.setupIcon("block","kiln",Blocks.kiln.region);
}
