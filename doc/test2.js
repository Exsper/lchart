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

const data = [];
const dateString = [];
let day = new Date("2020-01-01");
for (let i = 1; i < 50; i++) {
    const x = i;
    const y = Math.log(i);
    data.push({ x, y });
    dateString.push(formatDate(day));
    day = new Date(day.setDate(day.getDate() + 1));
}

const chart = new Chart([{ points: data }], {
    padding: {
        right: 100
    },
    xDateMode: true,
    xDateLabel: dateString,
    label: {
        title: "date~log(i)",
        titleX: "date",
        titleY: "log(i)",
        divideX: 6
    }
});
const picUrl = chart.draw();
const base64 = picUrl.replace(/^data:image\/\w+;base64,/, "");
const dataBuffer = Buffer.from(base64, 'base64');
const filePath = "./doc/result2.png"
fs.writeFile(filePath, dataBuffer, function (err) {
    if (err) {
        throw err;
    }
});