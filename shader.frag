#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;

uniform vec2 u_resolution;
uniform vec2 u_shift; // translation vector
uniform float u_scale;
uniform float u_rotation;


void main() {
    // Get the pixel coordinates
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st*=0.5;
    

    vec2 grid = floor(st * 2.0);
    vec2 cell = fract(st * 2.0);

    if (grid.x > 0.0) {
        cell.x = 1.0 - cell.x; // Mirror horizontally for right cells
    }   
    if (grid.y > 0.0) {
        cell.y = 1.0 - cell.y; // Mirror vertically for top cells
    }

    cell = mod(cell+u_shift,2.0);

    st = cell*u_scale;  

    // extract the colors from the texture
    vec4 color = texture2D(u_texture, st);
    
    // Debug: visualize the coordinates directly
    //vec4 color = vec4(st.x, st.y, 0.0, 1.0);
    
    // Output final color
    gl_FragColor = color;
} 