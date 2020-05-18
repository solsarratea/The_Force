    uniform sampler2D start;


    float inter=0.5;
    float rNeighbour=1.;
    float tNeighbour = 0.;
    float zoom= 0.;
  
    float randomBug =10.;
    float curves = 0.;

    //Cell radius
   const int kernelRadius = 53;
   float outerRadius = 200.*bands.z;
   float innerRadius = 100.*bands.z;


    struct CellDensity {
        vec4 inner;
        vec4 outter; 
    };

    const float birth_min =  0.278;
    const float birth_max = 0.3065;


    const float death_min = 0.267;
    const float death_max = 0.345; 

    const float alpha_n = 0.028;
    const float alpha_m =  0.147;
   

    float sigma1(float x, float a, float alpha) {
      return 1.0 / (1.0 + exp(-4.0*(x-a)/alpha));
    }

    float sigma_n(float x, float a, float b) {
        return sigma1(x, a, alpha_n) * (1.0 - sigma1(x, b, alpha_n));
    }

    float sigma_m(float x, float y, float m) {
        float w = sigma1(m, 0.5, alpha_m);
        return x*(1.0-w)+y*w;
    }

    float S(float n, float m) {
        return sigma_n(n,
            sigma_m(birth_min, death_min, m),
            sigma_m(birth_max, death_max, m));
    }

    float weight(float r, float cutoff) {
        return 1.0 - sigma1(r, cutoff, 0.5);
    }

    CellDensity computeCellDensity(vec2 fragCoord){
      CellDensity d = CellDensity(vec4(0.0),vec4(0.0));
      float norm_i = 0.0;
      float norm_o = 0.0;
      float dr = rNeighbour;
      float a = 0.0;
      vec2 uv;
      
      for(int i=-kernelRadius;i<kernelRadius;i++){
        for(int j=-kernelRadius;j<kernelRadius;j++){

          uv = mod((gl_FragCoord.xy + vec2(i,j)) / resolution,vec2(1.0));
          uv =  curves * ( PI * uv / vec2(randomBug))+ (1. - curves) * uv;
          vec4 f = texture2D(backbuffer,uv + tNeighbour /100.);
          float r = sqrt(float(i*i + j*j)) * dr;
        
          float wi= weight(r, innerRadius);
          d.inner += f * wi;
          norm_i += wi;

          float wo= weight(r, outerRadius);
          d.outter += f * wo;
          norm_o += wo;

          }
        }
    
        d.outter =  (d.outter - d.inner) / (norm_o - norm_i);
        d.inner /= norm_i; ;
        
        return d;
    }

    vec2 rotateP(vec2 uv, vec2 pivot, float rotation) {
      float sine = sin(rotation);
      float cosine = cos(rotation);
  
      uv -= pivot;
      uv.x = uv.x * cosine - uv.y * sine;
      uv.y = uv.x * sine + uv.y * cosine;
      uv += pivot;
  
      return uv;
  }


      void main() {


      vec2 pixelT = (1. - mod( bands.y,0.) )* uvN();
 
      float f = texture2D(backbuffer,uvN()).r;
      CellDensity cell = computeCellDensity(uvN());

      float m = cell.outter.r;
      float n = cell.inner.r;

      float newState = abs(2.*S(n,m) - f);
       newState = mix(f,newState, bands.z*.3);
     

      vec4 videoColor= texture2D(start, pixelT);
      
      vec4 mixy = vec4(newState,newState,newState,1)*0.94+(1.-videoColor)*0.02;

      gl_FragColor = mixy;

      }