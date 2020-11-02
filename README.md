# lchart

Streamlined and efficient line-chart tool designed to draw line charts for large amounts of data.

## install
```javascript
npm install Exsper/lchart
```

## usage
```javascript
const Chart = require("lchart");
const chart = new Chart(yourData, yourOptions);
const picUrl = chart.draw(); // base64 url like "data:image/png;base64,#picdata#"
```

## example
### test1
code: [test1](/doc/test1.js)
![test1](/doc/result1.png)

### test2
code: [test2](/doc/test2.js)
![test2](/doc/result2.png)
