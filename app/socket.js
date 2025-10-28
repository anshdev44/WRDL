import { io } from "socket.io-client";

// The URL of your server
const URL = "http://localhost:4000";

// Create the socket instance
const socket = io(URL, {
  autoConnect: false // Optional: prevent auto-connection
});

// Export the single socket instance
export default socket;