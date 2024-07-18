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

    const salesByIntervalArray = Array.from(salesByInterval, ([interval, sales]) => ({ interval, sales }));

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
        .attr("fill", "steelblue");
}).catch(error => {
    console.error('Error loading or parsing the data:', error);
});
