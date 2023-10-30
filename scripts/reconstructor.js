
var factory = require("factory");
var utils = require("utils");
var vars = require("arms_vars");

module.exports = {

get: (arms) =>
{
    return Object.assign(utils.deepCopy(factory.get()),{
        getUnitSprite()
        {
            if(this.isWorking()){
                return this.upgrade(this.payload.unit.type).fullIcon;
            }
            return utils.Load("error");
        },
        
        isWorking()
        {
            return this.constructing() && this.hasArrived();
        },
        
        getProgress()
        {
            if(this.isWorking()){
                return this.progress / this.block.constructTime;
            }
            return 1;
        },
        
        drawBelow()
        {
            let fallback = true;
            for (let i = 0; i < 4; i++)
            {
                if (this.blends(i) && i != this.rotation)
                {
                    Draw.rect(this.block.inRegion, this.x, this.y, (i * 90) - 180);
                    fallback = false;
                }
            }
            if (fallback)
            { 
                Draw.rect(this.block.inRegion, this.x, this.y, this.rotation * 90);
            }
            if (this.isWorking())
            {
                Draw.rect(this.payload.unit.type.fullIcon, this.x, this.y, this.payload.rotation() - 90);
            }
        },
    
        assignArmTask(type,tasks)
        {
            Log.info(type+","+tasks);
            switch (type)
            {
                case vars.type_point_welder:
                    this.arms[0].positions = this.arms[0].positions.concat(tasks);
                break;
                case vars.type_line_welder:
                    this.arms[1].positions = this.arms[1].positions.concat(tasks);
                break;
            }
        },
    
        setupArms()
        {
            this.arms.push(arms.pivotingMechArm(-40,-32, -39,-32));
            this.arms.push(arms.pivotingMechArm(40,32, 39,32));
            this.arms[1].type = vars.type_line_welder;
            this.arms[0].seglength = 54;
            this.arms[1].seglength = 54;
        },
        
        drawArms(x,y,pratio,rotdeg)
        {
            for (let i=0;i<this.arms.length;i++)
            {
                this.arms[i].draw(x,y,pratio,rotdeg,this.speedScl);
            }
        },
        
    });
}

}
