var game = new Phaser.Game(
    800, 600,
    Phaser.AUTO,
    'gamediv',
    {
        preload: preload,
        create: create,
        update: update
    });

function preload() {
    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);

    game.load.image('level', 'assets/level.png');
    game.load.image('background', 'assets/bg.png');

    game.load.atlasJSONHash('character', 'assets/character.png', 'assets/character.json');
}

var map;
var layer;
var player;
var facing = "left";
var cursors;
var jumpButton;
var hozMove = 160; // walk
var vertMove = -180; // jump
var jumpTimer = 0;

function create() {
    //Background
    game.stage.backgroundColor = '#FFFFFF';
    game.add.tileSprite(0, 0, 2000, 600, 'background');

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
    player = game.add.sprite(1, 5 * 70, 'character', 'p1_walk01.png');
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


    // Player Physics
    game.physics.enable(player);
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 160;

    // Controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Set Camera
    game.camera.x = player.body.x - 150;
    game.camera.y = player.body.y;
}

function update() {
    // Check collisions & Move player forward
    game.physics.arcade.collide(player, layer);
    player.body.velocity.x = 10;

    // Update Camera
    game.camera.y = player.body.y;
    game.camera.x = game.time.now / 100;
    if (!player.inCamera) {
        playerOOC();
    }


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
    }
}

function playerOOC() {
    alert("Player OOC!");
    location.reload();
}