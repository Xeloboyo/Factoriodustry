
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
	if(!region){
		return;
	}
 	var editoricon2 = Core.atlas.find(name);
	if(!editoricon2){
		return;
	}
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
	replaceAtlas(type+"-"+name + "-full",region);
	replaceAtlas(type+"-"+name + "-ui",region);
}

function directAtlasReplace(region, replacement){
	if(replacement.name=="error" || !replacement || !region){
		return;
	}
	region.texture.getTextureData().pixmap.draw(replacement.texture.getTextureData().pixmap, 
					region.u * region.texture.width, 
					region.v * region.texture.height, 
					replacement.u*replacement.texture.width, replacement.v*replacement.texture.height, replacement.width, replacement.height);
}
function smoothCurve(x){
	return x*x*(3-2*x);
	
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

function drawOrientedRect(tex,x,y,ox,oy,rotdeg,rot){
	Draw.rect(tex,x + Mathf.cosDeg(rotdeg-90)*ox + Mathf.sinDeg(rotdeg-90)*oy,y + Mathf.sinDeg(rotdeg-90)*ox - Mathf.cosDeg(rotdeg-90)*oy,rot+rotdeg);
}
function createOrientedEffect(eff,x,y,ox,oy,rotdeg,rot){
	eff.at(x + Mathf.cosDeg(rotdeg-90)*ox + Mathf.sinDeg(rotdeg-90)*oy,y + Mathf.sinDeg(rotdeg-90)*ox - Mathf.cosDeg(rotdeg-90)*oy,rot);
}

function drawItemCluster(x,y,item,am,randpos,startp){
	if(am>0){
		am = Math.min(am,100);
		for(var i = 0;i<am;i++){
			Draw.rect(item.icon(Cicon.medium), x+randpos[(i+startp)%randpos.length].x, y+randpos[(i+startp)%randpos.length].y, 5,5);
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
function addShader(shader, name){
	Shaders[name] = shader;
	let original = CacheLayer[name];
	for(let i = 0;i<CacheLayer.all.length;i++){
		if(CacheLayer.all[i] == original){
			CacheLayer[name] = new CacheLayer.ShaderLayer(shader);
			CacheLayer.all[i] = CacheLayer[name];
			CacheLayer.all[i].id = i;
		}
	}
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
	addShader(Shaders.water,"water");
	
	Shaders.tar = extendShader("tar", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,200.0));
			this.setUniformf("tscal",0.2);
		}}
	);
	addShader(Shaders.tar,"tar");
	
	Shaders.mud = extendShader("mud", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(100.0,100.0));
			this.setUniformf("tscal",0.02);
		}}
	);
	addShader(Shaders.mud,"mud");
	
	Shaders.slag = extendShader("slag", {});
	addShader(Shaders.slag,"slag");
	
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

const type_point_welder = 0;
const type_line_welder = 1;

const mechArm = {
	fromX:0,
	fromY:0,
	toX:0,
	toY:0,
	positions:[],
	actions:[],
	rotation: 0,
	tx: 0,//headpos
	ty: 0,
	nx: 0,//normal
	ny: 0,
	lastEffect: 0,lastEffect2: 0,
	type: type_point_welder,
	restx: 0,resty: 0,
	draw(bx,by,progress,rotdeg,spd){
		this.lastEffect -= Time.delta;
		this.lastEffect2 -= Time.delta;
		if(this.positions.length>0 && progress < 1 && spd > 0.001){
			for(let i = 0;i<this.positions.length;i++){
				if(i+1 == this.positions.length || this.positions[i+1].t>progress){
					switch(this.type){
						case type_point_welder:
							let dtx = (this.positions[i].x-this.tx);
							let dty = (this.positions[i].y-this.ty);
							this.tx += dtx*0.1*spd;
							this.ty += dty*0.1*spd;
							if(Math.abs(dtx)+Math.abs(dty)<1 && this.lastEffect<0){
								createOrientedEffect(weldspark,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,45+Mathf.range(7));
								this.lastEffect = 5;
							}
							break;
						case type_line_welder:
							let next = this.positions[Math.min(i+1,this.positions.length-1)];
							let curr = this.positions[i];
							let l = (progress - curr.t) / (next.t - curr.t);
							if(next==curr){
								l = 0;
							}
							l = smoothCurve(l);
							this.tx = Mathf.lerp(curr.x,next.x,l);
							this.ty = Mathf.lerp(curr.y,next.y,l);
							if(curr.a){
								if(this.lastEffect<0){
									createOrientedEffect(weldspark,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,45+Mathf.range(7));
									this.lastEffect = 5;
								}
								if(this.lastEffect2<0){
									createOrientedEffect(weldglow,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,0);
									this.lastEffect2 = 1.5;
								}
							}
							break;
					}
					break;
				}
			}
		}else{
			this.tx += (this.restx -this.tx)*0.2;
			this.ty += (this.resty -this.ty)*0.2;
		}
		let dx = this.toX-this.fromX; let dy = this.toY - this.fromY;
		let slidepos = ((this.tx-this.fromX)*dx + (this.ty-this.fromY)*dy)/(dx*dx+dy*dy);
		
		let x = Mathf.lerp(this.fromX,this.toX,slidepos);
		let y = Mathf.lerp(this.fromY,this.toY,slidepos);
		let dis = Mathf.dst(x,y,this.tx,this.ty);
		for(let i = 0;i<dis-16;i+=32){
			drawOrientedRect(armconn,bx,by,(this.tx-this.nx*(i+16))*Draw.scl,(this.ty-this.ny*(i+16))*Draw.scl,rotdeg,this.rotation);
		}
		drawOrientedRect(armhead,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,this.rotation);//
		drawOrientedRect(armbase,bx,by,x*Draw.scl,y*Draw.scl,rotdeg,this.rotation);//
	},
	
	resetRail(x,y,x2,y2){
		this.fromX = x;
		this.toX = x2;
		this.fromY = y;
		this.toY = y2;
		this.rotation = 270-Angles.angle(x,y,x2,y2);
		let d = Mathf.dst(x,y,x2,y2);
		this.nx = (y-y2)/d;
		this.ny = -(x-x2)/d;
		this.restx = (this.fromX + this.nx*8);
		this.resty = (this.fromY + this.ny*8);
	},
	//oriented from a building facing down
	newArm(x,y,x2,y2){
		let arm = Object.create(mechArm);
		arm.resetRail(x,y,x2,y2);
		return arm;
	}
}
var armbase=null;
var armhead=null;
var armconn=null;
var weldspark = null;
var weldglow = null;
const unitFacB = {
	arms: [],
	pieces: [],
	gw:0,gh:0,cw:0,ch:0,usprite:null,
	getUnitSprite(){
		if(this.currentPlan != -1){
			return this.block.plans.get(this.currentPlan).unit.fullIcon;
		}
		return Core.atlas.find("error");
	},
	isWorking(){
		return this.currentPlan != -1;
	},
	getProgress(){
		if(this.currentPlan != -1){
			return Math.min(1,this.progress / this.block.plans.get(this.currentPlan).time);
		}
		return 1;
	},
	drawBelow(){
		
	},
	draw(){	
		if(this.arms.length == 0){
			this.setupArms();
		}
		let x = this.x;
		let y = this.y;
		let rotdeg = this.rotdeg();
		Draw.rect(this.block.region, x, y);
		Draw.rect(this.block.outRegion, x, y, this.rotdeg());
		let pratio = this.getProgress();
		this.drawBelow();
		this.drawPayload();
		if(this.isWorking()){
			let unitSprite = this.getUnitSprite();
			if(this.pieces.length==0 || this.usprite!=unitSprite){
				this.pieces=[];
				this.gw = Math.max(1,Mathf.floor(unitSprite.width/24));
				this.gh = Math.max(1,Mathf.floor(unitSprite.height/24));
				this.cw = unitSprite.width/this.gw;
				this.ch = unitSprite.height/this.gh;
				this.usprite=unitSprite;
				let ox = (-this.usprite.width*0.5 + this.cw*0.5)*Draw.scl;
				let oy = (-this.usprite.height*0.5 + this.ch*0.5)*Draw.scl;
				for (let j = 0;j<this.gh;j++){
					for (let i = 0;i<this.gw;i++){
						this.pieces.push({
							tex: new TextureRegion(unitSprite, i*this.cw, j*this.ch,this.cw,this.ch),
							x: (this.cw * i)*Draw.scl + ox,
							y: (this.ch * j)*Draw.scl + oy
						});
					}	
				}
				this.resetArms();
				this.assignPaths();
			}
			this.windup += (1.0-this.windup)*0.08;
			let rx = 0;
			let ry = 0;
			let ax = 0;
			let ay = 0;
			
			let showam = Mathf.clamp(Mathf.ceil(this.pieces.length*pratio),0,this.pieces.length);
			for (let i = 0;i<showam;i++){
				rx = this.pieces[i].x;
				ry = this.pieces[i].y;
				ax = Mathf.cosDeg(rotdeg-90)*rx + Mathf.sinDeg(rotdeg-90)*ry; 
				ay = Mathf.sinDeg(rotdeg-90)*rx - Mathf.cosDeg(rotdeg-90)*ry; 
				if(i<showam-1){
					Draw.rect(this.pieces[i].tex, x+ax, y+ay, rotdeg - 90.0);
				}else{
					let leftover = (this.pieces.length*pratio)%1.0;
					Draw.rect(this.pieces[i].tex, x+ax, y+ay, this.cw*Draw.scl*leftover, this.ch*Draw.scl*leftover, rotdeg - 90.0);
				}
			}
			//Draw.rect(unitSprite, x, y, rotdeg - 90.0);
			//Draw.draw(Layer.blockOver, () -> Drawf.construct(this, plan.unit, rotdeg() - 90f, progress / plan.time, speedScl, time));
		}else{
			this.pieces=[];
			this.usprite = null;
		}

		Draw.z(Layer.blockOver);

		this.payRotation = rotdeg;
		

		Draw.z(Layer.blockOver + 0.1);
		Draw.rect(this.block.topRegion, x, y);
		this.drawArms(x,y,pratio,rotdeg);
		
		
	},
	
	drawArms(x,y,pratio,rotdeg){
		for(let i=0;i<this.arms.length;i++){
			this.arms[i].draw(x,y,pratio,rotdeg,this.speedScl*(this.payload==null?1:0))
		}
	},
	
	setupArms(){
		this.arms.push(mechArm.newArm(-32,16, -32,-16));
		this.arms.push(mechArm.newArm(32,-16, 32,16));
		this.arms[1].type = type_line_welder;
	},
	
	resetArms(){
		for (let i = 0;i<this.arms.length;i++){
			this.arms[i].positions = [];
		}
	},
	assignArmTask(type,tasks){
		switch(type){
			case type_point_welder:
				this.arms[0].positions = this.arms[0].positions.concat(tasks);
			break;
			case type_line_welder:
				this.arms[1].positions = this.arms[1].positions.concat(tasks);
			break;
		}
	},
	squarePath(x,y,x2,y2,tstart,tend){
		return [
			{x: x, y: y, t: tstart, a: true },
			{x: x2,y: y, t: Mathf.lerp(tstart,tend,0.2), a: true },
			{x: x2,y: y2,t: Mathf.lerp(tstart,tend,0.4), a: true },
			{x: x ,y: y2,t: Mathf.lerp(tstart,tend,0.6), a: true },
			{x: x ,y: y ,t: tend, a: false },
		];
	},
	assignPaths(){
		let dt = 1.0/(this.pieces.length*1.0);
		for (let i = 0;i<this.pieces.length;i++){
			let ax = this.pieces[i].x/Draw.scl;
			let ay = this.pieces[i].y/Draw.scl;
			this.assignArmTask(type_point_welder,[{
				x: ax,
				y: ay,
				t: i*dt
			}]);
			this.assignArmTask(type_line_welder,
				this.squarePath( ax-this.cw*0.5, ay-this.ch*0.5, ax+this.cw*0.5, ay+this.ch*0.5,    i*dt + 0.6*(dt),  i*dt + 0.9*(dt))
			);
		}
		for (let i = 0;i<this.arms.length;i++){
			if(this.arms[i].positions[0].t>0){
				
				this.arms[i].positions = [{
					x: this.arms[i].restx,
					y: this.arms[i].resty,
					t: 0,
					a: false,
				}].concat(this.arms[i].positions);
			}
		}
	}
}

const reconFacB = Object.assign(deepCopy(unitFacB),{
	getUnitSprite(){
		if(this.isWorking()){
			return this.upgrade(this.payload.unit.type).fullIcon;
		}
		return Core.atlas.find("error");
	},
	isWorking(){
		return this.constructing() && this.hasArrived();
	},
	getProgress(){
		if(this.isWorking()){
			return this.progress / this.block.constructTime;
		}
		return 1;
	},
	drawBelow(){
		let fallback = true;
		for(let i = 0; i < 4; i++){
			if(this.blends(i) && i != this.rotation){
				Draw.rect(this.block.inRegion, this.x, this.y, (i * 90) - 180);
				fallback = false;
			}
		}
		if(fallback){ 
			Draw.rect(this.block.inRegion, this.x, this.y, this.rotation * 90);
		}
		if(this.isWorking()){
			Draw.rect(this.payload.unit.type.fullIcon, this.x, this.y, this.payload.rotation() - 90);
		}
	},
	assignArmTask(type,tasks){
		Log.info(type+","+tasks);
		switch(type){
			case type_point_welder:
				this.arms[0].positions = this.arms[0].positions.concat(tasks);
			break;
			case type_line_welder:
				this.arms[1].positions = this.arms[1].positions.concat(tasks);
			break;
		}
	},
	setupArms(){
		this.arms.push(mechArm.newArm(-32,0, 0,-32));
		this.arms.push(mechArm.newArm(32,0, 0,32));
		this.arms[1].type = type_line_welder;
	},
	drawArms(x,y,pratio,rotdeg){
		for(let i=0;i<this.arms.length;i++){
			this.arms[i].draw(x,y,pratio,rotdeg,this.speedScl);
		}
	},
});

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

Events.on(EventType.ContentInitEvent, 
cons(e => {
	Log.info("Content init")
	//initShader();
}));

Events.on(EventType.ClientLoadEvent, 
cons(e => {
	Log.info("Client load")
	Vars.ui.settings.graphics.checkPref("seethrough", Core.settings.getBool("seethrough"));
	Core.settings.defaults("seethrough", true);
	
	flyingbuffer = new FrameBuffer(Core.graphics.width, Core.graphics.height);
	initShader();
	

	Vars.content.getBy(ContentType.item).each(item=>{
		changeAtlasToSprite("item",item.name,item.fullIcon);
	});
	
	var envrionment = Core.atlas.find("grass1").texture;
	var envpixmap = envrionment.getTextureData().pixmap;
	armbase = Core.atlas.find("xelos-pixel-texturepack-construct-arm-base");
	armhead = Core.atlas.find("xelos-pixel-texturepack-construct-arm-head");
	armconn = Core.atlas.find("xelos-pixel-texturepack-construct-arm-connector");
	weldspark = new Effect(12, cons(e=>{
		Draw.color(Color.white, Pal.turretHeat, e.fin());
        Lines.stroke(e.fout() * 0.6 + 0.6);

        Angles.randLenVectors(e.id, 3, 15 * e.finpow(), e.rotation, 3, new Floatc2(){get: (x, y) => {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 5 + 0.5);
        }});
	}));
	weldglow = new Effect(20, cons(e=>{
		Draw.color(Color.white, Pal.turretHeat, e.fin());
        Fill.square(e.x,e.y,e.fout() * 0.6 + 0.6);
	}));
	
	Vars.content.getBy(ContentType.block).each(block=>{
		if(!(block instanceof BaseTurret) &&
		    !(block instanceof Conveyor) &&
			!(block instanceof PayloadConveyor) &&
			!(block instanceof LiquidBlock) &&
			!(block instanceof UnitFactory) &&
			!(block instanceof Reconstructor) &&
			!(block instanceof RepairPoint) &&
			!(block instanceof MassDriver) &&
			!(block instanceof Floor) &&
			!(block instanceof Drill) &&
			!(block instanceof LiquidConverter) &&
			!(block instanceof Cultivator)){
			changeAtlasToSprite("block",block.name,Core.atlas.find(block.name));
		}
		
		if(block instanceof Floor){
			if(block.variants>0){
				if(block.variantRegions){
					for(let i = 0;i<block.variants;i++){
						directAtlasReplace(block.variantRegions[i], Core.atlas.find("xelos-pixel-texturepack-"+block.name+(i+1)));
					}
				}
			}else{
				directAtlasReplace(block.variantRegions[0], Core.atlas.find("xelos-pixel-texturepack-"+block.name));
			}
			directAtlasReplace(Core.atlas.find(block.name+"-edge"), Core.atlas.find("xelos-pixel-texturepack-"+block.name + "-edge"));
		}
		
		if(block instanceof Prop){
			if(block.variants>0){
				if(block.variantRegions){
					for(let i = 0;i<block.variants;i++){
						directAtlasReplace(block.variantRegions[i], Core.atlas.find("xelos-pixel-texturepack-"+block.name+(i+1)));
					}
				}
			}else{
				directAtlasReplace(block.region, Core.atlas.find("xelos-pixel-texturepack-"+block.name));
			}
			if(block instanceof StaticWall){
				directAtlasReplace(block.large, Core.atlas.find("xelos-pixel-texturepack-"+block.name+"-large"));
			}
		}
	});
	envrionment.load(envrionment.getTextureData());
	
	Vars.content.getBy(ContentType.unit).each(unit=>{
		changeAtlasToSprite("unit",unit.name + "-outline",Core.atlas.find("unit-"+unit.name + "-outline"));
		unit.loadIcon();
		changeAtlasToSprite("unit",unit.name,unit.fullIcon);
	});
	
	Blocks.sporeMoss.blendGroup = Blocks.moss;
	
	
	Blocks.siliconSmelter.drawer = extend(DrawSmelter,{
		topreg:null,
		botreg:null,
		heatreg:null,
		randpos:[],
		load(block){
			let alt = Core.atlas.find("xelos-pixel-texturepack-silicon-smelter");
			this.topreg = getRegion(alt,0,2,2);
			this.botreg = getRegion(alt,1,2,2);
			this.heatreg = getRegion(alt,2,2,2);
			for(var i = 0;i<=20;i++){
				this.randpos[i] = {x: Mathf.random(3,5)-8,y: Mathf.random(3,12)-8};
			}
		},
		draw(build){
			if(!this.topreg){
				this.load(build.block);
			}
			Draw.rect(this.botreg, build.x, build.y);
			
			if(build.warmup > 0 && this.flameColor.a > 0.001){
				var g = 0.3;
				var r = 0.06;
				var cr = Mathf.random(0.1);	    
				var a = (((1 - g) + Mathf.absin(Time.time, 8, g) + Mathf.random(r) - r) * build.warmup);
				Draw.color(getHeatColor(Pal.turretHeat,a*2));
				Draw.rect(this.heatreg,build.x, build.y);
				Draw.color();
			}
			if(Core.settings.getBool("seethrough")){
				drawItemClusterInventory(build.x  ,build.y,Items.coal,build.items,this.randpos,0);
				drawItemClusterInventory(build.x+8,build.y,Items.sand,build.items,this.randpos,10);
			}
			Draw.rect(this.topreg, build.x, build.y);
		}
	})
	
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
				this.drawShield();
			}
			
		});
	}
	
	Blocks.airFactory.buildType = ()=>{
		return extendContent(UnitFactory.UnitFactoryBuild, Blocks.airFactory,deepCopy(unitFacB));
	}
	Blocks.groundFactory.buildType = ()=>{
		return extendContent(UnitFactory.UnitFactoryBuild, Blocks.groundFactory,deepCopy(unitFacB));
	}
	Blocks.navalFactory.buildType = ()=>{
		return extendContent(UnitFactory.UnitFactoryBuild, Blocks.navalFactory,deepCopy(unitFacB));
	}
	
	Blocks.additiveReconstructor.buildType = ()=>{
		return extendContent(Reconstructor.ReconstructorBuild, Blocks.additiveReconstructor,deepCopy(reconFacB));
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
