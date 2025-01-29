import { getDoc, setDoc } from 'firebase/firestore';
import { getCurrentUser, handleFirebaseError, db_operations } from '../utils/firebaseUtils';

export const userDataService = {
    // Update flag
    async updateFlag(questionId, flag) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const flagRef = db_operations.docs.flag(user.uid, questionId);
            
            await setDoc(flagRef, {
                userId: user.uid,
                questionId,
                flag: flag || null,
                updated_at: new Date()
            });
        } catch (error) {
            handleFirebaseError(error, 'updating flag');
        }
    },

    // Get flags for questions
    async getFlags(questionIds) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Create an array of document references for all question flags
            const flagRefs = questionIds.map(qId => db_operations.docs.flag(user.uid, qId));
            
            // Get all flags in parallel
            const flagDocs = await Promise.all(flagRefs.map(ref => getDoc(ref)));
            
            // Convert to a map of questionId -> flag color
            const flags = {};
            flagDocs.forEach((doc, index) => {
                if (doc.exists() && doc.data().flag) {
                    flags[questionIds[index]] = doc.data().flag;
                }
            });

            return flags;
        } catch (error) {
            handleFirebaseError(error, 'fetching flags');
        }
    },

    // Save note
    async saveNote(questionId, note) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const noteRef = db_operations.docs.note(user.uid, questionId);
            const noteDoc = await getDoc(noteRef);
            
            if (noteDoc.exists()) {
                // Update existing note
                await setDoc(noteRef, {
                    content: note,
                    updated_at: new Date()
                }, { merge: true });
            } else {
                // Create new note
                await setDoc(noteRef, {
                    userId: user.uid,
                    questionId,
                    content: note,
                    created_at: new Date(),
                    updated_at: new Date()
                });
            }
        } catch (error) {
            handleFirebaseError(error, 'saving note');
        }
    },

    // Get notes for questions
    async getNotes(questionIds) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Create an array of document references for all question notes
            const noteRefs = questionIds.map(qId => db_operations.docs.note(user.uid, qId));
            
            // Get all notes in parallel
            const noteDocs = await Promise.all(noteRefs.map(ref => getDoc(ref)));
            
            // Convert to a map of questionId -> note content
            const notes = {};
            noteDocs.forEach((doc, index) => {
                if (doc.exists() && doc.data().content) {
                    notes[questionIds[index]] = doc.data().content;
                }
            });

            return notes;
        } catch (error) {
            handleFirebaseError(error, 'fetching notes');
        }
    }
};
