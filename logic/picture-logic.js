const StatusModel = require('../models/status.js');
const PictureModel = require('../models/picture.js');
const PixelModel = require('../models/pixel.js');
const ColorModel = require('../models/color.js');
const Color = require('../util/color.js');

let currentPictureId;

const createEmptyPicture = async (width, height) => {
    const now = new Date();

    const picture = {
        width,
        height,
        created: now
    };

    const savedPicture = await PictureModel.create(picture);

    const pixels = [];

    for (let i = 0; i < width * height; i++) {
        const x = i % width;
        const y = Math.floor(i / width);

        pixels.push({
            x,
            y,
            r: 0,
            g: 0,
            b: 0,
            user: 'None',
            modified: now,
            pictureId: savedPicture._id
        });
    }

    await PixelModel.create(pixels);

    return savedPicture;
}

const createNewCurrentPicture = async () => {
    const width = process.env.PICTURE_WIDTH | 32;
    const height = process.env.PICTURE_HEIGHT | 32;

    const picture = await createEmptyPicture(width, height);
    await setCurrentPictureId(picture._id);
    return picture;
}

const createDefaultSelectableColors = () => {
    return [
        new Color(255, 255, 255),
        new Color(127, 255, 255),
        new Color(255, 127, 255),
        new Color(255, 255, 127),
        new Color(255, 127, 127),
        new Color(127, 255, 127),
        new Color(127, 127, 255),
        new Color(127, 127, 127),
        new Color(0, 255, 255),
        new Color(255, 0, 255),
        new Color(255, 255, 0),
        new Color(255, 0, 0),
        new Color(0, 255, 0),
        new Color(0, 0, 255),
        new Color(0, 127, 127),
        new Color(127, 0, 127),
        new Color(127, 127, 0),
        new Color(127, 0, 0),
        new Color(0, 127, 0),
        new Color(0, 0, 127),
        new Color(0, 0, 0)
    ];
}

const getPicturesFromDatabase = async () => {
    const pictures = await PictureModel.find({}).sort({ created: 'desc' }).exec();

    if (pictures && pictures.length > 0) {
        return pictures;
    }

    const newPicture = await createNewCurrentPicture();
    return [newPicture];
}

const getCurrentPictureFromDatabase = async () => {
    return await PictureModel.findById(await getCurrentPictureId()).sort({ created: 'desc' }).exec();
}

const getPixelsFromDatabase = async (pictureId) => {
    return await PixelModel.find({ pictureId }).exec();
}

const getCurrentPixelsFromDatabase = async () => {
    const currentPictureId = await getCurrentPictureId();
    return await getPixelsFromDatabase(currentPictureId);
}

const getSelectableColors = async () => {
    const colors = await ColorModel.find({}).exec();

    if (colors && colors.length > 0) {
        return colors;
    }

    const defaultColors = createDefaultSelectableColors();
    const newDefaultColors = [];
    defaultColors.forEach((color, index) => {
        const c = { r: color.r, g: color.g, b: color.b, number: index};
        newDefaultColors.push(c);
    });

    await ColorModel.create(newDefaultColors);

    return newDefaultColors;


}

const getMappedColor = async (colorNumber) => {
    const colors = await ColorModel.findOne({ number: colorNumber }).select('r g b').exec();

    return new Color(colors.r, colors.g, colors.b);
}

const getCurrentPictureId = async () => {
    if (!currentPictureId) {
        const status = await StatusModel.findOne({}).select('currentPicture').exec();
        if (!status) {
            await createNewCurrentPicture();
            return currentPictureId;
        }

        currentPictureId = status.currentPicture;
    }

    return currentPictureId;
}

const setCurrentPictureId = async (pictureId) => {
    if (currentPictureId !== pictureId) {
        await StatusModel.findOneAndUpdate({}, { currentPicture: pictureId }, { upsert: true }).exec();
        currentPictureId = pictureId;
    }

    return currentPictureId;
}

const setPixel = async (x, y, color, user) => {
    const pictureId = await getCurrentPictureId();
    try {
        const pixel = await PixelModel.findOne({ x, y, pictureId }).exec();
        pixel.r = color.r;
        pixel.g = color.g;
        pixel.b = color.b;
        pixel.user = user;
        pixel.modified = new Date();

        await pixel.save();

        return pixel;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getPicturesFromDatabase,
    getCurrentPictureFromDatabase,
    getPixelsFromDatabase,
    getCurrentPixelsFromDatabase,
    getSelectableColors,
    getMappedColor,
    getCurrentPictureId,
    setCurrentPictureId,
    setPixel
}
