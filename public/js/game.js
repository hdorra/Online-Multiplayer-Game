var config = { //The configuration for the game is presented here and will be passed into a new Phase game.
    type: Phaser.AUTO, //This is the renderer type that will be used for the game. In Phaser, there are usually two types - either Canvas or WebGL. While WebGL
    //provides better performance, using .AUTO will tell the game to use WebGL if it is available and if it is not, then just use Canvas.
    parent: 'phaser-finalproject', //This tell Phaser to render the game in an existing <canvas> element id exists but if it doesnt, it will create one.
    width: 1000, //the width of the viewable area of the game - this can be enlarged to cover the screen but for the purposes of this project, will keep it smaller.
    height: 800,  //the width of the viewable area of the game - this can be enlarged to cover the screen but for the purposes of this project, will keep it smaller.
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60, 
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: { //This embedds a scene object in the canvas and the functions that will be used are listed here. These correspond to the functions below.
        preload: preload,
        create: create,
        update: update
    }
  
};

var sprite; //defining the sprite here that will be used later on.
var cursors; //defining the cursors here that will be used later on - this will be used to move the sprite on the screen with the arrows on the keyboard.
var text; //defining the text here that will be used later on - this will be used to show the scores at the top of the screen.

var game = new Phaser.Game(config); //Here, we are passing our config (from above) to Phaser to create a new game instance.

function preload() { //This will load the images from assets here so they can be used for game.
    this.load.image('background', 'assets/background.jpg');
    this.load.image('shuttle', 'assets/shuttle.png');
    this.load.image('shuttle2', 'assets/shuttleTeam2.png');
    this.load.image('otherPlayer', 'assets/asteroid.png');
    this.load.image('astronaut', 'assets/astronaut2.png');
    this.load.image('equipment', 'assets/satellite2.png');
  
}


//Since the images we need ar eloaded, here is where we create our player in the game (the shuttle).
//In the server, the socket.io connection has been set up to emit the current players every time a new player connects to the game. 
//To help with other functions, an object that contains all of the current players will be passed in as well.
function create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(0.6); //Here we are adding the background - the space scene.
    var self = this;

    //Below we will include the library and tie it to the html, where we see the game.js file as being rendered.
    //we will use the concept of groups in Phaser, so will create 2 groups - the "other" players and the current player, so that the other players can be handled
    //in a simialr format and the player - the person that is playing - can also be handled with common functions, etc.
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    //Here we are using a socket.on to listen for the currentPlayer's even when it is triggered in the server. 
    this.socket.on('currentPlayers', function (players) { 

        //When the server passed the players object, we then use this function to loop through each player and use Object.keys() to create an array of all those keys. 
        Object.keys(players).forEach(function (id) { 
            //We use the forEach() method to loop through each key/item in the array and let us to something with it. In this case, we are adding them to the current scene and passing their current
            //information as well.
            //We then call the addOtherPlayers (which are treated as 1 group) to see that the player is not the current player.
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]); 
            } else {
                addOtherPlayers(self, players[id]); 
            }
        });
    });

    //Below is the socket function to listen for newPlayers and any disconnecting events (when the player closes his browser). When a new player event is triggered, thsi calls the addOtherPlayers function to 
    //add a new player.
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    //When a player disconnects (by closing the browser), the player's id and shuttle are removed from the game scene and other players are updated.
    //This is done by using the getChildren method in the other player's group where the forEach() method will loop through the array of IDs and destroy that object corresponding to the 
    //disconnected ID.
    this.socket.on('remove', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
                delete otherPlayer[playerId];
                
            }
        });
    });


    //Below are the functions that handle player input using Phaser's built-in keyboard manager.
    //The cursor's object that is defined will be populated based on the 4 arrow keys on the keyboard (it will see which is being held down and then update the function accordingly).
   
    this.cursors = this.input.keyboard.createCursorKeys();

    //Below we see the client side is listening for a new event to indicate that the player moved. When this is updated, then the player's shuttle
    //will need to be updated in the game. This is done for both the player and other players.
    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });


    //This displays the two team scores, and Phaser's text game object will be used. Any lable can be used but the labels that correspond to colors (to match the colors on the screen)
    //were used for simplicity. 
    this.whiteScoreText = this.add.text(20, 16, '', { fontSize: '32px', fill: '#FFFFFF' });
    this.blueScoreText = this.add.text(500, 16, '', {fontSize: '32px', fill: '#b3e5fc' });

  
    //When the scores are updated and the score update event is triggered as a result, then teh text is updated with the new point tally.
    this.socket.on('scoreUpdate', function (scores) {
        self.whiteScoreText.setText('Team Two Rocket: ' + scores.white);  
        self.blueScoreText.setText('Team One Rocket: ' + scores.blue);
    });

    //Here, we listen for the astronautLocation event, and when received do the following:
    this.socket.on('astronautLocation', function (astronautLocation) {
        
        if (self.astronaut) self.astronaut.destroy();  //check to see if the astronaut exists, and if it does, that object is destroyed.
        self.astronaut = self.physics.add.image(astronautLocation.x, astronautLocation.y, 'astronaut'); //A new start game astronaut object is added to the player's game 
                                                                                                      //using the information passed to the event to populate its location.
      
        self.physics.add.overlap(self.shuttle, self.astronaut, function () { //A check to see if player's shop and astronaut's coordinates are overlapping.
            this.socket.emit('astronautCollected'); //if they are overlapping, the astronautCollected event is emitted by calling physics.addoverlap,
            //A great built in feature of Phaser is that it will automatically check for the overlap and then run the provided function when there is overlap.
        }, null, self);
    });

      //The equipment rescue is similar to the astronaut point collection process by checking for overlap and destory or adding points.
    this.socket.on('equipmentLocation', function (equipmentLocation) {
        if (self.equipment) self.equipment.destroy();  
        self.equipment = self.physics.add.image(equipmentLocation.x, equipmentLocation.y, 'equipment'); 

        self.physics.add.overlap(self.shuttle, self.equipment, function () { 
            this.socket.emit('equipmentCollected'); 
        }, null, self);
    });

  
  
};


function addPlayer(self, playerInfo) {
    //This function adds the player to the game by using the x and y coordinates that the code in the server generated.
    //setOrigin sets the origin of the shuttle in the middle of the screen as opposed to some off point on thet side. setDisplay size changes the png size to
    //fit the screen better.
    //The shuttle design is also updated based on what color team they are on.
    //The self.physics in the code below allows the shuttle to use the setDrag, setAngularVelocity, and setMaxVelocity.

    if (playerInfo.team === 'white') {
        self.shuttle = self.physics.add.image(playerInfo.x, playerInfo.y, 'shuttle').setOrigin(0.5, 0.5).setDisplaySize(70, 70);
   } else {
        self.shuttle = self.physics.add.image(playerInfo.x, playerInfo.y, 'shuttle2').setOrigin(0.5, 0.5).setDisplaySize(70, 70);
   }

    //Both setDrag and setAngularDrag = control the amount of resistence shuttle will face when it is moving. 
    //setMaxVelocity is used to control the max speed the shuttle can reach.
    self.shuttle.setDrag(50);
    self.shuttle.setAngularDrag(50);
    self.shuttle.setMaxVelocity(200);

}

function update() {

    if (this.shuttle) {
        //3 new variables are used to store information about the player (i.e. shuttle)
        var x = this.shuttle.x;
        var y = this.shuttle.y;
        var r = this.shuttle.rotation;
      
        //Below will check to see if the shuttle's rotation has changed when comparing before and if it it has, then an event is omitted to update the location information.
        if (this.shuttle.oldPosition && (x !== this.shuttle.oldPosition.x || y !== this.shuttle.oldPosition.y || r !== this.shuttle.oldPosition.rotation)) {
            this.socket.emit('playerMovement', { x: this.shuttle.x, y: this.shuttle.y, rotation: this.shuttle.rotation });
        }

        //The player's current rotation and position is stored here.
        this.shuttle.oldPosition = {
            x: this.shuttle.x,
            y: this.shuttle.y,
            rotation: this.shuttle.rotation
        };

        //Below, it is checking if the left, right, or up keys are pressed down.
        //if left or right key is pressed - the player's angular velocity by calling setAngularVelocity() - a built in feature of Phaser library.
        //The angular velocity will allow the shuttle to rotate left and right.
        if (this.cursors.left.isDown) {
            this.shuttle.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
            this.shuttle.setAngularVelocity(150);
        } else {
            this.shuttle.setAngularVelocity(0); //if neither the left of right keys are pressed, angular veolcity is set back to 0.
        }

        //if up key is pressed, the shuttle's veolcity is updated, otherwise, it is set to 0.
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.shuttle.rotation + 1.5, 100, this.shuttle.body.acceleration);
        } else {
            this.shuttle.setAcceleration(0);
        }
     
    }


}

//Code is similar to the addPlayer() function but here, other player's game object is added to the otherPlayer's group.
function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(70, 70);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}


