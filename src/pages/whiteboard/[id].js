import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectName } from "../../slices/userSlice";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { Button, Input, Container, Box, Flex, Icon } from "@chakra-ui/react";
import { DownloadIcon, CloseIcon } from "@chakra-ui/icons";

let socket;

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const nameCanvasRef = useRef(null);
  const name = useSelector(selectName);
  const router = useRouter();
  const [color, setColor] = useState("black");
  const { id: room } = router.query;
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 }); // New state for cursor position

  useEffect(() => {
    const canvas = canvasRef.current;
    const nameCanvas = nameCanvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    nameCanvas.width = window.innerWidth;
    nameCanvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (!name) {
      router.push("/JoinSession");
    }
  }, []);

  useEffect(() => {
    if (room) {
      socket = io("https://flask-socketio-service-xok7vv6ada-uc.a.run.app/");
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

      // Maintain a record of all users and their cursor positions
      const users = {};

      socket.on("cursorMove", ({ name, x, y }) => {
        // Update the cursor position of the user who moved their cursor
        users[name] = { x, y };

        // Clear the name canvas
        const nameCanvas = nameCanvasRef.current;
        const ctx = nameCanvas.getContext("2d");
        ctx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);

        // Redraw the name of each user at their cursor position
        for (const [name, { x, y }] of Object.entries(users)) {
          drawName(name, x, y);
        }
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
  // Update the drawName function to use the name canvas
  const drawName = (x, y) => {
    const nameCanvas = nameCanvasRef.current;
    const ctx = nameCanvas.getContext("2d");

    // Clear the previous name from the name canvas
    ctx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);

    // Draw the new name at the current cursor position
    ctx.font = "16px Arial";
    ctx.fillText(name, x, y - 10);
  };

  const handleMouseMove = (e) => {
    let newX = e.clientX - e.target.offsetLeft;
    let newY = e.clientY - e.target.offsetTop;

    // Draw the user's name at the current cursor position
    drawName(newX, newY);

    // Emit a socket event with the user's name and cursor position
    socket.emit("cursorMove", { name, x: newX, y: newY });

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
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={handleMouseMove}
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
