"use strict";

const { createCanvas } = require("canvas");

class Chart {
    /**
     * @param {Array<{x:Number, y:Number}>} data 
     * @param {Object} [configs]
     * @param {{left:Number, right:Number, up:Number, down:Number}} [configs.padding]
     * @param {{width:Number, height:Number}} [configs.size] pic size
     * @param {String} [configs.font] exp. "15px Georgia"
     * @param {{title:String, titleX:String, titleY:String, divideX:Number, divideY:Number}} [configs.label]
     * @param {Boolean} [configs.xDateMode] x-coordinate is date etc... divited evenly, data.x must be [1, 2, 3, ...]
     * @param {Array<String>} [configs.xDateLabel] when xDateMode = true, show xDateLabel at x-coordinate instead of x value, length must equal to data.length
     */
    constructor(data, configs = {}) {
        // source
        this.data = data;
        // padding
        this.padding = {};
        if (!configs.padding) configs.padding = {};
        this.padding.left = configs.padding.left || 50;
        this.padding.right = configs.padding.right || 50;
        this.padding.up = configs.padding.up || 50;
        this.padding.down = configs.padding.down || 50;
        // size
        this.size = {};
        if (!configs.size) configs.size = {};
        this.size.width = configs.size.width || 800;
        this.size.height = configs.size.height || 600;
        // font
        this.font = configs.font || "15px Georgia";
        // labels
        this.label = {};
        if (!configs.label) configs.label = {};
        this.label.title = configs.label.title || "";
        this.label.titleX = configs.label.titleX || "";
        this.label.titleY = configs.label.titleY || "";
        // how many segments are the coordinates divided into, it may be changed by getDataRange()
        this.label.divideX = configs.label.divideX || 10;
        this.label.divideY = configs.label.divideY || 10;
        // xDateMode
        this.xDateMode = configs.xDateMode || false;
        this.xDateLabel = configs.xDateLabel || null;
        // draw zone
        /*
        -123-in-pic----------------------------------------------------------------
        1         |                                                    |          |
        2         |                      up padding                    |          |
        3         |                        (title)                     |          |
        |---------^---------------------------------------------------------------|
        |         |                                                    |          |
        |   left  |                                                    |          |
        | (y-coor 3                       data zone                    |   right  |
        | dinate) 2                                                    |  padding |
        |         1                                                    |          |
        |---------+1-2-3-in-data--------------------------------------->----------|
        |         |                                                    |          |
        |         |                         down                       |          |
        |         |                    (x-coordinate)                  |          |
        ---------------------------------------------------------------------------
        */
        this.zone = {};
        // data zone
        this.zone.data = {};
        this.zone.data.width = this.size.width - this.padding.left - this.padding.right;
        this.zone.data.height = this.size.height - this.padding.up - this.padding.down;
        this.zone.data.originX = this.padding.left;
        this.zone.data.originY = this.size.height - this.padding.down;
        // left zone
        this.zone.left = {};
        this.zone.left.width = this.padding.left;
        this.zone.left.height = this.zone.data.height;
        // down zone
        this.zone.down = {};
        this.zone.down.width = this.zone.data.width;
        this.zone.down.height = this.padding.down;

        // dataRange
        this.dataRange = this.getDataRange();
        // Calculate how many pixels equal to 1 
        this.dataInterval = this.getDataInterval();

        // initCtx
        this.canvas = createCanvas(this.size.width, this.size.height);
        this.ctx = this.canvas.getContext('2d');
    }

    getSuitableRange(min, max, divideCount) {
        const interval = (max - min) / divideCount;
        const digit = Math.floor(Math.log10(interval)) + 1;
        const fixedInterval = Math.pow(10, digit);
        let fixedMin = (min >= 0) ? (min - (min % fixedInterval)) : (min - (min % fixedInterval) - fixedInterval);
        let fixedMax = (max > 0) ? (max - (max % fixedInterval) + fixedInterval) : (max - (max % fixedInterval));
        // Avoid accuracy problems
        const mul = Math.pow(10, -digit);
        if (Math.abs(fixedMin) < 1) fixedMin = Math.round((fixedMin + Number.EPSILON) * mul) / mul;
        if (Math.abs(fixedMax) < 1) fixedMax = Math.round((fixedMax + Number.EPSILON) * mul) / mul;
        const fixedDivideCount = Math.round((fixedMax - fixedMin) / fixedInterval);
        return { min: fixedMin, max: fixedMax, divideCount: fixedDivideCount };
    }

    getDataRange() {
        let xmin = this.data[0].x;
        let xmax = this.data[0].x;
        let ymin = this.data[0].y;
        let ymax = this.data[0].y;
        this.data.map((point) => {
            if (point.x > xmax) xmax = point.x;
            if (point.x < xmin) xmin = point.x;
            if (point.y > ymax) ymax = point.y;
            if (point.y < ymin) ymin = point.y;
        });
        const suitableX = (this.xDateMode) ? { min: xmin, max: xmax, divideCount: this.label.divideX } : this.getSuitableRange(xmin, xmax, this.label.divideX);
        this.label.divideX = suitableX.divideCount;
        const suitableY = this.getSuitableRange(ymin, ymax, this.label.divideY);
        this.label.divideY = suitableY.divideCount;
        return { xmin: suitableX.min, xmax: suitableX.max, ymin: suitableY.min, ymax: suitableY.max };
    }

    getDataInterval() {
        const widthInterval = this.zone.data.width / (this.dataRange.xmax - this.dataRange.xmin);
        const heightInterval = this.zone.data.height / (this.dataRange.ymax - this.dataRange.ymin);
        return { widthInterval, heightInterval };
    }

    data2Point() {
        // true point in pic
        return this.data.map((point) => {
            const x = Math.ceil(this.dataInterval.widthInterval * (point.x - this.dataRange.xmin) + this.padding.left);
            const y = Math.ceil(this.size.height - this.dataInterval.heightInterval * (point.y - this.dataRange.ymin) - this.padding.down);
            return { x, y };
        });
    }

    drawLines() {
        const drawPoints = this.data2Point();
        this.ctx.beginPath();
        this.ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
        drawPoints.map((point) => {
            this.ctx.lineTo(point.x, point.y);
            this.ctx.strokeStyle = "#000";
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.fillStyle = "gray";
            this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
        });
    }

    drawCoordinates() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.zone.data.originX, this.zone.data.originY);
        this.ctx.lineTo(this.zone.data.originX, this.padding.up);
        this.ctx.moveTo(this.zone.data.originX, this.zone.data.originY);
        this.ctx.lineTo(this.zone.data.originX + this.zone.data.width, this.zone.data.originY);
        this.ctx.stroke();
    }

    // accuary fix
    accAdd(arg1, arg2) {
        var r1, r2, m;
        try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
        try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
        m = Math.pow(10, Math.max(r1, r2));
        return (arg1 * m + arg2 * m) / m;
    }

    drawUp() {
        // title
        this.ctx.beginPath();
        this.ctx.font = this.font;
        this.ctx.strokeStyle = "#999";
        // min label at origin
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.label.title, Math.floor(this.size.width / 2), Math.floor(this.padding.up / 2));
        this.ctx.stroke();
    }

    drawLeft() {
        this.ctx.beginPath();
        this.ctx.font = this.font;
        this.ctx.strokeStyle = "#999";
        // min label at origin
        this.ctx.textAlign = "center";
        const intervalY = this.accAdd(this.dataRange.ymax, -this.dataRange.ymin) / this.label.divideY;
        const fontWidth = 5;
        let nowY = this.dataRange.ymin;
        for (let i = 0; i <= this.label.divideY; i++) {
            const y = Math.ceil(this.size.height - this.dataInterval.heightInterval * i * intervalY - this.padding.down);
            const text = nowY.toString();
            this.ctx.moveTo(this.zone.data.originX, y);
            this.ctx.lineTo(this.zone.data.originX + this.zone.data.width, y);
            this.ctx.textAlign = "right";
            this.ctx.fillText(text, this.zone.data.originX - fontWidth * text.length, y);
            nowY = this.accAdd(nowY, intervalY);
        }
        // titleY
        this.ctx.fillText(this.label.titleY, this.zone.data.originX, this.padding.up - 20);
        this.ctx.stroke();
    }

    drawBottom() {
        if (this.xDateMode && this.xDateLabel && this.xDateLabel.length >= this.data.length) {
            this.ctx.beginPath();
            this.ctx.font = this.font;
            this.ctx.strokeStyle = "#999";
            // min label at origin
            this.ctx.textAlign = "center";
            const intervalX = this.accAdd(this.dataRange.xmax, -this.dataRange.xmin) / this.label.divideX;
            const fontHeight = 20;
            let nowX = this.dataRange.xmin;
            for (let i = 0; i <= this.label.divideX; i++) {
                const x = Math.ceil(this.padding.left + this.dataInterval.widthInterval * i * intervalX);
                let labelIndex = (this.label.divideX <= 1) ? (this.xDateLabel.length - 1) * i : Math.floor(this.xDateLabel.length / this.label.divideX * i);
                if (labelIndex >= this.xDateLabel.length) labelIndex = this.xDateLabel.length - 1;
                const text = this.xDateLabel[labelIndex];
                this.ctx.textAlign = "center";
                this.ctx.fillText(text, x, this.zone.data.originY + fontHeight);
                nowX = this.accAdd(nowX, intervalX);
            }
            // titleX
            this.ctx.fillText(this.label.titleX, this.zone.data.originX + this.zone.data.width + 20, this.zone.data.originY);
            this.ctx.stroke();
        }
        else {
            this.ctx.beginPath();
            this.ctx.font = this.font;
            this.ctx.strokeStyle = "#999";
            // min label at origin
            this.ctx.textAlign = "center";
            const intervalX = this.accAdd(this.dataRange.xmax, -this.dataRange.xmin) / this.label.divideX;
            const fontHeight = 20;
            let nowX = this.dataRange.xmin;
            for (let i = 0; i <= this.label.divideX; i++) {
                const x = Math.ceil(this.padding.left + this.dataInterval.widthInterval * i * intervalX);
                const text = nowX.toString();
                this.ctx.moveTo(x, this.zone.data.originY);
                this.ctx.lineTo(x, this.padding.up);
                this.ctx.textAlign = "center";
                this.ctx.fillText(text, x, this.zone.data.originY + fontHeight);
                nowX = this.accAdd(nowX, intervalX);
            }
            // titleX
            this.ctx.fillText(this.label.titleX, this.zone.data.originX + this.zone.data.width + 20, this.zone.data.originY);
            this.ctx.stroke();
        }
    }

    setBackground() {
        this.ctx.rect(0, 0, this.size.width, this.size.height);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
    }

    draw() {
        this.setBackground();
        this.drawLines();
        this.drawUp();
        this.drawCoordinates();
        this.drawLeft();
        this.drawBottom();
        // data:image/png;base64,#picdata#
        return this.canvas.toDataURL();
    }

}


module.exports = Chart;