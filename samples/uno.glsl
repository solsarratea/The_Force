//Boundaries
#define MAX_STEPS 32
#define MAX_DIST 10.
#define SURF_DIST .001

//Auxiliar functions
float opSubtraction( float d1, float d2 )
{
    return max(-d1,d2);
}

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s + sin(time/2.)*4., s, c);
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}


float scene(vec3 ray){
    float radius = 0.3;
    vec3 modSpace;
    
    float s = sdSphere(vec3(ray.xy,ray.z/1.2),0.55);
    float sr = sdSphere(vec3(ray.x/0.5+sin(time)*2.,ray.y/1.8,0.),0.22);
 
    modSpace = vec3(ray.z,2.,ray.x);
    ray = mod(ray, modSpace)-0.5*modSpace;
    
    float s2 = sdSphere(ray,radius);
    
	return min(opSubtraction(sr,s),s2);
}


vec3 trace(vec3 rayOrigin, vec3 dir) {
	float walk=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = rayOrigin + dir*walk;
        float dS = scene(p);
        walk += dS;
        if(walk>MAX_DIST || dS<SURF_DIST) break;
    }

    return hsv2rgb(vec3((1.-walk)/1.9));
}


void main () {
	
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    uv.x *= resolution.x/resolution.y;
    uv = (uv*2.5) - vec2(2.5,1.2);
    
    vec3 camOrigin = vec3(0.,pow(cos(time/2.),2.),pow(sin(time/3.),2.));  
    vec3 rayOrigin = vec3(camOrigin.xy + uv, camOrigin.z + .5);
    
    
    
    //Experimenting rotations
    rayOrigin.yz *= Rot(-uv.y*sin(time/2.));
    rayOrigin.xz *= Rot(-uv.x*(time/2.));

	vec3 dir = normalize(rayOrigin-camOrigin);
    
    
    gl_FragColor = vec4(trace(rayOrigin, dir),1.);
}