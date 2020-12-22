"use strict";

const { createCanvas } = require("canvas");

class Line {
    /**
     * @param {Object} data
     * @param {String} data.name
     * @param {Array<{x:Number, y:Number}>} data.points
     * @param {{lineColor:String, pointFillColor:String}} [data.configs]
     * @param {{lineColor:String, pointFillColor:String}} defaultConfigs
     */
    constructor(data, defaultConfigs) {
        this.name = data.name;
        this.points = data.points;
        this.lineConfigs = data.configs || {};
        this.lineColor = this.lineConfigs.lineColor || defaultConfigs.lineColor;
        this.pointFillColor = this.lineConfigs.pointFillColor || defaultConfigs.pointFillColor;
    }
}

/**
 * calculate chart layout & draw coordinates
 */
class Chart {
    /**
     * lchart v0.1   WARNING: Not compatible with versions below v0.1
     * @param {Array<{name:String,points:Array<{x:Number, y:Number}>,configs:{lineColor:String, pointFillColor:String}}>} datas
     * @param {Object} [picConfigs]
     * @param {{left:Number, right:Number, up:Number, down:Number}} [picConfigs.padding]
     * @param {{width:Number, height:Number}} [picConfigs.size] pic size
     * @param {String} [picConfigs.font] exp. "15px Georgia"
     * @param {{background:String ,title:String, titleX:String, titleY:String, coordinate:String, grid:String}} [picConfigs.color] 
     * @param {{title:String, titleX:String, titleY:String, divideX:Number, divideY:Number}} [picConfigs.label]
     * @param {Boolean} [picConfigs.xDateMode] x-coordinate is date etc... divited evenly, point.x must be [1, 2, 3, ...] or [3, 5, 6, ...] etc...
     * @param {Array<String>} [picConfigs.xDateLabel] when xDateMode = true, show xDateLabel at x-coordinate instead of x value, length must contains all data's point.x
     *                                                for example:   line1 point.x [1, 2, 3, 4, 5]   line2 point.x [2, 4, 6, 7, 8]
     *                                                xDateLabel should be like ["day1", "day2", "day3", "day4", "day5", "day6", "day7", "day8"] contains 1-8
     *                                                the reason that I don't use Date() directly is x-coordinate can be other things like team numbers, seasons, years...
     */
    constructor(datas, picConfigs = {}) {
        // lines count should be no more than 8
        this.defaultLineColor = ["#E74C3C", "#3498DB", "#9B59B6", "#2ECC71", "#F1C40F", "#34495E", "#95A5A6", "#1ABC9C"];
        this.defaultPointColor = ["#C0392B", "#2980B9", "#8E44AD", "#27AE60", "#F39C12", "#2C3E50", "#7F8C8D", "#16A085"];
        if (datas.length <= 1) this.lines = [new Line(datas.pop(), { lineColor: "#000", pointFillColor: "gray" })];
        else this.lines = datas.map((data, index) => {
            const lineColor = this.defaultLineColor[index] || this.randomColor();
            const pointFillColor = this.defaultPointColor[index] || lineColor;
            return new Line(data, { lineColor, pointFillColor });
        });
        // padding
        this.padding = {};
        if (!picConfigs.padding) picConfigs.padding = {};
        this.padding.left = picConfigs.padding.left || 50;
        this.padding.right = picConfigs.padding.right || (this.lines.length > 1) ? 150 : 50;
        this.padding.up = picConfigs.padding.up || 50;
        this.padding.down = picConfigs.padding.down || 50;
        // size
        this.size = {};
        if (!picConfigs.size) picConfigs.size = {};
        this.size.width = picConfigs.size.width || 800;
        this.size.height = picConfigs.size.height || 600;
        // font
        this.font = picConfigs.font || "15px Georgia";
        // color
        this.color = {};
        if (!picConfigs.color) picConfigs.color = {};
        this.color.background = picConfigs.color.background || "white";
        this.color.title = picConfigs.color.title || "#000";
        this.color.titleX = picConfigs.color.titleX || "#000";
        this.color.titleY = picConfigs.color.titleY || "#000";
        this.color.coordinate = picConfigs.color.coordinate || "#000";
        this.color.grid = picConfigs.color.grid || "#999";
        // labels
        this.label = {};
        if (!picConfigs.label) picConfigs.label = {};
        this.label.title = picConfigs.label.title || "";
        this.label.titleX = picConfigs.label.titleX || "";
        this.label.titleY = picConfigs.label.titleY || "";
        // how many segments are the coordinates divided into, it may be changed by getDatasRange()
        this.label.divideX = picConfigs.label.divideX || 10;
        this.label.divideY = picConfigs.label.divideY || 10;
        // xDateMode
        this.xDateMode = picConfigs.xDateMode || false;
        this.xDateLabel = picConfigs.xDateLabel || null;
        // draw zone
        /*
        -123-in-pic----------------------------------------------------------------
        1         |                                                    |          |
        2         |                      up padding                    |          |
        3         |                        (title)                     |          |
        |---------^---------------------------------------------------------------|
        |         |                                                    |          |
        |   left  |                                                    |   right  |
        | (y-coor 3                       data zone                    |  padding |
        | dinate) 2                                                    | (legend) |
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
        this.dataRange = this.getCoordinatesRanges();
        // Calculate how many pixels equal to 1 
        this.dataInterval = this.getDataInterval();

        // initCtx
        this.canvas = createCanvas(this.size.width, this.size.height);
        this.ctx = this.canvas.getContext('2d');
    }

    randomColor() {
        var color = "#";
        for (var i = 0; i < 6; i++) color += parseInt(Math.random() * 16).toString(16);
        return color;
    }

    getSuitableRange(min, max, divideCount) {
        const interval = (max - min) / divideCount;
        const digit = Math.floor(Math.log10(interval)) + 1;
        const fixedInterval = Math.pow(10, digit);
        let fixedMin = (min >= 0) ? (min - (min % fixedInterval)) : (min - (min % fixedInterval) - fixedInterval);
        let fixedMax = (max > 0) ? (max - (max % fixedInterval) + fixedInterval) : (max - (max % fixedInterval));
        // Avoid accuracy problems
        const mul = Math.pow(10, -digit);
        if (fixedMin.toString().length > 10) fixedMin = Math.round((fixedMin + Number.EPSILON) * mul) / mul;
        if (fixedMax.toString().length > 10) fixedMax = Math.round((fixedMax + Number.EPSILON) * mul) / mul;
        const fixedDivideCount = Math.round((fixedMax - fixedMin) / fixedInterval);
        return { min: fixedMin, max: fixedMax, divideCount: fixedDivideCount };
    }

    getDataRange(data) {
        let xmin = data[0].x;
        let xmax = data[0].x;
        let ymin = data[0].y;
        let ymax = data[0].y;
        data.map((point) => {
            if (point.x > xmax) xmax = point.x;
            if (point.x < xmin) xmin = point.x;
            if (point.y > ymax) ymax = point.y;
            if (point.y < ymin) ymin = point.y;
        });
        return { xmin, xmax, ymin, ymax };

    }

    getCoordinatesRanges() {
        const ranges = this.lines.map((line) => {
            return this.getDataRange(line.points);
        })
        let xmin = ranges[0].xmin;
        let xmax = ranges[0].xmax;
        let ymin = ranges[0].ymin;
        let ymax = ranges[0].ymax;
        ranges.map((range) => {
            if (range.xmax > xmax) xmax = range.xmax;
            if (range.xmin < xmin) xmin = range.xmin;
            if (range.ymax > ymax) ymax = range.ymax;
            if (range.ymin < ymin) ymin = range.ymin;
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

    drawCoordinates() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color.coordinate;
        this.ctx.moveTo(this.zone.data.originX, this.zone.data.originY);
        this.ctx.lineTo(this.zone.data.originX, this.padding.up);
        this.ctx.moveTo(this.zone.data.originX, this.zone.data.originY);
        this.ctx.lineTo(this.zone.data.originX + this.zone.data.width, this.zone.data.originY);
        this.ctx.stroke();
    }

    // accuary fix
    accAdd(arg1, arg2) {
        let r1, r2;
        try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
        try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
        const m = Math.pow(10, Math.max(r1, r2));
        return (arg1 * m + arg2 * m) / m;
    }

    accDiv(arg1, arg2) {
        let t1 = 0, t2 = 0, r1, r2;
        try { t1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
        try { t2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
        r1 = Number(arg1.toString().replace(".", ""))
        r2 = Number(arg2.toString().replace(".", ""))
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }

    drawUp() {
        // title
        this.ctx.beginPath();
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.color.title;
        // min label at origin
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.label.title, Math.floor(this.size.width / 2), Math.floor(this.padding.up / 2));
        this.ctx.stroke();
    }

    drawRight() {
        // legend
        // ----------------
        // | right padding|
        // |        name O|
        // | anothername O|
        // |              |
        // ----------------
        const fontHeight = 20;
        const circleX = this.size.width - 10;
        let circleY = this.padding.up + fontHeight;
        const colors = [];
        const names = [];
        this.lines.map((line) => {
            colors.push(line.lineColor);
            names.push(line.name);
        })
        this.ctx.textAlign = "right";
        for (let i = 0; i < colors.length; i++) {
            this.ctx.beginPath();
            this.ctx.fillStyle = colors[i];
            this.ctx.arc(circleX, circleY, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillText(names[i], circleX - 20, circleY + 5);
            circleY += fontHeight
        }
        this.ctx.stroke();
    }

    drawLeft() {
        this.ctx.beginPath();
        this.ctx.font = this.font;
        this.ctx.strokeStyle = this.color.grid;
        this.ctx.fillStyle = this.color.titleY;
        // min label at origin
        this.ctx.textAlign = "center";
        const intervalY = this.accDiv(this.accAdd(this.dataRange.ymax, -this.dataRange.ymin), this.label.divideY);
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
        this.ctx.stroke();
        // titleY
        this.ctx.beginPath();
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.color.titleY;
        this.ctx.fillText(this.label.titleY, this.zone.data.originX, this.padding.up - 20);
        this.ctx.stroke();
    }

    drawBottom() {
        if (this.xDateMode && this.xDateLabel) {
            this.ctx.beginPath();
            this.ctx.font = this.font;
            this.ctx.strokeStyle = this.color.grid;
            this.ctx.fillStyle = this.color.titleX;
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
            this.ctx.stroke();
            // titleX
            this.ctx.beginPath();
            this.ctx.font = this.font;
            this.ctx.fillStyle = this.color.titleX;
            this.ctx.fillText(this.label.titleX, this.zone.data.originX + this.zone.data.width + 5, this.zone.data.originY - 10);
            this.ctx.stroke();
        }
        else {
            this.ctx.beginPath();
            this.ctx.font = this.font;
            this.ctx.strokeStyle = this.color.grid;
            this.ctx.fillStyle = this.color.titleX;
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
            this.ctx.stroke();
            // titleX
            this.ctx.beginPath();
            this.ctx.font = this.font;
            this.ctx.fillStyle = this.color.titleX;
            this.ctx.fillText(this.label.titleX, this.zone.data.originX + this.zone.data.width + 5, this.zone.data.originY - 10);
            this.ctx.stroke();
        }
    }

    setBackground() {
        this.ctx.rect(0, 0, this.size.width, this.size.height);
        this.ctx.fillStyle = this.color.background;
        this.ctx.fill();
    }

    data2Point(points) {
        // true point in pic
        return points.map((point) => {
            const x = Math.ceil(this.dataInterval.widthInterval * (point.x - this.dataRange.xmin) + this.padding.left);
            const y = Math.ceil(this.size.height - this.dataInterval.heightInterval * (point.y - this.dataRange.ymin) - this.padding.down);
            return { x, y };
        });
    }

    /**
     * @param {Line} line
     */
    drawLine(line) {
        const drawPoints = this.data2Point(line.points);
        this.ctx.beginPath();
        this.ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
        drawPoints.map((point) => {
            this.ctx.lineTo(point.x, point.y);
            this.ctx.strokeStyle = line.lineColor;
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.fillStyle = line.pointFillColor;
            this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
        });
        this.ctx.stroke();
    }

    drawLines() {
        this.lines.map((line) => {
            this.drawLine(line);
        })
    }

    draw() {
        this.setBackground();
        this.drawLines();
        this.drawUp();
        this.drawCoordinates();
        this.drawLeft();
        if (this.lines.length > 1) this.drawRight();
        this.drawBottom();
        // data:image/png;base64,#picdata#
        return this.canvas.toDataURL();
        // return this;
    }

}


module.exports = Chart;