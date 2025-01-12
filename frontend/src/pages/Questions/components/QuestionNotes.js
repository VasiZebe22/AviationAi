import React from 'react';

const QuestionNotes = ({ questionId, notes, handleSaveNote }) => {
    return (
        <textarea
            value={notes[questionId] || ''}
            onChange={(e) => handleSaveNote(e.target.value)}
            className="w-full h-48 bg-surface-dark/50 text-gray-300 p-3 rounded resize-none focus:outline-none focus:ring-1 focus:ring-accent-lilac"
            placeholder="Add your notes here..."
        />
    );
};

export default QuestionNotes;
