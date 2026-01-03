const { Parser } = require("json2csv");

function graphToCsvString(graph) {
  const rows = graph.spheres.map((sphere) => {
    const connections = graph.connections
      .filter((c) => c.from === sphere.name || c.to === sphere.name)
      .map((c) => `${c.from} ${c.symbol} ${c.to}`)
      .join("; ") || "No connections";

    return {
      "Sphere Name": sphere.name,
      Color: sphere.color,
      Radius: sphere.radius,
      Connections: connections,
    };
  });

  const parser = new Parser({
    fields: ["Sphere Name", "Color", "Radius", "Connections"],
  });

  return parser.parse(rows);
}

module.exports = { graphToCsvString };
