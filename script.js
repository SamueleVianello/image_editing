let originalImg = null;
let canvas = null;
let w;
let shift;
let curr_shift;
let scale; // zoom in or out
let my_shader;
let buffer;
let high_res_buffer;

let mouse_start;
let mouse_end;

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

    // initialize Parameters
    initializeParameters()

    // create a buffer canvas   
    buffer = createGraphics(w, w, WEBGL);
    high_res_buffer = createGraphics(w*2, w*2, WEBGL);

    renderScreen();
}

function mousePressed(){
    mouse_start = createVector(mouseX, mouseY);
}

function mouseDragged(){
    mouse_end = createVector(mouseX, mouseY);
    curr_shift = mouse_end.sub(mouse_start);
    curr_shift.x = curr_shift.x/width;
    curr_shift.y = curr_shift.y/height;
    //print(curr_shift)
    renderScreen()
}

function mouseReleased(){
    mouse_end = createVector(mouseX, mouseY);
    curr_shift = mouse_end.sub(mouse_start);
    curr_shift.x = curr_shift.x/width;
    curr_shift.y = curr_shift.y/height;
    // save final shift and delete curr_shift
    shift = shift.add(curr_shift);
    curr_shift = createVector(0, 0);
    renderScreen()
}

function doubleClicked() {
    //shift = createVector(0, 0);
    //renderScreen()
}

function initializeParameters(){
    // initialize shifts
    shift = createVector(0, 0);
    curr_shift = createVector(0, 0);
    scale = 0.70;
}

function renderScreen() {
    // set shader parameters
    my_shader.setUniform('u_resolution', [w, w]);
    my_shader.setUniform('u_shift', [-(shift.x+curr_shift.x), shift.y+curr_shift.y]);
    my_shader.setUniform('u_scale', scale*0.5);
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
    initializeParameters()
    renderScreen()
    //image(originalImg, -width/2, -height/2);
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
