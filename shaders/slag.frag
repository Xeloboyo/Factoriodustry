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
const vec3 basecol = vec3(0.9,0.15,0.05);



float getNoise(vec2 p){
	return 0.5+ (texture2D(u_noise,p).r-0.5)*1.5;
}

void main(){
	float stime = u_time / 20000.0;
	float btime = u_time / 3000.0;
	vec2 uv = v_texCoords;

	vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
	vec2 coords = vec2(uv.x / v.x + u_campos.x, uv.y / v.y + u_campos.y);
	vec2 sclco = ((floor(coords*2.0)*0.5)/mscl);

    // Time varying pixel color
    vec2 off = 1.0* vec2(getNoise(sclco + vec2(btime)), getNoise(sclco + vec2(btime*0.3)));
		 off += 4.0* vec2(getNoise(sclco*0.3 + vec2(stime)), getNoise(sclco*0.3 + vec2(stime)));
    
    vec2 dpos = (sclco*10.0+ off);
    float size = pow(getNoise((dpos-mod(dpos,1.0))*0.10),5.0);
    size = size*0.3+0.7* getNoise(sclco*0.03 + vec2(stime));
    
    vec2 rpos = dpos-floor(dpos);
    float d =length(vec2((rpos.x-0.5),(rpos.y-0.5)));
    
    vec3 col = basecol* vec3(getNoise(floor(dpos)*0.10 )+(0.1));
	float liq = clamp((d-size)*10.0,0.1,1.0);
    col*=liq*10.0;
	
	
	vec3 cam = normalize(vec3((uv.x - 0.5)*(u_resolution.x/u_resolution.y),uv.y, 1.0));
	vec3 light = normalize(vec3(0.0 , -0.5 , 0.7));
    vec3 normal =  vec3(0, 0, -1.0);
	vec3 refl = reflect(cam,normal);
	col += vec3(pow(max(0.0 , -dot(refl,light)),700.0))*(1.0-liq)*0.4;
	
	
	col += vec3(0.4,0.05,0.0) * max(0.0, 1.0- length(uv - vec2(0.5)));
	col = mix(col,vec3(0.7),0.15); 
    gl_FragColor = vec4(col,texture2D(u_texture,uv).a);

}
