const Chart = require("../index");

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

const chart = new Chart(data, {
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
console.log(chart.draw());