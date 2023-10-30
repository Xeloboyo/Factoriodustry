
var arms_vars = require("xelos-pixel-texturepack/arms_vars");
var utils = require("xelos-pixel-texturepack/utils");

function exponentialReconstructor(arms, reconstructor)
{
    Blocks.exponentialReconstructor.buildType = () => extend(Reconstructor.ReconstructorBuild, Blocks.exponentialReconstructor,Object.assign(utils.deepCopy(reconstructor),{
        gsize:48,
        platformy: 0,
        assignArmTask(type,tasks){
            switch(type){
                case arms_vars.type_point_welder:
                    if(tasks[0].x<=0){
                        this.arms[0].positions = this.arms[0].positions.concat(tasks);
                        this.arms[3].repeatPosition(false,tasks[0].t);
                    }else{
                        this.arms[3].positions = this.arms[3].positions.concat(tasks);
                        this.arms[0].repeatPosition(false,tasks[0].t);
                    }
                    
                break;
                case arms_vars.type_line_welder:
                    if(tasks[0].x<=0){
                        this.arms[1].positions = this.arms[1].positions.concat(tasks);
                    }else{
                        this.arms[2].positions = this.arms[2].positions.concat(tasks);
                    }
                break;
                case arms_vars.type_large_welder:
                    this.arms[4].positions = this.arms[4].positions.concat(tasks);
                break;
            }
        },	
        setupArms(){
            
            this.arms.push(arms.pivotingMechArm( -80,0,-48,0));
            this.arms.push(arms.pivotingMechArm( -48,0,-16,0));//
            this.arms.push(arms.pivotingMechArm( 16,0,48,0));
            this.arms.push(arms.pivotingMechArm( 48,0,80,0));
            this.arms.push(arms.pivotingMechArmLarge( -16,0,16,0));//
            
            this.arms[1].type = arms_vars.type_line_welder;
            this.arms[2].type = arms_vars.type_line_welder;
            this.arms[0].seglength = 40;
            this.arms[1].seglength = 40;
            this.arms[2].seglength = 40;
            this.arms[3].seglength = 40;
            this.arms[4].seglength = 80;
        },
        drawOntop(){
            let target = (this.getProgress()-0.5)*32*5;
            target += this.getProgress()<0.5? 32: -32;
            
            this.platformy += (target-this.platformy)*0.03;
            for(let i =0;i<this.arms.length;i++){
                this.arms[i].resetRail(this.arms[i].fromX, this.platformy,this.arms[i].toX, this.platformy);
            }
            utils.drawOrientedRect(arms.expoplatform,this.x,this.y,0,this.platformy*Draw.scl,this.rotdeg(),90);
        },
    }));
}
function multiplicativeReconstructor(arms, reconstructor)
{
    Blocks.multiplicativeReconstructor.buildType = () => extend(Reconstructor.ReconstructorBuild, Blocks.multiplicativeReconstructor,Object.assign(utils.deepCopy(reconstructor),{
        assignArmTask(type,tasks){
            switch(type){
                case arms_vars.type_point_welder:
                    if(tasks[0].x<=0){
                        this.arms[0].positions = this.arms[0].positions.concat(tasks);
                        this.arms[3].repeatPosition(false,tasks[0].t);
                    }else{
                        this.arms[3].positions = this.arms[3].positions.concat(tasks);
                        this.arms[0].repeatPosition(false,tasks[0].t);
                    }
                break;
                case arms_vars.type_line_welder:
                    if(tasks[0].x<=0){
                        this.arms[1].positions = this.arms[1].positions.concat(tasks);
                    }else{
                        this.arms[2].positions = this.arms[2].positions.concat(tasks);
                    }
                break;
            }
        },
        setupArms(){
            this.arms.push(arms.pivotingMechArm(-51,-22, -22,-51));
            this.arms.push(arms.pivotingMechArm(-22,51,-51,22,));
            this.arms.push(arms.pivotingMechArm( 22,-51,51,-22));
            this.arms.push(arms.pivotingMechArm( 51,22,22,51));
            this.arms[1].type = arms_vars.type_line_welder;
            this.arms[2].type = arms_vars.type_line_welder;
            this.arms[0].seglength = 40;
            this.arms[1].seglength = 40;
            this.arms[2].seglength = 40;
            this.arms[3].seglength = 40;
        },
        makePieces(unitSprite){
            let ox = (-this.usprite.width*0.5 + this.cw*0.5)*Draw.scl;
            let oy = (-this.usprite.height*0.5 + this.ch*0.5)*Draw.scl;
            let count = 0.0;
            let total = this.gh*this.gw;
            let tempList = [];
            for (let j = 0;j<this.gh;j++){
                for (let i = 0;i<this.gw;i++){
                    tempList.push({
                        tex: new TextureRegion(unitSprite, i*this.cw, j*this.ch,this.cw,this.ch),
                        x: (this.cw * i)*Draw.scl + ox,
                        y: (this.ch * j)*Draw.scl + oy,
                        w: this.cw,
                        h: this.ch,
                        tstart: count/total,
                        tend: (count+1)/total,
                    });
                    count ++;
                }	
            }
            tempList.sort((f, s) => { 
                return (Math.abs(f.x)+Math.abs(f.y))-(Math.abs(s.x)+Math.abs(s.y));
            });
            for (let i = 0;i<tempList.length;i++){
                tempList[i].tstart = i/total;
                tempList[i].tend = (i+1)/total;
                this.pieces.push(tempList[i]);
            }
        },
    }));
}

module.exports = (arms, factory, reconstructor) =>
{
	factory = factory.get(arms);
	reconstructor = reconstructor.get(arms);

	Blocks.airFactory.buildType    = () => extend(UnitFactory.UnitFactoryBuild, Blocks.airFactory,    utils.deepCopy(factory));
	Blocks.groundFactory.buildType = () => extend(UnitFactory.UnitFactoryBuild, Blocks.groundFactory, utils.deepCopy(factory));
	Blocks.navalFactory.buildType  = () => extend(UnitFactory.UnitFactoryBuild, Blocks.navalFactory,  utils.deepCopy(factory));
	
	Blocks.additiveReconstructor.buildType = () => extend(Reconstructor.ReconstructorBuild, Blocks.additiveReconstructor, utils.deepCopy(reconstructor));
	multiplicativeReconstructor(arms, reconstructor);
	exponentialReconstructor(arms, reconstructor);
}
