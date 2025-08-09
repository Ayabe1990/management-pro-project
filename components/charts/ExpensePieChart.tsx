import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Global registration in index.tsx handles this.
// ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpensePieChartProps {
    data: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
            borderColor: string[];
        }[];
    };
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#E6EDF3', // light-text
                    boxWidth: 20,
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        cutout: '60%',
    };

    return <Doughnut data={data} options={options} />;
};

export default ExpensePieChart;