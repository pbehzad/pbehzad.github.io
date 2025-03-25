const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const playerImage = new Image();
playerImage.src = "https://www.frankslaboratory.co.uk/downloads/shadow_dog.png"
const spriteWidth = 575;
const spriteHeight = 523;
let gameFrame = 0;
const staggerFrames = 5;
const spriteAnimations = [];
let playerState = 'jump';
const dropdown = document.getElementById('animations');
dropdown.addEventListener('change', function(e){
    playerState = e.target.value;
})
const animateStates = [
    {
        name: 'idle',
        frames: 7,
    },
    {
        name: 'jump',
        frames: 7,
    }

];

animateStates.forEach((state, index) => {
    let frames = {
        loc: [],
    }
    for (let j=0; j < state.frames; j++){
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({x: positionX, y: positionY});
    }
    spriteAnimations[state.name] = frames;

});


function animate(){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // ctx.drawImage(image, sx, sy, sw, sh, sw, sh, dx, dy, dw, dh);
    let position = Math.floor(gameFrame/staggerFrames) % spriteAnimations[playerState].loc.length;
    let frameX = spriteWidth * position;
    let frameY = spriteAnimations[playerState].loc[position].y;
    frameX = spriteWidth * position;
    ctx.drawImage(
        playerImage, 
        frameX, 
        frameY, 
        spriteWidth, 
        spriteHeight,
        0, 
        0,
        spriteWidth, 
        spriteHeight
    );
    
    gameFrame++;
    requestAnimationFrame(animate);
};

animate();
