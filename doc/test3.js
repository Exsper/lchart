const Chart = require("../index");
const fs = require("fs");

const formatDate = (date) => {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
};

const data1 = [];
const data2 = [];
const data3 = [];
const dateString = [];
let day = new Date("2020-01-01");
for (let i = 1; i < 50; i++) {
    const x = i;
    const y1 = Math.log(i);
    const y2 = Math.log10(i);
    const y3 = Math.log2(i);
    data1.push({ x, y:y1 });
    data2.push({ x, y:y2 });
    data3.push({ x, y:y3 });
    dateString.push(formatDate(day));
    day = new Date(day.setDate(day.getDate() + 1));
}

const chart = new Chart([{ name:"log(i)", points: data1 },{ name:"ln(i)", points: data2 },{ name:"log2(i)", points: data3 }], {
    padding: {
        right: 100
    },
    xDateMode: true,
    xDateLabel: dateString,
    label: {
        title: "chart3",
        titleX: "date",
        titleY: "y",
        divideX: 6
    }
});
const picUrl = chart.draw();
const base64 = picUrl.replace(/^data:image\/\w+;base64,/, "");
const dataBuffer = Buffer.from(base64, 'base64');
const filePath = "./doc/result3.png"
fs.writeFile(filePath, dataBuffer, function (err) {
    if (err) {
        throw err;
    }
});