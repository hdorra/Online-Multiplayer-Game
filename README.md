# Online Multiplayer Game </br>

This is a an example of a online, multiplayer, game leveraging Socket.io, and the Phaser framework. The intent is to illustrate how to connect multiple players online in an arcade-like experience. Users can connect and disconnect and there is no limit to the number of players. </br>

**What is Socket.IO?** </br>
</br>
    From https://socket.io/ </br>
   	--> "Socket.IO is a library that enables low-latency, bidirectional and event-based communication between a client and a server. It is built on top of the WebSocket protocol and provides additional guarantees like fallback to HTTP long-polling or automatic reconnection." </br>
    The WebSocket protocol (on which this library is built) essentially establishes a continuous communication connection (bidirectional or “full-duplex”) between two devices (client and server) over the web. This makes it ideal for gaming when multiplayer updates around location, points, and movements are needed. This protocol is preferred over HTTP at the transport layer due to efficiencies around leveraging existing filtering, indexes, and ports.  (rfc-editor, 2022)</br>
	
**What is Phaser?** </br>
</br>
    From https://phaser.io/ </br>
        --> "A fast, free and fun open source framework for Canvas and WebGL powered browser games." </br>
</br>
**The game:** </br>
</br>***--> Overview:*** </br>
       Goal: The shuttle needs to save the astronaut and equipment without drifting into space. </br>
       About:  </br>
           - The game has 2 teams, each player is assigned to a team once they connect to the browser. </br>
           - They will be randomly assigned to one of two teams.  </br>
           - As more players connect, each player will only be able to see their shuttle and the team scores. </br>
           - Every other player will look like a meteor to each player (even if they are on the same team).  </br>
           - Players will be able to see the meteors move as each player moves in their respective browsers but cannot tell which meteor is on their team. So, they       will need to try to save the astronaut and equipment regardless of which object is moving to collect them on the canvas.   </br>
            - Example: </br>
              a. The player is the shuttle. There is currently an astronaut and satellite that need to be “saved”: </br>       
                 ![image](https://user-images.githubusercontent.com/13279722/208960995-3e41e2b6-5c53-4de7-ae77-23e57fa1d1b4.png) </br>
              b. When multiple browsers are open (3 are shown for reference – each color represents a player and how they look on each respective screen): </br>
                 ![image](https://user-images.githubusercontent.com/13279722/208961147-7c583964-06cf-4c57-a344-ed1f5f77d384.png) </br>
   ***--> Design Limitations:*** </br>   
   *The intent of this project is to illustrate connectivity for multiple players online. Note the following limitations or areas for potential improvements:* 
           - Animation is limited, utilizing Phaser’s built-in keyboard manager to map arrows on the keyboard to the movement of objects. Touch-screen, more natural movements, animation, etc. would have enhanced the game experience. </br>
           - Score Persistence: Scores are not stored (no database backend). </br>
           - Browser Refresh: Since a player is identified based on their socket connection, when they refresh their browser, their shuttle ends up on different x, y coordinates (while other players remain in their original respective locations). </br>
           - Team Assignment: Assignment is random so you can have numerous players join but they may be on the same team.  </br>
   </br>***--> Demo (On Local Host Port):*** 
   
   https://user-images.githubusercontent.com/13279722/208972889-fd33d5df-ee28-483d-bff8-090181982445.mp4



