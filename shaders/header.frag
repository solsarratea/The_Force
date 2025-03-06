precision lowp float;

uniform vec2      resolution;
uniform float     time;
uniform float     channelTime[4];
uniform vec4      mouse;
uniform vec4      date;
uniform vec3      channelResolution[4];
uniform vec4      bands;
uniform vec4      bandsTime;
uniform sampler2D backbuffer;
uniform sampler2D channel0;

float PI = 3.14159;
float PI2 = 6.28318;

vec3 black = vec3(0.0);
vec3 white = vec3(1.0);
vec3 red = vec3(0.86,0.22,0.27);
vec3 orange = vec3(0.92,0.49,0.07);
vec3 yellow = vec3(0.91,0.89,0.26);
vec3 green = vec3(0.0,0.71,0.31);
vec3 blue = vec3(0.05,0.35,0.65);
vec3 purple = vec3(0.38,0.09,0.64);
vec3 pink = vec3(.9,0.758,0.798);
vec3 lime = vec3(0.361,0.969,0.282);
vec3 teal = vec3(0.396,0.878,0.878);
vec3 magenta = vec3(1.0, 0.189, 0.745);
vec3 brown = vec3(0.96, 0.474, 0.227);

vec2 uvN(){return (gl_FragCoord.xy / resolution);}
vec2 uv(){return (gl_FragCoord.xy / resolution * 2.0 -1.0) * vec2(resolution.x/resolution.y, 1.0);}

float kale(vec2 p, float n) {
  return abs(mod(atan(p.x, p.y), n) - n * .5);
}

float box(vec2 p,vec2 b,float r,float f) {
    return smoothstep(f, 0.0, length(max(abs(p)-b,0.0))-r);
}

float circle(float x,float y,float r,float f) {
    float d=distance(uv(),vec2(x, y))/r;
    return 1.-smoothstep(r-f,r,d);
}

vec2 rotate(vec2 space, vec2 center, float amount){
    return vec2(cos(amount) * (space.x - center.x) + sin(amount) * (space.y - center.y),
        cos(amount) * (space.y - center.y) - sin(amount) * (space.x - center.x));
}

vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

const mat2 myt = mat2(.12121212,.13131313,-.13131313,.12121212);
const vec2 mys = vec2(1e4, 1e6);
vec2 rhash(vec2 uv) {
    uv *= myt;
    uv *= mys;
    return  fract(fract(uv/mys)*uv);
}
vec3 hash( vec3 p ){
    return fract(sin(vec3( dot(p,vec3(1.0,57.0,113.0)),
                           dot(p,vec3(57.0,113.0,1.0)),
                           dot(p,vec3(113.0,1.0,57.0))))*43758.5453);

}

float rand(const in float n){return fract(sin(n) * 1e4);}
float rand(const in vec2 n) { return fract(1e4 * sin(17.0 * n.x + n.y * 0.1) * (0.1 + abs(sin(n.y * 13.0 + n.x))));
}

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand(i), rand(i + 1.0), u);
}

float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

    // Four corners in 2D of a tile
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);

    vec3 i = floor(x);
    vec3 f = fract(x);

    float n = dot(i, step);

    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( rand(n + dot(step, vec3(0, 0, 0))), rand(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( rand(n + dot(step, vec3(0, 1, 0))), rand(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( rand(n + dot(step, vec3(0, 0, 1))), rand(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( rand(n + dot(step, vec3(0, 1, 1))), rand(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
float snoise(vec2 v){
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

const vec2  CC = vec2(1.0/6.0, 1.0/3.0) ;
const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
float snoise(vec3 v){

  vec3 i  = floor(v + dot(v, CC.yyy) );
  vec3 x0 =   v - i + dot(i, CC.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * CC.xxx;
  vec3 x2 = x0 - i2 + 2.0 * CC.xxx;
  vec3 x3 = x0 - 1. + 3.0 * CC.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float voronoi(const in vec2 point )
{
    vec2 p = floor( point );
    vec2 f = fract( point );
    float res = 0.0;
    for( int j=-1; j<=1; j++ ) {
        for( int i=-1; i<=1; i++ ) {
            vec2 b = vec2( i, j );
            vec2 r = vec2( b ) - f + rhash( p + b);
            res += 1./pow(dot(r,r),8.);
        }
    }
    return pow(1./res, 0.0625);
}

vec3 voronoi( const in vec3 x ) {
    vec3 p = floor( x );
    vec3 f = fract( x );

    float id = 0.0;
    vec2 res = vec2( 100.0 );
    for( int k=-1; k<=1; k++ ) {
        for( int j=-1; j<=1; j++ ) {
            for( int i=-1; i<=1; i++ ) {
                vec3 b = vec3( float(i), float(j), float(k) );
                vec3 r = vec3( b ) - f + hash( p + b );
                float d = dot( r, r );

                float cond = max(sign(res.x - d), 0.0);
                float nCond = 1.0 - cond;

                float cond2 = nCond * max(sign(res.y - d), 0.0);
                float nCond2 = 1.0 - cond2;

                id = (dot(p + b, vec3(1.0, 57.0, 113.0)) * cond) + (id * nCond);
                res = vec2(d, res.x) * cond + res * nCond;

                res.y = cond2 * d + nCond2 * res.y;
            }
        }
    }

    return vec3( sqrt( res ), abs(id) );
}

//brownian
float fbm(float x, const in int it) {
    float v = 0.0;
    float a = 0.5;
    float shift = float(100);
    for (int i = 0; i < 32; ++i) {
        if(i<it) {
            v += a * noise(x);
            x = x * 2.0 + shift;
            a *= 0.5;
        }
    }
    return v;
}

float fbm(vec2 x, const in int it) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 32; ++i) {
        if(i<it) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
        }
    }
    return v;
}

float fbm(vec3 x, const in int it) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100);
    for (int i = 0; i < 32; ++i) {
        if(i<it) {
            v += a * noise(x);
            x = x * 2.0 + shift;
            a *= 0.5;
        }
    }
    return v;
}

//ridged multifractal
float rmf(vec2 uv, const in int it) {
    float l = 2.;
    float r = 0.;
    float a = 0.5;
    float f = 1.0;
    for(int i = 0; i < 32; i++) {
        if(i<it) {
            uv = uv.yx * l;
            float n = noise(uv);
            n = abs(fract(n-.5)-.5);
            n *= n * a;
            a = clamp(0.,1., n*2.);
            r += n*pow(f, -1.);
            f *= l;
        }
    }
    return r*2.;
}

//voronoi fbm
float vfbm(const in vec2 uv, const in int it) {
    float n = 0.;
    float a = 0.5;
    float f = 1.0;
    for(int i = 0; i < 32; i++) {
        if(i<it) {
            n += voronoi(uv*f)*a;
            f *= 2.;
            a *= .5;
        }
    }
    return n;
}

//ridged multifractal
float vrmf(vec2 uv, const in int it) {
    float l = 2.;
    float r = 0.;
    float a = 0.5;
    float f = 1.0;
    for(int i = 0; i < 32; i++) {
        if(i<it) {
            uv = uv.yx * l;
            float n = voronoi(uv);
            n = abs(fract(n-.5)-.5);
            n *= n * a;
            a = clamp(0.,1., n*2.);
            r += n*pow(f, -1.);
            f *= l;
        }
    }
    return r*2.;
}

const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 sexy(void) {
    float star=0.0;
    vec3 cr = black;
    for(int i = 0; i < 80; i++)
    {
       float tTime = float(i) * PI;
        vec2 p = vec2(rand(floor(-tTime * time*.005)), fract(time *0.1 +tTime));
        float   r = rand(uv().x);
        star= r*(0.3*sin(time * (r * 5.0) + 20.0 * r) + 0.25);
        cr += box(uvN()-p.yx, vec2(0.005, 0.01), 0.001, 0.0001) * star;
        cr += box(uvN()-p.yx * vec2(1.2, 3.0), vec2(0.005, 0.01), 0.001, 0.0001) * star;
    }
    return vec3(cr * 1.5);
}

vec2 nyanFrame(vec2 p, float rr) {
    float v = 40.0/256.0;
    p = clamp(p,0.0,1.0);
    p.x = p.x*v;
    p = clamp(p,0.0,1.0);
    float fr = floor( mod( 20.0*time+rr, 6.0 ) );
    p.x += fr*v;
    return p;
}

float saturate(float s) {
  return clamp(s, 0., 1.);
}

float distanceToLine(vec3 origin, vec3 dir, vec3 point) {
	vec3 pointToOrigin = point - origin;
    float pointToOriginLength = length(pointToOrigin);
    vec3 pointToOriginNorm = normalize(pointToOrigin);
    float theta = dot(dir, pointToOriginNorm);
    return pointToOriginLength * sqrt(1. - theta * theta);
}

float invert(float m) {
  return 1.0 / m;
}

mat2 invert(mat2 m) {
  return mat2(m[1][1],-m[0][1],
             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);
}

mat3 invert(mat3 m) {
  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

  float b01 = a22 * a11 - a12 * a21;
  float b11 = -a22 * a10 + a12 * a20;
  float b21 = a21 * a10 - a11 * a20;

  float det = a00 * b01 + a01 * b11 + a02 * b21;

  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}

mat4 invert(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

mat4 scale(vec3 s) {
  return invert(mat4(
    s.x, 0., 0., 0.,
    0., s.y, 0., 0.,
    0., 0., s.z, 0.,
    0., 0., 0., 1.
  ));
}

mat4 rotateX(float angle) {
  return invert(mat4(
    1., 0., 0., 0.,
    0., cos(angle), -sin(angle), 0.,
    0., sin(angle), cos(angle), 0.,
    0., 0., 0., 1.
  ));
}

mat4 rotateY(float angle) {
  return invert(mat4(
    cos(angle), 0., sin(angle), 0.,
    0., 1., 0., 0.,
    -sin(angle), 0., cos(angle), 0.,
    0., 0., 0., 1.
  ));
}

mat4 rotateZ(float angle) {
  return invert(mat4(
    cos(angle), -sin(angle), 0., 0.,
    sin(angle), cos(angle), 0., 0.,
    0., 0., 1., 0.,
    0., 0., 0., 1.
  ));
}

mat4 translate(vec3 p) {
  return invert(mat4(
    1., 0., 0., p.x,
    0., 1., 0., p.y,
    0., 0., 1., p.z,
    0., 0., 0., 1.
  ));
}

float sdSphere(vec3 p, float size) {
  return length(p) - size;
}

float tube2(vec2 p, float size) {
  return length(p) - size;
}

float cylindar(vec3 p, vec3 c) {
  return length(p.xz - c.xy) - c.z;
}

float displacement(vec3 p, vec3 power) {
  return sin(power.x * p.x) * sin(power.y * p.y) * sin(power.z * p.z);
}

float smin( float a, float b, float k )
{
    float h = max(k-abs(a-b),0.0);
    return min(a, b) - h*h*0.25/k;
}

vec2 smin( vec2 a, vec2 b, float k )
{
    float h = clamp( 0.5+0.5*(b.x-a.x)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float smax( float a, float b, float k )
{
    float h = max(k-abs(a-b),0.0);
    return max(a, b) + h*h*0.25/k;
}

#define FLOAT_MAX 3.402823466e+38
#define FLOAT_MIN 1.175494351e-38
#define DBL_MAX 1.7976931348623158e+308
#define DBL_MIN 2.2250738585072014e-308

float sdElipsoide(vec3 pos,vec3 r){

    float k0 = length(pos/r) ;
    float k1 = length(pos/r/r) ;

    return k0*(k0-1.)/k1;
}




float plength(vec3 pos, float p){
    return pow(pow(abs(pos.x),p)+pow(abs(pos.y),p)+pow(abs(pos.z),p),1./p);
}

float luma(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); }

vec3 colorSaturate(vec3 cin, float amount) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(cin.rgb, W));
  return mix(intensity, cin.rgb, amount);
}

float bpm(float bpm, float q, float intensity){
 float bps = 60./bpm; // beats por segundo
 float bpmVis = tan((time*PI/q)/bps);
 return max(min(abs(bpmVis),1.),0.) * intensity;
}

float bpmd(float val){
  return step(0.5, bpm(val,1.,1.));
}

mat3 rotateX3(float rotation) {
    mat3 rotateX = mat3(
        1.0, 0.0, 0.0,
    0.0, cos(rotation), -sin(rotation),
    0.0, sin(rotation), cos(rotation)
    );

    return rotateX;
}

mat3 rotateY3(float rotation) {
mat3 rotateY = mat3(
        cos(rotation), 0.0, sin(rotation),
    0.0, 1.0, 0.0,
    -sin(rotation), 0.0, cos(rotation)
    );

    return rotateY;
}

mat3 rotateZ3(float rotation) {
    mat3 rotateZ = mat3(
        cos(rotation), -sin(rotation), 0.0,
    sin(rotation), cos(rotation), 0.0,
    0.0, 0.0, 1.0
    );

    return rotateZ;
}


void pR(inout vec2 p, float a) {
    p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

void moda (inout vec2 p, float rep)
{
  float per = 2.*PI/rep;
  float a = atan(p.y,p.x);
  float l = length(p);
  a = mod(a,per)-per*0.1;
  p = vec2(cos(a),sin(a))*l;
}


float sdBox(vec3 p, vec3 s) {
  p=abs(p)-s;
  return max(p.x, max(p.y,p.z));
}


vec3 round(vec3 p){
    vec3 r; vec3 f = floor(p);
    r.x= mix(f.x, f.x+1., step(0.5, fract(p.x)));
    r.y= mix(f.y, f.y+1., step(0.5, fract(p.y)));
    r.z= mix(f.z, f.z+1., step(0.5, fract(p.z)));
    
    return r;
    
}


#define repeatLimit(p,c,l) p=p-c*clamp(round(p/c),-l,l)

void repeat(inout vec3 p, float c) {
  p = mod(p, c) - c * .5;
}

void repeat(inout vec3 p, vec3 c) {
	p = mod(p, c) - 0.5 * c;
}
