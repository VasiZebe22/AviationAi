import React from 'react';
import SavedTestsList from '../../components/SavedTests/SavedTestsList';

const SavedTests = () => {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl text-white font-light mb-6">Saved Tests</h1>
                <SavedTestsList />
            </div>
        </div>
    );
};

export default SavedTests;