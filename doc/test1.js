const Chart = require("../index");
const fs = require("fs");

const data = [];
for (let i = 1; i < 50; i++) {
    const x = Math.log(i);
    const y = Math.log10(i);
    data.push({ x, y });
}

const chart = new Chart([{ points: data }], {
    padding: {
        left: 100
    },
    label: {
        title: "ln(x)~log10(x)",
        titleX: "ln(x)",
        titleY: "log10(x)"
    }
});
const picUrl = chart.draw();
const base64 = picUrl.replace(/^data:image\/\w+;base64,/, "");
const dataBuffer = Buffer.from(base64, 'base64');
const filePath = "./doc/result1.png"
fs.writeFile(filePath, dataBuffer, function (err) {
    if (err) {
        throw err;
    }
});