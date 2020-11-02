const Chart = require("../index");

const data = [];
for (let i = 1; i < 50; i++) {
    const x = Math.log(i);
    const y = Math.log10(i);
    data.push({ x, y });
}

const chart = new Chart(data, {
    padding:{
        left: 100
    },
    label: {
        title: "ln(x)~log10(x)",
        titleX: "ln(x)",
        titleY: "log10(x)"
    }
});
console.log(chart.draw());