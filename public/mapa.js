d3.json("areas.json").then(function (data) {
  // Specify the dimensions of the chart.
  const width = 1920;
  const height = window.innerHeight + 50;

  let raio = 20;

  // Create the SVG container.
  let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;")
    .attr("id", "svg_map");

  // Specify the color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  const links = data.links.map((d) => ({ ...d }));
  const nodes = data.nodes.map((d) => ({ ...d }));

  // Create a simulation with several forces.
  let simulation = d3
    .forceSimulation(nodes)
    .nodes(nodes)

    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force(
      "charge",
      d3.forceCollide((d) => d.radius)
    )
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  // Add a line for each link, and a circle for each node.
  let link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.8)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  let node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 4)
    .selectAll("g")
    .data(nodes)
    .join("g");

  let circ = node
    .append("circle")
    .attr("r", (d) => d.radius - 10)
    //.attr("fill", (d) => color(d.group))
    .attr("fill", "white")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => d.radius);

  let imagem = node
    .append("image")
    .attr("x", (d) => d.x - d.radius)
    .attr("y", (d) => d.y - d.radius)
    .attr("width", (d) => d.radius * 2)
    .attr("height", (d) => d.radius * 2)
    .attr("xlink:href", (d) => "assets/" + d.id + ".svg");

  node.append("title").text((d) => d.id);

  // Add a drag behavior.
  node.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

  // Set the position attributes of links and nodes each time the simulation ticks.
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke-width", (d) => d.value);

    node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.radius);

    circ
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.radiusp + 10);

    imagem
      .attr("x", (d) => d.x - d.radius)
      .attr("y", (d) => d.y - d.radius)
      .attr("width", (d) => d.radius * 2)
      .attr("height", (d) => d.radius * 2);

    simulation
      .force(
        "charge",
        d3.forceCollide((d) => d.radius + 20)
      )
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force(
        "link",
        d3.forceLink(links).distance((d) => 200)
      );
  });

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    for (let i = 0; i < data.nodes.length; i++) {
      if (data.nodes[i].id == event.subject.id) {
        data.nodes[i].radius += 3;
        event.subject.radius += 3;
      }
    }

    for (let i = 0; i < data.links.length; i++) {
      let raioSource, raioTarget;

      for (let j = 0; j < data.nodes.length; j++) {
        if (data.nodes[j].id == data.links[i].source) {
          raioSource = data.nodes[j].radius;
        }
        if (data.nodes[j].id == data.links[i].target) {
          raioTarget = data.nodes[j].radius;
        }
      }

      data.links[i].value = (raioSource + raioTarget) / 2;
    }
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    event.subject.fx = null;
    event.subject.fy = null;
  }
});
