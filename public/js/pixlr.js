const pixlrWsUrl = `ws://${window.location.host}/picture/ws`;
const imageScale = 20;
let selectedX;
let selectedY;

const ws = new WebSocket(pixlrWsUrl);

const pixlrActivateDisconnectDialog = () => {
    const modal = document.getElementById('pixlr-disconnect-modal');
    modal.classList.remove('display-none');
}

const pixlrConvertPixelDataToCss = (pixel) => {
    return `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, 255)`;
}

const pixlrConvertPixelDataArrayToCss = (pixel) => {
    return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`;
}

const drawPixel = (pixel) => {
    const canvas = document.getElementById('pixlr-canvas');
    const ctx = canvas.getContext('2d');

    const x = pixel.x
    const y = pixel.y

    ctx.fillStyle = pixlrConvertPixelDataToCss(pixel);
    ctx.fillRect(x, y, 1, 1);
}

const pixlrDrawCanvas = (pixels, width, height) => {
    const canvas = document.getElementById('pixlr-canvas');
    canvas.width = width * imageScale;
    canvas.height = height * imageScale;

    const ctx = canvas.getContext('2d');
    ctx.scale(imageScale, imageScale);

    pixels.forEach((pixel) => {
        const x = pixel.x
        const y = pixel.y

        ctx.fillStyle = pixlrConvertPixelDataToCss(pixel);
        ctx.fillRect(x, y, 1, 1);
    });
}

const pixlrUpdateCanvas = (data) => {
    pixlrDrawCanvas(data.pixels, data.picture.width, data.picture.height);
}

const pixlrUpdatePixel = (data) => {
    drawPixel(data.pixel);
}

const pixlrCreatePalette = (data) => {
    const paletteList = document.getElementById('pixlr-palette-list');
    paletteList.innerHTML = '';

    const ul = document.createElement('ul');
    ul.className = 'palette-list';

    data.colors.forEach((color) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const textDiv = document.createElement('div');
        const text = document.createTextNode(`${color.number}`);

        div.className = 'color-swatch';
        const rgba = pixlrConvertPixelDataToCss(color);
        div.style.background = rgba;
        div.addEventListener('mousedown', pixlrPaletteOnMouseDown, false);

        textDiv.className = 'display-none';

        textDiv.appendChild(text);
        div.appendChild(textDiv);
        li.appendChild(div);
        ul.appendChild(li);
    });

    paletteList.appendChild(ul);
}

const pixlrOnOpen = (event) => {
    ws.send(JSON.stringify({ type: 'getCanvasData' }));
    ws.send(JSON.stringify({ type: 'getColorPalette' }));
}

const pixlrOnMessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'updatePixel') {
        pixlrUpdatePixel(message.data);
    } else if (message.type === 'canvasData') {
        pixlrUpdateCanvas(message.data);
    } else if (message.type === 'paletteData') {
        pixlrCreatePalette(message.data)
    }
}

const pixlrCanvasOnMouseDown = (event) => {
    const x = event.offsetX;
    const y = event.offsetY;

    const canvas = document.getElementById('pixlr-canvas');
    const ctx = canvas.getContext('2d');

    const pixel = ctx.getImageData(x, y, 1, 1);
    const rgba = pixlrConvertPixelDataArrayToCss(pixel.data);

    const previewer = document.getElementById('pixlr-color-preview-box');
    previewer.style.background = rgba;

    selectedX = Math.floor(x / imageScale);
    selectedY = Math.floor(y / imageScale);

    const ui = document.getElementById('pixlr-ui');
    ui.classList.remove('display-none');

    const previewText = document.getElementById('pixlr-color-preview-text');
    previewText.textContent = `X: ${selectedX}, Y: ${selectedY}`;
}

const pixlrPaletteOnMouseDown = (event) => {
    const selectedSwatch = event.target;
    const number = selectedSwatch.firstElementChild.innerHTML;

    const previewer = document.getElementById('pixlr-color-preview-box');
    const swatchColor = selectedSwatch.style.background;
    const previewColor = previewer.style.background;

    if (swatchColor !== previewColor) {
        const data = {
            color: number,
            x: selectedX,
            y: selectedY
        }
        ws.send(JSON.stringify({ type: 'setPixelColor', data }));
    }
}

const connectToPixlrWs = () => {
    ws.onopen = event => pixlrOnOpen(event);
    ws.onmessage = event => pixlrOnMessage(event);
    ws.onerror = event => pixlrActivateDisconnectDialog();
}

const setUpPixlrUi = () => {
    const canvas = document.getElementById('pixlr-canvas');
    canvas.addEventListener('mousedown', pixlrCanvasOnMouseDown, false);
}

const pixlrStart = () => {
    connectToPixlrWs();
    setUpPixlrUi();
}

window.onload = () => {
    pixlrStart();
}
