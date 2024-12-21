// components/VennDiagram.js
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import * as venn from "venn.js";
import { Card } from 'antd';

const VennDiagram = () => {
  const [selectedDisease, setSelectedDisease] = useState("Asthma");

  // Define the data for the Venn diagram with more diseases
  const vennData = [
    {
      sets: ["PM"], // PM group
      size: 6,
      label: "PM",
    },
    {
      sets: ["NOx"], // NOx group
      size: 5,
      label: "NOx",
    },
    {
      sets: ["VOCs"], // VOCs group
      size: 4,
      label: "VOCs",
    },
    {
      sets: ["SO2"], // SO2 group
      size: 4,
      label: "SO2",
    },
    {
      sets: ["CO"], // CO group
      size: 3,
      label: "CO",
    },
    {
      sets: ["Ozone"], // Ozone group
      size: 4,
      label: "Ozone",
    },
    {
      sets: ["Ammonia"], // Ammonia group
      size: 3,
      label: "Ammonia",
    },
    {
      sets: ["Methane"], // Methane group
      size: 3,
      label: "Methane",
    },
    {
      sets: ["Lead"], // Lead group
      size: 3,
      label: "Lead",
    },
    {
      sets: ["Arsenic"], // Arsenic group
      size: 3,
      label: "Arsenic",
    },
    {
      sets: ["Black Carbon"], // Black Carbon group
      size: 4,
      label: "Black Carbon",
    },
    {
      sets: ["Hydrogen Sulfide"], // Hydrogen Sulfide group
      size: 3,
      label: "Hydrogen Sulfide",
    },
    {
      sets: ["Formaldehyde"], // Formaldehyde group
      size: 3,
      label: "Formaldehyde",
    },
    // Diseases
    {
      sets: ["Asthma"], // Asthma disease
      size: 5,
      label: "Asthma",
    },
    {
      sets: ["Pulmonary Disease"], // Pulmonary Disease group
      size: 6,
      label: "Pulmonary Disease",
    },
    {
      sets: ["Cardiovascular Disease"], // Cardiovascular Disease group
      size: 7,
      label: "Cardiovascular Disease",
    },
    {
      sets: ["Diabetes"], // Diabetes disease
      size: 5,
      label: "Diabetes",
    },
    {
      sets: ["Chronic Bronchitis"], // Chronic Bronchitis disease
      size: 4,
      label: "Chronic Bronchitis",
    },
    {
      sets: ["Lung Cancer"], // Lung Cancer disease
      size: 6,
      label: "Lung Cancer",
    },
    // Intersections between pollutants and diseases
    {
      sets: ["PM", "Asthma"], 
      size: 2,
    },
    {
      sets: ["NOx", "Asthma"],
      size: 3,
    },
    {
      sets: ["VOCs", "Asthma"],
      size: 2,
    },
    {
      sets: ["SO2", "Asthma"],
      size: 2,
    },
    {
      sets: ["CO", "Asthma"],
      size: 1,
    },
    {
      sets: ["Ozone", "Asthma"],
      size: 2,
    },
    {
      sets: ["Ammonia", "Asthma"],
      size: 1,
    },
    {
      sets: ["Methane", "Asthma"],
      size: 1,
    },
    {
      sets: ["Lead", "Asthma"],
      size: 1,
    },
    {
      sets: ["Arsenic", "Asthma"],
      size: 1,
    },
    {
      sets: ["Black Carbon", "Asthma"],
      size: 1,
    },
    {
      sets: ["Hydrogen Sulfide", "Asthma"],
      size: 1,
    },
    {
      sets: ["Formaldehyde", "Asthma"],
      size: 1,
    },
    {
      sets: ["PM", "Pulmonary Disease"], 
      size: 3,
    },
    {
      sets: ["NOx", "Pulmonary Disease"],
      size: 4,
    },
    {
      sets: ["SO2", "Pulmonary Disease"],
      size: 3,
    },
    {
      sets: ["CO", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Ozone", "Pulmonary Disease"],
      size: 3,
    },
    {
      sets: ["Ammonia", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Methane", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Lead", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Arsenic", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Black Carbon", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Hydrogen Sulfide", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["Formaldehyde", "Pulmonary Disease"],
      size: 2,
    },
    {
      sets: ["PM", "Cardiovascular Disease"],
      size: 3,
    },
    {
      sets: ["NOx", "Cardiovascular Disease"],
      size: 4,
    },
    {
      sets: ["SO2", "Cardiovascular Disease"],
      size: 3,
    },
    {
      sets: ["CO", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Ozone", "Cardiovascular Disease"],
      size: 3,
    },
    {
      sets: ["Ammonia", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Methane", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Lead", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Arsenic", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Black Carbon", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Hydrogen Sulfide", "Cardiovascular Disease"],
      size: 2,
    },
    {
      sets: ["Formaldehyde", "Cardiovascular Disease"],
      size: 2,
    },
    // Add intersections for new diseases
    {
      sets: ["PM", "Diabetes"],
      size: 2,
    },
    {
      sets: ["NOx", "Diabetes"],
      size: 2,
    },
    {
      sets: ["SO2", "Diabetes"],
      size: 1,
    },
    {
      sets: ["CO", "Diabetes"],
      size: 1,
    },
    {
      sets: ["Ozone", "Diabetes"],
      size: 2,
    },
    {
      sets: ["PM", "Chronic Bronchitis"],
      size: 2,
    },
    {
      sets: ["NOx", "Chronic Bronchitis"],
      size: 2,
    },
    {
      sets: ["SO2", "Chronic Bronchitis"],
      size: 1,
    },
    {
      sets: ["PM", "Lung Cancer"],
      size: 2,
    },
    {
      sets: ["NOx", "Lung Cancer"],
      size: 2,
    },
    {
      sets: ["SO2", "Lung Cancer"],
      size: 1,
    },
  ];

  useEffect(() => {
    // Filter the data based on the selected disease
    const filteredData = vennData.filter(item => 
      item.sets.includes(selectedDisease) || item.sets.length === 1
    );

    // Set up the Venn diagram
    const chart = venn.VennDiagram();

    // Create SVG element and render the Venn diagram inside it
    const svg = d3.select("#vennDiagram")
      //.append("svg")
      //.attr("width", 900) // Adjust the width here
      //.attr("height", 650) // Adjust the height here
      .datum(filteredData)
      .call(chart);

    svg.selectAll("text")
    .style("font-size", "10px") // Adjust the font size here
    .style("fill", "#333"); // Optional: Change text color
  }, [selectedDisease]);

  // Handle dropdown change
  const handleSelectChange = (event) => {
    setSelectedDisease(event.target.value);
  };

  return (
    <div>
      <Card title="Venn Diagram"  >
        <label htmlFor="diseaseSelect">Select Disease:</label>
        <select id="diseaseSelect" value={selectedDisease} onChange={handleSelectChange}>
          <option value="Asthma">Asthma</option>
          <option value="Pulmonary Disease">Pulmonary Disease</option>
          <option value="Cardiovascular Disease">Cardiovascular Disease</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Chronic Bronchitis">Chronic Bronchitis</option>
          <option value="Lung Cancer">Lung Cancer</option>
        </select>
        <div id="vennDiagram" style={{width: '100%', height: '0', paddingBottom: '100%', position: 'relative', 
      }}></div>
      </Card>
    </div>
  );
};

export default VennDiagram;