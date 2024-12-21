import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers';
import { StaticMap } from 'react-map-gl';
import { BASEMAP } from '@deck.gl/carto';
import 'mapbox-gl/dist/mapbox-gl.css';

import purpleAirData from '../assets/data/purpleAirData.json';
import purpleAirData_2 from '../assets/data/purpleAirData_2.json';
import purpleAirData_3 from '../assets/data/purpleAirData_3.json';
import purpleAirData_4 from '../assets/data/purpleAirData_4.json';
import purpleAirData_5 from '../assets/data/purpleAirData_5.json';
import purpleAirData_6 from '../assets/data/purpleAirData_6.json';
import purpleAirData_7 from '../assets/data/purpleAirData_7.json';

import FakePurpleAirData from '../assets/data/FakePurpleAirData.json';
import FakePurpleAirData_2 from '../assets/data/FakePurpleAirData_2.json';
import FakePurpleAirData_3 from '../assets/data/FakePurpleAirData_3.json';
import FakePurpleAirData_4 from '../assets/data/FakePurpleAirData_4.json';
import FakePurpleAirData_5 from '../assets/data/FakePurpleAirData_5.json';
import FakePurpleAirData_6 from '../assets/data/FakePurpleAirData_6.json';
import FakePurpleAirData_7 from '../assets/data/FakePurpleAirData_7.json';

import Secondary from './Secondary.tsx'; // Import the LineChart component

interface HexagonMapProps {
  viewState: any;
  onViewStateChange: (viewState: any) => void;
  areaMode: string;
}

// const FULL_VIEW_STATE2 = {
//   longitude: -118.2437,
//   latitude: 34.0522,
//   zoom: 5,
//   pitch: 40,
//   bearing: 0,
// };

// const LA_VIEW_STATE2 = {
//   longitude: -118.2437,
//   latitude: 34.0522,
//   zoom: 8,
//   pitch: 40,
//   bearing: -30,
// };

const calculateWarning = (averagePollution) => {
  if (averagePollution > 150) {
    return {
      level: 'Severe Danger',
      message: 'Very high pollution levels detected! Health impact is severe.',
      risks: [
        'Increased risk of respiratory illnesses like asthma or bronchitis.',
        'Exacerbation of chronic heart conditions.',
        'Higher vulnerability for pregnant women, children, and the elderly.',
      ],
      recommendations: [
        'Avoid all outdoor physical activities.',
        'Stay indoors with air purifiers or closed windows.',
        'Wear high-quality masks (N95/FFP2) outdoors.',
        'Consult a doctor if you experience symptoms like coughing, difficulty breathing, or fatigue.',
      ],
      color: 'darkred',
    };
  } else if (averagePollution > 100) {
    return {
      level: 'High Danger',
      message: 'High pollution levels detected. Take immediate precautions.',
      risks: [
        'Aggravation of asthma and heart conditions.',
        'Eye, nose, and throat irritation.',
        'Risk of headaches or dizziness from prolonged exposure.',
      ],
      recommendations: [
        'Limit time spent outdoors, especially during peak pollution hours.',
        'Wear masks when commuting or outdoors.',
        'Use public transportation to reduce overall emissions.',
        'Consider using a portable air purifier in high-pollution areas.',
      ],
      color: 'red',
    };
  } else if (averagePollution > 50) {
    return {
      level: 'Moderate Risk',
      message: 'Moderate pollution detected. Caution advised.',
      risks: [
        'Discomfort for sensitive groups (children, elderly, and those with pre-existing conditions).',
        'Mild respiratory symptoms like coughing or shortness of breath.',
        'Risk of fatigue after prolonged exposure.',
      ],
      recommendations: [
        'Avoid prolonged outdoor exercise.',
        'Take frequent breaks indoors if working outdoors.',
        'Reduce driving to lower emissions.',
      ],
      color: 'orange',
    };
  } else if (averagePollution > 20) {
    return {
      level: 'Low Risk',
      message: 'Low pollution levels detected. Minimal health impact.',
      risks: ['Mild discomfort for highly sensitive individuals.'],
      recommendations: [
        'Safe for most individuals, but monitor pollution trends.',
        'Carry medication if allergic or asthmatic during physical activities.',
      ],
      color: 'yellow',
    };
  } else {
    return {
      level: 'Safe',
      message: 'Air quality is good. No health risks detected.',
      risks: ['No known health risks.'],
      recommendations: [
        'Enjoy outdoor activities with no precautions needed.',
        'Encourage public awareness to maintain clean air.',
      ],
      color: 'green',
    };
  }
};

const Hexagonmap: React.FC<HexagonMapProps> = ({
  viewState, 
  onViewStateChange,
  areaMode
}) => {
  // const [viewState, setViewState] = useState(FULL_VIEW_STATE2); // Default: LA View
  const [basemap, setBasemap] = useState(BASEMAP.DARK_MATTER); // Default: Dark Matter
  const [radius, setRadius] = useState(1000); // Default: 1000
  const [hoverInfo, setHoverInfo] = useState(null);
  const [warningInfo, setWarningInfo] = useState(null); // Warning hover data
  const [layerType, setLayerType] = useState('hexagon'); // Layer type toggle

  const dataset1 = [
    purpleAirData,
    purpleAirData_2,
    purpleAirData_3,
    purpleAirData_4,
    purpleAirData_5,
    purpleAirData_6,
    purpleAirData_7,
  ];

  const dataset2 = [
    FakePurpleAirData,
    FakePurpleAirData_2,
    FakePurpleAirData_3,
    FakePurpleAirData_4,
    FakePurpleAirData_5,
    FakePurpleAirData_6,
    FakePurpleAirData_7,
  ];

  const datasets = () => (areaMode === 'FULL' ? dataset1 : dataset2);
  const getRange = () => (areaMode === 'FULL' ? [100, 3000] : [0, 500]);
  const getRadius = () => (areaMode === 'FULL' ? 30 : 10);

  const generateLabels = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date.toLocaleDateString('en-GB');
    });
  };

  const aggregateData = (points) => {
    const labels = generateLabels();
    return datasets().map((dataset, index) => {
      const timeSeriesData = points.map((point) => {
        const source = point.source;
        const match = dataset.find(
          (d) => d.latitude === source.latitude && d.longitude === source.longitude
        );
        return match ? match : null;
      });

      const pm1Values = timeSeriesData.map((data) => (data ? data['pm1.0_atm'] : null));
      const pm2_5Values = timeSeriesData.map((data) => (data ? data['pm2.5_atm'] : null));
      const pm10Values = timeSeriesData.map((data) => (data ? data['pm10.0_atm'] : null));

      return {
        time: labels[index],
        pm1: pm1Values.reduce((sum, val) => sum + (val || 0), 0) / pm1Values.length || null,
        pm2_5: pm2_5Values.reduce((sum, val) => sum + (val || 0), 0) / pm2_5Values.length || null,
        pm10: pm10Values.reduce((sum, val) => sum + (val || 0), 0) / pm10Values.length || null,
      };
    });
  };

  const hexagonLayer = new HexagonLayer({
    id: 'hexagon-layer',
    data: datasets()[6],
    getPosition: (d) => [d.longitude, d.latitude],
    getElevationWeight: (d) => (d['pm2.5_atm'] + d['pm10.0_atm'] + d['pm1.0_atm']) / 3,
    getColorWeight: (d) => (d['pm2.5_atm'] + d['pm10.0_atm'] + d['pm1.0_atm']) / 3,
    elevationScale: 50,
    elevationRange: getRange(),
    radius: radius,
    extruded: true,
    pickable: true,
    coverage: 0.8,
    aggregation: 'MEAN',
    colorRange: [
      [1, 152, 189],
      [73, 227, 206],
      [216, 254, 181],
      [254, 237, 177],
      [254, 173, 84],
      [209, 55, 78],
    ],
    onHover: (info) => {
      if (info.object) {
        const points = info.object.points;
        const avgPollution =
          points.reduce(
            (sum, p) =>
              sum +
              (p.source['pm2.5_atm'] + p.source['pm10.0_atm'] + p.source['pm1.0_atm']) / 3,
            0
          ) / points.length;

        const warning = calculateWarning(avgPollution);

        setHoverInfo({ x: info.x, y: info.y, data: aggregateData(points) });
        setWarningInfo({ x: info.x, y: info.y - 50, warning });
      } else {
        setHoverInfo(null);
        setWarningInfo(null);
      }
    },
  });

  const heatmapLayer = new HeatmapLayer({
    id: 'heatmap-layer',
    data: datasets()[6],
    getPosition: (d) => [d.longitude, d.latitude],
    getWeight: (d) => (d['pm2.5_atm'] + d['pm10.0_atm'] + d['pm1.0_atm']) / 3,
    radiusPixels: getRadius(),
    intensity: 1,
    threshold: 0.001,
    pickable: true,
  });

  // const handleDropdownChange = (e) => {
  //   const selectedView = e.target.value === 'FULL' ? FULL_VIEW_STATE2 : LA_VIEW_STATE2;
  //   setViewState(selectedView);
  //   onViewStateChange(selectedView === FULL_VIEW_STATE2 ? 'FULL' : 'LA'); // Communicate with App.tsx
  // };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}>

        <label style={{ marginLeft: '20px' }}>
          Basemap:
          <select
            value={
              basemap === BASEMAP.POSITRON
                ? 'POSITRON'
                : basemap === BASEMAP.DARK_MATTER
                ? 'DARK_MATTER'
                : 'VOYAGER'
            }
            onChange={(e) => setBasemap(BASEMAP[e.target.value])}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="DARK_MATTER">Dark Matter</option>
            <option value="POSITRON">Positron</option>
            <option value="VOYAGER">Voyager</option>
          </select>
        </label>

        <label style={{ marginLeft: '20px' }}>
          Radius: {radius}m
          <input
            type="range"
            min="300"
            max="1500"
            step="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
          <label style={{ marginRight: '10px' }}>Layer Type:</label>
          <label style={{ marginRight: '5px' }}>
            <input
              type="radio"
              name="layerType"
              value="hexagon"
              checked={layerType === 'hexagon'}
              onChange={() => setLayerType('hexagon')}
            />
            Hexagon Map
          </label>
          <label>
            <input
              type="radio"
              name="layerType"
              value="heatmap"
              checked={layerType === 'heatmap'}
              onChange={() => setLayerType('heatmap')}
            />
            Heatmap (Simplified)
          </label>
        </div>
      </div>

      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={true}
        layers={[layerType === 'hexagon' ? hexagonLayer : heatmapLayer]}
      >
        <StaticMap mapStyle={basemap} />
      </DeckGL>

      {hoverInfo && hoverInfo.data && (
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', zIndex: 1000 }}>
          <Secondary data={hoverInfo.data} />
        </div>
      )}

      {warningInfo && warningInfo.warning && (
        <div
          style={{
            position: 'absolute',
            left: warningInfo.x,
            top: warningInfo.y,
            background: warningInfo.warning.color,
            color: 'black',
            padding: '10px',
            borderRadius: '8px',
            zIndex: 1000,
          }}
        >
          <strong>{warningInfo.warning.level}</strong>
          <div>{warningInfo.warning.message}</div>
          <strong>Risks:</strong>
          <ul>
            {warningInfo.warning.risks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
          <strong>Recommendations:</strong>
          <ul>
            {warningInfo.warning.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Hexagonmap;
