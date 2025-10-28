import { createServer } from "http";
import { Server } from "socket.io";

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
    socket.on("leave-room",(roomID,username)=>{
        console.log(`❌ ${username} left room: ${roomID} with socket ID: ${socket.id}`);
        socket.leave(roomID);
    })

})

