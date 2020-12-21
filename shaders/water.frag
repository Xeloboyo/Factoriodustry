#define HIGHP

uniform sampler2D u_texture;
uniform sampler2D u_noise;
uniform sampler2D u_flying;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

uniform vec2 mscl;
uniform float tscal;
const float mth = 7.0;

const vec3 sky = vec3(0.5,0.8,1.0);

float ridge(float x){
	return min(max(0.5-(2.0*x),2.0*x-0.5),2.5-(2.0*x))-0.5;
}


void main(){
	float stime = tscal*u_time / 5.0;
	float btime = tscal*u_time / 1500.0;
	vec2 c = v_texCoords;

	vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
	vec2 coords = vec2(c.x / v.x + u_campos.x, c.y / v.y + u_campos.y);
	
	vec2 wavecord = c + vec2(sin(stime/3.0 + coords.y/0.75) * v.x, 0.0);

	
	vec4 fcolor = texture2D(u_texture, wavecord);
    vec3 color = fcolor.rgb *0.7;
	float hm = min(1.0,texture2D(u_texture, wavecord+vec2(0.0,5.0)*v).a*2.0);
	vec2 o1 = 0.17*vec2(ridge(texture2D(u_noise,coords/mscl + vec2(btime)).r), ridge(texture2D(u_noise,coords/mscl + vec2(btime*vec2(-1,1))).r));
		
	vec3 cam = normalize(vec3((c.x - 0.5)*(u_resolution.x/u_resolution.y),c.y, 1.0));
	vec3 light = normalize(vec3(0.0 , -0.5 , 0.7));
    vec3 normal =  normalize(vec3(o1.x, o1.y, -1.0));
	
	vec3 refl = reflect(cam,normal);
	
	vec4 fly = texture2D(u_flying, c+refl.xy*v*30.0);
	
	vec3 lightcol = vec3(pow(max(0.0 , -dot(refl,light)),700.0))* (0.8*color+vec3(0.2));
	lightcol += sky*(pow(max(0.0 , -dot(refl,light)),10.0))*0.1;
	lightcol += sky*0.5*(length(o1)*0.8+0.2);
	
	color += hm*lightcol*(1.0-fly.a) + (fly.a*fly.rgb * 0.2);
	color*=(1.0-fly.a*0.2);
	gl_FragColor = vec4(color.rgb, min(1.0,fcolor.a*6.0));
}
