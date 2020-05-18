uniform sampler2D start;

vec2 pos;
vec2 texColor;

float pixelSize = 10.*(bands.x *0.2+ 0.1);
float t = 0.1;
float threshold =0.49;
float bound =3.;
float rNeighbour =0.;
float tNeighbour = 0.;

void main( void ){

  pos = vec2(
             floor( gl_FragCoord.x / pixelSize ) * pixelSize + pixelSize * t,
             floor( gl_FragCoord.y / pixelSize ) * pixelSize + pixelSize * t
             );

  vec3 color = texture2D( backbuffer, pos / resolution ).rgb;
  vec3 lastColor= color;
  vec3 videoColor= texture2D(start, uvN()).rgb;

  vec2 dy = floor(rNeighbour * vec2(1.,-1.) + tNeighbour)* pixelSize /resolution.xy;
  vec2 dx = floor(rNeighbour * vec2(1.,-1.) + tNeighbour)* pixelSize /resolution.xy;
  vec2 pixel = pos / resolution.xy;

  float neighbors = 0.0;
  vec4 N = texture2D(backbuffer, vec2(pixel.x, pixel.y + dy.x));
  neighbors += step(threshold,N.r);
  vec4 S = texture2D(backbuffer, vec2(pixel.x, pixel.y + dy.y));
  neighbors += step(threshold,S.r);
  vec4 W = texture2D(backbuffer, vec2(pixel.x + dx.x, pixel.y));
  neighbors += step(threshold,W.r);
  vec4 E = texture2D(backbuffer, vec2(pixel.x + dx.y, pixel.y));
  neighbors += step(threshold,E.r);

  vec4 NE = texture2D(backbuffer, vec2(pixel.x + dx.x, pixel.y + dy.x));
  neighbors += step(threshold,NE.r);
  vec4 NW = texture2D(backbuffer, vec2(pixel.x + dx.y, pixel.y + dy.x));
  neighbors += step(threshold,NW.r);
  vec4 SE = texture2D(backbuffer, vec2(pixel.x + dx.x, pixel.y + dy.y));
  neighbors += step(threshold,SE.r);
  vec4 SW = texture2D(backbuffer, vec2(pixel.x + dx.y, pixel.y + dy.y));
  neighbors += step(threshold,SW.r);

  //neighbors = N.r + S.r + E.r + W.r + NE.r + NW.r + SE.r +SW.r;


  float status = step(threshold, color.r );
  if (status == 1.0 && neighbors > bound ){
    color = vec3(0.5, color.g, color.b);
  }else if( status == 1.0 && ( neighbors <= 1.0 )){
    color = vec3(0.5, color.g, color.b);
  }
  else if( status == 0.0 && neighbors == bound ){
    color = vec3(1., color.g, color.b);
  }
  else if( floor(pos / (pixelSize*2.0)) == floor(vec2(mouse) / (pixelSize*2.0)) ){
    color =vec3(1.);
  } else color = vec3(status, color.g, color.b);

vec3 newColor = mix(lastColor,color,0.4)*.8+mix(.7-videoColor,vec3(0.2,0.,0.2),0.6)*0.4;
  gl_FragColor = vec4(newColor,1.);


}
