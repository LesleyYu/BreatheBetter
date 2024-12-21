import React, { useEffect } from "react";
import * as d3 from "d3";
import { Card } from 'antd';
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

const SimpleSankey = () => {
  useEffect(() => {
    // Multi-level data
    const data = {
      nodes: [
        { name: "Fossil Fuel" }, //0
        { name: "Industrial Emission" }, //1
        { name: "Transportation" }, //2
        { name: "Agricultural Practices" }, //3
        { name: "Deforestration" }, //4
        { name: "Household Activities" }, //5
        { name: "Volcanic Eruptions" }, //6
        { name: "Dust Storm" }, //7
        { name: "Wild Fires" }, //8
        { name: "Lightning Strikes" }, //9
        { name: "Pollen Dispersal" }, //10
        { name: "Greenhouse Gases" }, //11
        { name: "CO" }, //12
        { name: "SO2" }, //13
        { name: "NOx" }, //14
        { name: "PM" }, //15
        { name: "VOCs" }, //16
        { name: "Ammonia (NH3)" }, //17
        { name: "Toxic chemicals" }, //18
        { name: "Toxic Metals" }, //19
        { name: "Radioactive gases" }, //20
        { name: "Asbestos" }, //21
        { name: "Asthama" }, //22
        { name: "Pulmonary Disease" }, //23
        { name: "Cardiovascular Disease" }, //24
        { name: "Lung Cancer" }, //25
        { name: "Neurological Disorder" } //26
      ],
      links: [
        //  Fossil Fuel → Pollutants
        { source: 0, target: 11, value: 40 },
        { source: 0, target: 12, value: 40 },
        { source: 0, target: 13, value: 35 },
        { source: 0, target: 14, value: 35 },
        { source: 0, target: 15, value: 30 },
        { source: 0, target: 16, value: 30 },

        // Industrial Emissions -> Pollutants
        { source: 1, target: 14, value: 40 },
        { source: 1, target: 16, value: 45 },
        { source: 1, target: 15, value: 30 },
        { source: 1, target: 12, value: 35 },
        { source: 1, target: 13, value: 25 },
        { source: 1, target: 17, value: 20 },
        { source: 1, target: 19, value: 20 },

        // Transportation -> Pollutants
        { source: 2, target: 12, value: 30 },
        { source: 2, target: 14, value: 20 },
        { source: 2, target: 15, value: 25 },
        { source: 2, target: 16, value: 20 },
        { source: 2, target: 11, value: 25 },

        // Agricultural Practices -> Pollutants
        { source: 3, target: 11, value: 8 },
        { source: 3, target: 17, value: 4 },
        { source: 3, target: 18, value: 15 },

        // Deforestration -> Pollutants
        { source: 4, target: 11, value: 12 },
        { source: 4, target: 15, value: 8 },
        { source: 4, target: 19, value: 4 },
        { source: 4, target: 14, value: 15 },

        // Household Activities -> Pollutants
        { source: 5, target: 15, value: 10 },
        { source: 5, target: 16, value: 10 },
        { source: 5, target: 20, value: 10 },
        { source: 5, target: 12, value: 10 },
        { source: 5, target: 21, value: 10 },
        { source: 5, target: 19, value: 10 },

        // Volcanic eruptions -> Pollutants
        { source: 6, target: 13, value: 7 },
        { source: 6, target: 11, value: 7 },
        { source: 6, target: 18, value: 7 },
        { source: 6, target: 19, value: 7 },
        { source: 6, target: 20, value: 7 },

        // Dust Storm -> Pollutants
        { source: 7, target: 15, value: 5 },
        { source: 7, target: 19, value: 5 },

        // Wild Fires -> Pollutants
        { source: 8, target: 15, value: 4 },
        { source: 8, target: 18, value: 4 },
        { source: 8, target: 19, value: 4 },
        { source: 8, target: 11, value: 4 },

        // Lightning Strike -> Pollutants
        { source: 9, target: 14, value: 2 },

        // Pollen Dispersal -> Polluntants
        { source: 10, target: 15, value: 1 },
        { source: 10, target: 14, value: 1 },
    
        // Pollutants → Health Issues
        { source: 12, target: 22, value: 20 }, // CO → Asthma
        { source: 13, target: 22, value: 20 }, // SO2 → Asthma
        { source: 15, target: 22, value: 20 }, // PM → Asthma
        { source: 15, target: 23, value: 20 }, // PM → Pulmonary Disease
        { source: 15, target: 24, value: 20 }, // PM → Cardiovascular Disease
        { source: 14, target: 23, value: 20 }, // NOx → Pulmonary Disease
        { source: 14, target: 24, value: 20 }, // NOx → Cardiovascular Disease
        { source: 16, target: 22, value: 20 }, // VOCs → Asthma
        { source: 19, target: 26, value: 20 }, // Toxic Metals → Neurological Disorder
        { source: 19, target: 24, value: 20 }, // Toxic Metals → Cardiovascular Disease
        { source: 20, target: 25, value: 20 }, // Radioactive gases → Lung Cancer
        { source: 21, target: 25, value: 20 }, // Asbestos → Lung Cancer
        { source: 18, target: 26, value: 20 } // Toxic Chemicals -> Neurologicacl Disorder
      ]
    };

    // Dimensions
    const width = 1000;
    const height = 650;

    // Create SVG container
    const svg = d3
      .select("#sankeyDiagram")
      .attr("width", width)
      .attr("height", height+50)
      .style("font", "10px sans-serif");

    // Set up the Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 1]
      ]);

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw links
    svg
      .append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", d => color(d.source.name))
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("stroke-opacity", 0.5)
      .append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);

    // Draw nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.name))
      .append("title")
      .text(d => `${d.name}\n${d.value}`);

    // Add labels
    svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", d => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
      .text(d => d.name);
  }, []);

  return (

    <Card title="Relationship: air pollution and its health effects" className="map-card">
      <svg id="sankeyDiagram"></svg>
    </Card>
  )
    
};

export default SimpleSankey;