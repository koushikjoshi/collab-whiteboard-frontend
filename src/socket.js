import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000"); // Replace with your Flask server address

export default socket;