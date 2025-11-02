import { createServer } from "http";
import { Server } from "socket.io";
// import leaveroombackend from "../app/action/room.js";


const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

httpServer.listen(4000, () => {
    console.log("✅ Server is listening on port 4000");
});

io.on("connection", (socket) => {
    console.log("✅ A user just connected", socket.id);

    //leave room if socket automatically disconnects form the server
    socket.on("disconnect", () => {
        console.log("❌ A user just disconnected", socket.id);
        const socketinroom = socket.rooms;
        if (socketinroom.size > 0) {
            const room = socket.rooms[0];
            // socket.leave(room);
            
            console.log("✅", email, "left the room with id" + room, "upon disconnection");
        }

    })
    socket.on("join-room", (roomID, username, email) => {
        console.log(`✅${username} is trying to join room with id ${roomID} and his email is ${email}`);
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                "roomId": roomID,
                "email": email,
                "username": username
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const res = fetch("http://localhost:3000/api/room/join", requestOptions)
            if (res.status === 200) {
                socket.join(roomID);
                io.to(roomID).emit("user_joined", {
                    user: username,
                    message: "has joined the room"
                });
                socket.emit("joined-room", (roomID, username, email));
            }
            else {
                socket.to(roomID).emit(username, "was unable to connect to the room");
                console.log(username, "tried to connect with room id", roomID, "but was unable to connect");
            }

        } catch (err) {
        }
    })
    socket.on("leave-room", async (roomID, email) => {
        console.log(`❌ ${email} left room: ${roomID} with socket ID: ${socket.id}`);

        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                roomId: roomID,
                email: email
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const res = await fetch("http://localhost:3000/api/room/leave", requestOptions);
            const data = await res.json();

            if (res.status === 200) {

                socket.leave(roomID);
                io.to(roomID).emit("player-left", { email, message: data.message });

                if (data.message && data.message.includes("empty room was deleted")) {

                    io.in(roomID).emit("room-deleted", { reason: "empty" });
                    io.in(roomID).socketsLeave(roomID);
                }
            } else if (res.status === 201) {

                io.to(roomID).emit("room-deleted", { reason: "host-left" });
                io.in(roomID).socketsLeave(roomID);
            } else {

                socket.emit("error-leaving-room", {
                    error: data.error || "Some Error occured at our side",
                    roomID,
                    email
                });
            }
        } catch (error) {
            console.error("Error processing leave-room:", error);
            socket.emit("error-leaving-room", {
                error: "Server error processing leave request",
                roomID,
                email
            });
        }
    })

    socket.on("create-room", (roomID, username) => {
        socket.join(roomID);
        console.log(`✅ ${username} create room: ${roomID} with socket ID: ${socket.id}`);
        // socket.to(roomID).emit(username, "has joined the room");
    })

})
