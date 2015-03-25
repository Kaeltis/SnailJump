var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamediv',
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

// Vars
var map, layer, cursors, objects, objectGroup;
var maps = [], mapCount = 5, hearts = [];
var player, lives = 3;
var jumpButton, debugButton, cheatButton, muteButton;
var coinSound, muted = false;
var debug = false;
var hozMove = 180; // walk
var vertMove = -300; // jump
var jumpTimer = 0, buttonTimer = 0;
var cameraPosX;
var highscore = 0, levelscore = 0, scoreText;
var speedMult = 1;
var endPoint = 0;
var mapRotation = 0;

function preload()
{
    // Level
    for(var i = 1; i <= mapCount; i++)
    {
        game.load.tilemap('map'+i, 'assets/map'+i+'.json', null, Phaser.Tilemap.TILED_JSON);
    }

    // Graphics
    game.load.image('level', 'assets/level.png');
    game.load.image('background', 'assets/bg.png');
    game.load.image("tree", "assets/tree.png");
    game.load.image("heart", "assets/heart.png");
    game.load.image('character', 'assets/snail_2.png');

    // Point Objects
    game.load.image('grape', 'assets/grape_32.png');
    game.load.image('worm', 'assets/worm_32.png');
    game.load.image('apple', 'assets/apple_32.png');
    game.load.image('strawberry', 'assets/strawberry_32.png');

    // Sounds
    game.load.audio('backgroundMusic', ['assets/mshanty-town.OGG']);
    game.load.audio('gameoverMusic', ['assets/mgame-over.OGG']);
    game.load.audio('dieMusic', ['assets/msplash.OGG']);
    game.load.audio('jumpMusic', ['assets/mjump.OGG']);
    game.load.audio('startMusic', ['assets/mgame-start.OGG']);
    game.load.audio('coinSound', ['assets/coin-sound.mp3']);
}


function create()
{
    // Background
    game.stage.backgroundColor = '#FFFFFF';
    game.add.tileSprite(0, 0, 10000, 800, 'background');

    // Music
    backgroundMusic = game.add.audio('backgroundMusic');
    gameoverMusic = game.add.audio('gameoverMusic');
    dieMusic = game.add.audio('dieMusic');
    jumpMusic = game.add.audio('jumpMusic');
    startMusic = game.add.audio('startMusic');
    coinSound = game.add.audio('coinSound');
    backgroundMusic.play('');

    // Physik
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Tilemap & Level
    for (var i = 0; i < mapCount; i++)
    {
        map = game.add.tilemap('map' + (i + 1));
        map.addTilesetImage('level');
        map.setCollision([5, 14]); // Collisions
        maps.push(map); // loaded maps
    }

    map = maps[mapRotation];
    layer = map.createLayer('Level');
    objects = map.objects.Points;
    objectGroup = game.add.group();
    objectGroup.enableBody = true;
    objectGroup.physicsBodyType = Phaser.Physics.ARCADE;

    if(objects !== undefined || objects !== null)
    {
        for(var i = 0; i < objects.length; i++)
        {
            objects[i].sprite = null;

            switch(objects[i].gid)
            {
                case 19: // worm
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'worm');
                    break;

                case 18: // strawberry
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'strawberry');
                    break;

                case 17: // grape
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'grape');
                    break;

                case 16: // apple
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'apple');
                    break;
            }
        }
    }

    // Player
    player = game.add.sprite(150, 5 * 70, 'character');

    // Player Physics
    game.physics.enable([player]);
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 400;

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
    scoreText = game.add.text(game.camera.width / 1.2, 40, "0 Punkte", {
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

function collisionHandler(player, pointObject)
{
    coinSound.play();
    pointObject.kill();
    highscore += 20;
}

function update()
{
    // Check collisions & Move player forward
    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(player, objectGroup, collisionHandler);

    if(game.time.now > buttonTimer)
        player.body.velocity.x = (hozMove / 4) * speedMult;

    // Update Camera
    if (game.camera.x <= player.body.x - 250)
    {
        cameraPosX += 2.5 * speedMult;
    }
    else
    {
        cameraPosX += 0.7 * speedMult;
    }

    game.camera.y = player.body.y;
    game.add.tween(game.camera).to({x: cameraPosX}, 200, Phaser.Easing.Linear.None, true, 0);
    //game.camera.x = cameraPosX;

    // Update Score
    if (player.body.x / 75 > levelscore)
        levelscore = parseInt(player.body.x / 75);

    scoreText.setText(levelscore + highscore + " Punkte");

    if (player.body.x >= endPoint)
    {
        arrivedEnd();
    }
    else if (!player.inCamera && game.time.now > buttonTimer)
    {
        game.add.tween(hearts[--lives]).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 0);

        if (lives <= 0)
            gameOver(levelscore + highscore);
        else
        {
            player.body.x = cameraPosX + 10;
            player.body.y = 100;
        }
    }

    // Controls
    if (cursors.left.isDown)
    {
        player.body.velocity.x = -hozMove * speedMult;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = hozMove * speedMult;
    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        player.body.velocity.y = vertMove;
        jumpTimer = game.time.now + 400;
        jumpMusic.play();
    }

    if (game.time.now > buttonTimer && cheatButton.isDown)
    {
        animCompleted = false;
        buttonTimer = game.time.now + 1500;
        cameraPosX = game.camera.bounds.width - game.camera.screenView.width;
        player.body.x = endPoint - 100;
        player.body.y = 390;
        player.body.velocity.x = 0;
    }
    else if (debugButton.isDown)
    {
        debug = true;
    }
    else if (game.time.now > buttonTimer && muteButton.isDown)
    {
        if(!muted)
            game.sound.setMute();
        else
            game.sound.unsetMute();
    }
}

function arrivedEnd() {
    // reset camera and other values
    buttonTimer = game.time.now + 1500;
    game.camera.x = cameraPosX = 0;
    player.body.x = 100;
    player.body.y = 350;
    player.body.velocity.x = 0;
    speedMult = speedMult < 2 ? speedMult + 0.2 : speedMult;

    highscore += levelscore + 100;
    levelscore = 0;

    // delete previous map layer
    layer.destroy();
    objectGroup.destroy(true);

    // random map rotation
    mapRotation = ~~((Math.random() * 100) % maps.length);
    map = maps[mapRotation];
    layer = map.createLayer("Level");
    objects = map.objects.Points;
    objectGroup = game.add.group();
    objectGroup.enableBody = true;
    objectGroup.physicsBodyType = Phaser.Physics.ARCADE;

    if(objects !== undefined || objects !== null)
    {
        for(var i = 0; i < objects.length; i++)
        {
            objects[i].sprite = null;

            switch(objects[i].gid)
            {
                case 19: // worm
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'worm');
                    break;

                case 18: // strawberry
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'strawberry');
                    break;

                case 17: // grape
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'grape');
                    break;

                case 16: // apple
                    objects[i].sprite = objectGroup.create(objects[i].x, objects[i].y-32, 'apple');
                    break;
            }
        }
    }

    layer.resizeWorld();

    // Set end of new map
    if (map.properties.MapWidth === undefined)
        endPoint = map.widthInPixels - player.body.width * 2;
    else
        endPoint = parseInt(map.properties.MapWidth);

    staticItems();
}

function staticItems()
{
    player.bringToTop();
    scoreText.parent.bringToTop(scoreText);

    // hearts
    for (var i = 0; i < lives; i++)
    {
        hearts[i].bringToTop();
    }
}

function render()
{
    if (debug)
    {
        game.debug.bodyInfo(player, 50, 480, '#ff0044');
        game.debug.cameraInfo(game.camera, 200, 100, '#ff0044');
    }
}

function gameOver(score) {
    dieMusic.play();
    gameoverMusic.play();
    layer.destroy();
    objectGroup.destroy(true);
    hearts[0].destroy();
    game.sound.setMute();

    alert("Game Over!");

    if (getCookie('highscore') < score) {
        name = prompt("Neuer Highscore!\nBitte Namen eingeben:", "");
        setCookie('highscorename', name, 365);
        setCookie('highscore', score, 365);
    }

    //location.reload();
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