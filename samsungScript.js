
// Dimensions

const margin = { top: 70, right: 80, bottom: 100, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 540 - margin.top - margin.bottom;
const amtYears = 25
          
const container = d3.select("#chart_container")
document.getElementById('y0').classList.add("active")

// Load Dataset

d3.csv("SamsungDataset.csv").then(function (data) {


  let yearly_data = Array.from({length: amtYears}, () => []);

  const parseDate = d3.timeParse("%Y-%m-%d")

  data.forEach(d => {
    const year = Number(d.Date.substring(0, 4))
    const index = year - 2000
    d.Date = parseDate(d.Date)
    yearly_data[index].push(d)
  })

  updateYear(0)

  // set listeners for buttons
  for (let i = 0; i < 25; i++) {
    const id = `y${i}`;
    let button = document.getElementById(id);
    button.addEventListener("click", function() {

      for (let y = 0; y < 25; y++) {
        document.getElementById(`y${y}`).classList.remove("active")
      }

      button.classList.add("active")

      updateYear(i)
    });
  }

  function updateYear(year) {

    // Scales

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Remove current SVG 

    container.select("svg").remove();

    // Set chart 
    const svg = container.append("svg")
                          .attr("width", width + margin.left + margin.right) 
                          .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                          .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // add x and y domains
    x.domain(d3.extent(yearly_data[year], d => d.Date));
    y.domain([0, d3.max(yearly_data[year], d => Number(d.Open))]);

    console.log(yearly_data[year])

    console.log(d3.max(yearly_data[year], d => d.Open))

    // remove previous data
    svg.selectAll("path").remove()
    svg.selectAll("g").remove()


    // add x-axis and y-axis

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .style("font-size", "14px")
      .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%b %Y")))
      .call(g => g.select(".domain").remove())
      .selectAll(".tick line")
      .style("stroke-opacity", 0)
    svg.selectAll(".tick text").attr("fill", "#777")    

    svg.append("g")
      .style("font-size", "14px")
      .call(d3.axisLeft(y)
              .ticks((d3.max(data, d => d.Open)) / 1000)
              .tickFormat(d => {
                return `${(d / 1000).toFixed(0)}k`;
              })
              .tickSize(0)
              .tickPadding(10))
      .call(g => g.select(".domain").remove())
      .selectAll(".tick text")
      .style("fill", "#777")
      .style("visibility", (d, i, n) => {
        if (i === 0) return "hidden";
        else return "visible";
      });

    // add gridlines

    svg.selectAll("xGrid")
      .data(x.ticks().slice(0))
      .join("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", d => 0)
      .attr("y2", d => height)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5)

    svg.selectAll("yGrid")
      .data(y.ticks((d3.max(data, d => d.Open)) / 1000).slice(1))
      .join("line")
      .attr("x1", d => 0)
      .attr("x2", d => width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5)

    // define line generator 

    const line = d3.line()
                  .x(d => x(d.Date))
                  .y(d => y(d.Open));

    // Include line in svg

    svg.append("path")
      .datum(yearly_data[year])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", line)

    // Add title and chart axis
    svg.append("text")
      .attr("class", "chart_title")
      .attr("x", margin.left -115)
      .attr("y", margin.top - 100)
      .style("font-size", "25px")
      .style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .text("Samsung Stock Price ($) per Year") 

    svg.append("text")
      .attr("class", "y_axis_title")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 10)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#777")
      .style("font-family", "sans-serif")
      .text("Samsung Stock Price ($)") 

    // Add Source Credits
    svg.append("text")
      .attr("class", "source_credit")
      .attr("x", 0)
      .attr("y", height + margin.bottom - 13)
      .style("font-size", "9px")
      .style("font-family", "sans-serif")
      .text("Source: https://www.kaggle.com/datasets/mayankanand2701/samsung-stock-price-dataset")
    
    svg.append("text")
      .attr("class", "source_credit")
      .attr("x", 0)
      .attr("y", height + margin.bottom - 3)
      .style("font-size", "9px")
      .style("font-family", "sans-serif")
      .text("Format Inspired by: https://www.youtube.com/watch?v=Wk8pIxcidv8")

  }
})