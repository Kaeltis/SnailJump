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
    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);

    // Graphics
    game.load.image('level', 'assets/level.png');
    game.load.image('background', 'assets/bg.png');
    game.load.atlasJSONHash('character', 'assets/character.png', 'assets/character.json');
    game.load.image('deathwall', 'assets/deathwall.png');

    // Sounds
    game.load.audio('backgroundMusic', ['assets/mshanty-town.OGG']);
    game.load.audio('gameoverMusic', ['assets/mgame-over.OGG']);
    game.load.audio('dieMusic', ['assets/msplash.OGG']);
    game.load.audio('jumpMusic', ['assets/mjump.OGG']);
    game.load.audio('startMusic', ['assets/mgame-start.OGG']);
}

var map;
var layer;
var player;
var deathwall;
var cursors;
var jumpButton;
var hozMove = 160; // walk
var vertMove = -180; // jump
var jumpTimer = 0;
var cameraPosX;
var score = 0;
var scoreMult = 1;
var scoreText;
var lives = 3;
var livesText;

function create() {
    //Background
    game.stage.backgroundColor = '#FFFFFF';
    game.add.tileSprite(0, 0, 2000, 600, 'background');
    backgroundMusic = game.add.audio('backgroundMusic');
    backgroundMusic.play('');
    gameoverMusic = game.add.audio('gameoverMusic');
    dieMusic = game.add.audio('dieMusic');
    jumpMusic = game.add.audio('jumpMusic');
    startMusic = game.add.audio('startMusic');

    //Physik
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Tilemap & Level
    map = game.add.tilemap('map');
    map.addTilesetImage('level');
    layer = map.createLayer('Kachelebene 1');

    // Collisions
    map.setCollisionByExclusion([1, 31]);

    // Resize World
    layer.resizeWorld();

    // Player & Animations
    player = game.add.sprite(150, 5 * 70, 'character', 'p1_walk01.png');
    player.animations.add('walk', [
        'p1_walk01.png',
        'p1_walk02.png',
        'p1_walk03.png',
        'p1_walk04.png',
        'p1_walk05.png',
        'p1_walk06.png',
        'p1_walk07.png',
        'p1_walk08.png',
        'p1_walk09.png'
    ], 30, false, false);

    // Deathwall
    deathwall = game.add.sprite(0, 250, 'deathwall');
    deathwall.fixedToCamera = true;
    deathwall.anchor.setTo(0.6, 0.5);

    // Player Physics
    game.physics.enable([player]);
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 160;

    // Controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Set Camera
    cameraPosX = player.body.x - 250;
    game.camera.x = cameraPosX;
    game.camera.y = player.body.y;

    //Score Text
    scoreText = game.add.text(game.camera.width / 1.2, 40, "0 Punkte", {
        font: "25px Arial",
        fill: "#ff0044"
    });
    scoreText.anchor.setTo(0.5, 0.5);
    scoreText.fixedToCamera = true;

    //Lives Text
    livesText = game.add.text(game.camera.width / 6, 40, lives + " Leben", {
        font: "25px Arial",
        fill: "#ff0044"
    });
    livesText.anchor.setTo(0.5, 0.5);
    livesText.fixedToCamera = true;
}

function update() {
    // Check collisions & Move player forward
    game.physics.arcade.collide(player, layer);
    player.body.velocity.x = hozMove / 4;

    // Update Camera
    if (game.camera.x <= player.body.x - 600)
        cameraPosX += 2.5;
    else
        cameraPosX += 0.5;

    game.camera.y = player.body.y;
    game.camera.x = cameraPosX;

    if (!player.inCamera) {
        gameOver(game.time.now);
    }

    if (game.camera.x < 1300)
        score += 1 * scoreMult;

    // Update Score
    scoreText.setText(score + " Punkte");

    // Update Lives
    livesText.setText(lives + " Leben");

    // Controls
    if (cursors.left.isDown) {
        player.body.velocity.x = -hozMove;
        player.animations.play('walk', 30);
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x = hozMove;
        player.animations.play('walk', 30);
    }
    else {
        player.animations.play('walk', 10);
    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
        player.body.velocity.y = vertMove;
        jumpTimer = game.time.now + 650;
        jumpMusic.play();
    }
}

function render() {

    // game.debug.body(p);
    game.debug.bodyInfo(player, 50, 480, '#ff0044');
    game.debug.cameraInfo(game.camera, 200, 100, '#ff0044');
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