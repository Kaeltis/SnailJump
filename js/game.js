(function () {
    var game = new Phaser.Game(
        720, 384, // The width and height of the game in pixels
        Phaser.AUTO, // The type of graphic rendering to use
        // (AUTO tells Phaser to detect if WebGL is supported.
        //  If not, it will default to Canvas.)
        'gamediv', // The parent element of the game
        {
            preload: preload, // The preloading function
            create: create, // The creation function
            update: update
        }); // The update (game-loop) function

    function preload() {
        // Load the 'map.json' file using the TILDED_JSON special flag
        game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);

        // Load the image 'level.png' and associate it in the cache as 'level'
        game.load.image('level', 'assets/level.png');

        // Load the spritesheet 'character.png', telling Phaser each frame is 30x48
        game.load.atlasJSONHash('character', 'assets/character.png', 'assets/character.json');

        //game.load.atlasJSONHash('sprites', 'assets/sprites.png', 'assets/sprites.json');
    }

    var map; // The tilemap
    var layer; // A layer within a tileset
    var player; // The player-controller sprite
    var facing = "left"; // Which direction the character is facing (default is 'left')
    var cursors; // A reference to the keys to use for input detection
    var jumpButton; // A reference to the button used for jumping
    var hozMove = 160; // The amount to move horizontally
    var vertMove = -120; // The amount to move vertically (when 'jumping')
    var jumpTimer = 0; // The initial value of the timer

    function create() {

        // Make the background color of the game's stage be white (#FFFFFF)
        game.stage.backgroundColor = '#FFFFFF';

        // Start the physics system ARCADE
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the tilemap 'map' to the game
        map = game.add.tilemap('map');

        // Add the tileset image 'level' to the map
        // (The name must match both an image in Phaser's cache
        //  and the name of an image withi the 'map.json'
        //  list of tilesets too.)
        map.addTilesetImage('sprites');

        // Create a layer from the 'map.json' file
        // based on 'Tile Layer 1' from the available tiles.
        layer = map.createLayer('Kachelebene 1');

        // Set the collision range
        //  Here, the range is from 1 (the first tile) to the fifth (last tile).
        map.setCollisionBetween(1, 57);

        // Tell the layer to resize the game 'world' to match its size
        layer.resizeWorld();

        // Create and add a sprite to the game at the position (2*48 x 6 *48)
        // and using, in this case, the spritesheet 'character'
        player = game.add.sprite(1, 5 * 70, 'character', 'p1_walk01.png');
        player.animations.add('walk', [
            'p1_walk01.png',
            'p1_walk02.png',
            'p1_walk03.png',
            'p1_walk04.png',
            'p1_walk05.png'
        ], 10, true, false);
        player.animations.play('walk');

        // By default, sprites do not have a physics 'body'
        // Before we can adjust its physics properties,
        // we need to add a 'body' by enabling
        // (As a second argument, we can specify the
        //  physics system to use too. However, since we
        //  started the Arcade system already, it will
        //  default to that.)
        game.physics.enable(player);

        // Set the amount of bounce on the physics body of the 'player' sprite
        player.body.bounce.y = 0.1;

        // Set the amount of gravity to apply to the physics body of the 'player' sprite
        player.body.gravity.y = 96;

        // Tell the game's camera to follow the 'player' sprite
        game.camera.follow(player);

        // Have the game create cursor keys (usually arrow keys)
        //  and save the reference to 'cursors'
        cursors = game.input.keyboard.createCursorKeys();

        // Add a specifically named key to the input checked for.
        //  In this case, it is the Keyboard.SPACEBAR
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    }

    function update() {

        // Using the physics.arcade system, check if 'player' is colliding
        //  with any tiles within 'layer'. If so, seperate them.
        game.physics.arcade.collide(player, layer);

        // Reset the x (horizontal) velocity
        player.body.velocity.x = 0;

        // Check if the left arrow key is being pressed
        if (cursors.left.isDown) {
            // Set the 'player' sprite's x velocity to a negative number:
            //  have it move left on the screen.
            player.body.velocity.x = -hozMove;

            // Check if 'facing' is not "left"
            if (facing !== "left") {
                // Set 'facing' to "left"
                facing = "left";
            }
        }
        // Check if the right arrow key is being pressed
        else if (cursors.right.isDown) {
            // Set the 'player' sprite's x velocity to a positive number:
            //  have it move right on the screen.
            player.body.velocity.x = hozMove;

            // Check if 'facing' is not "right"
            if (facing !== "right") {
                // Set 'facing' to "right"
                facing = "right";
            }
        }

        // Check if the jumpButton (SPACEBAR) is down AND
        //  if the 'player' physics body is onFloor (touching a tile) AND
        //  if the current game.time is greater than the value of 'jumpTimer'
        //  (Here, we need to make sure the player cannot jump while alreay in the air
        //   AND that jumping takes place while the sprite is colliding with
        //   a tile in order to jump off it.)
        if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
            // Set the 'player' sprite's y velocity to a negative number
            //  (vertMove is -90) and thus have it move up on the screen.
            player.body.velocity.y = vertMove;
            // Add 650 and the current time together and set that value to 'jumpTimer'
            // (The 'jumpTimer' is how long in milliseconds between jumps.
            //   Here, that is 650 ms.)
            jumpTimer = game.time.now + 650;
        }

        // Check if 'facing' is "left"
        if (facing === "left") {
            // Set the 'player' to the second (1) frame
            //  ('facing' is "left")
            player.frame = 1;
        } else {
            // Set the 'player' to the first (0) frame
            //  ('facing' is "right").
            player.frame = 0;
        }

    }
}());