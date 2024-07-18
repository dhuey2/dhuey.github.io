const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV file
d3.csv("vgsales.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.Year = +d.Year;
        d.Global_Sales = +d.Global_Sales;
    });

    // Aggregate global sales by intervals
    const salesByInterval = d3.rollup(data, v => d3.sum(v, d => d.Global_Sales), d => {
        if (d.Year >= 1980 && d.Year < 1990) return "1980-1989";
        if (d.Year >= 1990 && d.Year < 2000) return "1990-1999";
        if (d.Year >= 2000 && d.Year < 2010) return "2000-2009";
        if (d.Year >= 2010) return "2010+";
        return "Unknown";
    });

    const salesByIntervalArray = Array.from(salesByInterval, ([interval, sales]) => ({ interval, sales }))
        .sort((a, b) => {
            const order = ["1980-1989", "1990-1999", "2000-2009", "2010+"];
            return order.indexOf(a.interval) - order.indexOf(b.interval);
        });

    // Create scales
    const x = d3.scaleBand()
        .domain(salesByIntervalArray.map(d => d.interval))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(salesByIntervalArray, d => d.sales)])
        .range([height, 0]);

    // Create axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Append bars to the SVG
    svg.selectAll(".bar")
        .data(salesByIntervalArray)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.interval))
        .attr("y", d => y(d.sales))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.sales))
        .attr("fill", d => d.interval === "2010+" ? "steelblue" : "steelblue")
        .style("cursor", d => d.interval === "2010+" ? "pointer" : "default")
        .on("mouseover", function(event, d) {
            if (d.interval === "2010+") {
                d3.select(this).attr("fill", "purple");
            }
        })
        .on("mouseout", function(event, d) {
            if (d.interval === "2010+") {
                d3.select(this).attr("fill", "steelblue");
            }
        })
        .on("click", function(event, d) {
            if (d.interval === "2010+") {
                window.location.href = 'publishers_2010.html';
            }
        });
}).catch(error => {
    console.error('Error loading or parsing the data:', error);
});
