import { createServer } from "http";
import { Server } from "socket.io";


const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

httpServer.listen(4000, () => {
    console.log("✅ Server is listening on port 4000");
});

const roomChats = new Map();
const MAX_HISTORY = 50;
const wordList = [
  "apple", "beach", "brain", "bread", "brush", 
  "chair", "chest", "chord", "click", "clock", 
  "cloud", "dance", "diary", "drink", "drive", 
  "earth", "feast", "field", "fruit", "glass", 
  "grape", "green", "ghost", "guide", "heart", 
  "house", "human", "juice", "light", "lemon", 
  "melon", "money", "music", "night", "ocean", 
  "party", "piano", "pilot", "plane", "plant", 
  "plate", "phone", "power", "quiet", "radio", 
  "river", "robot", "scene", "scope", "score", 
  "shape", "share", "shirt", "shoe", "smile", 
  "snake", "space", "spoon", "star", "stone", 
  "storm", "sugar", "table", "taste", "tiger", 
  "toast", "touch", "tower", "track", "trade", 
  "train", "truck", "uncle", "unity", "value", 
  "video", "virus", "voice", "waste", "watch", 
  "water", "whale", "white", "woman", "world", 
  "write", "youth", "zebra"
];
const roomWord=new Map();
const guessedLetters=new Map();
const roomstarted=new Map();
const roomTimers=new Map();
const roomTimerIntervals=new Map();

const chooserandomeword=()=>{
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
}

io.on("connection", (socket) => {
    console.log("✅ A user just connected", socket.id);

    //leave room if socket automatically disconnects form the server
    socket.on("disconnect", () => {
        console.log("❌ A user just disconnected", socket.id);
        const socketinroom = socket.rooms;
        if (socketinroom.size > 0) {
            const room = socket.rooms[0];
            // socket.leave(room);

            console.log(
                "✅",
                email,
                "left the room with id" + room,
                "upon disconnection"
            );
        }
    });
    socket.on("join-room", async (roomID, username, email) => {
        // console.log(
        //     `✅${username} is trying to join room with id ${roomID} and his email is ${email}`
        // );
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                roomId: roomID,
                email: email,
                username: username,
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const res = await fetch(
                "http://localhost:3000/api/room/join",
                requestOptions
            );
            if (res.status === 200) {
                socket.join(roomID);
                io.to(roomID).emit("user_joined", {
                    user: username,
                    message: "has joined the room",
                });
                socket.emit("joined-room", (roomID, username, email));
            } else {
                socket
                    .to(roomID)
                    .emit(username, "was unable to connect to the room");
                // console.log(
                //     username,
                //     "tried to connect with room id",
                //     roomID,
                //     "but was unable to connect"
                // );
            }
        } catch (err) {}
    });
    socket.on("leave-room", async (roomID, email) => {
        console.log(
            `❌ ${email} left room: ${roomID} with socket ID: ${socket.id}`
        );

        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                roomId: roomID,
                email: email,
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const res = await fetch(
                "http://localhost:3000/api/room/leave",
                requestOptions
            );
            const data = await res.json();

            if (res.status === 200) {
                socket.leave(roomID);
                io.to(roomID).emit("player-left", {
                    email,
                    message: data.message,
                });

                if (
                    data.message &&
                    data.message.includes("empty room was deleted")
                ) {
                    //room deleted as it was empty
                    io.in(roomID).emit("room-deleted", { reason: "empty" });
                    io.in(roomID).socketsLeave(roomID);
                    const obj=roomChats.get(roomID);
                    if(obj){
                      roomChats.delete(roomID);
                    }
                }
            } else if (res.status === 201) {
                //host left and room deleted
                io.to(roomID).emit("room-deleted", { reason: "host-left" });
                io.in(roomID).socketsLeave(roomID);
                const obj=roomChats.get(roomID);
                if(obj){
                    roomChats.delete(roomID);
                }
            } else {
                socket.emit("error-leaving-room", {
                    error: data.error || "Some Error occured at our side",
                    roomID,
                    email,
                });
            }
        } catch (error) {
            console.error("Error processing leave-room:", error);
            socket.emit("error-leaving-room", {
                error: "Server error processing leave request",
                roomID,
                email,
            });
        }
    });

    socket.on("create-room", (roomID, username) => {
        socket.join(roomID);
        console.log(
            `✅ ${username} create room: ${roomID} with socket ID: ${socket.id}`
        );
        // socket.to(roomID).emit(username, "has joined the room");
    })

    socket.on("BUZZED", (payload) => {
       
        const roomID = payload && typeof payload === "object" ? payload.roomID : payload;
        const username = payload && typeof payload === "object" ? payload.username : undefined;
        const email = payload && typeof payload === "object" ? payload.email : undefined;

        // console.log("BUZZED event received from", socket.id, "payload:", payload);

        if (roomID) {
           
            console.log("Emitting BUZZES to room:", roomID, { id: socket.id, username, email });
            io.to(roomID).emit("BUZZES", { id: socket.id, username, email });
        } else {
         
            io.emit("BUZZED", { from: socket.id, username, email });
        }
    });

    socket.on("start-game",(roomid)=>{
       if(!roomid){
        console.error("start-game event missing roomID");
        io.emit("error-starting-game",{ error: "Missing roomID"});
        return;
       }
       roomstarted.set(roomid,true);
       console.log("roomtarted map is updated",roomstarted);
       io.to(roomid).emit("game-started",{message:"Game is starting"})
       console.log("Game started in room:",roomid)
    })

    socket.on("send-message",(data)=>{
        const message=data.message
        const roomID=data.roomID;
        const username=data.username;
        console.log("Received message to send:", message, roomID, username);
        if(!roomID || !message || !username){
            socket.emit("error-sending-message",{error:"Missing data to send message"});
            return;
        }

        if(!roomChats.has(roomID)){
            roomChats.set(roomID,[{from:username,msg:message}]);
        }

        const obj=roomChats.get(roomID);
        obj.push({from:username,msg:message});
        if(obj.length > MAX_HISTORY){
            obj.shift(); 
        }
        roomChats.set(roomID,obj);
        // console.log("updated message for room:",roomID,roomChats.get(roomID));
        

        console.log("✅", roomChats);
      
        try {
            const plain = Object.fromEntries(roomChats);
          
            io.to(roomID).emit("send-message-map", plain);
        } catch (err) {
            console.error("Error serializing roomChats:", err);
        }

       
        io.to(roomID).emit("receive-message", roomChats.get(roomID) || []);

    });

    socket.on("send-messages-backend", (roomid)=>{
        try {
            const plain = Object.fromEntries(roomChats);
          
            io.to(roomid).emit("send-message-map", plain);
        } catch (err) {
            console.error("Error serializing roomChats:", err);
        }
        io.to(roomid).emit("receive-message", roomChats.get(roomid));
        
    });
    socket.on("send-word",(roomid)=>{
        const word=chooserandomeword();
        io.to(roomid).emit("receive-word",word);
        roomWord.set(roomid,word);
        guessedLetters.set(roomid,[]);
        console.log("roomword map is updated",roomWord);
        console.log("guessed letters map is updated",{guessedLetters,roomWord});
        console.log("Sent word",word,"to room",roomid);
    })

    socket.on("start-timer",(roomid)=>{
        // Clear any existing timer for this room
        if(roomTimerIntervals.has(roomid)){
            clearInterval(roomTimerIntervals.get(roomid));
            roomTimerIntervals.delete(roomid);
        }
        
       
        let minutes = 2;
        let seconds = 0;
        let obj=[{
            minutes: minutes,
            seconds: seconds
        }]
        roomTimers.set(roomid,obj);
        io.to(roomid).emit("timer-started",obj);
        
      
        startTimer(roomid, minutes, seconds);
    })

    socket.on("is-game-started",(roomid)=>{
        console.log("is-game-started event received for room:",roomid);
        const started=roomstarted.get(roomid);
        // console.log("is-game-started checked for room:",roomid,"->",started);
       if(started){
        socket.emit("game-has-started");
       }
    });

    socket.on("correct-guess",(data)=>{
        const roomid=data.roomID;
        const username=data.username;

        io.to(roomid).emit("player-guessed-correctly", {username, roomid});
        console.log("Player",username,"guessed correctly in room:",roomid);
    })

    socket.on("stop-timer",(roomid)=>{
        if(roomTimerIntervals.has(roomid)){
            clearInterval(roomTimerIntervals.get(roomid));
            roomTimerIntervals.delete(roomid);
            console.log(`Timer stopped for room: ${roomid}`);
        }
        io.to(roomid).emit("stopped-timer",(roomid));
    })

 
})

const startTimer=(roomid,minutes,seconds)=>{
    // Clear any existing timer for this room
    if(roomTimerIntervals.has(roomid)){
        clearInterval(roomTimerIntervals.get(roomid));
    }
    
    const timerInterval=setInterval(()=>{
        if (!roomTimerIntervals.has(roomid)) {
            return;
        }
        if(seconds === 0){
            if(minutes === 0){
                clearInterval(timerInterval);
                roomTimerIntervals.delete(roomid);
                console.log(`Timer finished for room: ${roomid}`);
                return;
            }
            minutes--;
            seconds = 59;
        }
        else{
            seconds--;
        }
        let obj=[{
            minutes: minutes,
            seconds: seconds
        }]
        roomTimers.set(roomid,obj);
        // console.log(`Time left for roomid:${roomid}-> ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        io.to(roomid).emit("timer-update", minutes, seconds);
    },1000);
    // io.to(roomid).emit("timer-ended",(roomid=>{
    //     clearInterval(timerInterval);
    //     roomTimerIntervals.delete(roomid);
    //     roomstarted.delete(roomid);
    //     guessedLetters.delete(roomid);
    //     roomWord.delete(roomid);
    //     roomTimers.delete(roomid);
    //     console.log(`Timer ended for room: ${roomid}`);
    // }));
    // Store the interval so we can clear it if needed
    roomTimerIntervals.set(roomid, timerInterval);
}
