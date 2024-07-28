// script.js

const width = 960;
const height = 600;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black");  // Add border for debugging

console.log("Loading CSV data...");
d3.csv("data/chicago_crime_data.csv").then(data => {
    console.log("CSV data loaded:", data);

    console.log("Loading TopoJSON data...");
    d3.json("data/chicago_neighborhoods.topojson").then(neighborhoodData => {
        console.log("TopoJSON data loaded:", neighborhoodData);

        if (!neighborhoodData.objects || !neighborhoodData.objects.chicago) {
            console.error("The TopoJSON file does not contain 'chicago' object");
            return;
        }

        const neighborhoods = topojson.feature(neighborhoodData, neighborhoodData.objects.chicago);
        console.log("Processed neighborhoods data:", neighborhoods);

        // For debugging purposes, draw the paths to ensure they are displayed
        const path = d3.geoPath();
        svg.selectAll("path")
            .data(neighborhoods.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#ccc")
            .attr("stroke", "#333");

    }).catch(error => {
        console.error("Error loading TopoJSON:", error);
    });
}).catch(error => {
    console.error("Error loading CSV:", error);
});
