import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import sun from '../assets/data/sun_data.json';
import stable from '../assets/data/sun_data_stable.json';
import other from '../assets/data/sun_data_other.json';
import { Card } from 'antd';

const SunburstChart = () => {
  const chartRef = useRef(null);
  const [currentData, setCurrentData] = useState(sun); // Start with the default data.

  const renderChart = (data) => {
    const width = 800;
    const height = width;
    const radius = width / 6;

    const color = d3.scaleOrdinal(d3.schemeSet3);

    const minThreshold = 1;

    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => {
        let exaggeratedValue = d.value < 1 ? Math.pow(d.value, 0.5) : d.value;
        return currentData === other
          ? exaggeratedValue
          : Math.max(exaggeratedValue, minThreshold);
      })
      .sort((a, b) => b.value - a.value);

    const root = d3
      .partition()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    root.each((d) => (d.current = d));

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('viewBox', [-width / 2, -height / 2, width, width])
      .style('font', '10px sans-serif');

    const path = svg
      .append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', (d) => (arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0))
      .attr('pointer-events', (d) => (arcVisible(d.current) ? 'auto' : 'none'))
      .attr('d', (d) => arc(d.current));

    path.filter((d) => d.children).style('cursor', 'pointer').on('click', clicked);

    path.append('title').text(
      (d) =>
        `${d.ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join('/')}\n${d3.format(',d')(d.value)}`
    );

    const label = svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill-opacity', (d) => +labelVisible(d.current))
      .attr('transform', (d) => labelTransform(d.current))
      .attr('fill', 'black')
      .text((d) => d.data.name);

    const parent = svg
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked);

    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each((d) => {
        d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        };
      });

      const t = svg.transition().duration(750);

      path
        .transition(t)
        .tween('data', (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (t) => (d.current = i(t));
        })
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') || arcVisible(d.target);
        })
        .attr('fill-opacity', (d) =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attr('pointer-events', (d) => (arcVisible(d.target) ? 'auto' : 'none'))
        .attrTween('d', (d) => () => arc(d.current));

      label
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') || labelVisible(d.target);
        })
        .transition(t)
        .attr('fill-opacity', (d) => +labelVisible(d.target))
        .attrTween('transform', (d) => () => labelTransform(d.current));
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = ((d.x0 + d.x1) / 2) * 180 / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  };

  useEffect(() => {
    d3.select(chartRef.current).html(''); // Clear previous chart.
    renderChart(currentData); // Render new chart.
  }, [currentData]);

  return (
    <Card title="Air Composition"  >
    <div style={{ textAlign: 'center' }}>
      <div>
        <button onClick={() => setCurrentData(sun)}>All</button>
        <button onClick={() => setCurrentData(stable)}>Stable Gases</button>
        <button onClick={() => setCurrentData(other)}>Pollutants</button>
      </div>
      <div ref={chartRef} style={{width: '100%', height: '0', paddingBottom: '100%', position: 'relative', 
      }}></div>
    </div>
    </Card>
  );
};

export default SunburstChart;
