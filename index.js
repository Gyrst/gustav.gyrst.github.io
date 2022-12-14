

$(document).ready(function () {
    var bubbleChart = new d3.svg.BubbleChart({
      supportResponsive: true,
      //container: => use @default
      size: 1000,
      //viewBoxSize: => use @default
      innerRadius: 600 / 3.5,
      //outerRadius: => use @default
      radiusMin: 20,
      //radiusMax: use @default
      //intersectDelta: use @default
      //intersectInc: use @default
      //circleColor: use @default
      data: {
        items: [
          {
                              "text": "NEW",
                              "number": 19
                            },
                            {
                              "text": "Trump",
                              "number": 10
                            },
                            {
                              "text": "BLM",
                              "number": 10
                            },
                            {
                              "text": "prolife",
                              "number": 30
                            },
                            {
                              "text": "vaccines",
                              "number": 9
                            },
                            {
                              "text": "LGBTrights",
                              "number": 7
                            },
                            {
                              "text": "abortion",
                              "number": 4
                            },
                            {
                              "text": "lo_is_awesome",
                              "number": 40
                            },
                            {
                              "text": "jerry_is_a_jerk",
                              "number": 23
                            },
            {
                              "text": "isaac_spectrum",
                              "number": 23
                            },
                            {
                              "text": "tony_monkey",
                              "number": 5
                            },
                            {
                              "text": "prolife",
                              "number": 5
                            },
        ],
        eval: function (item) {return item.number;},
        classed: function (item) {return item.text.split(" ").join("");}
      },
      plugins: [
        {
          name: "central-click",
          options: {
            text: "(See more detail)",
            style: {
              "font-size": "12px",
              "font-style": "bold",
              "font-family": "Source Sans Pro, sans-serif",
              //"font-weight": "700",
              "text-anchor": "middle",
              "fill": "white"
            },
            attr: {dy: "65px"},
            centralClick: function() {
              alert("Here is more details!!");
            }
          }
        },
        {
          name: "lines",
          options: {
            format: [
              {// Line #0
                textField: "number",
                classed: {number: true},
                style: {
                  "font-size": "28px",
                  "font-family": "Source Sans Pro, sans-serif",
                  "text-anchor": "middle",
                  fill: "white"
                },
                attr: {
                  dy: "0px",
                  x: function (d) {return d.cx;},
                  y: function (d) {return d.cy;}
                }
              },
              {// Line #1
                textField: "text",
                classed: {text: true},
                style: {
                  "font-size": "14px",
                  "font-family": "Source Sans Pro, sans-serif",
                  "text-anchor": "middle",
                  fill: "white"
                },
                attr: {
                  dy: "20px",
                  x: function (d) {return d.cx;},
                  y: function (d) {return d.cy;}
                }
              }
            ],
            centralFormat: [
              {// Line #0
                style: {"font-size": "50px"},
                attr: {}
              },
              {// Line #1
                style: {"font-size": "30px"},
                attr: {dy: "40px"}
              }
            ]
          }
        }]
    });
  });
  