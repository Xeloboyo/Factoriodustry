
var utils = require("utils");
var vars = require("arms_vars");

function smoothCurve(x){
	return x*x*(3-2*x);
}

module.exports = (atlas) =>
    {
    
    var mechArm = {
        fromX:0,
        fromY:0,
        toX:0,
        toY:0,
        positions:[],
        actions:[],
        rotation: 0,
        tx: 0, ty: 0, //headpos
        nx: 0, ny: 0, //normal
        lastEffect: 0,lastEffect2: 0,
        type: vars.type_point_welder,
        restx: 0,resty: 0,
        
        draw(bx,by,progress,rotdeg,spd)
        {
            this.lastEffect -= Time.delta;
            this.lastEffect2 -= Time.delta;
            if (this.positions.length>0 && progress < 1 && spd > 0.001)
            {
                for (let i = 0;i<this.positions.length;i++)
                {
                    if (i+1 == this.positions.length || this.positions[i+1].t>progress)
                    {
                        switch (this.type)
                        {
                            case vars.type_point_welder:
                                let dtx = (this.positions[i].x-this.tx);
                                let dty = (this.positions[i].y-this.ty);
                                this.tx += dtx*0.1*spd;
                                this.ty += dty*0.1*spd;
                                if (Math.abs(dtx)+Math.abs(dty)<1 && this.lastEffect<0 && this.positions[i].a)
                                {
                                    utils.createOrientedEffect(vars.weldspark,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,45+Mathf.range(7) +i*839);
                                    this.lastEffect = 5;
                                }
                                break;
    
                            case vars.type_line_welder:
                                let next = this.positions[Math.min(i+1,this.positions.length-1)];
                                let curr = this.positions[i];
                                let l = (progress - curr.t) / (next.t - curr.t);
                                if (next==curr)
                                {
                                    l = 0;
                                }
                                l = smoothCurve(l);
                                this.tx = Mathf.lerp(curr.x,next.x,l);
                                this.ty = Mathf.lerp(curr.y,next.y,l);
                                if (curr.a)
                                {
                                    if (this.lastEffect<0)
                                    {
                                        utils.createOrientedEffect(vars.weldspark,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,45+Mathf.range(7)+i*4);
                                        this.lastEffect = 5;
                                    }
                                    if (this.lastEffect2<0)
                                    {
                                        utils.createOrientedEffect(vars.weldglow,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,0);
                                        this.lastEffect2 = 1.5;
                                    }
                                }
                                break;
                        }
                        break;
                    }
                }
            }
            else
            {
                this.tx += (this.restx -this.tx)*0.1;
                this.ty += (this.resty -this.ty)*0.1;
            }
            this.drawArm(bx,by,rotdeg,progress);
        },
        
        drawArm(bx,by,rotdeg,progress)
        {
            let dx = this.toX-this.fromX; let dy = this.toY - this.fromY;
            let slidepos = ((this.tx-this.fromX)*dx + (this.ty-this.fromY)*dy)/(dx*dx+dy*dy);
            
            let x = Mathf.lerp(this.fromX,this.toX,slidepos);
            let y = Mathf.lerp(this.fromY,this.toY,slidepos);
            let dis = Mathf.dst(x,y,this.tx,this.ty);
            for (let i = 0;i<dis-16;i+=32)
            {
                utils.drawOrientedRect(atlas.armconn,bx,by,(this.tx-this.nx*(i+16))*Draw.scl,(this.ty-this.ny*(i+16))*Draw.scl,rotdeg,this.rotation);
            }
            utils.drawOrientedRect(atlas.armhead,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,this.rotation);//
            utils.drawOrientedRect(atlas.armbase,bx,by,x*Draw.scl,y*Draw.scl,rotdeg,this.rotation);//
        },
        
        repeatPosition(rest, t)
        {
            if (this.positions.length==0) return;
            let copy = Object.create(this.positions[this.positions.length-1]);
            copy.a = rest;
            copy.t = t;
            this.positions.push(copy);
        },
        
        resetRail(x,y,x2,y2)
        {
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
        newArm(x,y,x2,y2)
        {
            let arm = Object.create(this);
            arm.resetRail(x,y,x2,y2);
            return arm;
        }
    };
    
    var pivotingMechArm = Object.assign(utils.deepCopy(mechArm),{
        seglength:40,
        pox:0,poy:0,
        drawArm(bx,by,rotdeg,progress){
            let dx = this.toX-this.fromX; let dy = this.toY - this.fromY;
            let slidepos = ((this.tx-this.fromX)*dx + (this.ty-this.fromY)*dy)/(dx*dx+dy*dy);
            slidepos = Mathf.clamp(slidepos,0,1);
            let x = Mathf.lerp(this.fromX,this.toX,slidepos);
            let y = Mathf.lerp(this.fromY,this.toY,slidepos);
            let tdx = this.tx-x;
            let tdy = this.ty-y;
            let tdd = Mathf.dst(0,0,tdx,tdy);
            let itdd = 1.0/tdd;
            let o = Mathf.sqrt(this.seglength*this.seglength - tdd*tdd*0.25)
            if(o<0 || isNaN(o)){
                o = 0;
            }
            let otx = o*(tdy*itdd);
            let oty = o*(tdx*itdd);
            if(Math.abs(x + tdx*0.5 + otx - this.pox)+Math.abs(y + tdy*0.5 - oty - this.poy) > 
               Math.abs(x + tdx*0.5 - otx - this.pox)+Math.abs(y + tdy*0.5 + oty - this.poy)){
                o*=-1;
            }
            
            let ox = x + tdx*0.5 + o*(tdy*itdd);
            let oy = y + tdy*0.5 - o*(tdx*itdd);
            
            this.drawArmActual(x,y,bx,by,ox,oy,rotdeg,progress);
            
            this.pox=ox;
            this.poy=oy;
            if(progress==1){
                this.pox = 0;
                this.poy = 0;
            }
        },
        
        drawArmActual(x,y,bx,by,ox,oy,rotdeg,progress){
            Lines.stroke(8);
            utils.drawOrientedLine(atlas.armconntickside, bx,by, ox*Draw.scl, oy*Draw.scl, x*Draw.scl, y*Draw.scl,rotdeg);
            utils.drawOrientedLine(atlas.armconnside, bx,by, ox*Draw.scl, oy*Draw.scl, this.tx*Draw.scl, this.ty*Draw.scl,rotdeg);
            
            utils.drawOrientedRect(atlas.armconnjoint,bx,by,ox*Draw.scl,oy*Draw.scl,rotdeg,this.rotation);//
            
            utils.drawOrientedRect(atlas.armbase,bx,by,x*Draw.scl,y*Draw.scl,rotdeg,this.rotation);//
            utils.drawOrientedRect(atlas.armhead,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,this.rotation);//
        }
    });
    
    var pivotingMechArmLarge = Object.assign(utils.deepCopy(pivotingMechArm),{
        drawArmActual(x,y,bx,by,ox,oy,rotdeg,progress){
            Lines.stroke(8);
            utils.drawOrientedLine(atlas.armconntickside, bx,by, ox*Draw.scl, oy*Draw.scl, x*Draw.scl, y*Draw.scl,rotdeg);
            utils.drawOrientedLine(atlas.armconntickside, bx,by, ox*Draw.scl, oy*Draw.scl, this.tx*Draw.scl, this.ty*Draw.scl,rotdeg);
            
            utils.drawOrientedRect(atlas.armconnjoint,bx,by,ox*Draw.scl,oy*Draw.scl,rotdeg,this.rotation);//
            
            utils.drawOrientedRect(atlas.armbase,bx,by,x*Draw.scl,y*Draw.scl,rotdeg,this.rotation);//
            utils.drawOrientedRect(atlas.armheadlarge,bx,by,this.tx*Draw.scl,this.ty*Draw.scl,rotdeg,this.rotation);//
        }
    });
    
    return {
    
    pivotingMechArmLarge: (ax,ay,bx,by) => pivotingMechArmLarge.newArm(ax,ay,bx,by),
    pivotingMechArm: (ax,ay,bx,by) => pivotingMechArm.newArm(ax,ay,bx,by),
    mechArm: (ax,ay,bx,by) => mechArm.newArm(ax,ay,bx,by),
    armbase: atlas.armbase,
    armhead: atlas.armhead,
    armheadlarge: atlas.armheadlarge,
    armconn: atlas.armconn,
    armconnside: atlas.armconnside,
    armconntickside: atlas.armconntickside,
    armconnjoint: atlas.armconnjoint,
    expoplatform: atlas.expoplatform
    
    };
}
