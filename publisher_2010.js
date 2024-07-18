
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

    // Filter data for years 2010+
    const filteredData = data.filter(d => d.Year >= 2010);

    // Aggregate global sales by publisher
    const salesByPublisher = d3.rollup(filteredData, v => d3.sum(v, d => d.Global_Sales), d => d.Publisher);
    const salesByPublisherArray = Array.from(salesByPublisher, ([publisher, sales]) => ({ publisher, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10); // Get top 10 publishers

    // Create scales
    const x = d3.scaleBand()
        .domain(salesByPublisherArray.map(d => d.publisher))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(salesByPublisherArray, d => d.sales)])
        .range([height, 0]);

    // Create axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Append bars to the SVG
    svg.selectAll(".bar")
        .data(salesByPublisherArray)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.publisher))
        .attr("y", d => y(d.sales))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.sales))
        .attr("fill", "steelblue");
}).catch(error => {
    console.error('Error loading or parsing the data:', error);
});
