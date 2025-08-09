import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Global registration in index.tsx handles this.
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

interface SalesExpenseChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
        }[];
    };
}

const SalesExpenseChart: React.FC<SalesExpenseChartProps> = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                 labels: {
                    color: '#E6EDF3', // light-text
                },
            },
            title: {
                display: true,
                text: 'Monthly Sales vs. Expenses',
                color: '#E6EDF3',
            },
        },
        scales: {
            x: {
                ticks: { color: '#8B949E' }, // medium-text
                grid: { color: '#30363D' } // dark-border
            },
            y: {
                ticks: { 
                    color: '#8B949E',
                    callback: function(value: any) {
                        return '₱' + value / 1000 + 'k';
                    }
                },
                grid: { color: '#30363D' }
            }
        }
    };

    return <Bar options={options} data={data} />;
};

export default SalesExpenseChart;