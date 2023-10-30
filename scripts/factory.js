
var vars = require("arms_vars");

module.exports = 
{
get: (arms) => 
{
    return {
	arms: [],
	pieces: [],
	gw:0,gh:0,cw:0,ch:0,usprite:null,
	gsize: 24,
	
    getUnitSprite()
    {
		if(this.currentPlan != -1){
			return this.block.plans.get(this.currentPlan).unit.fullIcon;
		}
		return Load("error");
	},
	
    isWorking()
    {
		return this.currentPlan != -1;
	},
	
    getProgress()
    {
		if(this.currentPlan != -1){
			return Math.min(1,this.progress / this.block.plans.get(this.currentPlan).time);
		}
		return 1;
	},
	
    drawBelow(){},
	drawOntop(){},
	
    draw()
    {
		if(this.arms.length == 0) this.setupArms();

		let x = this.x;
		let y = this.y;
		
        let rotdeg = this.rotdeg();
		Draw.rect(this.block.region, x, y);
		Draw.rect(this.block.outRegion, x, y, this.rotdeg());
		
        let pratio = this.getProgress();
		
        this.drawBelow();
		this.drawPayload();
		
        if (this.isWorking())
        {
			let unitSprite = this.getUnitSprite();
			if (this.pieces.length==0 || this.usprite!=unitSprite)
            {
				this.pieces=[];
				this.gw = Math.max(1,Mathf.floor(unitSprite.width/this.gsize));
				this.gh = Math.max(1,Mathf.floor(unitSprite.height/this.gsize));
				this.cw = unitSprite.width/this.gw;
				this.ch = unitSprite.height/this.gh;
				this.usprite=unitSprite;
				this.makePieces(unitSprite);
				this.resetArms();
				this.assignPaths();
			}
			this.windup += (1.0-this.windup)*0.08;
			let rx = 0;
			let ry = 0;
			let ax = 0;
			let ay = 0;
			
			let showam = Mathf.clamp(Mathf.ceil(this.pieces.length*pratio),0,this.pieces.length);
			for (let i = 0;i<showam;i++)
            {
				rx = this.pieces[i].x;
				ry = this.pieces[i].y;
				ax = Mathf.cosDeg(rotdeg-90)*rx + Mathf.sinDeg(rotdeg-90)*ry; 
				ay = Mathf.sinDeg(rotdeg-90)*rx - Mathf.cosDeg(rotdeg-90)*ry; 
				let size = (pratio-this.pieces[i].tstart)/(this.pieces[i].tend - this.pieces[i].tstart);
				size = Mathf.clamp(size,0,1);
				if(size>0)
                {
					Draw.rect(this.pieces[i].tex, x+ax, y+ay, this.cw*Draw.scl*size, this.ch*Draw.scl*size, rotdeg - 90.0);
				}
			}
		}
        else
        {
			this.pieces=[];
			this.usprite = null;
		}

		Draw.z(Layer.blockOver);

		this.payRotation = rotdeg;

		Draw.z(Layer.blockOver + 0.1);
		Draw.rect(this.block.topRegion, x, y,rotdeg);
		this.drawOntop();
		this.drawArms(x,y,pratio,rotdeg);
	},
	
	makePieces(unitSprite)
    {
		let ox = (-this.usprite.width*0.5 + this.cw*0.5)*Draw.scl;
		let oy = (-this.usprite.height*0.5 + this.ch*0.5)*Draw.scl;

		let count = 0.0;
		let total = this.gh*this.gw;
		for (let j = 0;j<this.gh;j++)
        {
			for (let i = 0;i<this.gw;i++)
            {
				let lx = Mathf.floor(i*this.cw);
				let lx2 = Mathf.floor((i+1)*this.cw);
				this.pieces.push(
                    {
                        tex    : new TextureRegion(unitSprite, lx, j*this.ch,lx2-lx,this.ch),
                        x      : (lx)*Draw.scl + ox,
                        y      : (this.ch * j)*Draw.scl + oy,
                        w      : lx2-lx,
                        h      : this.ch,
                        tstart : count/total,
                        tend   : (count+1)/total,
				    });
				count++;
			}	
		}
	},
	
	drawArms(x,y,pratio,rotdeg)
    {
		for(let i=0;i<this.arms.length;i++)
        {
			this.arms[i].draw(x,y,pratio,rotdeg,this.speedScl*(this.payload==null?1:0))
		}
	},
	
	setupArms()
    {
		this.arms.push(arms.mechArm(-32,16, -32,-16));
		this.arms.push(arms.mechArm(32,-16, 32,16));
		this.arms[1].type = vars.type_line_welder;
	},
	
	resetArms()
    {
		for (let i = 0;i<this.arms.length;i++){
			this.arms[i].positions = [];
		}
	},

	assignArmTask(type,tasks)
    {
		switch(type){
			case vars.type_point_welder:
				this.arms[0].positions = this.arms[0].positions.concat(tasks);
			break;
			case vars.type_line_welder:
				this.arms[1].positions = this.arms[1].positions.concat(tasks);
			break;
		}
	},
	
    squarePath(x,y,x2,y2,tstart,tend)
    {
		return [
			{x: x, y: y, t: tstart, a: true },
			{x: x2,y: y, t: Mathf.lerp(tstart,tend,0.2), a: true },
			{x: x2,y: y2,t: Mathf.lerp(tstart,tend,0.4), a: true },
			{x: x ,y: y2,t: Mathf.lerp(tstart,tend,0.6), a: true },
			{x: x ,y: y ,t: tend, a: false },
		];
	},
	
    assignPaths()
    {
		let dt = 1.0/(this.pieces.length*1.0);
		for (let i = 0;i<this.pieces.length;i++)
        {
			let ax = this.pieces[i].x/Draw.scl;
			let ay = this.pieces[i].y/Draw.scl;
			let piece = this.pieces[i];
			this.assignArmTask(vars.type_point_welder,[{
				x: ax,
				y: ay,
				t: piece.tstart,
				a: true,
			}]);
			this.assignArmTask(vars.type_large_welder,[
				{x: ax-piece.w*0.25,y: ay-piece.h*0.25,t: Mathf.lerp(piece.tstart,piece.tend,0.25),a: true},
				{x: ax+piece.w*0.25,y: ay-piece.h*0.25,t: Mathf.lerp(piece.tstart,piece.tend,0.45),a: true},
				{x: ax+piece.w*0.25,y: ay+piece.h*0.25,t: Mathf.lerp(piece.tstart,piece.tend,0.65),a: true},
				{x: ax-piece.w*0.25,y: ay+piece.h*0.25,t: Mathf.lerp(piece.tstart,piece.tend,0.85),a: true},
			]);
			this.assignArmTask(vars.type_line_welder,
				this.squarePath( ax-piece.w*0.5, ay-piece.h*0.5, ax+piece.w*0.5, ay+piece.h*0.5,   Mathf.lerp(piece.tstart,piece.tend,0.6),   Mathf.lerp(piece.tstart,piece.tend,0.9))
			);
		}
		for (let i = 0;i<this.arms.length;i++)
        {
			if (this.arms[i].positions.length == 0 || this.arms[i].positions[0].t>0)
            {
				
				this.arms[i].positions = [{
					x: this.arms[i].restx,
					y: this.arms[i].resty,
					t: 0,
					a: false,
				}].concat(this.arms[i].positions);
			}
		}
	}
};
}
}
