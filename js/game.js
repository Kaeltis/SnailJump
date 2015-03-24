var game = new Phaser.Game(
    800, 600,
    Phaser.AUTO,
    'gamediv',
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

function preload() {
    // Level
    game.load.tilemap('map1', 'assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('map2', 'assets/map2.json', null, Phaser.Tilemap.TILED_JSON);

    // Graphics
    game.load.image('level', 'assets/level.png');
    game.load.image('background', 'assets/bg.png');

    game.load.image("tree", "assets/tree.png");
    game.load.image("heart", "assets/heart.png");

    game.load.image('character', 'assets/snail_2.png');

    // Sounds
    game.load.audio('backgroundMusic', ['assets/mshanty-town.OGG']);
    game.load.audio('gameoverMusic', ['assets/mgame-over.OGG']);
    game.load.audio('dieMusic', ['assets/msplash.OGG']);
    game.load.audio('jumpMusic', ['assets/mjump.OGG']);
    game.load.audio('startMusic', ['assets/mgame-start.OGG']);
}

var map;
var maps = [];
var layer, layer2;
var player;
var cursors;
var jumpButton;
var debugButton;
var cheatButton;
var muteButton;
var debug = false;
var hozMove = 160; // walk
var vertMove = -240; // jump
var jumpTimer = 0;
var cameraPosX;
var score = 0;
var currentscore = 0;
var scoreMult = 1;
var scoreText;
var lives = 3;
var hearts = [];
var speedMult = 1;
var endPoint = 0;
var mapRotation = 0;

function create() {
    //Background
    game.stage.backgroundColor = '#FFFFFF';
    game.add.tileSprite(0, 0, 10000, 600, 'background');

    //Music
    backgroundMusic = game.add.audio('backgroundMusic');
    backgroundMusic.play('');
    gameoverMusic = game.add.audio('gameoverMusic');
    dieMusic = game.add.audio('dieMusic');
    jumpMusic = game.add.audio('jumpMusic');
    startMusic = game.add.audio('startMusic');

    //Physik
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Tilemap & Level
    for (var i = 0; i < 2; i++) {
        map = game.add.tilemap('map' + (i + 1));
        map.addTilesetImage('level');
        map.setCollision([5, 14]); // Collisions
        maps.push(map); // loaded maps
    }

    map = maps[mapRotation];
    layer = maps[mapRotation].createLayer('Level');

    // Player
    player = game.add.sprite(150, 5 * 70, 'character');

    // Player Physics
    game.physics.enable([player]);
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 160;

    // Controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    cheatButton = game.input.keyboard.addKey(Phaser.Keyboard.C);
    debugButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
    muteButton = game.input.keyboard.addKey(Phaser.Keyboard.M);

    // Set Camera
    cameraPosX = player.body.x - 250;
    game.camera.x = cameraPosX;
    game.camera.y = player.body.y;

    // Score Text
    scoreText = game.add.text(game.camera.width / 1.2, 40, "0 m", {
        font: "25px Arial",
        fill: "#ff0044"
    });
    scoreText.anchor.setTo(0.5, 0.5);
    scoreText.fixedToCamera = true;

    //Lives
    for (var i = 0; i < lives; i++) {
        hearts[i] = game.add.sprite(10 + (i * 80), 10, "heart");
        hearts[i].fixedToCamera = true;
    }

    // Resize World
    layer.resizeWorld();

    // Set end of map
    if (map.properties.MapWidth === undefined)
        endPoint = map.widthInPixels - player.body.width * 2;
    else
        endPoint = parseInt(map.properties.MapWidth);

}

function update() {
    // Check collisions & Move player forward
    game.physics.arcade.collide(player, layer);
    player.body.velocity.x = (hozMove / 4) * speedMult;
    player.body.gravity.y = 300;

    // Update Camera
    if (game.camera.x <= player.body.x - 250) {
        cameraPosX += 2.5 * speedMult;
        scoreMult = 3;
    }
    else {
        cameraPosX += 0.5 * speedMult;
        scoreMult = 1;
    }

    game.camera.y = player.body.y;
    game.camera.x = cameraPosX;

    if (player.body.x >= endPoint) {
        arrivedEnd();
    }

    if (!player.inCamera) {
        game.add.tween(hearts[--lives]).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 0);

        if (lives <= 0)
            gameOver(game.time.now);
        else {
            player.body.x = cameraPosX + 10;
            player.body.y = 100;
        }
    }

    score += scoreMult;

    // Update Score
    scoreText.setText(score + " m");

    // Controls
    if (cursors.left.isDown) {
        player.body.velocity.x = -hozMove * speedMult;
        //player.animations.play('walk', 30);
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x = hozMove * speedMult;
    }
    else {

    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
        player.body.velocity.y = vertMove;
        jumpTimer = game.time.now + 400;
        jumpMusic.play();
    }

    if (cheatButton.isDown) {
        game.camera.x = cameraPosX = game.camera.bounds.width - game.camera.screenView.width;
        player.body.x = endPoint - 100;
        player.body.y = 390;
    }

    if (debugButton.isDown) {
        debug = true;
    }

    if (muteButton.isDown) {
        game.sound.setMute();
    }
}

function arrivedEnd() {
    // reset camera and other values
    game.camera.x = cameraPosX = 0;
    player.body.x = 150;
    player.body.y = 350;
    score += 1000;
    speedMult = speedMult < 2 ? speedMult + 0.2 : speedMult;

    // delete previous map layer
    layer.destroy();

    // random map rotation
    mapRotation = ~~((Math.random() * 100) % maps.length);
    map = maps[mapRotation];
    layer = map.createLayer("Level");
    layer.resizeWorld();

    // Set end of new map
    if (map.properties.MapWidth === undefined)
        endPoint = map.widthInPixels - player.body.width * 2;
    else
        endPoint = parseInt(map.properties.MapWidth);

    // hearts
    for (var i = 0; i < lives; i++) {
        hearts[i].destroy();
        hearts[i] = game.add.sprite(10 + (i * 80), 10, "heart");
        hearts[i].fixedToCamera = true;
    }
}

function render() {
    if (debug) {
        game.debug.bodyInfo(player, 50, 480, '#ff0044');
        game.debug.cameraInfo(game.camera, 200, 100, '#ff0044');
    }
}

function gameOver(score) {
    dieMusic.play();
    gameoverMusic.play();

    alert("Game Over!");

    if (getCookie('highscore') < score) {
        name = prompt("Neuer Highscore!\nBitte Namen eingeben:", "");
        setCookie('highscorename', name, 365);
        setCookie('highscore', score, 365);
    }

    location.reload();
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}