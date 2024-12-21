import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from '../assets/air_quality_timeseries.json';
import "./AirQualityDashboard.css";

interface CoverageAQIProps {
  selectedStation: string;
  selectedPollutant: string;
}

const CoverageAQI: React.FC<CoverageAQIProps> = ({selectedStation, selectedPollutant}) => {
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  const drawBarChart = () => {
    if (!barChartRef.current) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = barChartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    d3.select(barChartRef.current).selectAll('*').remove()

    const svg = d3.select(barChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    let stationStats = data.stationStats
    if (selectedStation) {
      stationStats = stationStats.filter(d => d['Site ID'].toString() === selectedStation)
    }

    const allPollutants = data.metadata.pollutants;// metadata.value.pollutants.filter(p => p !== 'ALL')
    
    let pollutantCounts = {}
    allPollutants.forEach(pollutant => {
      pollutantCounts[pollutant] = 0
    })

    stationStats.forEach(stat => {
      if (stat.Pollutant in pollutantCounts) {
        pollutantCounts[stat.Pollutant]++
      }
    })

    const totalStations = selectedStation ? 1 : data.stations.length

    const barData = allPollutants.map(pollutant => ({
      pollutant,
      count: pollutantCounts[pollutant],
      percentage: (pollutantCounts[pollutant] / totalStations) * 100
    }))

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(allPollutants)
      .padding(0.3)

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, 100])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => d + '%'))

    const bars = svg.selectAll('.bar')
      .data(barData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.pollutant))
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => d.pollutant === selectedPollutant ? '#f44336' : '#2196F3')

    bars.transition()
      .duration(1000)
      .attr('y', d => y(d.percentage))
      .attr('height', d => height - y(d.percentage))

    svg.selectAll('.bar-label')
      .data(barData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.pollutant) + x.bandwidth() / 2)
      .attr('y', d => y(d.percentage) - 5)
      .attr('text-anchor', 'middle')
      .text(d => `${d.percentage.toFixed(1)}%`)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1)
  }

  const drawPieChart = () => {
    if (!pieChartRef.current) return;
  
    const margin = { top: 20, right: 350, bottom: 20, left: 20 };
    const width = pieChartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
  
    // Clear previous content
    d3.select(pieChartRef.current).selectAll('*').remove();
  
    const svg = d3.select(pieChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width/2 + margin.left},${height/2 + margin.top})`);
  
    // Filter data based on selected station
    let filteredData = data.timeSeriesData;
    if (selectedStation) {
      filteredData = filteredData.filter(d => d['Site ID'].toString() === selectedStation);
    }
  
    // Define AQI ranges and colors
    const aqiRanges = [
      { name: 'Good', range: '0-50', min: 0, max: 50, color: '#00e400' },
      { name: 'Moderate', range: '51-100', min: 51, max: 100, color: '#ffff00' },
      { name: 'Unhealthy for Sensitive Groups', range: '101-150', min: 101, max: 150, color: '#ff7e00' },
      { name: 'Unhealthy', range: '151-200', min: 151, max: 200, color: '#ff0000' },
      { name: 'Very Unhealthy', range: '201-300', min: 201, max: 300, color: '#99004c' },
      { name: 'Hazardous', range: '>300', min: 301, max: Infinity, color: '#7e0023' }
    ];
  
    // Calculate AQI distribution
    const pieData = aqiRanges.map(range => ({
      ...range,
      value: filteredData.filter(d => 
        d['Daily AQI Value'] >= range.min && 
        d['Daily AQI Value'] <= range.max
      ).length
    })).filter(d => d.value > 0);
  
    const total = d3.sum(pieData, d => d.value);
  
    // Create pie layout
    const pie = d3.pie<(typeof pieData)[0]>()
      .value(d => d.value)
      .sort(null);
  
    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<(typeof pieData)[0]>>()
      .innerRadius(radius * 0.4)  // Create donut hole
      .outerRadius(radius * 0.8);
  
    // Create arcs
    const arcs = svg.selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');
  
    // Add path for each arc
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });
  
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${radius + 30}, ${-radius})`);
  
    const legendItems = legend.selectAll('.legend-item')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 60})`);
  
    // Add color boxes to legend
    legendItems.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', d => d.color)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);
  
    // Add text to legend
    const legendText = legendItems.append('text')
      .attr('x', 30)
      .attr('y', 15)
      .style('font-size', '12px')
      .style('opacity', 0);
  
    legendText.append('tspan')
      .text(d => `${d.name} (${d.range})`)
      .style('font-weight', 'bold');
  
    legendText.append('tspan')
      .attr('x', 30)
      .attr('dy', '1.2em')
      .text(d => `${d.value} times (${(d.value/total*100).toFixed(1)}%)`);
  
    legendText.transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 1);
  
    // Add center text
    const centerText = svg.append('text')
      .attr('text-anchor', 'middle')
      .style('opacity', 0);
  
    centerText.append('tspan')
      .text('AQI')
      .attr('x', 0)
      .attr('dy', '0em')
      .style('font-size', '24px')
      .style('font-weight', 'bold');
  
    centerText.append('tspan')
      .text('Distribution')
      .attr('x', 0)
      .attr('dy', '1.2em')
      .style('font-size', '18px');
  
    centerText.transition()
      .delay(1500)
      .duration(500)
      .style('opacity', 1);
  };

  useEffect(() => {
    drawBarChart();
    drawPieChart();
  }, [selectedPollutant, selectedStation]);

  useEffect(() => {
    const handleResize = () => {
      drawBarChart();
      drawPieChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="two-charts row">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Station Pollutant Coverage</h2>
        <div ref={barChartRef} className="chart" />
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">AQI Distribution</h2>
        <div ref={pieChartRef} className="chart" />
      </div>
    </div>
  );
};

export default CoverageAQI;