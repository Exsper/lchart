const Chart = require("../index");
const fs = require("fs");

const data = [];
const data2 = [];
for (let i = 1; i < 50; i++) {
    const x = Math.log(i);
    const y = Math.log10(i);
    data.push({ x, y });
}
for (let i = 1; i < 50; i++) {
    const x = Math.log10(i);
    const y = Math.log2(i);
    data2.push({ x, y });
}

const chart = new Chart([{name:"ln(x)~log10(x)", points: data },{name:"log10(x)~log2(x)", points: data2 }], {
    padding: {
        left: 100
    },
    label: {
        title: "chart4",
        titleX: "x",
        titleY: "y"
    }
});
const picUrl = chart.draw();
const base64 = picUrl.replace(/^data:image\/\w+;base64,/, "");
const dataBuffer = Buffer.from(base64, 'base64');
const filePath = "./doc/result4.png"
fs.writeFile(filePath, dataBuffer, function (err) {
    if (err) {
        throw err;
    }
});