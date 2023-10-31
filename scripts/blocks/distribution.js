
var utils = require("xelos-pixel-texturepack/utils");
var bridge = require("xelos-pixel-texturepack/bridge");

module.exports = () =>
{
	Blocks.itemBridge.buildType = () => extend(BufferedItemBridge.BufferedItemBridgeBuild, Blocks.itemBridge,utils.deepCopy(bridge.bridgeBase));
	Blocks.phaseConveyor.buildType = ()=> extend(ItemBridge.ItemBridgeBuild, Blocks.phaseConveyor,utils.deepCopy(bridge.bridgeBase));
}
