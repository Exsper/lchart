# lchart

[![npm](https://img.shields.io/npm/v/lchart?style=flat-square)](https://www.npmjs.com/package/lchart)

WARNING: Not compatible with versions below v0.1

Streamlined and efficient line-chart tool designed to draw line charts for large amounts of data.

## install
```javascript
npm install lchart
```

## usage
```javascript
const Chart = require("lchart");
const yourData = [
    {
        name: "line's name",
        points: [{x:Number, y:Number}, ...],
        configs: {
            lineColor: "#E74C3C",
            pointFillColor: "#C0392B"
        }
    }
, {...}, ...];
const configs = {Object}; // see ##configs
const chart = new Chart(yourData, configs);
const picUrl = chart.draw(); // base64 url like "data:image/png;base64,#picdata#"
```

## example
### test1
code: [test1](/doc/test1.js)
![test1](/doc/result1.png)

### test2
code: [test2](/doc/test2.js)
![test2](/doc/result2.png)

### test3
code: [test2](/doc/test3.js)
![test2](/doc/result3.png)

### test4
code: [test2](/doc/test4.js)
![test2](/doc/result4.png)

## data
```javascript
data = [
    {
        name: "line's name", // for multi line's legend
        points: [{x:Number, y:Number}, ...],
        configs: {
            lineColor: "#E74C3C",
            pointFillColor: "#C0392B"
        }
    }
, {...}, ...]
```

## configs
```javascript
configs = { // All can be omitted
    padding: {
        left, right, up, down // Number, padding of the main data chart
    },
    size: {
        width, height // Number, pic size
    },
    font, // String, exp: "15px Georgia"
    color: {
        background, title, titleX, titleY, coordinate, grid // String
    },
    label: {
        title, titleX, titleY, // String
        divideX, divideY // Number, max number of  coordinate marks
    },
    xDateMode, // Boolean, x-coordinate is date etc... divited evenly, point.x must be [1, 2, 3, ...] or [3, 5, 6, ...] etc...
    xDateLabel // Array<String>, when xDateMode = true, show xDateLabel at x-coordinate instead of x value, length must contains all data's point.x
               // for example:   line1 point.x [1, 2, 3, 4, 5]   line2 point.x [2, 4, 6, 7, 8]
               // xDateLabel should be like ["day1", "day2", "day3", "day4", "day5", "day6", "day7", "day8"] contains 1-8
               // the reason that I don't use Date() directly is x-coordinate can be other things like team numbers, seasons, years...

}
```
