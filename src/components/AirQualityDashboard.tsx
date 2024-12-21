import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from '../assets/air_quality_timeseries.json';
import laCountyData from "../assets/los-angeles-county.ts";
import "./AirQualityDashboard.css";

interface TimeSeriesData {
  Date: string;
  'Site ID': number;
  Pollutant: string;
  Concentration: number;
  'Daily AQI Value': number;
  Units: string;
}

interface Station {
  'Site ID': number;
  'Local Site Name': string;
  'Site Latitude': number;
  'Site Longitude': number;
  Pollutant: string[];
}

interface GeoData {
  type: string;
  features: Array<{
    type: string;
    properties: any;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }>;
}

const AirQualityDashboard: React.FC = () => {
  const timeSeriesRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  const [selectedPollutant, setSelectedPollutant] = useState<string>('ALL');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const timeRange = `${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}`;

  const pollutantColors: { [key: string]: string } = {
    'PM2.5': '#FF6B6B',
    'PM10': '#4ECDC4',
    'NO2': '#45B7D1',
    'SO2': '#96CEB4',
    'CO': '#FFEEAD',
    'O3': '#D4A5A5'
  };

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
        setSelectedStation(newSelectedStation);

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
    drawTimeSeries();
    drawMap();
    drawBarChart();
    drawPieChart();
  }, [selectedPollutant, selectedStation]);

  useEffect(() => {
    const handleResize = () => {
      drawTimeSeries();
      drawMap();
      drawBarChart();
      drawPieChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-5 bg-gray-100">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Air Quality Monitoring (2024)</h1>
        <p className="text-gray-600">{timeRange}</p>
      </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Monitoring Station Distribution</h2>
          <div className="mb-4">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
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

      <div className="row space-y-6">
        <div className="card bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pollutant Concentration Trends</h2>
          <div className="mb-4">
            <label className="mr-2 text-gray-600">Select Pollutant:</label>
            <select 
              value={selectedPollutant}
              onChange={(e) => setSelectedPollutant(e.target.value)}
              className="p-2 border rounded"
            >
              {['ALL', ...data.metadata.pollutants].map(pollutant => (
                <option key={pollutant} value={pollutant}>{pollutant}</option>
              ))}
            </select>
          </div>
          <div ref={timeSeriesRef} className="w-full h-[400px]" />
        </div>
      </div>

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
    </div>
  );
};

export default AirQualityDashboard;