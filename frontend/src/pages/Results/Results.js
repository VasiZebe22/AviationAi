import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, total, time, categoryId } = location.state || {};

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const percentage = Math.round((score / total) * 100);
    const isPassing = percentage >= 75; // Standard aviation passing score

    const chartData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                data: [score, total - score],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af',
                    font: {
                        size: 14
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-dark p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-surface-dark rounded-lg p-8">
                    <h1 className="text-3xl text-gray-200 text-center mb-8">Test Results</h1>

                    {/* Score Overview */}
                    <div className="text-center mb-12">
                        <div className="text-6xl font-bold mb-4">
                            <span className={isPassing ? 'text-green-500' : 'text-red-500'}>
                                {percentage}%
                            </span>
                        </div>
                        <div className="text-xl text-gray-400">
                            {isPassing ? 'Passed!' : 'Not Passed'}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-12">
                        <div className="bg-dark rounded-lg p-6 text-center">
                            <div className="text-2xl font-bold text-gray-200 mb-2">
                                {score}/{total}
                            </div>
                            <div className="text-sm text-gray-400">Questions Correct</div>
                        </div>
                        <div className="bg-dark rounded-lg p-6 text-center">
                            <div className="text-2xl font-bold text-gray-200 mb-2">
                                {formatTime(time)}
                            </div>
                            <div className="text-sm text-gray-400">Time Taken</div>
                        </div>
                        <div className="bg-dark rounded-lg p-6 text-center">
                            <div className="text-2xl font-bold text-gray-200 mb-2">
                                {Math.round((time / total) * 10) / 10}s
                            </div>
                            <div className="text-sm text-gray-400">Average Time per Question</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="w-64 h-64 mx-auto mb-12">
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/test')}
                            className="px-6 py-3 bg-accent-lilac text-white rounded-lg hover:bg-accent-lilac/90 transition-colors"
                        >
                            Start New Test
                        </button>
                        <button
                            onClick={() => navigate(`/review/${categoryId}`, { state: { testResults: location.state } })}
                            className="px-6 py-3 bg-dark text-gray-200 rounded-lg hover:bg-dark-lighter transition-colors"
                        >
                            Review Answers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;
