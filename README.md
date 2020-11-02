# lchart

Streamlined and efficient line-chart tool designed to draw line charts for large amounts of data.

## install
```javascript
npm install lchart
```

## usage
```javascript
const Chart = require("lchart");
const yourData = [{x:Number, y:Number}, ...];
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

## data
```javascript
data = [{
    x: Number,
    y: Number,
}, {...}, ...]
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
        background, title, titleX, titleY, coordinate, line, pointFill, grid // String
    },
    label: {
        title, titleX, titleY, // String
        divideX, divideY // Number, max number of  coordinate marks
    },
    xDateMode, // Boolean, x-coordinate is date etc... divited evenly, data.x must be [1, 2, 3, ...]
    xDateLabel // Array<String>, when xDateMode = true, show xDateLabel at x-coordinate instead of x value, length must equal to data.length

}
```
