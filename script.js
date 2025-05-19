let originalImg = null;
let canvas = null;
let w;
let shift;
let my_shader;
let buffer;
let high_res_buffer;

function preload() {
    my_shader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
    w = min(windowWidth, windowHeight) * 0.8;
    // Initial canvas setup - will be properly sized when an image is uploaded
    canvas = createCanvas(w, w, WEBGL);
    canvas.parent('canvasContainer');
    background(240);
    
    // File upload handling
    document.getElementById('imageUpload').addEventListener('change', handleFileUpload);
    document.getElementById('resetBtn').addEventListener('click', resetImage);
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);

    // initialize shift
    shift = createVector(0, 0);

    // create a buffer canvas   
    buffer = createGraphics(w, w, WEBGL);
    high_res_buffer = createGraphics(w*2, w*2, WEBGL);

    renderScreen();
}



function renderScreen() {
    // set shader parameters
    my_shader.setUniform('u_resolution', [w, w]);
    my_shader.setUniform('u_shift', [shift.x, shift.y]);
    my_shader.setUniform('u_scale', 0.5);
    my_shader.setUniform('u_rotation', 0);
    my_shader.setUniform('u_texture', originalImg);

    // clear the buffer
    buffer.clear();
    buffer.background(0);
    buffer.noStroke();
    buffer.shader(my_shader);
    buffer.rect(0, 0, w, w);

    // draw the buffer to canvas
    image(buffer, -w/2, -w/2, w, w);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.match(/^image\//)) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            loadImage(e.target.result, img => {
                originalImg = img;
                
                // Enable download and reset buttons
                document.getElementById('resetBtn').disabled = false;
                document.getElementById('downloadBtn').disabled = false;
                
                // Hide upload message
                document.getElementById('uploadMessage').style.display = 'none';
                
                renderScreen();
            });
        };
        
        reader.readAsDataURL(file);
    }
}

function resetImage() {
    if (!originalImg) return;
    
    clear();
    image(originalImg, -width/2, -height/2);
}

function downloadImage() {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Expose setup to p5.js
window.setup = setup;
