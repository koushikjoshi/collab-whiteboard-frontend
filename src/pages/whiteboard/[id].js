import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectName } from '../../slices/userSlice';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

let socket;

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const name = useSelector(selectName);
  const router = useRouter();
    const [color, setColor] = useState('black');
  const { id: room } = router.query;

  useEffect(() => {
  if (room) {
    socket = io('https://flask-socketio-service-xok7vv6ada-uc.a.run.app/');
    socket.emit('join', { user: name, room });

    socket.on('drawing', (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    data.points.forEach(point => {
        ctx.strokeStyle = data.color;  // Use the received color
        ctx.beginPath();
        ctx.moveTo(point.x0, point.y0);
        ctx.lineTo(point.x1, point.y1);
        ctx.stroke();
    });
});




    return () => {
      socket.emit('leave', { user: name, room });
      socket.off();
    };
  }
}, [room, name]);

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  const startDrawing = (e) => {
    drawing = true;
    [lastX, lastY] = [e.clientX, e.clientY];
  };

  let points = [];

const draw = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();

    points.push({
      x0: lastX,
      y0: lastY,
      x1: e.clientX,
      y1: e.clientY
    });

    [lastX, lastY] = [e.clientX, e.clientY];
};

const stopDrawing = () => {
    drawing = false;
    if (points.length > 0) {
        socket.emit('draw', { points, color, room });  // Include the color
        points = [];
    }
};




  const handleExport = () => {
  const canvas = canvasRef.current;
  const imgURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = imgURL;
  link.download = 'whiteboard.png';
  link.click();
};


  return (
    <div className='text-black bg-white'>
      <canvas 
        ref={canvasRef}
        width={800} 
        height={600} 
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
      ></canvas>
      <button onClick={handleExport}>Export as Image</button>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

    </div>
  );
}

