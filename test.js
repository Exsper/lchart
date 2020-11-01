const Chart = require("./index");

const chart = new Chart([{ x: 1, y: 0.2 }, { x: 2, y: 0.4 }, { x: 3, y: 0.9 }, { x: 4, y: 0.16 }, { x: 5, y: 0.25 }, { x: 6, y: 0.36 }], {
    label: {
        divideX: 3, title: "423152135215323515",
        titleX: "xName",
        titleY: "yName"
    }, xDateMode: true, xDateLabel: ["12", "66", "33", "99", "52", "55"],

});
console.log(chart.draw());