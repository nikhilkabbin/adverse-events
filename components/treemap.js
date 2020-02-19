/*jshint esversion: 6 */

class treeMap {
  constructor(dom, data, config) {
    this.data = data;
    this.element = dom;
    this.colors = config.colors;

    // create the chart
    this.draw();
  }

  draw() {
    this.margin = {
      top: 20,
      right: 10,
      bottom: 20,
      left: 0
    };
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;

    this.w = this.width + this.margin.left + this.margin.right;
    this.h = this.height + this.margin.top + this.margin.bottom;

    this.element.innerHTML = '';
    console.log(this.element)
    const svg = d3.select(this.element).append('svg');
    // svg.attr("height", 300);
    svg.attr('preserveAspectRatio', 'xMinYMin meet');
    svg.attr('viewBox', '0 0 ' + this.w + ' ' + this.h);

    this.plot = svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.treemap = d3.treemap()
      .padding(1)
      .round(true);

    // create the other stuff
    this.drawShapes();
  }

  drawShapes() {
    let _this = this;
    let duration = 1000;

    let root = d3.hierarchy(this.data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    this.treemap.size([this.w, this.h]);
    const leaves = this.treemap(root).leaves();

    const rects = this.plot.selectAll(".rect")
      .data(leaves, d => d.data.name);

    const labels = this.plot.selectAll(".label")
      .data(leaves.filter(f => f.x1 - f.x0 > 60 && f.y1 - f.y0 > 30), d => d.data.name);

    rects.exit()
      .transition().duration(duration)
      .remove();

    rects.transition().duration(duration)
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);

    rects.enter().append("rect")
      .attr("class", "rect")
      .style("fill", d => _this.colors(d.data.color/100))
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .transition().duration(duration);

    labels.exit()
      .style("opacity", 1)
      .transition().duration(duration)
      .style("opacity", 1e-6)
      .remove();

    // labels
    //   .html(d => `<tspan style="font-size: 0.8rem">${d.data.name}</tspan><tspan dx=10>${d.data.value}</tspan>`)
    //   .transition().duration(duration)
    //   .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

    labels.enter().append('text')
          .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
          .selectAll('tspan')
          .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
          .enter()
          .append('tspan')
          .attr('font-size', '8px')
          .attr('x', 4)
          .attr('y', (d, i) => 13 + 10*i)
          .style("opacity", 1e-6)
          .transition().duration(duration)
          .style("opacity", 1)
          .text(d => d);

    // labels.enter().append("text")
    //   .attr("class", "label")
    //   .attr("dy", 16)
    //   .attr("dx", 5)
    //   .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
    //   .html(d => `<tspan style="font-size: 0.8rem">${d.data.name}</tspan>`)
    //   .style("opacity", 1e-6)
    //   .transition().duration(duration)
    //   .style("opacity", 1);
  }

  update(newData) {
    this.data = newData;

    // update shapes
    this.drawShapes();
  }
}