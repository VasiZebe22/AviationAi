import { useState, useEffect } from 'react';
import { testService } from '../../../services/tests/testService';
import { noteService } from '../../../services/notes/noteService';
import { mapSavedTestForDisplay, mapFinishedTestForDisplay } from '../utils/testUtils';
import { mapNoteForDisplay } from '../utils/noteUtils';
import { getCategoryName, getSubcategoryNames } from '../utils/categoryUtils';
import { getRelativeTime, getProgress, getAnsweredCount, formatSuccessRate, getTestStatus } from '../utils/formatters';
import { BookOpenIcon, BookmarkIcon, FlagIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';

export const useActivityData = () => {
    const { currentUser } = useAuth();
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedSubcategory, setSelectedSubcategory] = useState('Saved Tests');
    const [savedTests, setSavedTests] = useState([]);
    const [finishedTests, setFinishedTests] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            // Don't fetch if there's no user
            if (!currentUser?.user?.uid) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }
                
                // Fetch tests, history, and notes in parallel
                const [tests, history, userNotes] = await Promise.all([
                    testService.getSavedTests(),
                    testService.getTestHistory(),
                    noteService.getNotes(currentUser.user.uid)
                ]);

                // Remove duplicates from history based on timestamp and categoryId
                const uniqueHistory = history.reduce((acc, current) => {
                    const isDuplicate = acc.some(item => 
                        item.categoryId === current.categoryId &&
                        Math.abs(item.completedAt.toDate() - current.completedAt.toDate()) < 1000 // Within 1 second
                    );
                    if (!isDuplicate) {
                        acc.push(current);
                    }
                    return acc;
                }, []);

                // Sort by completion date (newest first)
                const sortedHistory = uniqueHistory.sort((a, b) => 
                    b.completedAt.toDate() - a.completedAt.toDate()
                );
                
                if (isMounted) {
                    setSavedTests(tests);
                    setFinishedTests(sortedHistory);
                    setNotes(userNotes || []); // Ensure we always have an array
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    const deleteNote = async (noteId) => {
        try {
            await noteService.deleteNote(noteId);
            setNotes(notes.filter(note => note.id !== noteId));
        } catch (err) {
            console.error('Error deleting note:', err);
            setError(err.message);
        }
    };

    const updateNote = async (noteId, content) => {
        try {
            await noteService.updateNote(noteId, { content });
            setNotes(prevNotes => prevNotes.map(n =>
                n.id === noteId ? { ...n, content } : n
            ));
        } catch (err) {
            console.error('Error updating note:', err);
            setError(err.message);
        }
    };

    const togglePin = async (noteId, isPinned) => {
        try {
            await noteService.pinNote(noteId, isPinned);
            setNotes(prevNotes => prevNotes.map(n =>
                n.id === noteId ? { ...n, isPinned } : n
            ));
        } catch (err) {
            console.error('Error pinning note:', err);
            setError(err.message);
        }
    };

    const activityCategories = [
        {
            name: 'Practice Tests & Exams',
            icon: BookOpenIcon,
            subcategories: ['Saved Tests', 'Finished Tests'],
            items: selectedSubcategory === 'Finished Tests' ? 
                finishedTests.map(test => mapFinishedTestForDisplay(test, {
                    getCategoryName,
                    getRelativeTime,
                    formatSuccessRate,
                    getTestStatus,
                    getSubcategoryNames
                })) :
                savedTests.map(test => mapSavedTestForDisplay(test, {
                    getCategoryName,
                    getRelativeTime,
                    getProgress,
                    getAnsweredCount,
                    getSubcategoryNames
                }))
        },
        {
            name: 'Notes',
            icon: BookmarkIcon,
            items: (() => {
                // Separate notes into pinned and unpinned
                const pinnedNotes = notes.filter(note => note.isPinned);
                const unpinnedNotes = notes.filter(note => !note.isPinned);

                // Sort each group by timestamp independently
                const sortByTimestamp = (a, b) => {
                    const aTime = a.created_at?.toDate().getTime() || 0;
                    const bTime = b.created_at?.toDate().getTime() || 0;
                    return bTime - aTime;
                };

                // Sort both groups
                pinnedNotes.sort(sortByTimestamp);
                unpinnedNotes.sort(sortByTimestamp);

                // Combine the groups with pinned notes at top
                return [...pinnedNotes, ...unpinnedNotes];
            })()
                .map(note => ({
                    ...mapNoteForDisplay(note, { getRelativeTime }),
                    isPinned: note.isPinned || false,
                    onDelete: async () => {
                        try {
                            await noteService.deleteNote(note.id);
                            setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
                        } catch (err) {
                            console.error('Error deleting note:', err);
                            setError(err.message);
                        }
                    },
                    onUpdate: async (content) => {
                        try {
                            await noteService.updateNote(note.id, { content });
                            setNotes(prevNotes => prevNotes.map(n =>
                                n.id === note.id ? { ...n, content } : n
                            ));
                        } catch (err) {
                            console.error('Error updating note:', err);
                            setError(err.message);
                        }
                    },
                    onTogglePin: async () => {
                        await togglePin(note.id, !note.isPinned);
                    }
                }))
        },
        {
            name: 'Flagged Questions',
            icon: FlagIcon,
            subcategories: ['All', 'Green', 'Yellow', 'Red'],
            items: [
                { 
                    name: 'Question #156 - Radio Navigation', 
                    date: '2025-01-18',
                    flag: 'Green'
                },
                { 
                    name: 'Question #89 - Weather Minimums', 
                    date: '2025-01-17',
                    flag: 'Yellow'
                },
                { 
                    name: 'Question #234 - Aircraft Systems', 
                    date: '2025-01-16',
                    flag: 'Red'
                }
            ]
        },
        {
            name: 'AI Chat History',
            icon: ChatBubbleLeftRightIcon,
            subcategories: ['Starred Conversations', 'Bookmarked Messages'],
            items: [
                { 
                    name: 'Weather Radar Discussion', 
                    date: '2025-01-18',
                    type: 'Starred Conversations'
                },
                { 
                    name: 'Flight Planning Tips', 
                    date: '2025-01-16',
                    type: 'Starred Conversations'
                },
                { 
                    name: 'ILS Approach Question', 
                    date: '2025-01-15',
                    type: 'Bookmarked Messages'
                }
            ]
        }
    ];

    return {
        selectedTab,
        setSelectedTab,
        selectedSubcategory,
        setSelectedSubcategory,
        savedTests,
        setSavedTests,
        finishedTests,
        notes,
        setNotes,
        loading,
        error,
        setError,
        activityCategories,
        deleteNote,
        updateNote,
        togglePin
    };
};