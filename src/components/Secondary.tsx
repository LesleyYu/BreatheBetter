import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Secondary = ({ data }) => {
  // Prepare chart data
  const chartData = {
    labels: data.map((d) => d.time), // Time labels (e.g., "Dataset 1", "Dataset 2")
    datasets: [
      {
        label: 'PM1.0',
        data: data.map((d) => d.pm1),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'PM2.5',
        data: data.map((d) => d.pm2_5),
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'PM10',
        data: data.map((d) => d.pm10),
        borderColor: 'rgba(54,162,235,1)',
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top', // Legend position
      },
      title: {
        display: true,
        text: 'Air Quality Levels Over Time',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return `${tooltipItem.dataset.label}: ${value !== null ? value.toFixed(2) : 'N/A'}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Last Week',
        },
        type: 'category', // Ensure x-axis is a category scale
      },
      y: {
        title: {
          display: true,
          text: 'PM Levels',
        },
        beginAtZero: true, // Start y-axis at zero
      },
    },
  };

  return (
    <div
      style={{
        backgroundColor: 'white', // Card background color
        padding: '20px', // Inner padding
        borderRadius: '8px', // Rounded corners
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
        height: '350px', // Adjust card height
        width: '550px', // Adjust card width
        margin: '0 auto', // Center the card horizontally
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default Secondary;
