




function changeAtlas(name){
	print("Changing"+name);
	var editoricon2 = Core.atlas.find("block-"+name + "-medium");
	var newicon = Core.atlas.find("xelos-pixel-texturepack-"+name+"-icon");
	editoricon2.set(newicon.u, newicon.v, newicon.u2, newicon.v2);
	editoricon2.texture = newicon.texture;
}

Events.on(EventType.ClientLoadEvent, 
cons(e => {
	changeAtlas("thorium-wall");
	changeAtlas("thorium-wall-large");
	changeAtlas("copper-wall");
	changeAtlas("copper-wall-large");
	changeAtlas("titanium-wall");
	changeAtlas("titanium-wall-large");
	changeAtlas("plastanium-wall");
	changeAtlas("plastanium-wall-large");
	changeAtlas("phase-wall");
	changeAtlas("phase-wall-large");
	changeAtlas("scrap-wall");
	changeAtlas("scrap-wall-large");
	
	Blocks.sporeMoss.blendGroup = Blocks.moss;
	
})
)
