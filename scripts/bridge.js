
const bridge={
	itemmove:[],
	moveindex:0,
	cap:6,
	
	create(block,team)
    {
		Log.info("T123 aaa");
		this.super$create(block,team);
		this.items = extend(ItemModule,{
			onTake:null,
			
            take()
            {
				var itm = this.super$take();
				if(this.onTake){
					this.onTake.get(itm);
				}
				return itm;
			},
			
            setTakeCons(s)
            {
				this.onTake=s;
			}
		});
		this.cap=6;
		if (this.block.bufferCapacity)
        {
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
	
    draw()
    {

		this.super$draw();
		if (!Core.settings.getBool("seethrough")) return;
		Draw.z(Layer.power);
		Draw.color();
		let other = Vars.world.tile(this.link);
		if(!this.block.linkValid(this.tile, other,true)) return;
		
		let opacity = Core.settings.getInt("bridgeopacity") / 100.0;
		if(Mathf.zero(opacity)) return;
		Draw.alpha(opacity);
		

		let i = this.tile.absoluteRelativeTo(other.x, other.y);
		
		let ex = other.worldx() - this.x;
        let ey = other.worldy() - this.y;
		let ttime = this.block.transportTime*10;
		if (this.block.bufferCapacity)
        {
			ttime = this.block.transportTime*10+ 3600/this.block.speed;
		}
		for (var m = 0;m<this.itemmove.length;m++)
        {
			if (this.itemmove[m] && this.itemmove[m].item && this.itemmove[m].t+ttime>Time.time)
            {
				var tlerp = (Time.time-this.itemmove[m].t)/ttime;
				Draw.rect(this.itemmove[m].item.fullIcon, this.x+ex*tlerp, this.y+ey*tlerp, 3,3);
			}
		}

		Draw.reset();
	}
};

module.exports =
{
	bridgeBase: bridge
}
