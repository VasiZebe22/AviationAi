import { db } from '../firebase';
import { 
    collection, 
    query, 
    orderBy, 
    getDocs,
    doc,
    updateDoc,
    where,
    deleteDoc,
    getDoc
} from 'firebase/firestore';
import { questionService } from '../questions/questionService';

export const noteService = {
    async getNotes(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const notesRef = collection(db, 'notes');
        const q = query(
            notesRef,
            where('userId', '==', userId),
            orderBy('created_at', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const notes = await Promise.all(snapshot.docs.map(async doc => {
            const noteData = doc.data();
            
            // If the note has a questionId, fetch the question data
            let questionData = null;
            if (noteData.questionId) {
                try {
                    questionData = await questionService.getQuestionById(noteData.questionId);
                } catch (error) {
                    console.error('Error fetching question data:', error);
                }
            }

            return {
                id: doc.id,
                ...noteData,
                // Include the question data with category and subcategories
                question: questionData,
                category: questionData?.category,
                subcategories: questionData?.subcategories,
                createdAt: noteData.created_at?.toDate(),
                updatedAt: noteData.updated_at?.toDate()
            };
        }));

        return notes;
    },

    async updateNote(noteId, noteData) {
        const noteRef = doc(db, 'notes', noteId);
        await updateDoc(noteRef, {
            ...noteData,
            updated_at: new Date()
        });
    },

    async deleteNote(noteId) {
        const noteRef = doc(db, 'notes', noteId);
        await deleteDoc(noteRef);
    },

    async pinNote(noteId, isPinned) {
        const noteRef = doc(db, 'notes', noteId);
        await updateDoc(noteRef, { 
            isPinned,
            updated_at: new Date()
        });
    }
};
