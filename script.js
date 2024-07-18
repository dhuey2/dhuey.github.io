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

    // Aggregate global sales by year
    const salesByYear = d3.rollup(data, v => d3.sum(v, d => d.Global_Sales), d => d.Year);
    const salesByYearArray = Array.from(salesByYear, ([year, sales]) => ({ year, sales }));

    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(salesByYearArray, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(salesByYearArray, d => d.sales)])
        .range([height, 0]);

    // Create axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Create line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.sales));

    // Append the line to the SVG
    svg.append("path")
        .datum(salesByYearArray)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

}).catch(error => {
    console.error('Error loading or parsing the data:', error);
});
