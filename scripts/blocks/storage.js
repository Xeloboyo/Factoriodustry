
var utils = require("xelos-pixel-texturepack/utils");
var storage = require("xelos-pixel-texturepack/storage");

module.exports = () =>
{
    Blocks.container.buildType = () => extend(StorageBlock.StorageBuild, Blocks.container,utils.deepCopy(storage._class));
    Blocks.vault.buildType = () => extend(StorageBlock.StorageBuild, Blocks.vault,utils.deepCopy(storage._class));
}
