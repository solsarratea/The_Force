// NOTE: TURN ON THE MIC

#define EPS 0.001

const int maxIterations = 48;
const float stepScale = 1.;
const float stopThreshold = .0005;

float fov = .9;//+cos(time)*0.2;
float nearClip = 0.;
float farClip = 40.;
#define  t fract(time*0.3)

struct Light {
  vec3 position;
  float intensity;
  vec3 color;
};

struct Surface {
  float dist;
  vec3 position;
  vec3 baseColor;
  vec3 normal;
  vec3 emissiveColor;
  float id;
};

struct Hit {
  Surface surface;
  Surface near;

};

vec2 sdCutie(vec3 pos){
   /* This is the body of a cute pinkish creature */

    float id =1.;
    float y = 4.0*t*(1.-t);

    float sy = (0.5+0.5*y); float sz = .8/sy;

    vec3 posc = pos-vec3(0.,y*5.-3.,0.);

    //body
    float d = sdElipsoide(posc,vec3(1.4,sy*2.,sz));
    vec3 h = posc+vec3(0.,-2.,-0.);
    vec3 sh = vec3(abs(h.x),h.yz);

    //head
    float d2 = sdElipsoide(h,vec3(1.));
    d = smin(d,d2,2.);
    vec3 eb = sh-vec3(.5,.5,0.9); float a = mix(-0.9,0.9,1.-y*0.5);
    eb.xy = mat2(cos(a),sin(a),-sin(a),cos(a))*eb.xy;

    //horns
    float d5 = sdElipsoide(eb,vec3(0.4,0.1,0.1));
    d = smin(d,d5,.39);
    id =max(id,1. * float(d==d5));

     //mouth
    float d6 = sdElipsoide(h-vec3(0.,-1.+h.x*h.x*3.,1.),vec3(mix(0.2,0.3,sy),0.4,0.5));
    d = smax(-d6,d,0.14);

    //eye
    float d3 = sdSphere(sh-vec3(.5,0.,1.),0.3);
    d = min(d,d3);
    id =max(id,2. * float(d==d3));

    float d4 = sdElipsoide(sh-vec3(.5,0.,1.2),vec3(0.1,0.3,0.2));
    d = min(d,d4);
    id =max(id,3. * float(d==d4));

    //arms
    vec3 ll = sh-vec3(1.5+h.y*h.y*.1,-1.,0.); float a1 = mix(-0.7,-2.5,y);
    ll.xy = mat2(cos(a1),sin(a1),-sin(a1),cos(a1))*ll.xy;
    float d7 = sdElipsoide(ll,vec3(0.3,1.2,0.4));
    d = smin(d,d7,.7);
    id =max(id,1. * float(d==d4));


    return vec2(d,id);

}

vec2 map (in vec3 p){
    /* map is describing the objects in our scene using SDFs*/

    float y = 4.0*t*(1.-t);
    vec3 pos = p;

    // vec3 pos = repeat(p,vec3(10.,0.,10.));
    // pR(pos.xz,time);
    vec2 d1 = sdCutie(pos);

    float dfw = p.y+2.8+sin(length(pos)*5.+time)*sin(pos.y)*sin(pos.x)*(1.-y)*0.5;

    float df =p.y+30.; //The floor is on purpose out of our sight
    //return (df<d1.x) ? vec2(df,0.) : d1;

    return vec2(df,0.);

}

vec3 getNormal(vec3 p) {
  const float e = EPS;
  return normalize(vec3(
    map(p + vec3(e,   0.0, 0.0)).x - map(p + vec3(-e,  0.0, 0.0)).x,
    map(p + vec3(0.0,   e, 0.0)).x - map(p + vec3(0.0,  -e, 0.0)).x,
    map(p + vec3(0.0, 0.0,   e)).x - map(p + vec3(0.0, 0.0,  -e)).x
  ));
}

Hit rayMarching(vec3 origin, vec3 dir, float start, float end) {
  Surface cs;
  cs.dist = -1.;

  Surface ns;
  ns.dist = FLOAT_MAX;

  Hit hit;

  float sceneDist = 0.;
  float rayDepth = start;

  for(int i = 0; i < maxIterations; i++) {
     vec2 mmap = map(origin + dir * rayDepth);

    sceneDist = mmap.x;
    cs.id = mmap.y;

    if(sceneDist < ns.dist) {
      ns.dist = sceneDist;
    }

    if((sceneDist < stopThreshold) || (rayDepth >= end)) {
     break;
    }
    rayDepth += sceneDist * stepScale;
    cs.dist = rayDepth;
  }

  if (sceneDist >= stopThreshold) {
    rayDepth = end;
 }

  cs.dist = rayDepth;
  hit.surface = cs;
  hit.near = ns;


  return hit;
}

float getSpecular(vec3 position, vec3 normal, Light light, float diffuse, vec3 cameraPos) {
  vec3 lightDir = light.position - position;
  vec3 ref = reflect(-normalize(lightDir), normal);
  float specular = 0.;
  if(diffuse > 0.) {
    specular = max(0., dot(ref, normalize(cameraPos - normal)));
    float specularPower = 100.;
    specular = pow(specular, specularPower) * light.intensity;
  }
  return specular;
}

vec3 coloring(Surface surface, vec3 cameraPos) {
  vec3 position = surface.position;

  vec3 color = vec3(0.05);
  vec3 sceneColor = vec3(0.);
  vec3 normal = getNormal(position);

  vec3 objColor;
  vec3 flr = cos(normal+12.);//vec3(smoothstep(0.,0.001,sin(position.x)*sin(position.z)));

    objColor = flr*float(surface.id == 0.);
    objColor = mix(objColor,vec3(.98, .74, .98),float(surface.id == 1.));
    objColor = mix(objColor,vec3(2.),float(surface.id  == 2.));
    objColor = mix(objColor,vec3(0.),float(surface.id  == 3.));

  vec3 specularColor = vec3(.6, .6, .6);

  Light directionalLight;
  directionalLight.position = vec3(5.,5.,5.);
  directionalLight.intensity =1.;
  directionalLight.color = vec3(.9, .9, 1.);

  Light ambientLight;
  ambientLight.color = vec3(.4);
  ambientLight.intensity = .03;

  // directional light
  float dDiffuse = max(0., dot(normal, normalize(directionalLight.position)));
  dDiffuse *= directionalLight.intensity;
  vec3 dDiffuseColor = dDiffuse * directionalLight.color * objColor;
  float dSpecular = getSpecular(position, normal, directionalLight, dDiffuse, cameraPos);
  vec3 dSpecularColor = dSpecular * specularColor;


  // ambient
  vec3 ambientColor = ambientLight.color * ambientLight.intensity * objColor;

  vec3 diffuse = dDiffuseColor;
  vec3 specular = dSpecularColor;
  vec3 ambient = ambientColor;

  color += objColor * diffuse + specular + ambient;

  return color;
}

vec3 emissiveLight(Light light, Surface surface, vec3 rayOrigin, vec3 rayDirection) {
  vec3 eyeDirection = rayOrigin + rayDirection;

  float lightEmissive = pow(distanceToLine(eyeDirection, rayDirection, light.position) + .95, -2.);

  float c = dot(surface.normal, normalize(light.position - surface.position));
  c = clamp(c, 0., 1.);
  float em = 0.;

  em = c + (1. - c) * step(farClip, surface.dist);

  return lightEmissive * light.color * light.intensity * em;
}

vec3 emissiveLighting(Surface surface, vec3 rayOrigin, vec3 rayDirection) {

  vec3 eyeDirection = rayOrigin + rayDirection;
  vec3 normal = surface.normal;

  vec3 color = vec3(0.);
  Light l1;


  l1.color = vec3(0., .9, .8);
  l1.intensity = 0.1*1./(dot(bands.x,bands.x));
  l1.position = vec3(sin(time)*2.,0.,cos(time))*2.;
  //color += emissiveLight(l1, surface, rayOrigin, rayDirection);

  return color;
}

void main() {

    vec2 coord = uv();

    // CAMERA

    float cameraAngle = (mouse.x/resolution.x)*0.;
    vec3 cameraPos = vec3(sin(cameraAngle)*5.,1.,cos(cameraAngle)*20.);


    // Camera vectors ←↑→
    vec3 forward = normalize(-cameraPos);
    vec3 right = normalize(cross(forward, vec3(0., 1., 0.)));
    vec3 up = normalize(cross(right, forward));

    // Marching though the ray
    vec3 rayOrigin = cameraPos;
    vec3 rayDirection = normalize(forward + fov * coord.x * right + fov * coord.y * up);
    Hit hit = rayMarching(rayOrigin, rayDirection, 0., farClip);
    Surface surface = hit.surface;
    //Update surface data
    surface.position = rayOrigin + rayDirection * surface.dist;
    surface.normal = getNormal(surface.position);

    // Painting the surface
    vec3 sceneColor = mix(vec3(0.),coloring(surface, cameraPos), float(surface.dist < farClip));

    // LIGHTS
    sceneColor += emissiveLighting(surface, rayOrigin, rayDirection);

    //Add a little bit of feeeed baaackkkkkk
    vec4 pr = texture2D(backbuffer, uvN()+vec2(0.001,0.));
    //sceneColor = max(sceneColor,pr.rgb*0.95);

    gl_FragColor = vec4(sceneColor, 1.);
}
