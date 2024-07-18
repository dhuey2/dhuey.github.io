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

    // Define intervals
    const intervals = [
        { name: "1980-1989", start: 1980, end: 1989 },
        { name: "1990-1999", start: 1990, end: 1999 },
        { name: "2000-2009", start: 2000, end: 2009 },
        { name: "2010+", start: 2010, end: 2024 }
    ];

    // Aggregate global sales by interval
    const salesByInterval = intervals.map(interval => {
        const filteredData = data.filter(d => d.Year >= interval.start && d.Year <= interval.end);
        const totalSales = d3.sum(filteredData, d => d.Global_Sales);
        return { interval: interval.name, sales: totalSales };
    });

    // Create scales
    const x = d3.scaleBand()
        .domain(salesByInterval.map(d => d.interval))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(salesByInterval, d => d.sales)])
        .nice()
        .range([height, 0]);

    // Create axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Append bars to the SVG
    svg.selectAll(".bar")
        .data(salesByInterval)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.interval))
        .attr("y", d => y(d.sales))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.sales))
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "purple");
            svg.append("text")
                .attr("class", "tooltip")
                .attr("x", x(d.interval) + x.bandwidth() / 2)
                .attr("y", y(d.sales) - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text(`${d.interval}: ${d.sales.toFixed(2)}M`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "steelblue");
            svg.select(".tooltip").remove();
        })
        .on("click", function(event, d) {
            const intervalPageMap = {
                "1980-1989": "publishers_1980.html",
                "1990-1999": "publishers_1990.html",
                "2000-2009": "publishers_2000.html",
                "2010+": "publishers_2010.html"
            };
            window.location.href = intervalPageMap[d.interval];
        });
});