
var utils = require("utils");

const _class = {
	topreg:null,
	botreg:null,
	randpos:[],
	shuffle:[],
	
    draw()
    {	
		if (!Core.settings.getBool("seethrough"))
        {
			this.super$draw();
			return;
		}
		if (!this.topreg)
        {
			this.loadreg();
		}
		Draw.rect(this.botreg, this.x, this.y);
		let total = this.items.total();
		if (total>0)
        {
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
			
			for (var tr = 0;tr<this.shuffle.length;tr++)
            {
				if(iiar[this.shuffle[tr]]){
					Draw.rect(iiar[this.shuffle[tr]].fullIcon, this.x+this.randpos[tr].x, this.y+this.randpos[tr].y, 5,5);
				}
			}
		}
		Draw.rect(this.topreg, this.x, this.y);
		this.drawTeamTop();
	},
	
    loadreg()
    {
		let alt = utils.Load("xelos-pixel-texturepack-"+this.block.name);
		this.topreg = utils.getRegion(alt,0,2,1);
		this.botreg = utils.getRegion(alt,1,2,1);
		let s = this.block.size;
		for (var i = 0;i<=30+s*10;i++)
        {
			this.randpos[i] = {x: Mathf.random(-s*2,s*2),y: Mathf.random(-s*2,s*2)};
		}
		let avail = [];
		for (var i = 0;i<s*10;i++)
        {
			avail[i] = i;
		}
		for (var i = 0;i<s*10;i++)
        {
			var rpos = Math.floor(Math.random(0,avail.length));
			this.shuffle[i]=avail[rpos];
			avail.splice(rpos,1);
		}
	}
};

module.exports = {

_class: _class
	
}
