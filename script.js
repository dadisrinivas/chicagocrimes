// script.js

const width = 960;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
let currentScene = 1;
let selectedNeighborhood = null;
let selectedCrimeType = null;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black");  // Add border for debugging

const backButton = d3.select("#backButton")
    .on("click", () => {
        if (currentScene === 3) {
            currentScene = 2;
            updateScene();
        } else if (currentScene === 2) {
            currentScene = 1;
            updateScene();
        }
    });

console.log("Loading CSV data...");
d3.csv("data/chicago_crime_data.csv").then(data => {
    console.log("CSV data loaded:", data);

    console.log("Loading TopoJSON data...");
    d3.json("data/chicago_neighborhoods.topojson").then(neighborhoodData => {
        console.log("TopoJSON data loaded:", neighborhoodData);

        const neighborhoods = topojson.feature(neighborhoodData, neighborhoodData.objects.chicago);
        console.log("Processed neighborhoods data:", neighborhoods);

        function updateScene() {
            console.log("Updating scene:", currentScene);
            svg.selectAll("*").remove();

            if (currentScene === 1) {
                backButton.style("display", "none");
                showCrimeOverview(neighborhoods, data);
            } else if (currentScene === 2) {
                backButton.style("display", "block");
                showCrimeTypesByNeighborhood(selectedNeighborhood, data);
            } else if (currentScene === 3) {
                backButton.style("display", "block");
                showTemporalTrends(selectedNeighborhood, selectedCrimeType, data);
            }
        }

        function showCrimeOverview(neighborhoods, data) {
            console.log("Showing crime overview");
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .text("Crime Overview");
        }

        function showCrimeTypesByNeighborhood(neighborhood, data) {
            console.log("Showing crime types by neighborhood:", neighborhood);
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .text("Crime Types for " + neighborhood);
        }

        function showTemporalTrends(neighborhood, crimeType, data) {
            console.log("Showing temporal trends for:", neighborhood, crimeType);
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .text("Trends for " + neighborhood + " - " + crimeType);
        }

        updateScene();
    }).catch(error => {
        console.error("Error loading TopoJSON:", error);
    });
}).catch(error => {
    console.error("Error loading CSV:", error);
});
