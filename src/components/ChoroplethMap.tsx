import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, Space, Select } from 'antd';
import './ChoroStyle.css';

interface PollutionData {
  location_name: string;
  [year: string]: number | string;
}

interface ChoroplethMapProps {
  HAPData: PollutionData[];
  NO2Data: PollutionData[];
  OzoneData: PollutionData[];
  PM25Data: PollutionData[];
}

type PollutantType = 'HAP' | 'NO2' | 'Ozone' | 'PM2.5';

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ HAPData, NO2Data, OzoneData, PM25Data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>('HAP');

  // Name mapping for countries
  const nameMapping = {
    "Russian Federation": "Russia",
    "Venezuela (Bolivarian Republic of)": "Venezuela",
    "Iran (Islamic Republic of)": "Iran",
    "Bolivia (Plurinational State of)": "Bolivia",
    "South Sudan": "S. Sudan",
    "United Republic of Tanzania": "Tanzania",
    "Central African Republic": "Central African Rep.",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "Syrian Arab Republic": "Syria",
    "Viet Nam": "Vietnam",
    "Lao People's Democratic Republic": "Laos",
    "Democratic People's Republic of Korea": "North Korea",
    "Republic of Korea": "South Korea",
    "Dominican Republic": "Dominican Rep.",
    "Bosnia and Herzegovina": "Bosnia and Herz.",
    "Republic of Moldova": "Moldova",
    "United States of America": "USA"
  };

  const transformData = (data: PollutionData[]) => {
    return data.map(item => {
      const newName = nameMapping[item.location_name as keyof typeof nameMapping];
      return newName ? { ...item, location_name: newName } : item;
    });
  };

  const getDataForPollutant = (type: PollutantType) => {
    switch (type) {
      case 'HAP':
        return transformData(HAPData);
      case 'NO2':
        return transformData(NO2Data);
      case 'Ozone':
        return transformData(OzoneData);
      case 'PM2.5':
        return transformData(PM25Data);
    }
  };

  const getPollutantRange = (type: PollutantType) => {
    switch (type) {
      case 'HAP':
        return [0, 1];
      case 'NO2':
        return [0, 10];
      case 'Ozone':
        return [20, 60];
      case 'PM2.5':
        return [0, 100];
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 928;
    const height = 550;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const projection = d3.geoNaturalEarth1()
      .fitSize([width - margin.left - margin.right, height ], { type: "Sphere" });
    const path = d3.geoPath(projection);

    const currentData = getDataForPollutant(selectedPollutant);
    const [minValue, maxValue] = getPollutantRange(selectedPollutant);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([minValue, maxValue]);

    // Add sphere and graticules
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("fill", "#f8f9fa")
      .attr("stroke", "#ddd")
      .attr("d", path);

    svg.append("path")
      .datum(d3.geoGraticule())
      .attr("fill", "none")
      .attr("stroke", "#eee")
      .attr("d", path);

    // Create legend
    const legendWidth = 200;
    const legendHeight = 20;

    const legendScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5);

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - legendWidth}, ${margin.top/2})`);

    // Create gradient
    const defs = svg.append('defs');
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    linearGradient
      .selectAll('stop')
      .data(colorScale.ticks(10))
      .enter()
      .append('stop')
      .attr('offset', (d, i) => `${(i * 100) / 9}%`)
      .attr('stop-color', d => colorScale(d));

    legend
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    legend
      .append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${selectedPollutant} Pollution Levels (${selectedYear})`);

    // Load and render world map
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(
      (worldData: any) => {
        svg
          .append('g')
          .selectAll('path')
          .data(worldData.features)
          .join('path')
          .attr('d', path)
          .attr('class', 'country')
          .attr('fill', (d: any) => {
            const locationData = currentData.find(item => 
              item.location_name.toLowerCase() === d.properties.name.toLowerCase()
            );
            if (locationData) {
              return colorScale(Number(locationData[selectedYear.toString()]));
            }
            return '#ccc';
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', function(event, d: any) {
            const locationData = currentData.find(item => 
              item.location_name.toLowerCase() === d.properties.name.toLowerCase()
            );
            
            if (locationData) {
              d3.select(this)
                .attr('stroke-width', 2)
                .attr('stroke', '#000');

              const [x, y] = path.centroid(d);
              const value = Number(locationData[selectedYear.toString()]).toFixed(2);

              const tooltip = svg
                .append('g')
                .attr('class', 'tooltip')
                .attr('transform', `translate(${x}, ${y})`);

              tooltip
                .append('rect')
                .attr('x', -100)
                .attr('y', -40)
                .attr('width', 200)
                .attr('height', 50)
                .attr('fill', 'white')
                .attr('stroke', '#ccc')
                .attr('rx', 5);

              tooltip
                .append('text')
                .attr('x', 0)
                .attr('y', -15)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text(d.properties.name);

              tooltip
                .append('text')
                .attr('x', 0)
                .attr('y', 5)
                .attr('text-anchor', 'middle')
                .text(`${value} units`);
            }
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('stroke-width', 0.5)
              .attr('stroke', '#fff');
            svg.selectAll('.tooltip').remove();
          });
      }
    );
  }, [selectedYear, selectedPollutant, HAPData, NO2Data, OzoneData, PM25Data]);

  const years = Array.from({ length: 31 }, (_, i) => 1990 + i);
  const pollutants: PollutantType[] = ['HAP', 'NO2', 'Ozone', 'PM2.5'];

  return (
    <Card title="Global Pollution Levels" className="map-card">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Select
            style={{ width: 200 }}
            value={selectedYear}
            onChange={setSelectedYear}
            options={years.map(year => ({ value: year, label: year.toString() }))}
          />
          <Select
            style={{ width: 200 }}
            value={selectedPollutant}
            onChange={setSelectedPollutant}
            options={pollutants.map(p => ({ value: p, label: p }))}
          />
        </Space>
        <svg ref={svgRef}></svg>
      </Space>
    </Card>
      
  );
};

export default ChoroplethMap;
