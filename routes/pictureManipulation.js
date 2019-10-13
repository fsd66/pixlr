const express = require('express');

const pictureLogic = require('../logic/picture-logic.js');
const WsMessage = require('../util/wsMessage.js');

const router = express.Router();

const pictureRouter = (wss) => {
    router.get('/', (req, res) => {
        pictureLogic.getCurrentPictureFromDatabase()
            .then((picture) => {
                res.json({ picture });
            });
    });

    router.get('/colors', (req, res) => {
        pictureLogic.getSelectableColors()
            .then((colors) => {
                res.json({ colors });
            });
    });

    router.get('/picture-scale', (req, res) => {
        const scale = getScale();
        res.json({ scale });
    });

    router.ws('/ws', (ws, req) => {
        ws.on('message', msg => {
            try {
                const message = JSON.parse(msg);

                const command = wsCommandMap[message.type];

                if (command) {
                    command(message, ws, req, wss);
                } else {
                    const error = new WsMessage('error', { reason: 'Invalid command' });
                    ws.send(JSON.stringify(error));
                }
            } catch (error) {
                console.error(error);
            }
        });
    });

    return router;
}

const wsCommandMap = {
    getColorPalette: async (msg, ws, req, wss) => {
        const colors = await pictureLogic.getSelectableColors();

        const paletteData = new WsMessage('paletteData', { colors });
        ws.send(JSON.stringify(paletteData));
    },
    getCanvasData: async (msg, ws, req, wss) => {
        const picture = await pictureLogic.getCurrentPictureFromDatabase();
        const pixels = await pictureLogic.getCurrentPixelsFromDatabase();

        const canvasData = new WsMessage('canvasData', { picture, pixels });

        ws.send(JSON.stringify(canvasData));
    },
    setPixelColor: async (msg, ws, req, wss) => {
        const msgData = msg.data;
        const color = await pictureLogic.getMappedColor(msgData.color);
        const user = 'todo';
        await pictureLogic.setPixel(msgData.x, msgData.y, color, user);

        const confirmation = new WsMessage('confirm', 'success');
        await ws.send(JSON.stringify(confirmation));

        const update = new WsMessage('updatePixel', {
            pixel: {
                x: msgData.x,
                y: msgData.y,
                r: color.r,
                g: color.g,
                b: color.b,
                a: color.a
            }
        });

        broadcastMessage(JSON.stringify(update), wss);
    }
}

const broadcastMessage = (msg, wss) => {
    wss.clients.forEach((client) => {
        client.send(msg);
    });
}

const getScale = () => {
    return process.env.PICTURE_SCALE;
}

module.exports = pictureRouter;
