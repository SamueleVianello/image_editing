let img = null;
let originalImg = null;
let modified = false;
let brightness = 0;
let contrast = 0;
let isGrayscale = false;
let isInverted = false;
let isBlurred = false;
let canvas = null;

function setup() {
    // Initial canvas setup - will be properly sized when an image is uploaded
    canvas = createCanvas(400, 300);
    canvas.parent('canvasContainer');
    background(240);
    textAlign(CENTER, CENTER);
    fill(100);
    textSize(16);
    text("Upload an image to begin editing", width/2, height/2);
    
    // File upload handling
    document.getElementById('imageUpload').addEventListener('change', handleFileUpload);
    
    // Control event listeners
    document.getElementById('brightnessSlider').addEventListener('input', updateImage);
    document.getElementById('contrastSlider').addEventListener('input', updateImage);
    document.getElementById('grayscaleBtn').addEventListener('click', toggleGrayscale);
    document.getElementById('invertBtn').addEventListener('click', toggleInvert);
    document.getElementById('blurBtn').addEventListener('click', toggleBlur);
    document.getElementById('resetBtn').addEventListener('click', resetImage);
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.match(/^image\//)) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            loadImage(e.target.result, img => {
                originalImg = img;
                resetControlValues();
                
                // Make sure we have proper dimensions for the canvas
                let canvasWidth = img.width;
                let canvasHeight = img.height;
                
                // Create or resize the canvas
                if (!canvas) {
                    canvas = createCanvas(canvasWidth, canvasHeight);
                    canvas.parent('canvasContainer');
                } else {
                    resizeCanvas(canvasWidth, canvasHeight);
                }
                
                // Clear the canvas and draw the image
                clear();
                image(originalImg, 0, 0);
                
                enableControls();
            });
        };
        
        reader.readAsDataURL(file);
    }
}

function resetControlValues() {
    document.getElementById('brightnessSlider').value = 0;
    document.getElementById('contrastSlider').value = 0;
    brightness = 0;
    contrast = 0;
    isGrayscale = false;
    isInverted = false;
    isBlurred = false;
}

function enableControls() {
    document.getElementById('brightnessSlider').disabled = false;
    document.getElementById('contrastSlider').disabled = false;
    document.getElementById('grayscaleBtn').disabled = false;
    document.getElementById('invertBtn').disabled = false;
    document.getElementById('blurBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
}

function updateImage() {
    brightness = parseInt(document.getElementById('brightnessSlider').value);
    contrast = parseInt(document.getElementById('contrastSlider').value);
    applyFilters();
}

function toggleGrayscale() {
    isGrayscale = !isGrayscale;
    document.getElementById('grayscaleBtn').style.backgroundColor = isGrayscale ? '#333' : '#555';
    applyFilters();
}

function toggleInvert() {
    isInverted = !isInverted;
    document.getElementById('invertBtn').style.backgroundColor = isInverted ? '#333' : '#555';
    applyFilters();
}

function toggleBlur() {
    isBlurred = !isBlurred;
    document.getElementById('blurBtn').style.backgroundColor = isBlurred ? '#333' : '#555';
    applyFilters();
}

function applyFilters() {
    if (!originalImg) return;
    
    // Start with a copy of the original image
    let imgCopy = originalImg.get();
    imgCopy.loadPixels();
    
    // Apply brightness and contrast
    for (let i = 0; i < imgCopy.pixels.length; i += 4) {
        // Apply brightness
        let r = imgCopy.pixels[i] + brightness;
        let g = imgCopy.pixels[i + 1] + brightness;
        let b = imgCopy.pixels[i + 2] + brightness;
        
        // Apply contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = constrain(factor * (r - 128) + 128, 0, 255);
        g = constrain(factor * (g - 128) + 128, 0, 255);
        b = constrain(factor * (b - 128) + 128, 0, 255);
        
        // Apply grayscale if selected
        if (isGrayscale) {
            const gray = (r + g + b) / 3;
            r = g = b = gray;
        }
        
        // Apply invert if selected
        if (isInverted) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
        }
        
        imgCopy.pixels[i] = r;
        imgCopy.pixels[i + 1] = g;
        imgCopy.pixels[i + 2] = b;
    }
    
    imgCopy.updatePixels();
    
    // Apply blur if selected
    if (isBlurred) {
        imgCopy.filter(BLUR, 3);
    }
    
    // Draw the processed image
    clear();
    image(imgCopy, 0, 0, width, height);
    
    modified = true;
}

function resetImage() {
    if (!originalImg) return;
    
    resetControlValues();
    document.getElementById('grayscaleBtn').style.backgroundColor = '#555';
    document.getElementById('invertBtn').style.backgroundColor = '#555';
    document.getElementById('blurBtn').style.backgroundColor = '#555';
    clear();
    image(originalImg, 0, 0, width, height);
    modified = false;
}

function downloadImage() {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Expose setup to p5.js
window.setup = setup;
