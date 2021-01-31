
const _dirs = [{
        x: 1,
        y: 0
    },
    {
        x: 0,
        y: 1
    },
    {
        x: -1,
        y: 0
    },
    {
        x: 0,
        y: -1
    }

]
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
// 	var editoricon2 = Core.atlas.find(name);
// 	editoricon2.u=region.u;
// 	editoricon2.v=region.v;
// 	editoricon2.u2=region.u2;
// 	editoricon2.v2=region.v2;
// 	editoricon2.texture = region.texture;
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
	
	nregion.u = Mathf.map(tilex,0,1,nregion.u,nregion.u2);
	nregion.v = Mathf.map(tiley,0,1,nregion.v,nregion.v2); 
	nregion.u2 = nregion.u+tilew;
	nregion.v2 = nregion.v+tileh;
	nregion.width = region.width/sheetw;
	nregion.height = region.height/sheeth;
    return nregion;
}

function drawItemCluster(x,y,item,am,randpos,startp){
	if(am>0){
		for(var i = 0;i<am;i++){
			Draw.rect(item.icon(Cicon.medium), x+randpos[i+startp].x, y+randpos[i+startp].y, 5,5);
		}
	}
}
function drawItemClusterInventory(x,y,item,items,randpos,startp){
	drawItemCluster(x,y,item,items.get(item),randpos,startp);
}
function extendShader2(shadername, ext){
	return extend(Shaders.SurfaceShader,readString("shaders/screenspace.vert"), readString("shaders/"+shadername+".frag"),ext);
}
function extendShader(shadername, ext){
	const shad = new Shader(readString("shaders/screenspace.vert"), readString("shaders/"+shadername+".frag"));
	return extend(Shaders.SurfaceShader, "space", Object.assign({
			setVertexAttribute(name, size, type, normalize, stride, buffer) {
				shad.setVertexAttribute(name, size, type, normalize, stride, buffer);
			},
			enableVertexAttribute(location){
				shad.enableVertexAttribute(location);
			},
			disableVertexAttribute(name){
				shad.disableVertexAttribute(name);
				//3553
			},
			fetchUniformLocation(name, pedantic) {
				return shad.fetchUniformLocation(name,pedantic);
			},
			getAttributeLocation(name){
				return shad.getAttributeLocation(name);
			},
			getAttributes(){
				return shad.getAttributes();
			},
			getUniforms(){
				return shad.getUniforms();
			},
			getAttributeSize(name){
				return shad.getAttributeSize(name);
			},
			bind(){
				shad.bind();
			},
			hasUniform(name) {
				return shad.hasUniform(name);
			},
			getUniformType(name) {
				return shad.getUniformType(name);
			},
			getUniformLocation(name) {
				return shad.getUniformLocation(name);
			},
			getUniformSize(name) {
				return shad.getUniformSize(name);
			},
			dispose() {
				shad.dispose();
				this.super$dispose();
			},
			isDisposed() {
				return shad.isDisposed();
			}
		},ext));
	
	
}
function initShader(){
	Shaders.water = extendShader("water", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,60.0));
			this.setUniformf("tscal",1.0);
		}}
	);
	Shaders.tar = extendShader("tar", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,200.0));
			this.setUniformf("tscal",0.2);
		}}
	);
	Shaders.mud = extendShader("mud", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(100.0,100.0));
			this.setUniformf("tscal",0.02);
		}}
	);
	Shaders.slag = extendShader("slag", {});
	

	
		/*Shaders.water = extend(Shaders.SurfaceShader,readString("shaders/screenspace.vert"), readString("shaders/water.frag"),{
			apply(){
				flyingbuffer.getTexture().bind(2);
				this.super$apply();
				this.setUniformi("u_flying", 2);
				this.setUniformf("mscl",new Vec2(300.0,60.0));
			}
		});
		Shaders.tar = extend(Shaders.SurfaceShader,readString("shaders/screenspace.vert"), readString("shaders/tar.frag"),{
			apply(){
				//flyingbuffer.getTexture().bind(2);
				this.super$apply();
				//this.setUniformi("u_flying", 2);
				this.setUniformf("mscl",new Vec2(300.0,60.0));
			}
		});
		Shaders.slag = new Shaders.SurfaceShader(readString("shaders/screenspace.vert"), readString("shaders/slag.frag"));
		
		set a1 "set a1 "
		set q "\\""
		print a1
		print q
		print a1
		print q
		printflush message1
		*/
	
	
	
}

var fancy = true;

const storageB= {
	topreg:null,
	botreg:null,
	randpos:[],
	shuffle:[],
	draw(){	
		if(!Core.settings.getBool("seethrough")){
			this.super$draw();
			return;
		}
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
		this.drawTeamTop();
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
const bridgeB={
	itemmove:[],
	moveindex:0,
	cap:6,
	
	
	
	create(block,team){
		this.super$create(block,team);
		this.items = extend(ItemModule,{
			onTake:null,
			take(){
				var itm = this.super$take();
				if(this.onTake){
					this.onTake.get(itm);
				}
				return itm;
			},
			setTakeCons(s){
				this.onTake=s;
			}
		});
		this.cap=6;
		if(this.block.bufferCapacity){
			this.cap=this.block.bufferCapacity;
		}
		this.items.setTakeCons(cons((item)=>{
			if(this.link!=-1){
				this.itemmove[this.moveindex] = {item:item, t:Time.time}
				this.moveindex = (this.moveindex+1)%this.cap;
			}
		}));
		return this;
	},
	draw(){
		this.super$draw();
		if(!Core.settings.getBool("seethrough")){
			return;
		}
		Draw.z(Layer.power);
		Draw.color();
		let other = Vars.world.tile(this.link);
		if(!this.block.linkValid(this.tile, other,true)){ return;}
		
		let opacity = Core.settings.getInt("bridgeopacity") / 100.0;
		if(Mathf.zero(opacity)) return;
		Draw.alpha(opacity);
		

		let i = this.tile.absoluteRelativeTo(other.x, other.y);
		
		let ex = other.worldx() - this.x;
        let ey = other.worldy() - this.y;
		let ttime = this.block.transportTime*10;
		if(this.block.bufferCapacity){
			ttime = this.block.transportTime*10+ 3600/this.block.speed;
		}
		for(var m = 0;m<this.itemmove.length;m++){
			if(this.itemmove[m] && this.itemmove[m].item && this.itemmove[m].t+ttime>Time.time){
				var tlerp = (Time.time-this.itemmove[m].t)/ttime;
				Draw.rect(this.itemmove[m].item.icon(Cicon.medium), this.x+ex*tlerp, this.y+ey*tlerp, 3,3);
			}
		}
		
		Draw.reset();
	}
}

var water;
var slag;
var flyingbuffer;
Events.run(Trigger.draw, () => {
	Draw.draw(Layer.flyingUnitLow-0.01, run(()=>{
		flyingbuffer.resize(Core.graphics.width, Core.graphics.height);
		flyingbuffer.begin(Color.clear);
	}));
	Draw.draw(Layer.flyingUnit+0.01, run(()=>{
		flyingbuffer.end();
		flyingbuffer.blit(Shaders.screenspace);
	}));

});
Events.on(EventType.ClientLoadEvent, 
cons(e => {
	
	Vars.ui.settings.graphics.checkPref("seethrough", Core.settings.getBool("seethrough"));
	Core.settings.defaults("seethrough", true);
	
	flyingbuffer = new FrameBuffer(Core.graphics.width, Core.graphics.height);
	
	initShader();

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
			!(block instanceof LiquidConverter) &&
			!(block instanceof Cultivator)){
			changeAtlasToSprite("block",block.name,Core.atlas.find(block.name));
		}
	});
	Vars.content.getBy(ContentType.unit).each(unit=>{
		changeAtlasToSprite("unit",unit.name + "-outline",Core.atlas.find(unit.name) + "-outline");
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
				if(Core.settings.getBool("seethrough")){
					drawItemClusterInventory(this.x  ,this.y,Items.coal,this.items,this.randpos,0);
					drawItemClusterInventory(this.x+8,this.y,Items.sand,this.items,this.randpos,10);
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
	
	Blocks.forceProjector.buildType = () =>{
		return extendContent(ForceProjector.ForceBuild, Blocks.forceProjector,{
			draw(){
				if(!Core.settings.getBool("seethrough")){
					this.super$draw();
					return;
				}
				Draw.rect(this.block.region, this.x, this.y);
				let hp = 1.0-(this.buildup / this.block.shieldHealth);
				
				if(this.liquids.total() > 0.001){
					Drawf.liquid(this.block.topRegion, this.x, this.y, this.liquids.total() / this.block.liquidCapacity, this.liquids.current().color);
				}
				
				if(hp>0){
					let bottomlerp = Mathf.clamp(hp*2);
					let toplerp = Mathf.clamp(hp*2-1);
					const size = 3.2;
					
					Draw.blend(Blending.additive);
					Draw.color(this.team.color,this.efficiency())
					Lines.stroke(0.8);
					
					Lines.line(this.x,this.y-size , this.x + bottomlerp*size, this.y-size + (bottomlerp*size));
					Lines.line(this.x,this.y-size , this.x - bottomlerp*size, this.y-size + (bottomlerp*size));
					
					Lines.line(this.x+size,this.y , this.x+size - (toplerp*size), this.y + (toplerp*size));
					Lines.line(this.x-size,this.y , this.x-size + (toplerp*size), this.y + (toplerp*size));
					
					Draw.blend();
					Draw.reset();
				}
				
			}
			
		});
	}

	
	Blocks.container.buildType = () =>{
		return extendContent(StorageBlock.StorageBuild, Blocks.container,deepCopy(storageB));
	}
	Blocks.vault.buildType = () =>{
		return extendContent(StorageBlock.StorageBuild, Blocks.vault,deepCopy(storageB));
	}
	
	Blocks.itemBridge.buildType = () =>{
		return extendContent(BufferedItemBridge.BufferedItemBridgeBuild, Blocks.itemBridge,deepCopy(bridgeB));
	}
	Blocks.phaseConveyor.buildType = () =>{
		return extendContent(ItemBridge.ItemBridgeBuild, Blocks.phaseConveyor,deepCopy(bridgeB));
	}
	
})
);

function addConsButton(table, consFunc, style, runnable) {
	let button = new Button(style);
	button.clearChildren();
	button.clicked(runnable);
	consFunc.get(button);
	return table.add(button);
}




if(!Vars.headless){
	var ut = new Table();

	/*Events.on(ClientLoadEvent, () => {
		var ut2 = new Table();
		ut.bottom().left();
		ut2.background(Styles.black5);
		let tblcons = cons((tbl)=>{
			//fancy
			tbl.clearChildren();
			addConsButton(
				tbl, 
				cons((butt) => {
					butt.top().left();
					butt.margin(12);
					butt.defaults().left().top();
					if(fancy){
						butt.add("[#aaffaa]Fancy:ON").size(170, 45); 
					}else{
						butt.add("[#ffaaaa]Fancy:OFF").size(170, 45); 
					}

				}),
				Styles.logict,
				() => { fancy = !fancy;  rebuild.run(); }
			);	
		});
		let rebuild = run(() => tblcons.get(ut2));
		rebuild.run();
		ut.add(ut2);
		if(Vars.mobile){
			ut.marginBottom(105);
		}
		Vars.ui.hudGroup.addChild(ut);
	});*/
}
