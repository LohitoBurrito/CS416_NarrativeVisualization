        
// Global Variables

const marginLeft = 80;
const marginRight = 80;
const marginTop = 70;
const marginBottom = 100;
const width = 1200 - marginLeft - marginRight;
const height = 540 - marginTop - marginBottom;
const amtYears = 25
const fontSize = "14px"
const creditSize = "9px"
const titleSize = "25px"
let currYear = 0

const container = d3.select("#chart_container")
document.getElementById('y0').classList.add("active")

// Set Annotations

const annotationValues = [
  [],
  [],
  [],
  [],
  [
    {
      note : {
        label : "Samsung Stock Prices stopped decreasing and started increasing due to strong growth in memory chip sales", 
        title : "Memory Chip Sale"
      },
      x : 560,
      y : 135,
      dx : -50,
      dy : 30,
    }
  ],
  [],
  [],
  [],
  [],
  [],
  [
    {
      note : {
        label : "There was an increase in electronic demand when the global financial crisis ended", 
        title : "Global Financial Crisis Rebound"
      },
      x : 100,
      y : 76,
      dx : 50,
      dy : 30,
    }
  ],
  [],
  [],
  [
    {
      note : {
        label : "Samsung Stock Prices increaed due to release of the Galaxy S4", 
        title : "Galaxy S4 release"
      },
      x : 332,
      y : 21,
      dx : -50,
      dy : 80,
    }
  ],
  [],
  [],
  [
    {
      note : {
        label : "Samsung Stock Prices decreases due to the Galaxy 7 battery exploding", 
        title : "Galaxy 7 Battery Explosion"
      },
      x : 730,
      y : 65,
      dx : 60,
      dy : 70,
    }
  ],
  [],
  [
    {
      note : {
        label : "Samsung Stock Prices surged due to higher demands in their memory chips", 
        title : "High Demand in Memory Chips"
      },
      x : 110,
      y : 62,
      dx : 50,
      dy : 30,
    },
    {
      note : {
        label : "Samsung experienced stock price decline due to slowing semiconductor demand/smarphone sales", 
        title : "Slower Global Smartphone Sales"
      },
      x : 777,
      y : 43,
      dx : -50,
      dy : 80,
    }
  ],
  [],
  [
    {
      note : {
        label : "Samsung Stock Prices gradually increases due increase in demand for displays/memory chips during Covid-19 pandemic", 
        title : "Covid-19 Stock Growth"
      },
      x : 290,
      y : 142.5,
      dx : 200,
      dy : 20,
    }
  ],
  [
    {
      note : {
        label : "Samsung had decrease in stock prices due to supply chain and semiconductor issues", 
        title : "Supply Chain Issues"
      },
      x : 81,
      y : 35,
      dx : 50,
      dy : 80,
    }
  ],
  [],
  [],
  [],
]

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

  let nextBtn = document.getElementById(`next`)
  nextBtn.addEventListener("click", function () {
    if (currYear !== 24) {
      for (let y = 0; y < 25; y++) {
        document.getElementById(`y${y}`).classList.remove("active")
      }

      document.getElementById(`y${currYear + 1}`).classList.add("active")

      updateYear(currYear + 1)
    }
  })

  // create helper function

  function updateYear(year) {

    currYear = year

    // Scales

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Remove current SVG 

    container.select("svg").remove();

    // Set chart 
    const svg = container.append("svg")
                          .attr("width", width + marginLeft + marginRight) 
                          .attr("height", height + marginTop + marginBottom)
                        .append("g")
                          .attr("transform", `translate(${marginLeft}, ${marginTop})`);

    // add x and y domains
    x.domain(d3.extent(yearly_data[year], d => d.Date));
    y.domain([0, d3.max(yearly_data[year], d => Number(d.Open))]);

    // remove previous data
    svg.selectAll("path").remove()
    svg.selectAll("g").remove()

    // add x-axis and y-axis

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .style("font-size", fontSize)
      .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%b %Y")))
      .call(g => g.select(".domain").remove())
      .selectAll(".tick line")
      .style("stroke-opacity", 0)
    svg.selectAll(".tick text").attr("fill", "#888")    

    svg.append("g")
      .style("font-size", fontSize)
      .call(d3.axisLeft(y)
              .ticks((d3.max(data, d => d.Open)) / 1000)
              .tickFormat(d => {
                return `${(d / 1000).toFixed(0)}k`;
              })
              .tickSize(0)
              .tickPadding(10))
      .call(g => g.select(".domain").remove())
      .selectAll(".tick text")
      .style("fill", "#888")
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
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#d1d1d1")
      .attr("stroke-width", 0.5)

    svg.selectAll("yGrid")
      .data(y.ticks((d3.max(data, d => d.Open)) / 1000).slice(1))
      .join("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#d1d1d1")
      .attr("stroke-width", 0.5)


    // Include line in svg

    svg.append("path")
      .datum(yearly_data[year])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", 
        d3.line()
          .x(d => x(d.Date))
          .y(d => y(d.Open))
      )

    const makeAnnotations = d3.annotation().annotations(annotationValues[year])
    svg.append("g").call(makeAnnotations)


    // Add title and chart axis
    svg.append("text")
      .attr("class", "chart_title")
      .attr("x", marginLeft - 115)
      .attr("y", marginTop - 100)
      .style("font-size", titleSize)
      .style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .text("Samsung Stock Price ($) per Year") 

    svg.append("text")
      .attr("class", "y_axis_title")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -marginLeft + 10)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", fontSize)
      .style("fill", "#888")
      .style("font-family", "sans-serif")
      .text("Samsung Stock Price ($)") 

    // Add Source Credits
    svg.append("text")
      .attr("class", "source_credit")
      .attr("x", 0)
      .attr("y", height + marginBottom - 13)
      .style("font-size", creditSize)
      .style("font-family", "sans-serif")
      .text("Source: https://www.kaggle.com/datasets/mayankanand2701/samsung-stock-price-dataset")
    
    svg.append("text")
      .attr("class", "source_credit")
      .attr("x", 0)
      .attr("y", height + marginBottom - 3)
      .style("font-size", creditSize)
      .style("font-family", "sans-serif")
      .text("Format Inspired by: https://www.youtube.com/watch?v=Wk8pIxcidv8")

  }
})