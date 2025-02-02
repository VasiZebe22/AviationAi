// Map a note document to the display format, including metadata and category information
export const mapNoteForDisplay = (note, { getRelativeTime, onDelete }) => ({
    id: note.id,
    content: note.content,
    questionId: note.questionId,
    // Include the full question data
    question: note.question,
    // Include category data both from direct fields and metadata
    category: note.category,
    subcategories: note.subcategories,
    metadata: {
        category: note.metadata?.category,
        subcategories: note.metadata?.subcategories
    },
    // Timestamps
    createdAt: note.created_at?.toDate(),
    updatedAt: note.updated_at?.toDate(),
    userId: note.userId,
    relativeTime: getRelativeTime(note.created_at?.toDate()),
    onDelete
});
