import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from '../assets/air_quality_timeseries.json';
import laCountyData from "../assets/los-angeles-county.ts";
import "./AirQualityDashboard.css";

interface MonitoringStationsProps {
  selectedStation: string;
  onStationChange: (station: string) => void;
}
  
const MonitoringStations: React.FC<MonitoringStationsProps> = ({
  selectedStation,
  onStationChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // const [selectedStation, setSelectedStation] = useState<string>('');

  const drawMap = async () => {
  if (!mapRef.current) return;

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width = (mapRef.current.clientWidth) / 2 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Clear previous content
  d3.select(mapRef.current).selectAll('*').remove();

  const svg = d3.select(mapRef.current)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  try {
    // Create a tooltip div
    const tooltip = d3.select(mapRef.current)
      .append('div')
      .attr('class', 'map-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)')
      .style('pointer-events', 'none')
      .style('z-index', '100');
      
    // Create projection centered on LA County
    const projection = d3.geoMercator()
      .fitSize([width, height], laCountyData);

    const path = d3.geoPath()
      .projection(projection);

    // Draw base map
    svg.append('g')
      .selectAll('path')
      .data(laCountyData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);

    // Add stations
    const stationGroups = svg.append('g')
      .selectAll('.station')
      .data(data.stations)
      .enter()
      .append('g')
      .attr('class', 'station')
      .attr('transform', d => {
        const coords = projection([d['Site Longitude'], d['Site Latitude']]);
        return coords ? `translate(${coords[0]},${coords[1]})` : 'translate(0,0)';
      });

    // Add station circles
    stationGroups.append('circle')
      .attr('r', d => d['Site ID'].toString() === selectedStation ? 12 : 8)
      .attr('fill', d => d['Site ID'].toString() === selectedStation ? '#f44336' : '#2196F3')
      .attr('opacity', 0)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .transition()
      .duration(1000)
      .attr('opacity', 0.7);

    // Add interactivity
    stationGroups
      .on('mouseover', function(event, d) {
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${d['Local Site Name']}</strong><br/>
          Longitude: ${d['Site Longitude'].toFixed(4)}<br/>
          Latitude: ${d['Site Latitude'].toFixed(4)}<br/>
          Monitored Pollutants: ${d.Pollutant.join(', ')}
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);

        // Highlight station
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 12)
          .attr('opacity', 1);

        // Add temporary label
        d3.select(this)
          .append('text')
          .attr('class', 'station-label')
          .attr('dy', -10)
          .text(d['Local Site Name'])
          .style('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('opacity', 0)
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function(event, d) {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);

        // Remove highlight
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d['Site ID'].toString() === selectedStation ? 12 : 8)
          .attr('opacity', 0.7);

        // Remove temporary label
        d3.select(this).select('.station-label').remove();
      })
      .on('click', (event, d) => {
        const newSelectedStation = d['Site ID'].toString() === selectedStation ? '' : d['Site ID'].toString();
        onStationChange(newSelectedStation);

        // Update all stations' appearance
        stationGroups.selectAll('circle')
          .transition()
          .duration(200)
          .attr('r', d => d['Site ID'].toString() === newSelectedStation ? 12 : 8)
          .attr('fill', d => d['Site ID'].toString() === newSelectedStation ? '#f44336' : '#2196F3')
          .attr('opacity', 0.7);
      });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        svg.selectAll('path')
          .attr('transform', event.transform);
        svg.selectAll('.station')
          .attr('transform', function(d: any) {
            const coords = projection([d['Site Longitude'], d['Site Latitude']]);
            return coords ? 
              `translate(${event.transform.applyX(coords[0])},${event.transform.applyY(coords[1])})` :
              'translate(0,0)';
          });
      });

    svg.call(zoom as any);

    } catch (error) {
      console.error('Error loading map data:', error);
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('Error loading map data');
    }
  };

  useEffect(() => {
    drawMap();
  }, [selectedStation]);

  useEffect(() => {
    const handleResize = () => {
      drawMap();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Monitoring Station Distribution</h2>
          <div className="mb-4">
            <select
              value={selectedStation}
              onChange={(e) => onStationChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Stations</option>
              {data.stations.map(station => (
                <option key={station['Site ID']} value={station['Site ID']}>
                  {station['Local Site Name']}
                </option>
              ))}
            </select>
          </div>
          <div ref={mapRef} className="w-full h-[400px]" />
        </div>
  );
};

export default MonitoringStations;