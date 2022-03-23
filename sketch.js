


const Y_AXIS = 1; //used for colour gradient function
var chocoFont; //Font used globally
var jumpSound; //Sound used during jump
var backgroundMusic; //The game background music

var gameChar_x;
var gameChar_y;
var floorPos_y;
var vel_x; //player velocity - x axis
var vel_y; //player velocity - y axis
var scrollPos;
var gameChar_world_x; //stores the xpos of game Character even when scrolling
var game_score;
var flagpole;
var lives;
var tempLives; //a temporary value used for lives

var isLeft;
var isRight;
var isFalling;
var isPlummeting;


 function preload()
 {
     soundFormats('mp3','wav');
    
     //loading jump sound effect
     jumpSound = loadSound('assets/Cartoon_jump_by_Bastianhallo_from_pixabay.com');
     jumpSound.setVolume(0.1);
     
     //loading background music
     backgroundMusic = loadSound('assets/piano_moment_by_ZakharValaha_from_Pixabay.com')
     backgroundMusic.setVolume(0.1)
     
     //loading main game font
     chocoFont = loadFont('assets/ChocoDonut.ttf')
 }

function setup()
{
	createCanvas(1024, 576);
	floorPos_y = 520; //yPos of the top of the ground
    lives = 3; //stores the number of lives the player has

    startGame(); //contains all the arrays and objects that define all game elements
}

function draw()
{
    //################################################################
    // CODE SUMMARY FOR DRAW() FUNCTION:                             #
    // 1: Drawing game elements and the character                    #
    // 4: Adding screen scrolling to the game                        #
    // 3: Adding movement to the Game Character (left, right, jump)  #
    // 5: Adding "GameOver" and "LevelComplete" logic                #
    // 2: Adding a score board (NO.OF COINS COLLECTED)               #
    // 6: Display no.of lives remaining                              #
    //################################################################
    
    //Font that will be used universally
    textFont(chocoFont)

	// Drawing the Sky
	setGradient(0, 0, 1024, 550, sky.color1, sky.color2, Y_AXIS); // fill the sky blue

	// Drawing the Clouds
	drawClouds();

	// Drawing the Mountains
	drawMountains();

	// Drawing the Ground
	noStroke(); 
    setGradient(
        ground.x,
        ground.y,
        ground.w,
        ground.h,
        ground.soilColor_1,
        ground.soilColor_2,
        Y_AXIS
    );
    noStroke(); 
    fill(ground.grassColor);
    rect(ground.x, ground.y - 10, ground.w, 15);

	// Adding scrolling mechanism for the elements below
	push();
    translate(scrollPos, 0);

	// Drawing the Trees
	drawTrees();
    renderFlagpole();
    if (flagpole.isReached == false) {
        checkFlagpole();
    }

	// Drawing the Canyon
	for (i = 1; i < 3; i++) {
        drawCanyon(canyons[i].x,
            canyons[i].y,
            canyons[i].w,
            canyons[i].h,
            canyons[0].color1,
            canyons[0].color2);
    }
	// Dying mechanism from falling in the canyon
    // for canyon 1 and 2.
	for (i = 1; i < canyons.length ; i++) {
		checkCanyon(gameChar_world_x, gameChar_y, canyons[i].x)
	} 

	// Drawing the Collectable Items (COINS)
	collectable.x = 260; //First line of collectable coins
    collectable.y = 400;
    for (i = 0; i < 7; i++) {
        drawCollectables(isFound[i], collectable.x, collectable.y, collectable.w, collectable.color1, collectable.color2);
        checkCollectables(gameChar_world_x, gameChar_y, collectable.x, collectable.y)
        collectable.x += 50;
    }
    collectable.x = 1300; //Second line of collectable coins
    collectable.y = 330;
    for (i = 0; i < 7; i++) {
        drawCollectables(isFound1[i], collectable.x, collectable.y, collectable.w, collectable.color1, collectable.color2)
        checkCollectables1(gameChar_world_x, gameChar_y, collectable.x, collectable.y)
        collectable.x += 50
    }

	//Stop the scroll mechanism
	pop();

	// Drawing the Game Character
	drawGameChar();

	// Logic to make the game character move and for the background scroll.
	if (isLeft) {
        // scrolling mechanism
        if (gameChar_x < 140) {
            scrollPos += 4;
        } else if (gameChar_x > 800) {
            scrollPos += 4;
            if (scrollPos == 0) {
                gameChar_x = 800;
            }
        } else {
            gameChar_x -= vel_x;
        }
    }
    if (isRight) {
        // scrolling mechanism
        if (gameChar_x < 140) {
            scrollPos -= 4;
            if (scrollPos == 0) {
                gameChar_x = 140;
            }
        } else if (gameChar_x > 800) {
            scrollPos -= 4;
        } else {
            gameChar_x += vel_x;
        }
    }

	// Logic to make the game character rise and fall.
	if (isFalling) {
        // for jumping mechanism
        gameChar_y -= vel_y / 1.4;
        vel_y -= 0.2;
        if (vel_y < -10) {
            isFalling = false;
            vel_y = 10;
            vel_x = 3;
        }
    }

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

    //"Game over", "Lives left" and "Level complete" text
    if (lives == 0) {
        fill(0, 100)
        rect(0, 0, width, height)
        fill(250, 0, 0);
        noStroke()
        textSize(60);
        text("Game over. You Lose! ", 265, 270);
        text("Press space to continue.", 250, 350)
    }else if (isPlummeting) {
        if (lives > -3 && lives < 3) {
            fill(0, 100)
            rect(0, 0, width, height)
            fill(250, 0, 0);
            noStroke()
            textSize(60);
            text("Lives left: " + abs(lives), 375, 270);
            text("Press enter to continue.", 245, 350)
        }
    }else if (flagpole.isReached == true) {
        fill(0, 100)
        rect(0, 0, width, height)
        fill(0, 250, 0);
        noStroke()
        textSize(60);
        text("Level complete. ", 340, 270);
        text("Press space to continue.", 255, 350)
        isFalling = false
        isLeft = false
        isRight = false
    }
    
    // Drawing the Score Board (NO.OF COINS COLLECTED)
    game_score = 0;
    for (i = 0; i < isFound.length; i++) {
        if (isFound[i] == true) {
            game_score++;
        }
        if (isFound1[i] == true) {
            game_score++;
        }
    }
    noStroke();
    fill(80, 200);
    rect(10, 10, 160, 40);
    fill(255);
    textSize(25);
    text("Coins: " + game_score + "/14", 25, 39);

    // Display no.of lives remaining
    checkPlayerDie();
    noStroke();
    fill(80, 200);
    rect(855, 10, 160, 40);
    fill(255);
    textSize(25);
    text("Lives: " + abs(lives), 870, 39);

}


//############################################################################
// SUMMARY FOR FUNCTIONS:                                                    #
// 1: Key control functions                                                  #
// 2: Color gradient function                                                #
// 3: Game character render function                                         #
// 4: Background render functions, (clouds, mountains, trees)                #
// 5: Canyon render and check functions                                      #
// 6: Collectable items render and check functions                           #
// 7: Function that holds all the arrays and objects for all game elements   #
// 8: Function to check if player has died                                   #
//############################################################################


// ---------------------
// Key control functions
// ---------------------
function keyPressed() 
{
    if (keyCode == LEFT_ARROW) {
        isLeft = true;
    } else if (keyCode == RIGHT_ARROW) {
        isRight = true;

        // for scrolling mechanism
        if (gameChar_x >= 800) {
            scroll = true;
        }
    } else if (keyCode == 32) {
        isFalling = true;
    }

    if (isPlummeting == true) {
        if (lives>-3 && lives < 3 && lives != 0) {
            if (keyCode == ENTER) {
                lives = abs(lives)
                startGame()
            }
        }
        if (lives == 0) {
            if (keyCode == 32) {
                lives = 3
                startGame()
            }
        }
    }

    if (flagpole.isReached == true && game_score == 14) {
        if (keyCode == 32) {
            lives = 3
            startGame()
        }
    }
}
function keyReleased() 
{
    if (keyCode == LEFT_ARROW) {
        isLeft = false;
    } else if (keyCode == RIGHT_ARROW) {
        isRight = false;
        scroll = false;
    }
}


// -----------------------------------
// Function to create a color gradient
// -----------------------------------
function setGradient(x, y, w, h, c1, c2, axis) {
    noFill(); //function used to produce the color gradient

    if (axis === Y_AXIS) {
        // Top to bottom gradient
        for (let i = y; i <= y + h; i++) {
            let inter = map(i, y, y + h, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(x, i, x + w, i);
        }
    }
}


// ------------------------------
// Game character render function
// ------------------------------
function drawGameChar() 
{
    if (isLeft && isFalling) {
        // JUMPING LEFT
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 7,
            gameChar_y - 22,
            gameChar_x + 3,
            gameChar_y - 8,
            gameChar_x + 4,
            gameChar_y - 8,
            gameChar_x - 1,
            gameChar_y - 22
        );
        quad(
            gameChar_x + 3,
            gameChar_y - 22,
            gameChar_x + 13,
            gameChar_y - 8,
            gameChar_x + 14,
            gameChar_y - 8,
            gameChar_x + 10,
            gameChar_y - 22
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x - 12, gameChar_y - 41);
        curveVertex(gameChar_x - 7, gameChar_y - 20);
        curveVertex(gameChar_x + 3, gameChar_y - 17);
        curveVertex(gameChar_x + 12, gameChar_y - 22);
        curveVertex(gameChar_x + 6, gameChar_y - 41);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x - 3, gameChar_y - 50, 36, 34);
        stroke(0); //eyes
        ellipse(gameChar_x - 14, gameChar_y - 51, 3, 7);
        ellipse(gameChar_x - 3, gameChar_y - 51, 3, 7);
        stroke(226, 88, 34); //fire
        strokeWeight(2);
        fill(230, 167, 31);
        triangle(
            gameChar_x,
            gameChar_y - 8,
            gameChar_x + 6,
            gameChar_y - 8,
            gameChar_x + 7,
            gameChar_y - 2
        );
        triangle(
            gameChar_x + 10,
            gameChar_y - 8,
            gameChar_x + 16,
            gameChar_y - 8,
            gameChar_x + 17,
            gameChar_y - 2
        );
    } else if (isRight && isFalling) {
        // JUMPING RIGHT
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 11,
            gameChar_y - 22,
            gameChar_x - 16,
            gameChar_y - 8,
            gameChar_x - 15,
            gameChar_y - 8,
            gameChar_x - 5,
            gameChar_y - 22
        );
        quad(
            gameChar_x - 1,
            gameChar_y - 22,
            gameChar_x - 7,
            gameChar_y - 8,
            gameChar_x - 6,
            gameChar_y - 8,
            gameChar_x + 3,
            gameChar_y - 22
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x - 8, gameChar_y - 41);
        curveVertex(gameChar_x - 16, gameChar_y - 20);
        curveVertex(gameChar_x - 4, gameChar_y - 16);
        curveVertex(gameChar_x + 3, gameChar_y - 20);
        curveVertex(gameChar_x + 8, gameChar_y - 41);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x + 3, gameChar_y - 50, 36, 34);
        stroke(0); //eyes
        ellipse(gameChar_x + 3, gameChar_y - 51, 3, 7);
        ellipse(gameChar_x + 15, gameChar_y - 51, 3, 7);
        stroke(226, 88, 34); //fire
        strokeWeight(2);
        fill(230, 167, 31);
        triangle(
            gameChar_x - 18.5,
            gameChar_y - 8,
            gameChar_x - 13,
            gameChar_y - 8,
            gameChar_x - 19,
            gameChar_y - 2
        );
        triangle(
            gameChar_x - 9,
            gameChar_y - 8,
            gameChar_x - 4,
            gameChar_y - 8,
            gameChar_x - 11,
            gameChar_y - 2
        );
    } else if (isLeft) {
        // WALKING LEFT
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 4,
            gameChar_y - 16,
            gameChar_x - 1,
            gameChar_y - 2,
            gameChar_x,
            gameChar_y - 2,
            gameChar_x - 1,
            gameChar_y - 16
        );
        quad(
            gameChar_x + 10,
            gameChar_y - 16,
            gameChar_x + 11,
            gameChar_y - 2,
            gameChar_x + 10,
            gameChar_y - 2,
            gameChar_x + 5,
            gameChar_y - 16
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x - 12, gameChar_y - 35);
        curveVertex(gameChar_x - 7, gameChar_y - 14);
        curveVertex(gameChar_x + 3, gameChar_y - 11);
        curveVertex(gameChar_x + 12, gameChar_y - 16);
        curveVertex(gameChar_x + 6, gameChar_y - 35);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x - 3, gameChar_y - 44, 36, 34);
        stroke(0); //eyes
        ellipse(gameChar_x - 14, gameChar_y - 45, 3);
        ellipse(gameChar_x - 3, gameChar_y - 45, 3);
    } else if (isRight) {
        // WALKING RIGHT
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 14,
            gameChar_y - 16,
            gameChar_x - 16,
            gameChar_y - 2,
            gameChar_x - 15,
            gameChar_y - 2,
            gameChar_x - 9,
            gameChar_y - 16
        );
        quad(
            gameChar_x - 4,
            gameChar_y - 16,
            gameChar_x - 4,
            gameChar_y - 2,
            gameChar_x - 3,
            gameChar_y - 2,
            gameChar_x - 1,
            gameChar_y - 16
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x - 8, gameChar_y - 35);
        curveVertex(gameChar_x - 16, gameChar_y - 14);
        curveVertex(gameChar_x - 4, gameChar_y - 10);
        curveVertex(gameChar_x + 3, gameChar_y - 14);
        curveVertex(gameChar_x + 8, gameChar_y - 35);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x + 3, gameChar_y - 44, 36, 34);
        stroke(0); //eyes
        ellipse(gameChar_x + 3, gameChar_y - 45, 3);
        ellipse(gameChar_x + 15, gameChar_y - 45, 3);
    } else if (isFalling) {
        // JUMPING FACING FORWARD
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 8,
            gameChar_y - 22,
            gameChar_x - 12,
            gameChar_y - 8,
            gameChar_x - 11,
            gameChar_y - 8,
            gameChar_x - 4,
            gameChar_y - 22
        );
        quad(
            gameChar_x + 7,
            gameChar_y - 22,
            gameChar_x + 9,
            gameChar_y - 8,
            gameChar_x + 8,
            gameChar_y - 8,
            gameChar_x + 2,
            gameChar_y - 22
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x - 10, gameChar_y - 41);
        curveVertex(gameChar_x - 12, gameChar_y - 20);
        curveVertex(gameChar_x, gameChar_y - 16);
        curveVertex(gameChar_x + 10, gameChar_y - 20);
        curveVertex(gameChar_x + 8, gameChar_y - 41);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x, gameChar_y - 52, 36, 34);
        stroke(0); //eyes
        ellipse(gameChar_x - 6, gameChar_y - 54, 3, 7);
        ellipse(gameChar_x + 6, gameChar_y - 54, 3, 7);
        stroke(226, 88, 34); //fire
        strokeWeight(2);
        fill(230, 167, 31);
        triangle(
            gameChar_x - 14,
            gameChar_y - 10,
            gameChar_x - 8,
            gameChar_y - 8,
            gameChar_x - 14,
            gameChar_y - 2
        );
        triangle(
            gameChar_x + 5,
            gameChar_y - 9,
            gameChar_x + 11,
            gameChar_y - 9,
            gameChar_x + 11,
            gameChar_y - 2
        );
    } else if (isPlummeting) {
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 2,
            gameChar_y - 23,
            gameChar_x - 17,
            gameChar_y - 15,
            gameChar_x - 17,
            gameChar_y - 14,
            gameChar_x - 4,
            gameChar_y - 18
        );
        quad(
            gameChar_x - 2,
            gameChar_y - 16,
            gameChar_x - 17,
            gameChar_y - 8,
            gameChar_x - 17,
            gameChar_y - 7,
            gameChar_x - 4,
            gameChar_y - 10
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x + 20, gameChar_y - 28);
        curveVertex(gameChar_x - 2, gameChar_y - 26);
        curveVertex(gameChar_x - 2, gameChar_y - 10);
        curveVertex(gameChar_x + 16, gameChar_y - 11);
        curveVertex(gameChar_x + 20, gameChar_y - 30);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x + 35, gameChar_y - 20, 36, 34);
        line(
            gameChar_x + 38,
            gameChar_y - 22,
            gameChar_x + 44,
            gameChar_y - 27
        ); //eye 1
        line(
            gameChar_x + 38,
            gameChar_y - 27,
            gameChar_x + 44,
            gameChar_y - 22
        );
        line(
            gameChar_x + 38,
            gameChar_y - 15,
            gameChar_x + 43,
            gameChar_y - 10
        ); //eye 2
        line(
            gameChar_x + 38,
            gameChar_y - 10,
            gameChar_x + 43,
            gameChar_y - 15
        );
    } else {
        // STANDING STILL
        fill(120);
        stroke(0);
        strokeWeight(3); //legs
        quad(
            gameChar_x - 8,
            gameChar_y - 16,
            gameChar_x - 7,
            gameChar_y - 2,
            gameChar_x - 6,
            gameChar_y - 2,
            gameChar_x - 4,
            gameChar_y - 16
        );
        quad(
            gameChar_x + 7,
            gameChar_y - 16,
            gameChar_x + 6,
            gameChar_y - 2,
            gameChar_x + 5,
            gameChar_y - 2,
            gameChar_x + 2,
            gameChar_y - 16
        );
        beginShape(TESS); //body
        curveVertex(gameChar_x - 10, gameChar_y - 35);
        curveVertex(gameChar_x - 12, gameChar_y - 14);
        curveVertex(gameChar_x, gameChar_y - 10);
        curveVertex(gameChar_x + 10, gameChar_y - 14);
        curveVertex(gameChar_x + 8, gameChar_y - 35);
        endShape(CLOSE);
        fill(255, 224, 189); //face
        ellipse(gameChar_x, gameChar_y - 46, 36, 34);
        ellipse(gameChar_x - 6, gameChar_y - 48, 3); //eyes
        ellipse(gameChar_x + 6, gameChar_y - 48, 3);
    }
}


// ---------------------------
// Background render functions
// ---------------------------
// Function to draw cloud objects.
function drawClouds() {
    for (i = 0; i < clouds.length; i++) {
        noStroke();
        fill(clouds[i].color); //cloud 1
        ellipse(clouds[i].x, clouds[i].y, clouds[i].w);
        rect(clouds[i].x, clouds[i].y, clouds[i].w * 2, clouds[i].w * 0.5);
        ellipse(
            clouds[i].x + clouds[i].w * 0.5,
            clouds[i].y - clouds[i].w * 0.2,
            clouds[i].w * 1.2
        );
        ellipse(
            clouds[i].x + clouds[i].w * 1.3,
            clouds[i].y - clouds[i].w * 0.1,
            clouds[i].w * 0.9
        );
        ellipse(clouds[i].x + clouds[i].w * 2, clouds[i].y, clouds[i].w);
    }
    
}
// Function to draw mountains objects.
function drawMountains() {
    noStroke();//background mountains
    for (i = 0; i < 1000; i += 300) {
        fill(60, 137, 170, 80); 
        triangle(
            mountains[0].x1 + i,
            mountains[0].y1,
            mountains[0].x2 + i,
            mountains[0].y2,
            mountains[0].x3 + i,
            mountains[0].y3
        );
        fill(240, 20)
        triangle(   
            mountains[0].x1 + i + 168,
            mountains[0].y1 - 260,
            mountains[0].x2 + i,
            mountains[0].y2,
            mountains[0].x3 + i - 260,
            mountains[0].y3 -250

        )
    }
    //foreground mountains
    fill(69, 124, 153);
    for (i = 1; i < mountains.length; i++) {
        triangle(
            mountains[i].x1,
            mountains[i].y1,
            mountains[i].x2,
            mountains[i].y2,
            mountains[i].x3,
            mountains[i].y3
        );
        rect(10, 390, 1000, 200);
    }

    fill(200); // ice on mountains
    triangle(260, 230, 192, 273, 316, 275);
    triangle(560, 310, 530, 334, 598, 338);
    triangle(850, 150, 784, 238, 905, 232);
}
// Function to draw trees objects.
function drawTrees() {
    for (i = 0; i < trees_x.length; i++) {
        fill(trees[0].woodColor);
        rect(trees_x[i], trees[i + 1].y, trees[i + 1].w, trees[i + 1].h); //wood
        fill(trees[0].greenColor_1);
        ellipse(trees_x[i] + 10, trees[i + 1].y - 40, trees[i + 1].d);
        fill(trees[0].greenColor_2);
        ellipse(trees_x[i] + 10, trees[i + 1].y - 40, trees[i + 1].d * 0.8);
        fill(trees[0].greenColor_1);
        ellipse(trees_x[i], trees[i + 1].y - 50, trees[i + 1].d * 0.8);
    }
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------
// Function to draw canyon objects.
function drawCanyon(x, y, w, h, c1, c2) {
    setGradient(
        x, y, w, h, c1, c2,
        Y_AXIS
    );
    //canyon spikes
    for (j = x; j <= x + 150; j += 30) {
        fill(180);
        noStroke();
        triangle(j, 576, j + 15, 560, j + 30, 576);
    }
}
// Function to check character is over a canyon.
function checkCanyon(x, y, t_canyon_x) {
	if (
        (x > t_canyon_x + 5 && x < t_canyon_x + 170)
    ) {
        if (y >= 509) {
            gameChar_y = 576;
            isPlummeting = true;
            isLeft = false;
            isRight = false;
            isFalling = false;
        }
    }
}


// ----------------------------------
// Collectable items render and check functions
// ----------------------------------
// Function to draw collectable objects.
function drawCollectables(f, x, y, w, c1, c2) {
    if (f == false) {
        fill(c2);
        ellipse(x + 2.5, y + 2.5, w);
        fill(c1);
        ellipse(x, y, w);
        fill(240);
        ellipse(x - 4, y - 4, 10);
    }
}
// Function to check character has collected an item.
function checkCollectables(x, y, Cx, Cy) {
    if (dist(x, y, Cx, Cy) < 30) {
        isFound[i] = true
    }
}
function checkCollectables1(x, y, Cx, Cy) {
    if (dist(x, y, Cx, Cy) < 30) {
        isFound1[i] = true
    }
}


// ----------------------------------
// Flagpole render and check functions
// ----------------------------------
// Function to draw Flagpole
function renderFlagpole() {
    fill(195)
    rect(flagpole.x_pos - 40, floorPos_y - 30, 80, 20)
    rect(flagpole.x_pos - 10, floorPos_y - 170, 20, 140)
    rect()
    fill(140)
    rect(flagpole.x_pos +10, floorPos_y - 30, 30, 20)
    rect(flagpole.x_pos, floorPos_y - 170, 10, 140)
    if (flagpole.isReached && game_score == 14) {
        fill(200, 0, 0)
        triangle(flagpole.x_pos -10, floorPos_y - 70, flagpole.x_pos - 50, floorPos_y - 40, flagpole.x_pos - 10, floorPos_y - 30)
    } else {
        fill(200, 0, 0)
        triangle(flagpole.x_pos -10, floorPos_y - 170, flagpole.x_pos - 50, floorPos_y - 140, flagpole.x_pos - 10, floorPos_y - 130)
    }
}
// Function to check if the flagpole has been closed
function checkFlagpole() {
    d = dist(gameChar_world_x, gameChar_y, flagpole.x_pos, floorPos_y)
    if (d<40 && game_score ==14) {
        flagpole.isReached = true;
        console.log(flagpole.isReached)
    }
}

//Function that holds all the arrays and objects for all game elements
function startGame() {
    gameChar_x = 140;
	gameChar_y = floorPos_y - 10;
	vel_x = 4;
	vel_y = 10;
    

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of non interactable elements in the game.
	sky = 
	{
        color1: color(0, 79, 240),
        color2: color(214, 243, 255),
    };
	clouds = 
	[
        { x: 80, y: 150, w: 100, color: color(200) },
        { x: 400, y: 100, w: 50, color: color(190) },
        { x: 700, y: 130, w: 100, color: color(190) },
    ];
	ground = 
	{
        soilColor_1: color(240, 150, 70),
        soilColor_2: color(120, 38, 3),
        grassColor: color(86, 217, 0),
        x: 0,
		y: floorPos_y,
        w: 1024,
        h: 60
    };
	mountains = 
	[
        {
            x1: -100,
            y1: 560,
            x2: 100,
            y2: 250,
            x3: 400,
            y3: 540,
            color: color(0, 137, 196, 50),
        }, //background mountains

        {
            x1: -300,
            y1: 590,
            x2: 260,
            y2: 230,
            x3: 460,
            y3: 390,
        }, //foreground mountain 1

        {
            x1: 460,
            y1: 390,
            x2: 560,
            y2: 310,
            x3: 660,
            y3: 390,
        }, //foreground mountain 2

        {
            x1: 600,
            y1: 490,
            x2: 850,
            y2: 150,
            x3: 1100,
            y3: 530,
        }, //foreground mountain 3
    ];
	trees_x = [650, 780, 900];
    trees = 
	[
        {
            woodColor: color(151, 84, 69),
            greenColor_1: color(0, 200, 0),
            greenColor_2: color(0, 180, 0),
        },
		//x values are in trees_x above
        { y: 300, w: 20, h: 210, d: 180 }, 
        { y: 400, w: 16, h: 110, d: 140 },
        { y: 300, w: 20, h: 210, d: 160 },
    ];

    // Initialise arrays of interactable elements in the game.
	isFound = [false, false, false, false, false, false, false];
    isFound1 = [false, false, false, false, false, false, false];
    collectable = 
	{
        color1: color(255, 195, 51), //main color
        color2: color(208, 105, 1), //back color
        x: 500,
        y: 480,
        w: 26,
    };
	canyons = 
	[
        {
            color1: color(120),
            color2: color(20),
            color_spikes: color(190),
        },
        {
            x: 220,
            y: 510,
            w: 180,
            h: 80,
        },
        {
            x: 430,
            y: 510,
            w: 180,
            h: 80,
        },
    ];
    flagpole = {isReached: false, x_pos: 2000}
}

// Function to check if player has died
function checkPlayerDie() {
    if (isPlummeting == true) {
        if (lives == 3) {
            lives = -2
        } else if (lives == 2) {
            lives = -1
        } else if (lives == 1) {
            lives = -0
        }
    }
}