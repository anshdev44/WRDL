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
    socket.on("disconnect", (socket) => {
        console.log("❌ A user just disconnected", socket.id);
    })
    socket.on("join-room", (roomID, username) => {
        socket.join(roomID);
        console.log(`✅ ${username} joined room: ${roomID} with socket ID: ${socket.id}`);
        socket.to(roomID).emit(username, "has joined the room");
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
                // Regular player left, notify others
                socket.leave(roomID);
                io.to(roomID).emit("player-left", { email, message: data.message });

                if (data.message && data.message.includes("empty room was deleted")) {
                    // Room was deleted because it's empty
                    io.in(roomID).emit("room-deleted", { reason: "empty" });
                    io.in(roomID).socketsLeave(roomID);
                }
            } else if (res.status === 201) {
                // Host left, notify everyone and close room
                io.to(roomID).emit("room-deleted", { reason: "host-left" });
                io.in(roomID).socketsLeave(roomID);
            } else {
                // Error occurred
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

})
