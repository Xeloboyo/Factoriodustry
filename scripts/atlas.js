
// replace region <name> to <region> in Mindustry atlas
function replaceAtlas(name, region)
{
	if (!region)
	{
		Log.info("Trying to replace \"" + name+ "\" to null.");
		return; // return if <region> not founded
	}
 	var replaceRegion = Core.atlas.find(name);
	if (!replaceRegion)
	{
		Log.info("\""+name+"\" not available.");
		return; // return if <name> sprite not in atlas
	}
 	replaceRegion.set(region);
}

module.exports = {

	// change standart icon of block <name> to texturepack icon
	setupBlockIcon: (name) =>
	{
		var editoricon2 = Core.atlas.find("block-"+name+"-medium");
		var newicon = Core.atlas.find("xelos-pixel-texturepack-"+name+"-icon");
		editoricon2.set(newicon.u, newicon.v, newicon.u2, newicon.v2);
		editoricon2.texture = newicon.texture;
	},

	// change standart icon of <name> with <type> to <region>
	setupIcon: (type, name, region) =>
	{
		replaceAtlas(type+"-"+name+"-full",region);
		replaceAtlas(type+"-"+name+"-ui",region);
	},

	// direct replace of texture region to other region
	directAtlasReplace: (region, replacement) =>
	{
		if (replacement.name == "error" || !replacement || !region) return; // return if arguments not avaible
		region.texture.getTextureData().pixmap.draw(replacement.texture.getTextureData().pixmap,
						region.u * region.texture.width,
						region.v * region.texture.height,
						replacement.u*replacement.texture.width, replacement.v*replacement.texture.height, replacement.width, replacement.height);
	}
}