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

        if (!neighborhoodData.objects || !neighborhoodData.objects.chicago) {
            console.error("The TopoJSON file does not contain 'chicago' object");
            return;
        }

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

            // Log all properties of the first neighborhood feature
            console.log("First neighborhood feature properties:", neighborhoods.features[0].properties);

            // Filter out undefined community areas
            const validNeighborhoods = neighborhoods.features.filter(f => f.properties.name !== undefined);
            validNeighborhoods.forEach(f => console.log("Valid Location Description from TopoJSON:", f.properties.name));
			console.log('am i printing this');
            console.log(validNeighborhoods);
            // Log community areas from CSV
            const csvCommunityAreas = Array.from(new Set(data.map(d => d["Location Description"])));
            csvCommunityAreas.forEach(ca => console.log("Location Description from CSV:", ca));

            // Crime overview by community area
            const crimeCounts = d3.rollups(data, v => v.length, d => d["Location Description"]);
            const crimeCountMap = new Map(crimeCounts);
            console.log("Crime count map:", crimeCountMap);

            const colorScale = d3.scaleQuantize()
                .domain([0, d3.max(crimeCounts, d => d[1])])
                .range(d3.schemeReds[9]);

            const path = d3.geoPath();

            const paths = svg.selectAll("path")
                .data(validNeighborhoods)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", d => colorScale(crimeCountMap.get(d.properties.name) || 0))
                .attr("stroke", "#333")
                .on("click", (event, d) => {
                    selectedNeighborhood = d.properties.name;
                    currentScene = 2;
                    updateScene();
                });

            console.log("Paths appended:", paths.size());

            // Add annotations here if necessary
        }

        function showCrimeTypesByNeighborhood(neighborhood, data) {
            console.log("Showing crime types by neighborhood:", neighborhood);

            // Filter data by community area
            const filteredData = data.filter(d => d["Location Description"] === neighborhood);
            const crimeCounts = d3.rollups(filteredData, v => v.length, d => d["Primary Type"]);
            console.log("Crime counts by type for neighborhood:", neighborhood, crimeCounts);
            
            const xScale = d3.scaleBand()
                .domain(crimeCounts.map(d => d[0]))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(crimeCounts, d => d[1])])
                .nice()
                .range([height - margin.bottom, margin.top]);

            svg.append("g")
                .selectAll("rect")
                .data(crimeCounts)
                .enter().append("rect")
                .attr("x", d => xScale(d[0]))
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(0) - yScale(d[1]))
                .attr("width", xScale.bandwidth())
                .attr("fill", "steelblue")
                .on("click", (event, d) => {
                    selectedCrimeType = d[0];
                    currentScene = 3;
                    updateScene();
                });

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale).tickRotation(45));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(yScale));

            // Add annotations here if necessary
        }

        function showTemporalTrends(neighborhood, crimeType, data) {
            console.log("Showing temporal trends for:", neighborhood, crimeType);

            // Filter data by community area and crime type
            const filteredData = data.filter(d => d["Location Description"] === neighborhood && d["Primary Type"] === crimeType);
            const crimeTrends = d3.rollups(filteredData, v => v.length, d => d.Date)
                .sort((a, b) => d3.ascending(new Date(a[0]), new Date(b[0])));
            console.log("Crime trends for", neighborhood, crimeType, crimeTrends);

            const xScale = d3.scaleTime()
                .domain(d3.extent(crimeTrends, d => new Date(d[0])))
                .range([margin.left, width - margin.right]);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(crimeTrends, d => d[1])])
                .nice()
                .range([height - margin.bottom, margin.top]);

            const line = d3.line()
                .x(d => xScale(new Date(d[0])))
                .y(d => yScale(d[1]));

            svg.append("path")
                .datum(crimeTrends)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line);

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(yScale));

            // Add annotations here if necessary
        }

        updateScene();
    }).catch(error => {
        console.error("Error loading TopoJSON:", error);
    });
}).catch(error => {
    console.error("Error loading CSV:", error);
});
