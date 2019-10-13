class Color {
    constructor(red = 0, green = 0, blue = 0, alpha = 255) {
        this.r = red;
        this.g = green;
        this.b = blue;
        this.a = alpha;
    }

    get asArray() {
        return [this.r, this.g, this.b, this.a];
    }

    get asColorModelObject() {
        return { r: this.r, g: this.g, b: this.b };
    }

    get toString() {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    static createFromArray(colorArray) {
        return new Color(colorArray[0], colorArray[1], colorArray[2], colorArray[3]);
    }
}

module.exports = Color;
