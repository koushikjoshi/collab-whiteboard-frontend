import { io } from "socket.io-client";

const socket = io("https://flask-socketio-service-xok7vv6ada-uc.a.run.app/"); // Replace with your Flask server address

export default socket;