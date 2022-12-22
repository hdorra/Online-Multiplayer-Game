var express = require('express'); //To use the express module (web framework to help render static files).
var app = express(); //Create a new instance of express - assign it the variable "app" as the name.
var server = require('http').Server(app); //Supply the app to the HTTP server --> this then allows express to handle the HTTP requests.
var io = require('socket.io')(server); //The socket.io module and have it listen to our server object.
var players = {}; 

//Adding 2 new variables for the game - astronauts and scores.
//This astronaut and equipment variable will be used to store the position of the astronaut object. 
var astronaut = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50
};

var equipment = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50
};
//The score variable will be used to keep track of both team's score and is initialized at 0. 
var scores = {
    white: 0,
    blue: 0
};


app.use(express.static(__dirname + '/public')); //This updates the server to render static files using express.static built-in middleware function in express.

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html'); //This tells the server to serve the index.html file as the root page
});


io.on('connection', function (socket) { //This logic listens to connections and disconnections
    console.log('a user connected'); //This logs that a user has connected (for development purposes)

    //Below is where a new player is created and added to the player's object. When a player connects to a web socket, the information around the player
    //is stored and then used. The socket.id is used as a key for each player.
    //The coordinates and rotation of the player is stored and used to control where the shuttles are created on the client side. This will update all of the 
    //players in the games as they are changed.
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50, 
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id, 
        team: (Math.floor(Math.random() * 2) == 0) ? 'blue' : 'white' 
    };

    //Here - the players object is sent to emit an event to the client side socket.
    //socket.emit here will only emit the event to this particular socket (the new player that was connected and not to all of the players)
    //In currentPlayers event shown below that is being passed to the socket,the players object will be passed to the new player so that
    //it can populate all the other shuttles and objects on the screen for the game. 
    socket.emit('currentPlayers', players); 

    //To update all the other players of the new player, broadcast will be used and send info to all the other sockets - representing the players already
    //in the game. You can see here that the new player's data is also being passed so that it can be added to their game, such as location and team assignment.
    
    socket.broadcast.emit('newPlayer', players[socket.id]);
    
    //Two new events when a player connects to the game are emitted, astronautLocation, and scoreUpdate.
    //These events will send the player the astronaut and equipment current locations and the current team totals.


    socket.emit('astronautLocation', astronaut);
    socket.emit('equipmentLocation', equipment);
    socket.emit('scoreUpdate', scores);

    //Wen a player disconnects, they are removed from the players object and a message is emitted to all other players about user leaving.
    //so they can remove that player's sprite from the game. 
    socket.on('disconnect', function () {
        console.log('user disconnected');
        delete players[socket.id]; //This removes this player from our players object
        io.emit('remove', socket.id); //This emits a message to all players to remove this player   - THIS IS NOT UPDATING CORRECTLY??
    });

    //Player movement is updated here. When playerMovement event is received on the server, that socket.id's player's information 
    //emits a new event playerMoved to all other players, and in this event the updated player's information is passed.
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    //In the code below, it is listening for a new event in the astronautCollected that is triggered when a shuttle saves an astronaut or equipment.
    //When the event is received, the team's scores are updated and a new location needs to be generated for both the astronaut and equipment.
    socket.on('astronautCollected', function () {
        if (players[socket.id].team === 'blue') {
            scores.blue += 10;
        } else {
            scores.white += 10;
        }
        astronaut.x = Math.floor(Math.random() * 700) + 50;
        astronaut.y = Math.floor(Math.random() * 500) + 50;
        io.emit('astronautLocation', astronaut);
        io.emit('scoreUpdate', scores);
    });

    socket.on('equipmentCollected', function () {
        if (players[socket.id].team === 'blue') {
            scores.blue += 5;
        } else {
            scores.white += 5;
        }
        equipment.x = Math.floor(Math.random() * 700) + 50;
        equipment.y = Math.floor(Math.random() * 500) + 50;
        io.emit('equipmentLocation', equipment);
        io.emit('scoreUpdate', scores);
    });

});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});  //the server start is listening on port 8081 - here is where you can see the game (the 'client')