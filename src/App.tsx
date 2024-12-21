import React, { useState, useRef } from 'react';
import './App.css';
import {
  RadarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  DashboardOutlined, 
  PieChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Layout, Space, Menu, theme, Card, Button } from 'antd';
import type { MenuProps } from 'antd';

// import local data
// import UScitiesAirQuality from './assets/air_quality_data.json';
import worldHAP from "./assets/pollution_HAP.json";
import worldNO2 from "./assets/pollution_NO2.json";
import worldOzone from "./assets/pollution_OZONE.json";
import worldPM25 from "./assets/pollution_PM.json";
import timeseries_data from './assets/air_quality_timeseries.json';

// import components
import ChoroplethMap from './components/ChoroplethMap.tsx';
import BubbleMap from './components/BubbleMap.tsx';
// import AirQualityDashboard from './components/AirQualityDashboard.tsx';
import MonitoringStations from './components/MonitoringStations.tsx';
import PollutantTrends from './components/PollutantTrends.tsx';
import CoverageAQI from './components/Coverage_AQI.tsx';
import SunburstChart from './components/SunChart.tsx';
import Hexagonmap from './components/HexagonMap.tsx';
import SimpleSankey from "./components/SimpleSankey.js";
import PollutantDiseaseVenn from "./components/VennDiagram.js";

const FULL_VIEW_STATE = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 5,
  pitch: 40,
  bearing: 0,
};

const LA_VIEW_STATE = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 8,
  pitch: 40,
  bearing: -30,
};

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  // View state: Global or Local
  const [currentViewState, setCurrentViewState] = useState(FULL_VIEW_STATE);
  const [areaMode, setAreaMode] = useState('FULL');

  const handleDropdownChange = (e) => {
    const newMode = e.target.value;
    setAreaMode(newMode);
    setCurrentViewState(newMode === 'FULL' ? FULL_VIEW_STATE : LA_VIEW_STATE);
  };

  const onViewStateChange = ({ viewState }) => {
    setCurrentViewState(viewState);
  };

  // Refs for each chart section
  const sections = {
    MS01: useRef<HTMLDivElement>(null),
    L01: useRef<HTMLDivElement>(null),
    L02: useRef<HTMLDivElement>(null),
    L03: useRef<HTMLDivElement>(null),
    M01: useRef<HTMLDivElement>(null),
    M02: useRef<HTMLDivElement>(null),
    M03: useRef<HTMLDivElement>(null),
    M04: useRef<HTMLDivElement>(null),
    M05: useRef<HTMLDivElement>(null)
  };

  // MENU
  // collapsible
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  // Scroll to section when timeseries_data menu item is clicked
  const handleMenuClick = (e: any) => {
    const section = sections[e.key];
    if (section && section.current) {
      section.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // local air quality monitoring controlling variables
  const timeRange = `${timeseries_data.metadata.dateRange.start} to ${timeseries_data.metadata.dateRange.end}`;
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedPollutant, setSelectedPollutant] = useState<string>('ALL');

  // Dynamically update the sidebar menu items based on `viewState`
  const sidebarItems: MenuProps['items'] =
    areaMode === 'FULL'
      ? [
          {
            key: '0',
            icon: <TableOutlined />,
            label: "Global",
            children: [
              {
                key: 'M01',
                icon: <RadarChartOutlined />,
                label: 'Main Map',
              },
              {
                key: 'M02',
                icon: <LineChartOutlined />,
                label: 'Choropleth',
              },
              {
                key: 'M03',
                icon: <AreaChartOutlined />,
                label: 'Bubble Map',
              },
              {
                key: 'M04',
                icon: <PieChartOutlined />,
                label: 'Pollutants & Diseases',
              },
              {
                key: 'M05',
                icon: <LineChartOutlined />,
                label: "Sankey Diagram",
              }
            ],
          },
        ]
      : [
          {
            key: '0',
            icon: <TableOutlined />,
            label: "LA County",
            children: [
              {
                key: 'MS01',
                icon: <RadarChartOutlined />,
                label: 'Main Map',
              },
            ],
          },
          {
            key: '1',
            icon: <PieChartOutlined />,
            label: "Local Air Quality",
            children: [
              {
                key: 'L01',
                icon: <DashboardOutlined />,
                label: 'Monitoring Stations',
              },
              {
                key: 'L02',
                icon: <LineChartOutlined />,
                label: 'Pollutant Trends',
              },
              {
                key: 'L03',
                icon: <AreaChartOutlined />,
                label: 'Coverage and AQI',
              },
            ],
          },
        ];

  return (
    <Layout>
      <Sider 
        trigger={null} theme="light" 
        collapsed={collapsed} 
        width={270} collapsedWidth={80}
      >
        <div className="demo-logo-vertical" />
        <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['M01']}
          defaultOpenKeys={['0']}
          items={sidebarItems} // Dynamically set items
          onClick={handleMenuClick}
          inlineCollapsed={collapsed}
        />
      </Sider>
      <Layout>
        <Header className="Main-header">
          {areaMode === 'FULL' ? 'Breathe Better (World)' : 'Breathe Better (LA County)'}
        </Header>
        <Content style={{ background: "#D9DFE8ff", borderRadius: borderRadiusLG }}>
          
          {/* Global / Local Selector */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '20px',
            background: "#D9DFE8ff"
          }}>
            <label style={{ fontSize: '16px', fontWeight: "bold", color: '#1a1a1a' }}>
              Select Area:
              <select
                value={areaMode}
                onChange={handleDropdownChange}
                style={{ marginLeft: '10px', padding: '8px 15px', borderRadius:'6px', border:'1px solid #d9d9d9d', backgroundColor: 'white', cursor: 'pointer' }}
              >
                <option value="FULL">World</option>
                <option value="LA">LA County</option>
              </select>
            </label>
          </div>
        
          <Space direction="vertical" size="large" style={{ display: 'flex' }}>

            {/* Main Section */}
            <div ref={sections.M01} style={{ padding: '16px 0' }}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pollution Distribution </h1>
                <Card className="map-card">
                <div className="map-container">
                  <Hexagonmap 
                      viewState={currentViewState}
                      onViewStateChange={onViewStateChange}
                      areaMode={areaMode}
                    />
                </div>
                </Card>
              </div>
            </div>

            {/* Conditional Rendering for Layouts */}
            {areaMode === 'FULL' ? (
              <>
                {/* Choropleth Map and Bubble Map Section */}
                <div ref={sections.M02} style={{ padding: '16px 0' }}>
                  <h1 className="text-2xl font-bold text-gray-800">Global Pollutant History</h1>
                  {/* Choropleth Map */}
                    <div className="map-container-row">
                      <ChoroplethMap
                        HAPData={worldHAP}
                        NO2Data={worldNO2}
                        OzoneData={worldOzone}
                        PM25Data={worldPM25}
                      />
                    </div>

                    {/* Bubble Map */}
                    <div ref={sections.M03} className="map-container-row">
                      <BubbleMap
                        HAPData={worldHAP}
                        NO2Data={worldNO2}
                        OzoneData={worldOzone}
                        PM25Data={worldPM25}
                      />
                    </div>
                </div>

                {/* Sunburst diagram */}
                <div ref={sections.M04} style={{ padding: '16px 0' }}>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Pollutants and Respiratory Diseases</h1>
                  <div className="map-row">
                    <div className="map-container-row">
                      <SunburstChart />
                    </div>
                    <div className="map-container-row">
                      <PollutantDiseaseVenn />
                    </div>
                  </div>
                </div>

                {/* Sankey */}
                <div ref={sections.M05} >
                    <h1>Sankey Diagram</h1>
                    {/* <p>
                      Relationship between Sources of air pollutants and the diseases caused
                      by them.
                    </p> */}
                    <div style={{ marginBottom: "30px" }}>
                      <SimpleSankey />
                    </div>
                  </div>
              </>
            ) : (
              <>
                {/* Air Quality Dashboard */}
                <div style={{ padding: '16px 0' }}>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="max-w-[1400px] mx-auto p-5 bg-gray-100">
                      <header className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Air Quality Monitoring (2024)</h1>
                        <p className="text-gray-600">{timeRange}</p>
                      </header>
                      {/* <AirQualityDashboard /> */}
                      <div ref={sections.L01}>
                        <MonitoringStations
                          selectedStation={selectedStation} 
                          onStationChange={setSelectedStation}
                        />
                      </div>
                      <div ref={sections.L02}>
                        <PollutantTrends 
                          selectedStation={selectedStation} 
                          selectedPollutant={selectedPollutant} 
                          onPollutantChange={setSelectedPollutant}
                          />
                      </div>
                      <div ref={sections.L03}>
                        <CoverageAQI
                          selectedStation={selectedStation}
                          selectedPollutant={selectedPollutant} 
                          />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
