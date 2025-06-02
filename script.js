let originalImg = null;
let canvas = null;
let w;
let shift;
let curr_shift;
let scale; // zoom in or out
let angle; // angle for rotation
let my_shader;
let buffer;
let high_res_buffer;

let mouse_start;
let mouse_end;
let flag_mouse_in=false;
let id_start = 0;

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
    // ROTATION SLIDER
    document.getElementById('rotationSlider').addEventListener('input', 
        function () {
            updateRotation(document.getElementById('rotationSlider').value
            /document.getElementById('rotationSlider').max*PI)}
    );
    document.getElementById('rotationSlider').addEventListener('change', 
        function () {
            updateRotation(document.getElementById('rotationSlider').value
            /document.getElementById('rotationSlider').max*PI)}
    );
    // ZOOM SLIDER
    document.getElementById('zoomSlider').addEventListener('input', 
        function () {
            updateZoom(document.getElementById('zoomSlider').value
            /document.getElementById('zoomSlider').max *0.75 + 1.0)}
    );
    document.getElementById('zoomSlider').addEventListener('change', 
        function () {
            updateZoom(document.getElementById('zoomSlider').value
            /document.getElementById('zoomSlider').max *0.75 + 1.0)}
    );

    // initialize Parameters
    initializeParameters()

    // create a buffer canvas   
    buffer = createGraphics(w, w, WEBGL);
    high_res_buffer = createGraphics(w*2, w*2, WEBGL);

    renderScreen();
}

function mousePressed(){
    if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0){
        mouse_start = createVector(mouseX, mouseY);
        flag_mouse_in = true;
        id_start = getIdStart(mouseX,mouseY);
    }
    else{flag_mouse_in = false;}
}

function mouseDragged(){
    if (flag_mouse_in){
        mouse_end = createVector(mouseX, mouseY);
        curr_shift = mouse_end.sub(mouse_start);
        curr_shift.x = curr_shift.x/width;
        curr_shift.y = curr_shift.y/height;
        curr_shift = correctDirection(curr_shift);
        curr_shift = curr_shift.rotate(angle);
        //print(curr_shift)
        renderScreen()
    }
    
}

function mouseReleased(){
    if (flag_mouse_in){
        mouse_end = createVector(mouseX, mouseY);
        curr_shift = mouse_end.sub(mouse_start);
        curr_shift.x = curr_shift.x/width;
        curr_shift.y = curr_shift.y/height;
        curr_shift = correctDirection(curr_shift);
        curr_shift = curr_shift.rotate(angle);
        // save final shift and delete curr_shift
        shift = shift.add(curr_shift);
        curr_shift = createVector(0, 0);
        renderScreen()
    }
}

function doubleClicked() {
    //shift = createVector(0, 0);
    //renderScreen()
}

// =========================================================
function initializeParameters(){
    // initialize shifts
    shift = createVector(0, 0);
    curr_shift = createVector(0, 0);
    scale = 1.0;
    angle = 0;
}

function updateRotation( ang){
    angle = ang;
    renderScreen();
}

function updateZoom(zm){
    scale = 1.0/zm;
    renderScreen();
}

function getIdStart(x,y){
    // 1 | 2
    //-------
    // 4 | 3
    if(x<width/2){
        if(y<height/2) return 1;
        else return 4;
    }
    else {
        if(y<height/2) return 2;
        else return 3;
    }
}

function correctDirection(s, i=id_start){
    // 1 | 2
    //-------
    // 4 | 3
    if (i==1) {
        s.y = -s.y; 
    }
    if (i==2) {
        s.x=-s.x;
        s.y=-s.y;
    }
    if (i==3) {
        s.x=-s.x;
    }
    return s;
}

function renderScreen() {
    // set shader parameters
    my_shader.setUniform('u_resolution', [w, w]);
    my_shader.setUniform('u_shift', [-(shift.x+curr_shift.x), shift.y+curr_shift.y]);
    my_shader.setUniform('u_scale', scale*0.5);
    my_shader.setUniform('u_rotation', angle);
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
