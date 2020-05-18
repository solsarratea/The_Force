uniform sampler2D texture;
	

float diff1 =3.;
float diff2 =2.5;

float t =1.6;
float step =1.;

void main() {
    float weight=sin(time/2.)*100.;
	vec2 pixel = gl_FragCoord.xy / resolution.xy;
	vec4 init = texture2D( texture, pixel );
	vec4 bb = texture2D( backbuffer,pixel);


	float xPixel = step /resolution.x;
	float yPixel = step /resolution.y;

	vec4 E = texture2D(backbuffer,vec2(pixel.x+xPixel,pixel.y));
	vec4 W = texture2D(backbuffer,vec2(pixel.x-xPixel,pixel.y));
	vec4 N = texture2D(backbuffer,vec2(pixel.x,pixel.y+yPixel));
	vec4 S = texture2D(backbuffer,vec2(pixel.x,pixel.y-yPixel));

    vec4 NE = texture2D(backbuffer,vec2(pixel.x+xPixel,pixel.y + yPixel));
	vec4 NW = texture2D(backbuffer,vec2(pixel.x-xPixel,pixel.y + yPixel));
	vec4 SE = texture2D(backbuffer,vec2(pixel.x+xPixel,pixel.y+yPixel));
	vec4 SW = texture2D(backbuffer,vec2(pixel.x+xPixel,pixel.y-yPixel));

	
    vec3 factor = vec3(0.);
    factor += gl_FragColor.rgb * weight;
    factor += N.rgb * diff1;
    factor += S.rgb * diff1;
    factor += E.rgb * diff1;
    factor += W.rgb * diff1;
    factor += NE.rgb * diff2;
    factor += NW.rgb * diff2;
    factor += SE.rgb * diff2;
    factor += SW.rgb * diff2;
    
    vec4 newColor = vec4(factor, 1.);
    vec4 diffusion = fract(mix(bb, newColor, 0.8))*0.2 + init*0.6;
    
    gl_FragColor =vec4(diffusion.b*0.5,diffusion.g*0.5,diffusion.b *0.5,.1);

}