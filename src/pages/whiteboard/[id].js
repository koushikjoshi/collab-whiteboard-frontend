import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectName } from "../../slices/userSlice";
import { useRouter } from "next/router";
import io from "socket.io-client";
import {
  Button,
  Input,
  Container,
  Box,
  Flex,
  Icon,
  Toast,
} from "@chakra-ui/react";
import { DownloadIcon, CloseIcon } from "@chakra-ui/icons";

let socket;

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const nameCanvasRef = useRef(null);
  const name = useSelector(selectName);
  const currentUser = useSelector(selectName);
  const router = useRouter();
  const [color, setColor] = useState("black");
  const room = router.asPath.split("/")[2];
  const [isCursorImgLoaded, setIsCursorImgLoaded] = useState(false);
  // Maintain a record of all users and their cursor positions
  const usersRef = useRef({}); // to persist the users object
  const cursorImg = useRef();

  useEffect(() => {
    cursorImg.current = new Image();
    cursorImg.onload = () => setIsCursorImgLoaded(true);
    cursorImg.src =
      "data:image/png;base64,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";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const nameCanvas = nameCanvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    nameCanvas.width = window.innerWidth;
    nameCanvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const room = router.asPath.split("/")[2]; // Extract room id from URL path
      if (!name) {
        router.push(`/JoinSession?session=${room}`);
      }
    }
  }, [name, router.asPath, router.isReady]); // Add router.isReady as a dependency

  useEffect(() => {
    if (room) {
      socket = io("https://flask-socketio-service-xok7vv6ada-uc.a.run.app/");
      // socket = io("http://127.0.0.1:5000");
      socket.emit("join", { user: name, room });

      socket.on("drawing", (data) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        data.points.forEach((point) => {
          ctx.strokeStyle = data.color; // Use the received color
          ctx.beginPath();
          ctx.moveTo(point.x0, point.y0);
          ctx.lineTo(point.x1, point.y1);
          ctx.stroke();
        });
      });

      socket.on("cursorMove", ({ name, x, y }) => {
        drawName(name, x, y);
      });

      socket.on("clear", () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      return () => {
        socket.emit("leave", { user: name, room });
        socket.off();
      };
    }
  }, [room, name]);

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  const startDrawing = (e) => {
    drawing = true;
    [lastX, lastY] = [
      e.clientX - e.target.offsetLeft,
      e.clientY - e.target.offsetTop,
    ];
  };

  let points = [];

  const draw = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    let newX = e.clientX - e.target.offsetLeft;
    let newY = e.clientY - e.target.offsetTop;
    ctx.lineTo(newX, newY);
    ctx.stroke();

    points.push({
      x0: lastX,
      y0: lastY,
      x1: newX,
      y1: newY,
    });

    [lastX, lastY] = [newX, newY];
  };

  const stopDrawing = () => {
    drawing = false;
    if (points.length > 0) {
      socket.emit("draw", { points, color, room }); // Include the color
      points = [];
    }
  };

  const clearScreen = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear", { room });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const imgURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgURL;
    link.download = "whiteboard.png";
    link.click();
  };

  // Update the drawName function to use the name canvas
  const drawName = (name, x, y) => {
    const nameCanvas = nameCanvasRef.current;
    const ctx = nameCanvas.getContext("2d");

    // Clear the previous position of the current user's name
    if (usersRef.current[name]) {
      const { x: oldX, y: oldY } = usersRef.current[name];
      ctx.clearRect(oldX - 20, oldY - 40, ctx.measureText(name).width + 20, 50);
    }

    // Draw the new name at the current cursor position
    // Draw the new name at the current cursor position
    ctx.font = "14px Arial";
    ctx.fillText(name, x, y - 10);

    ctx.font = "20px Arial";
    ctx.fillText("️•", x - 7, y + 5);

    // Draw the cursor image below the name
    if (isCursorImgLoaded) {
      ctx.drawImage(cursorImg.current, x, y, 20, 20); // Adjust the size and position as needed
    }

    // Update the cursor position of the current user
    usersRef.current[name] = { x, y };
  };

  const handleMouseMove = (e) => {
    let newX = e.clientX - e.target.offsetLeft;
    let newY = e.clientY - e.target.offsetTop;

    // Draw the user's name at the current cursor position
    drawName(name, newX, newY);

    // Update the cursor position of the current user
    usersRef.current[name] = { x: newX, y: newY };

    // Emit a socket event with the user's name, cursor position, and room
    socket.emit("cursorMove", { name, x: newX, y: newY, room });

    draw(e);
  };

  return (
    <Container
      maxW="container.xl"
      centerContent
      height={"100vh"}
      className="bg-red-200"
    >
      <Box
        w="100%"
        h="80vh"
        bg="white"
        boxShadow="xl"
        p={6}
        rounded="md"
        overflow="hidden"
        className="border-b-[1px] border-solid border-black"
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <div style={{ position: "relative" }}>
            <canvas
              ref={nameCanvasRef}
              style={{ position: "absolute", zIndex: 1 }}
            ></canvas>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onTouchStart={startDrawing}
              onMouseUp={stopDrawing}
              onTouchEnd={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchCancel={stopDrawing}
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
              style={{ position: "absolute", zIndex: 2 }}
            ></canvas>
          </div>
        </div>
      </Box>
      <Flex
        mt={4}
        justify="space-between"
        w="100%"
        className="px-10 bg-red-200"
      >
        <Button
          leftIcon={<DownloadIcon />}
          colorScheme="blue"
          onClick={handleExport}
          className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-black border border-solid border-black"
        >
          Export as Image
        </Button>
        <Button
          leftIcon={<CloseIcon />}
          colorScheme="red"
          onClick={clearScreen}
          className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-black border border-solid border-black"
        >
          Clear Screen
        </Button>
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </Flex>
    </Container>
  );
}
