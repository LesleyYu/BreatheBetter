import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { StaticMap } from 'react-map-gl';
import { BASEMAP } from '@deck.gl/carto';
import 'mapbox-gl/dist/mapbox-gl.css';

import purpleAirData from './data/purpleAirData.json'; // Dataset for FULL view
import FakePurpleAirData from './data/FakePurpleAirData.json'; // Dataset for LA view

const FULL_VIEW_STATE = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 5,
  pitch: 0,
  bearing: 0,
};
const LA_VIEW_STATE = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 8,
  pitch: 0,
  bearing: -30,
};

const Heatmap = () => {
  const [viewState, setViewState] = useState(FULL_VIEW_STATE);
  const [basemap, setBasemap] = useState(BASEMAP.POSITRON);

  // Dynamically select dataset
  const getData = () => (viewState === FULL_VIEW_STATE ? purpleAirData : FakePurpleAirData);

  // Dynamically select radius
  const getRadius = () => (viewState === FULL_VIEW_STATE ? 30 : 10);

  const heatmapLayer = new HeatmapLayer({
    id: 'heatmap',
    data: getData(),
    getPosition: (d) => [d.longitude, d.latitude],
    getWeight: (d) => d['pm2.5_atm'],
    radiusPixels: getRadius(),
    intensity: 1,
    threshold: 0.001,
    pickable: true,
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* View State and Basemap Selectors */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
        }}
      >
        <label style={{ marginRight: '10px' }}>
          View State:
          <select
            value={viewState === FULL_VIEW_STATE ? 'FULL' : 'LA'}
            onChange={(e) =>
              setViewState(e.target.value === 'FULL' ? FULL_VIEW_STATE : LA_VIEW_STATE)
            }
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="FULL">Full View</option>
            <option value="LA">LA View</option>
          </select>
        </label>

        {/* Basemap Selector */}
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
            <option value="POSITRON">Positron</option>
            <option value="DARK_MATTER">Dark Matter</option>
            <option value="VOYAGER">Voyager</option>
          </select>
        </label>
      </div>

      {/* Map Visualization */}
      <DeckGL initialViewState={viewState} controller={true} layers={[heatmapLayer]}>
        <StaticMap mapStyle={basemap} />
      </DeckGL>
    </div>
  );
};

export default Heatmap;
