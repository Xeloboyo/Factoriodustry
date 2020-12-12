




function changeAtlas(name){
	print("Changing"+name);
	var editoricon2 = Core.atlas.find("block-"+name + "-medium");
	var newicon = Core.atlas.find("xelos-pixel-texturepack-"+name+"-icon");
	editoricon2.set(newicon.u, newicon.v, newicon.u2, newicon.v2);
	editoricon2.texture = newicon.texture;
}
function changeAtlasToSprite(name,region){
	print("Changing"+name);
	var editoricon2 = Core.atlas.find("block-"+name + "-medium");
	var placeicon = Core.atlas.find("block-"+name + "-full");
	var newicon = region;
	editoricon2.set(newicon.u, newicon.v, newicon.u2, newicon.v2);
	editoricon2.texture = newicon.texture;
	placeicon.set(newicon.u, newicon.v, newicon.u2, newicon.v2);
	placeicon.texture = newicon.texture;
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
	changeAtlas("thorium-wall");
	changeAtlas("thorium-wall-large");
	changeAtlas("copper-wall");
	changeAtlas("copper-wall-large");
	changeAtlas("titanium-wall");
	changeAtlas("titanium-wall-large");
	changeAtlas("plastanium-wall");
	changeAtlas("plastanium-wall-large");
	changeAtlas("phase-wall");
	changeAtlas("phase-wall-large");
	changeAtlas("scrap-wall");
	changeAtlas("scrap-wall-large");
	
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
					
					Draw.alpha(((1 - g) + Mathf.absin(Time.time, 8, g) + Mathf.random(r) - r) * this.warmup);

					Draw.tint(Pal.turretHeat);
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
	changeAtlasToSprite("silicon-smelter",Blocks.siliconSmelter.region);
	
	
	
})
)
