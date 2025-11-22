const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- Socket.IO connection ---
const socket = io(window.location.origin, {
    transports: ["websocket", "polling"]
});

socket.on("connect", () => console.log("✅ Connected:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Connection failed:", err));

// --- Drawing tools ---
let tool = 'pen';
function setTool(t) { tool = t; }

let drawing = false;
let startX, startY;

canvas.addEventListener('mousedown', e => {
    drawing = true;
    startX = e.clientX; startY = e.clientY;
});
canvas.addEventListener('mouseup', e => {
    if (!drawing) return;
    drawing = false;
    const endX = e.clientX, endY = e.clientY;
    let data;

    if (tool === 'line') {
        data = { tool, startX, startY, endX, endY };
        drawLine(data);
    } else if (tool === 'rect') {
        data = { tool, startX, startY, endX, endY };
        drawRect(data);
    } else if (tool === 'text') {
        const text = prompt("Enter text:");
        data = { tool, x: startX, y: startY, text };
        drawText(data);
    }
    if (data) socket.emit('draw', data);
});
canvas.addEventListener('mousemove', e => {
    if (!drawing || tool !== 'pen') return;
    const data = { tool, lastX: startX, lastY: startY, x: e.clientX, y: e.clientY };
    drawPen(data);
    socket.emit('draw', data);
    startX = data.x; startY = data.y;
});

// --- Render functions ---
function drawPen(d) {
    ctx.beginPath();
    ctx.moveTo(d.lastX, d.lastY);
    ctx.lineTo(d.x, d.y);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
    ctx.stroke();
}
function drawLine(d) {
    ctx.beginPath();
    ctx.moveTo(d.startX, d.startY);
    ctx.lineTo(d.endX, d.endY);
    ctx.strokeStyle = 'blue'; ctx.lineWidth = 2;
    ctx.stroke();
}
function drawRect(d) {
    const w = d.endX - d.startX, h = d.endY - d.startY;
    ctx.strokeStyle = 'red'; ctx.lineWidth = 2;
    ctx.strokeRect(d.startX, d.startY, w, h);
}
function drawText(d) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "green";
    ctx.fillText(d.text, d.x, d.y);
}

// --- Listen for remote events ---
socket.on('draw', data => {
    if (data.tool === 'pen') drawPen(data);
    else if (data.tool === 'line') drawLine(data);
    else if (data.tool === 'rect') drawRect(data);
    else if (data.tool === 'text') drawText(data);
});

// --- Sync state for new users ---
socket.on('sync_state', state => {
    state.forEach(d => {
        if (d.tool === 'pen') drawPen(d);
        else if (d.tool === 'line') drawLine(d);
        else if (d.tool === 'rect') drawRect(d);
        else if (d.tool === 'text') drawText(d);
    });
});