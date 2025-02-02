import React from 'react';

const FinishedTestCard = ({ item }) => (
    <div className="bg-surface-DEFAULT p-4 rounded-lg relative group cursor-pointer hover:bg-surface-lighter transition-colors duration-200">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">
                        {item.name}
                    </h3>
                    <div className="flex items-center space-x-3">
                        <div className={`
                            px-3 py-1 rounded-full font-medium text-sm
                            ${parseFloat(item.successRate) >= 75 
                                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400' 
                                : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400'}
                        `}>
                            {item.successRate}
                        </div>
                        <div className={`
                            px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider
                            flex items-center space-x-1
                            ${parseFloat(item.successRate) >= 75
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'}
                        `}>
                            <div className={`
                                w-1.5 h-1.5 rounded-full
                                ${parseFloat(item.successRate) >= 75 ? 'bg-emerald-400' : 'bg-red-400'}
                            `}></div>
                            <span>{parseFloat(item.successRate) >= 75 ? 'Pass' : 'Fail'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                            {item.questionsCompleted} questions completed
                        </span>
                        <span className="text-xs text-gray-500">
                            {item.date}
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        <span className="text-gray-500">Subcategories:</span>{' '}
                        {item.subcategories}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default FinishedTestCard;