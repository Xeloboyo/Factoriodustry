

function deepCopy(obj) {
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

function replaceAtlas(name,region){
	var editoricon2 = Core.atlas.find(name);
	editoricon2.u=region.u;
	editoricon2.v=region.v;
	editoricon2.u2=region.u2;
	editoricon2.v2=region.v2;
	editoricon2.texture = region.texture;
}
function changeAtlas(name){
	var editoricon2 = Core.atlas.find("block-"+name + "-medium");
	var newicon = Core.atlas.find("xelos-pixel-texturepack-"+name+"-icon");
	editoricon2.set(newicon.u, newicon.v, newicon.u2, newicon.v2);
	editoricon2.texture = newicon.texture;
}
function changeAtlasToSprite(type,name,region){
	replaceAtlas(type+"-"+name + "-medium",region);
	replaceAtlas(type+"-"+name + "-xlarge",region);
	replaceAtlas(type+"-"+name + "-large",region);
	replaceAtlas(type+"-"+name + "-full",region);
	replaceAtlas(type+"-"+name + "-small",region);
	replaceAtlas(type+"-"+name + "-tiny",region);
}


function getHeatColor(heatcolor, a){
	if(a<0.01){
		return new Color(Color.clear);
	}
	let fcol = new Color(heatcolor.r,heatcolor.g,heatcolor.b,a);
	if(a>1){
		fcol.add(0,0,0.01*a);
		fcol.mul(a);
	}
	return fcol;
}

function getRegion(region, tile,sheetw,sheeth) {
    if (!region) {
        print("oh no there is no texture");
        return;
    }
    let nregion = new TextureRegion(region);
    let tilew = (nregion.u2 - nregion.u)/sheetw;
	let tileh = (nregion.v2 - nregion.v)/sheeth;
	let tilex = (tile%sheetw)/sheetw;
	let tiley = Math.floor(tile/sheetw)/sheeth;
	
	nregion.u = Mathf.map(tilex,0,1,nregion.u,nregion.u2)+tilew*0.02;
	nregion.v = Mathf.map(tiley,0,1,nregion.v,nregion.v2)+tileh*0.02; 
	nregion.u2 = nregion.u+tilew*0.96;
	nregion.v2 = nregion.v+tileh*0.96;
	nregion.width = region.width/sheetw;
	nregion.height = region.height/sheeth;
    return nregion;
}

Events.on(EventType.ClientLoadEvent, 
cons(e => {
	
	Vars.content.getBy(ContentType.item).each(item=>{
		changeAtlasToSprite("item",item.name,item.icon(Cicon.medium));
	});
	
	Vars.content.getBy(ContentType.block).each(block=>{
		if(!(block instanceof BaseTurret) &&
		    !(block instanceof Conveyor) &&
			!(block instanceof PayloadConveyor) &&
			!(block instanceof LiquidBlock) &&
			!(block instanceof UnitFactory) &&
			!(block instanceof RepairPoint) &&
			!(block instanceof MassDriver) &&
			!(block instanceof Floor) &&
			!(block instanceof Drill) &&
			!(block instanceof Cultivator)){
			changeAtlasToSprite("block",block.name,Core.atlas.find(block.name));
		}
	});
	
	Blocks.sporeMoss.blendGroup = Blocks.moss;
	
	Blocks.siliconSmelter.buildType = () => {
		return extendContent(GenericSmelter.SmelterBuild,Blocks.siliconSmelter,{
			topreg:null,
			botreg:null,
			heatreg:null,
			randpos:[],
			draw(){
				if(!this.topreg){
					this.loadreg();
				}
				Draw.rect(this.botreg, this.x, this.y);
				
				if(this.warmup > 0 && this.block.flameColor.a > 0.001){
					var g = 0.3;
					var r = 0.06;
					var cr = Mathf.random(0.1);	    
					var a = (((1 - g) + Mathf.absin(Time.time, 8, g) + Mathf.random(r) - r) * this.warmup);
					Draw.color(getHeatColor(Pal.turretHeat,a*2));
					Draw.rect(this.heatreg,this.x, this.y);
					Draw.color();
				}
				
				if(this.items.get(Items.coal)>0){
					var c = this.items.get(Items.coal);
					for(var i = 0;i<c;i++){
						Draw.rect(Items.coal.icon(Cicon.medium), this.x+this.randpos[i].x, this.y+this.randpos[i].y, 5,5);
					}
				}
				if(this.items.get(Items.sand)>0){
					var s = this.items.get(Items.sand);
					for(var i = 0;i<s;i++){
						Draw.rect(Items.sand.icon(Cicon.medium), this.x+(8+this.randpos[i+10].x), this.y+this.randpos[i+10].y, 5,5);
					}
				}
				Draw.rect(this.topreg, this.x, this.y);
			},
			loadreg(){
				let alt = Core.atlas.find("xelos-pixel-texturepack-silicon-smelter");
				this.topreg = getRegion(alt,0,2,2);
				this.botreg = getRegion(alt,1,2,2);
				this.heatreg = getRegion(alt,2,2,2);
				for(var i = 0;i<=20;i++){
					this.randpos[i] = {x: Mathf.random(3,5)-8,y: Mathf.random(3,12)-8};
				}
			}
		});
	};
	changeAtlasToSprite("block","silicon-smelter",Blocks.siliconSmelter.region);
	
	
	const storageB= {
		topreg:null,
		botreg:null,
		randpos:[],
		shuffle:[],
		draw(){
			if(!this.topreg){
				this.loadreg();
			}
			Draw.rect(this.botreg, this.x, this.y);
			let total = this.items.total();
			if(total>0){
				let unique = this.items.sum((item,am)=>{
					return 1;
				});
				let spaces = Mathf.clamp( Math.max(unique,Math.ceil(total*0.1))-unique,0,this.block.size*10);
				let iiar = [];
				let rind = 0;
				this.items.each((item,am)=>{
					let occupy = Math.max(0,spaces*((am-10)/total));
					for(var ii = 0;ii<1+occupy;ii++){
						iiar[rind] = item;
						rind++;
					}
					spaces-=occupy;
					total-=am;
				});
				
				for(var tr = 0;tr<this.shuffle.length;tr++){
					if(iiar[this.shuffle[tr]]){
						Draw.rect(iiar[this.shuffle[tr]].icon(Cicon.medium), this.x+this.randpos[tr].x, this.y+this.randpos[tr].y, 5,5);
					}
				}
			}
			Draw.rect(this.topreg, this.x, this.y);
		},
		loadreg(){
			let alt = Core.atlas.find("xelos-pixel-texturepack-"+this.block.name);
			this.topreg = getRegion(alt,0,2,1);
			this.botreg = getRegion(alt,1,2,1);
			let s = this.block.size;
			for(var i = 0;i<=30+s*10;i++){
				this.randpos[i] = {x: Mathf.random(-s*2,s*2),y: Mathf.random(-s*2,s*2)};
			}
			let avail = [];
			for(var i = 0;i<s*10;i++){
				avail[i] = i;
			}
			for(var i = 0;i<s*10;i++){
				var rpos = Math.floor(Math.random(0,avail.length));
				this.shuffle[i]=avail[rpos];
				avail.splice(rpos,1);
			}
		}
	};
	
	Blocks.container.buildType = () =>{
		return extendContent(StorageBlock.StorageBuild, Blocks.container,deepCopy(storageB));
	}
	Blocks.vault.buildType = () =>{
		return extendContent(StorageBlock.StorageBuild, Blocks.vault,deepCopy(storageB));
	}
	
})
)
