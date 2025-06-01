#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;

uniform vec2 u_resolution;
uniform vec2 u_shift; // translation vector
uniform float u_scale;
uniform float u_rotation;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}


void main() {
    // Get the pixel coordinates
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st*=0.5;
    //st = rotate2d(0.5)*st;

    vec2 grid = floor(st * 2.0);
    vec2 cell = fract(st * 2.0);

    if (grid.x > 0.0) {
        cell.x = 1.0 - cell.x; // Mirror horizontally for right cells
    }   
    if (grid.y > 0.0) {
        cell.y = 1.0 - cell.y; // Mirror vertically for top cells
    }

    //cell = rotate2d(0.3)*(cell-vec2(0.5))+vec2(0.5);
    cell = rotate2d(u_rotation) * (cell - vec2(0.5)) + vec2(0.5);

    vec2 shift = rotate2d(u_rotation) * u_shift;
    
    //cell = mod(cell+shift,2.0);
    cell = (cell+u_shift);

    st = cell*u_scale;  
    //st = rotate2d(0.5)*st;
    

    // extract the colors from the texture
    vec4 color = texture2D(u_texture, st);
    
    // Debug: visualize the coordinates directly
    //color = vec4(st.x, st.y, 0.0, 1.0);
    
    // Output final color
    gl_FragColor = color;
} 