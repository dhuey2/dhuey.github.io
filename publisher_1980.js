const margin = { top: 20, right: 200, bottom: 120, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

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

    // Filter data for years 1980-1989
    const filteredData = data.filter(d => d.Year >= 1980 && d.Year <= 1989);

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
        .nice()
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

    // Adjust the x-axis label position
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Publisher");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 2)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "16px")
        .text("Total Global Sales (millions)");

    // Append bars to the SVG
    svg.selectAll(".bar")
        .data(salesByPublisherArray)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.publisher))
        .attr("y", d => y(d.sales))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.sales))
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "purple");
            svg.append("text")
                .attr("class", "tooltip")
                .attr("x", x(d.publisher) + x.bandwidth() / 2)
                .attr("y", y(d.sales) - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text(`${d.publisher}: ${d.sales.toFixed(2)}M`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "steelblue");
            svg.select(".tooltip").remove();
        });

    // Add annotation
    const topPublisher = salesByPublisherArray[0];
    const topPublisherGames = filteredData
        .filter(d => d.Publisher === topPublisher.publisher)
        .sort((a, b) => b.Global_Sales - a.Global_Sales)
        .slice(0, 3)
        .map(d => d.Name);

    // Calculate annotation position to keep it within bounds
    const annotationX = Math.min(width - 200, x(topPublisher.publisher) + x.bandwidth() / 2 + 50);
    const annotationY = Math.max(30, y(topPublisher.sales) - 30);

    svg.append("line")
        .attr("x1", x(topPublisher.publisher) + x.bandwidth() / 2)
        .attr("y1", y(topPublisher.sales))
        .attr("x2", annotationX - 10)
        .attr("y2", annotationY + 10)
        .attr("stroke", "black");

    svg.append("text")
        .attr("x", annotationX)
        .attr("y", annotationY)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .text(`Publisher: ${topPublisher.publisher}`);

    svg.append("text")
        .attr("x", annotationX)
        .attr("y", annotationY + 15)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .text(`Sales: ${topPublisher.sales.toFixed(2)}M`);

        svg.append("text")
        .attr("x", annotationX)
        .attr("y", annotationY + 30)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .text("Top Games:");

    topPublisherGames.forEach((game, index) => {
        svg.append("text")
            .attr("x", annotationX)
            .attr("y", annotationY + 45 + (index * 15))
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle")
            .text(game);
    });

    // Create top games table
    const topGames = filteredData
        .sort((a, b) => a.Rank - b.Rank)
        .slice(0, 10);

    const table = d3.select("#top-games-table").select("tbody");
    const rows = table.selectAll("tr")
        .data(topGames)
        .enter().append("tr");

    rows.append("td").text(d => d.Rank);
    rows.append("td").text(d => d.Name);
    rows.append("td").text(d => d.Publisher);
    rows.append("td").text(d => d.Platform);
    rows.append("td").text(d => d.Year);
    rows.append("td").text(d => d.Genre);
    rows.append("td").text(d => d.Global_Sales.toFixed(2));
}).catch(error => {
    console.error('Error loading or parsing the data:', error);
});
