import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import NoteCard from './cards/NoteCard';

const StudyMaterials = ({ notes = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter notes based on search query
    const filteredNotes = notes.filter(note => {
        if (!note) return false;
        
        const query = searchQuery.toLowerCase().replace('#', ''); // Remove # from search query
        
        // Prepare searchable strings
        const searchableFields = [
            note.content,                              // Note content
            note.questionId?.replace('#', ''),         // Question ID without #
            note.question?.text || note.question,      // Question text
            note.category?.name,                       // Category name
            note.category?.code,                       // Category code
            note.question?.category?.name,             // Category name from question
            note.question?.category?.code,             // Category code from question
            ...(note.subcategories?.map(sub => sub.name) || []),  // Subcategory names
            ...(note.subcategories?.map(sub => sub.code) || []),  // Subcategory codes
            ...(note.question?.subcategories?.map(sub => sub.name) || []),  // Subcategory names from question
            ...(note.question?.subcategories?.map(sub => sub.code) || [])   // Subcategory codes from question
        ];

        // Create a single searchable string and normalize it
        const searchableText = searchableFields
            .filter(Boolean)  // Remove null/undefined values
            .map(field => field.toString().toLowerCase())
            .join(' ');

        // Debug logging
        console.log('Note being searched:', {
            content: note.content,
            questionId: note.questionId,
            category: note.category,
            questionCategory: note.question?.category,
            subcategories: note.subcategories,
            questionSubcategories: note.question?.subcategories,
            searchableText
        });

        // Check if any part of the searchable text includes the query
        return searchableText.includes(query);
    });

    return (
        <div className="w-full p-4">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search notes, questions, categories, or IDs..."
                        className="w-full bg-surface-light rounded-lg px-4 py-2 pl-10 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Notes List */}
            {filteredNotes.length > 0 ? (
                <div className="space-y-4">
                    {filteredNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onDelete={note.onDelete}
                            onUpdate={note.onUpdate}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 mt-8">
                    {searchQuery ? 'No notes match your search.' : 'No notes found.'}
                </div>
            )}
        </div>
    );
};

export default StudyMaterials;
