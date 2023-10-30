
var utils = require("utils");
var atlas = require("atlas");

module.exports = {

floorInit: (block) =>
{
    if(block.variants>0){
        if(block.variantRegions){
            for(let i = 0;i<block.variants;i++){
                atlas.directAtlasReplace(block.variantRegions[i], utils.Load("xelos-pixel-texturepack-"+block.name+(i+1)));
            }
        }
    }else{
        atlas.directAtlasReplace(block.variantRegions[0], utils.Load("xelos-pixel-texturepack-"+block.name));
    }
    atlas.directAtlasReplace(utils.Load(block.name+"-edge"), utils.Load("xelos-pixel-texturepack-"+block.name + "-edge"));
},

propInit: (block) =>
{
    if(block.variants>0){
        if(block.variantRegions){
            for(let i = 0;i<block.variants;i++){
                atlas.directAtlasReplace(block.variantRegions[i], utils.Load("xelos-pixel-texturepack-"+block.name+(i+1)));
            }
        }
    }else{
        atlas.directAtlasReplace(block.region, utils.Load("xelos-pixel-texturepack-"+block.name));
    }
    if(block instanceof StaticWall){
        atlas.directAtlasReplace(block.large, utils.Load("xelos-pixel-texturepack-"+block.name+"-large"));
    }
}
}
