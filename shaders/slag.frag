#define HIGHP

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

const vec2 mscl = vec2(150.0,90.0);
const float mth = 7.0;
const vec3 sky = vec3(0.5,0.8,1.0);
const vec3 basecol = vec3(0.9,0.12,0.05);



float getNoise(vec2 p){
	return clamp(0.5+ (texture2D(u_noise,p).r-0.5)*1.7,0.0,1.0);
}

float getLiq(vec2 rpos, float  size){
	float d =max(abs(rpos.x-0.5), abs(rpos.y-0.5));
	return clamp((d-size)*10.0,-2.0,1.0);
}

void main(){
	float stime = u_time / 20000.0;
	float btime = u_time / 3000.0;
	vec2 uv = v_texCoords;

	vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
	vec2 coords = vec2(uv.x / v.x + u_campos.x, uv.y / v.y + u_campos.y);
	vec2 sclco = ((floor(coords*2.0)*0.5)/mscl);
	float mednoise = getNoise(sclco*0.3 + vec2(stime));
    // Time varying pixel color
    vec2 off = 1.0* vec2(getNoise(sclco + vec2(btime)), getNoise(sclco + vec2(btime*0.3)));
		 off += 4.0* vec2(mednoise,mednoise);
    
    vec2 dpos = (sclco*10.0+ off);
    float size = pow(getNoise((dpos-mod(dpos,1.0))*0.10),5.0);
    size = size*0.3+0.7* pow(  0.6*getNoise(sclco*0.1 + 0.1*vec2(stime))+  0.4*mednoise  ,2.0);
    size=max(0.0,0.2+(size-0.2)*4.0);
    vec2 rpos = dpos-floor(dpos);
    
    vec3 col = basecol* vec3(getNoise(floor(dpos)*0.10 )+(0.1));
	float liq = clamp((max(abs(rpos.x-0.5), abs(rpos.y-0.5))-size)*10.0,0.1,1.0);
	vec2 normaldir = vec2(getLiq(rpos+vec2(0.01,0),size-0.15)-getLiq(rpos-vec2(0.01,0),size-0.15), getLiq(rpos+vec2(0,0.01),size-0.15)-getLiq(rpos-vec2(0,0.01),size-0.15)) * 0.5;
    col*=liq*10.0;
	
	
	vec3 cam = normalize(vec3((uv.x - 0.5)*(u_resolution.x/u_resolution.y),uv.y, 1.0));
	vec3 light = normalize(vec3(0.0 , -0.5 , 0.7));
    vec3 normal =  normalize(vec3(normaldir.x,normaldir.y, -1.0));
	vec3 refl = reflect(cam,normal);
	col += vec3(pow(max(0.0 , -dot(refl,light)),200.0))*(1.0-liq)*0.4;
	
	
	col += vec3(0.4,0.05,0.0) * max(0.0, 1.0- length(uv - vec2(0.5)));
	col = mix(col,vec3(0.7),0.25); 
    gl_FragColor = vec4(col,texture2D(u_texture,uv).a);

}
