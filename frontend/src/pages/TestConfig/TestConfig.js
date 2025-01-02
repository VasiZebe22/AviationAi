import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestConfig = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [mode, setMode] = useState('study'); // 'study' or 'exam'
    const [filters, setFilters] = useState({
        questionType: 'all', // 'all', 'with-annexes', 'without-annexes'
        realExamOnly: true,
        reviewQuestions: true,
        markedQuestions: true,
        unseenQuestions: true,
        incorrectlyAnswered: false,
        greenFlagged: false,
        yellowFlagged: false,
        redFlagged: false,
        showCorrectAnswers: false
    });

    const handleStartTest = () => {
        if (!selectedCategory) {
            alert('Please select a category');
            return;
        }
        
        navigate(`/questions/${selectedCategory}`, {
            state: {
                mode,
                filters
            }
        });
    };

    return (
        <div className="min-h-screen bg-dark p-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl text-gray-200 mb-8 text-center">New Test</h1>
                
                {/* Category Selection */}
                <div className="mb-8">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-surface-dark text-gray-200 rounded-lg border border-gray-700 focus:border-accent-lilac focus:ring-1 focus:ring-accent-lilac"
                    >
                        <option value="">Select Category</option>
                        <option value="021">021 - Airframe, Systems, Electrics, Power Plant</option>
                        <option value="022">022 - Instrumentation</option>
                        <option value="031">031 - Mass and Balance</option>
                        <option value="032">032 - Performance</option>
                    </select>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setMode('study')}
                        className={`p-4 rounded-lg text-center transition-colors ${
                            mode === 'study'
                                ? 'bg-accent-lilac text-white'
                                : 'bg-surface-dark text-gray-300 hover:bg-dark-lighter'
                        }`}
                    >
                        STUDY
                    </button>
                    <button
                        onClick={() => setMode('exam')}
                        className={`p-4 rounded-lg text-center transition-colors ${
                            mode === 'exam'
                                ? 'bg-accent-lilac text-white'
                                : 'bg-surface-dark text-gray-300 hover:bg-dark-lighter'
                        }`}
                    >
                        EXAM
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className="flex mb-4 space-x-2">
                        {['All Questions', 'With annexes', 'Without annexes'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilters({
                                    ...filters,
                                    questionType: tab.toLowerCase().replace(' ', '-')
                                })}
                                className={`px-4 py-2 rounded-lg ${
                                    filters.questionType === tab.toLowerCase().replace(' ', '-')
                                        ? 'bg-accent-lilac text-white'
                                        : 'bg-surface-dark text-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Options */}
                <div className="bg-surface-dark rounded-lg p-6 mb-8">
                    <div className="space-y-4">
                        <FilterOption
                            label="Only Real Exam Questions"
                            checked={filters.realExamOnly}
                            onChange={(checked) => setFilters({ ...filters, realExamOnly: checked })}
                        />
                        
                        <FilterOption
                            label="Review Questions"
                            checked={filters.reviewQuestions}
                            onChange={(checked) => setFilters({ ...filters, reviewQuestions: checked })}
                        />
                        <FilterOption
                            label="Marked Questions"
                            checked={filters.markedQuestions}
                            onChange={(checked) => setFilters({ ...filters, markedQuestions: checked })}
                        />
                        <FilterOption
                            label="Previously Unseen Questions"
                            checked={filters.unseenQuestions}
                            onChange={(checked) => setFilters({ ...filters, unseenQuestions: checked })}
                        />
                        <FilterOption
                            label="Incorrectly answered"
                            checked={filters.incorrectlyAnswered}
                            onChange={(checked) => setFilters({ ...filters, incorrectlyAnswered: checked })}
                        />
                        <FilterOption
                            label="Green Flagged Questions"
                            checked={filters.greenFlagged}
                            onChange={(checked) => setFilters({ ...filters, greenFlagged: checked })}
                        />
                        <FilterOption
                            label="Yellow Flagged Questions"
                            checked={filters.yellowFlagged}
                            onChange={(checked) => setFilters({ ...filters, yellowFlagged: checked })}
                        />
                        <FilterOption
                            label="Red Flagged Questions"
                            checked={filters.redFlagged}
                            onChange={(checked) => setFilters({ ...filters, redFlagged: checked })}
                        />
                        <FilterOption
                            label="Study Test with correct answers"
                            checked={filters.showCorrectAnswers}
                            onChange={(checked) => setFilters({ ...filters, showCorrectAnswers: checked })}
                        />
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartTest}
                    className="w-full p-4 bg-accent-lilac text-white rounded-lg hover:bg-accent-lilac/90 transition-colors"
                >
                    Start Test
                </button>
            </div>
        </div>
    );
};

const FilterOption = ({ label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
        />
        <label className="ml-3 text-gray-300">{label}</label>
    </div>
);

export default TestConfig;
