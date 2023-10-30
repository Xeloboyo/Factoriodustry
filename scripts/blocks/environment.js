
var utils = require("xelos-pixel-texturepack/utils");
var blocks = require("xelos-pixel-texturepack/blocks");

module.exports = () => 
{
    utils.eachType(ContentType.block, block=>{
		if(block instanceof Floor) blocks.floorInit(block);
		
		if(block instanceof Prop) blocks.propInit(block);
	});

    Blocks.sporeMoss.blendGroup = Blocks.moss;
}
