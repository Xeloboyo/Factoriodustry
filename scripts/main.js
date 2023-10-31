
var utils = require("utils");
var atlas = require("atlas");

var arms = require("arms");

// init content
require("content");

var defense_blocks = require("blocks/defense");
var distribution_blocks = require("blocks/distribution");
var environment_blocks = require("blocks/environment");
var production_blocks = require("blocks/production");
var storage_blocks = require("blocks/storage");
var units_blocks = require("blocks/units");

var reconstructor = require("reconstructor");
var factory = require("factory");

function blocks_init()
{
	defense_blocks();
	distribution_blocks();
	environment_blocks();
	production_blocks();
	storage_blocks();
	units_blocks(arms, factory, reconstructor);
}

Events.on(EventType.ClientLoadEvent, 
cons(e => {
	Log.info("Client load")
	
	arms = arms({
		armbase: utils.Load("xelos-pixel-texturepack-construct-arm-base"),
		armhead: utils.Load("xelos-pixel-texturepack-construct-arm-head"),
		armheadlarge: utils.Load("xelos-pixel-texturepack-construct-arm-head-large"),
		armconn: utils.Load("xelos-pixel-texturepack-construct-arm-connector"),
		armconnside: utils.Load("xelos-pixel-texturepack-construct-arm-connector-side"),
		armconntickside: utils.Load("xelos-pixel-texturepack-construct-arm-connector-thick-side"),
		armconnjoint: utils.Load("xelos-pixel-texturepack-construct-arm-connector-joint"),
		expoplatform: utils.Load("xelos-pixel-texturepack-construct-platform")
	});

	utils.eachType(ContentType.item, item=>{
		atlas.setupIcon("item",item.name,item.fullIcon);
	});
	
	utils.eachType(ContentType.unit, unit=>{
		atlas.setupIcon("unit",unit.name + "-outline", utils.Load("unit-"+unit.name + "-outline"));
		unit.loadIcon();
		atlas.setupIcon("unit",unit.name,unit.fullIcon);
	});
	
	blocks_init();
})
);

// init shaders
require("shaders");

// init settings
require("settings");
