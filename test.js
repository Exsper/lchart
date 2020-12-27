const blocked = require("blocked-at");
blocked((time, stack, { type, resource }) => {
    console.log(`Blocked for ${time}ms, operation started here:`, stack);
    if (type === "HTTPPARSER" && resource) {
        // resource structure in this example assumes Node 10.x
        console.log(`URL related to blocking operation: ${resource.resource.incoming.url}`);
    }
}, { resourcesCap: 100 });

const Chart = require("./index");

const data = [];
for (let i = 1; i < 10000; i++) {
    const x = Math.log(i);
    const y = Math.log10(i);
    data.push({ x, y });
}

const chart = new Chart([{points:data}], {
    label: {
        divideX: 10, title: "423152135215323515",
        titleX: "xName",
        titleY: "yName"
    }
});
console.log(chart.draw());