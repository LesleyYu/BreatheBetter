import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from '../assets/air_quality_timeseries.json';
import "./AirQualityDashboard.css";

interface TimeSeriesData {
  Date: string;
  'Site ID': number;
  Pollutant: string;
  Concentration: number;
  'Daily AQI Value': number;
  Units: string;
}

interface PollutantTrendsProps {
  selectedStation: string;
  selectedPollutant: string;
  onPollutantChange: (pollutant: string) => void;
}

const PollutantTrends: React.FC<PollutantTrendsProps> = ({
  selectedStation,
  selectedPollutant,
  onPollutantChange
}) => {
  const timeSeriesRef = useRef<HTMLDivElement>(null);

  // Copy the pollutantColors and drawTimeSeries functions from AirQualityDashboard
  const pollutantColors = {
    'PM2.5': '#FF6B6B',
    'PM10': '#4ECDC4',
    'NO2': '#45B7D1',
    'SO2': '#96CEB4',
    'CO': '#FFEEAD',
    'O3': '#D4A5A5'
  };


  const drawTimeSeries = () => {
    if (!timeSeriesRef.current) return;

    const margin = { top: 20, right: 120, bottom: 30, left: 60 };
    const width = timeSeriesRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(timeSeriesRef.current).selectAll('*').remove();

    const svg = d3.select(timeSeriesRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    let filteredData = data.timeSeriesData;
    if (selectedStation) {
      filteredData = filteredData.filter(d => d['Site ID'].toString() === selectedStation);
    }
    if (selectedPollutant !== 'ALL') {
      filteredData = filteredData.filter(d => d.Pollutant === selectedPollutant);
    }

    // If no data after filtering, show message
    if (filteredData.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No data available for selected station/pollutant');
      return;
    }

    filteredData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    const x = d3.scaleTime()
      .domain(d3.extent(filteredData, d => new Date(d.Date)) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.Concentration) || 0])
      .range([height, 0])
      .nice();

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10))
      .selectAll('text')
      .style('text-anchor', 'middle');

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Concentration');

    const drawLines = (data: TimeSeriesData[], pollutant?: string) => {
      const line = d3.line<TimeSeriesData>()
        .x(d => x(new Date(d.Date)))
        .y(d => y(d.Concentration))
        .curve(d3.curveMonotoneX);

      const path = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', pollutant ? pollutantColors[pollutant] : '#2196F3')
        .attr('stroke-width', 1)
        .attr('d', line);

      const pathLength = path.node()?.getTotalLength() || 0;
      path.attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);

      return path;
    };

    if (selectedPollutant === 'ALL') {
      const pollutants = [...new Set(filteredData.map(d => d.Pollutant))];
      
      pollutants.forEach(pollutant => {
        const pollutantData = filteredData.filter(d => d.Pollutant === pollutant);
        drawLines(pollutantData, pollutant);
      });

      // Add legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + 10}, 0)`);

      legend.selectAll('.legend-item')
        .data(pollutants)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
          g.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 10)
            .attr('y2', 10)
            .attr('stroke', d => pollutantColors[d])
            .attr('stroke-width', 2);

          g.append('text')
            .attr('x', 25)
            .attr('y', 10)
            .attr('dy', '.35em')
            .style('font-size', '12px')
            .text(d => d);
        });
    } else {
      drawLines(filteredData);

      // Add dots with tooltips
      const dots = svg.selectAll('.dot')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(new Date(d.Date)))
        .attr('cy', d => y(d.Concentration))
        .attr('r', 2)
        .attr('fill', pollutantColors[selectedPollutant])
        .style('opacity', 0.4)
        .transition()
        .delay((d, i) => i * 10)
        .style('opacity', 0.4);
    }
  };
  
  useEffect(() => {
    drawTimeSeries();
  }, [selectedPollutant, selectedStation]);

  useEffect(() => {
    const handleResize = () => {
      drawTimeSeries();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="card bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Pollutant Concentration Trends</h2>
      <div className="mb-4">
        <label className="mr-2 text-gray-600">Select Pollutant:</label>
        <select 
          value={selectedPollutant}
          onChange={(e) => onPollutantChange(e.target.value)}
          className="p-2 border rounded"
        >
          {['ALL', ...data.metadata.pollutants].map(pollutant => (
            <option key={pollutant} value={pollutant}>{pollutant}</option>
          ))}
        </select>
      </div>
      <div ref={timeSeriesRef} className="w-full h-[400px]" />
    </div>
  );
};

export default PollutantTrends;