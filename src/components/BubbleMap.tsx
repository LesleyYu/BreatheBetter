import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, Space, Select } from 'antd';
import countryCoordinates from '../assets/country-codes-lat-lng1.json';

interface PollutionData {
  location_name: string;
  [year: string]: number | string;
}

interface BubbleMapProps {
  HAPData: PollutionData[];
  NO2Data: PollutionData[];
  OzoneData: PollutionData[];
  PM25Data: PollutionData[];
}

type PollutantType = 'HAP' | 'NO2' | 'Ozone' | 'PM2.5';

const BubbleMap: React.FC<BubbleMapProps> = ({ HAPData, NO2Data, OzoneData, PM25Data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedYear, setSelectedYear] = React.useState<number>(2000);
  const [selectedPollutant, setSelectedPollutant] = React.useState<PollutantType>('HAP');

  const dimensions = {
    width: 928,
    height: 600,
    margin: { top: 40, right: 40, bottom: 40, left: 40 }
  };

  const getDataForPollutant = (type: PollutantType) => {
    switch (type) {
      case 'HAP':
        return HAPData;
      case 'NO2':
        return NO2Data;
      case 'Ozone':
        return OzoneData;
      case 'PM2.5':
        return PM25Data;
    }
  };

  const getPollutantRange = (type: PollutantType) => {
    switch (type) {
      case 'HAP':
        return [0, 1];
      case 'NO2':
        return [0, 35];
      case 'Ozone':
        return [11, 90];
      case 'PM2.5':
        return [3, 110];
    }
  };

  const getUnitLabel = (type: PollutantType) => {
    switch (type) {
      case 'HAP':
        return 'HAP Index';
      case 'NO2':
        return 'ppb';
      case 'Ozone':
        return 'ppb';
      case 'PM2.5':
        return 'μg/m³';
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create projection
    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Get current data and process it
    const currentData = getDataForPollutant(selectedPollutant);
    const [minValue, maxValue] = getPollutantRange(selectedPollutant);

    // Load and draw world map
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((worldData: any) => {
        // Draw base map
        svg.append('g')
          .selectAll('path')
          .data(worldData.features)
          .join('path')
          .attr('d', pathGenerator)
          .attr('fill', '#f0f0f0')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 0.5);

        // Process data for bubbles
        const yearData = currentData.map(location => {
            // Try to find the country in the coordinates data
            const countryName = location.location_name;
            const countryData = countryCoordinates.ref_country_codes.find(
              c => c.country.toLowerCase() === countryName.toLowerCase()
            );

            if (countryData) {
              return {
                location: location.location_name,
                value: Number(location[selectedYear.toString()]) || 0,
                coordinates: projection([countryData.longitude, countryData.latitude])
              };
            }
            return null;
          })
          .filter((d): d is { location: string; value: number; coordinates: [number, number] } => 
            d !== null && d.coordinates !== null
          );

        // Create scale for bubble size
        const radiusScale = d3.scaleSqrt()
          .domain([minValue, maxValue])
          .range([5, 20]);

        // Add bubbles
        const bubbleGroup = svg.append('g');
        
        bubbleGroup.selectAll('circle')
          .data(yearData)
          .join('circle')
          .attr('cx', d => d.coordinates[0])
          .attr('cy', d => d.coordinates[1])
          .attr('r', d => radiusScale(d.value))
          .attr('fill', '#1890ff')
          .attr('fill-opacity', 0.6)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', function(event, d) {
            d3.select(this)
              .attr('fill-opacity', 0.8);
            
            // Add tooltip
            const tooltip = svg.append('g')
              .attr('class', 'tooltip')
              .attr('transform', `translate(${d.coordinates[0]}, ${d.coordinates[1] - radiusScale(d.value) - 10})`);

            tooltip.append('rect')
              .attr('x', -60)
              .attr('y', -30)
              .attr('width', 120)
              .attr('height', 40)
              .attr('fill', 'white')
              .attr('stroke', '#ccc')
              .attr('rx', 4);

            tooltip.append('text')
              .attr('x', 0)
              .attr('y', -15)
              .attr('text-anchor', 'middle')
              .style('font-size', '12px')
              .style('font-weight', 'bold')
              .text(d.location);

            tooltip.append('text')
              .attr('x', 0)
              .attr('y', 0)
              .attr('text-anchor', 'middle')
              .style('font-size', '12px')
              .text(`${d.value.toFixed(2)} ${getUnitLabel(selectedPollutant)}`);
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('fill-opacity', 0.6);
            svg.selectAll('.tooltip').remove();
          });

        // Add legend
        const legend = svg.append('g')
          .attr('transform', `translate(${dimensions.width - 120}, ${dimensions.height - 100})`);

        const legendValues = [maxValue, maxValue/2, maxValue/4];
        
        legend.selectAll('circle')
          .data(legendValues)
          .join('circle')
          .attr('cy', (d, i) => -radiusScale(d))
          .attr('r', d => radiusScale(d))
          .attr('fill', 'none')
          .attr('stroke', '#666');

        legend.selectAll('text')
          .data(legendValues)
          .join('text')
          .attr('y', d => -2 * radiusScale(d))
          .attr('x', 40)
          .text(d => d.toFixed(1));

        // Add legend title
        legend.append('text')
          .attr('y', 20)
          .attr('x', 0)
          .style('font-size', '12px')
          .text(getUnitLabel(selectedPollutant));
      });
  }, [selectedYear, selectedPollutant, HAPData, NO2Data, OzoneData, PM25Data]);

  const years = Array.from({ length: 31 }, (_, i) => 1990 + i);
  const pollutants: PollutantType[] = ['HAP', 'NO2', 'Ozone', 'PM2.5'];

  return (
    <Card title="Global Pollution Bubble Map" className="map-card">
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
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Space>
    </Card>
  );
};

export default BubbleMap;