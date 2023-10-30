
var utils = require("utils");

var buffer;

function initFlyingBuffer()
{
    buffer = new FrameBuffer(Core.graphics.width, Core.graphics.height);
}

// init flying buffer event
Events.run(Trigger.draw, () => {
    Draw.draw(Layer.flyingUnitLow-0.01, run(()=>{
        buffer.resize(Core.graphics.width, Core.graphics.height);
        buffer.begin(Color.clear);
    }));
    Draw.draw(Layer.flyingUnit+0.01, run(()=>{
        buffer.end();
        buffer.blit(Shaders.screenspace);
    }));
});


function extendShader(shadername, ext){
	const shad = new Shader(utils.readString("shaders/screenspace.vert"), utils.readString("shaders/"+shadername+".frag"));
	return extend(Shaders.SurfaceShader, "space", Object.assign({
			setVertexAttribute(name, size, type, normalize, stride, buffer) {
				shad.setVertexAttribute(name, size, type, normalize, stride, buffer);
			},
			enableVertexAttribute(location){
				shad.enableVertexAttribute(location);
			},
			disableVertexAttribute(name){
				shad.disableVertexAttribute(name);
				//3553
			},
			fetchUniformLocation(name, pedantic) {
				return shad.fetchUniformLocation(name,pedantic);
			},
			getAttributeLocation(name){
				return shad.getAttributeLocation(name);
			},
			getAttributes(){
				return shad.getAttributes();
			},
			getUniforms(){
				return shad.getUniforms();
			},
			getAttributeSize(name){
				return shad.getAttributeSize(name);
			},
			bind(){
				shad.bind();
			},
			hasUniform(name) {
				return shad.hasUniform(name);
			},
			getUniformType(name) {
				return shad.getUniformType(name);
			},
			getUniformLocation(name) {
				return shad.getUniformLocation(name);
			},
			getUniformSize(name) {
				return shad.getUniformSize(name);
			},
			dispose() {
				shad.dispose();
				this.super$dispose();
			},
			isDisposed() {
				return shad.isDisposed();
			}
		},ext));
}

function addShader(shader, name){
	Shaders[name] = shader;
	let original = CacheLayer[name];
	for(let i = 0;i<CacheLayer.all.length;i++){
		if(CacheLayer.all[i] == original){
			CacheLayer[name] = new CacheLayer.ShaderLayer(shader);
			CacheLayer.all[i] = CacheLayer[name];
			CacheLayer.all[i].id = i;
		}
	}
}

function initShaders(){
	Shaders.water = extendShader("water", {
		apply(){
			buffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,60.0));
			this.setUniformf("tscal",1.0);
		}}
	);
	addShader(Shaders.water,"water");
	
	Shaders.tar = extendShader("tar", {
		apply(){
			buffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,200.0));
			this.setUniformf("tscal",0.2);
		}}
	);
	addShader(Shaders.tar,"tar");
	
	Shaders.mud = extendShader("mud", {
		apply(){
			buffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(100.0,100.0));
			this.setUniformf("tscal",0.02);
		}}
	);
	addShader(Shaders.mud,"mud");
	
	Shaders.slag = extendShader("slag", {});
	addShader(Shaders.slag,"slag");
}

Events.on(EventType.ClientLoadEvent, 
cons(e => {
	Log.info("Shaders load");

	initFlyingBuffer();
	initShaders();
}));
