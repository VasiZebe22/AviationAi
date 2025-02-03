import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';

class FlagService {
    constructor() {
        this.flagsCollection = 'flags';
    }

    async getFlaggedQuestions(userId) {
        try {
            const flagsRef = collection(db, this.flagsCollection);
            const q = query(
                flagsRef,
                where('userId', '==', userId),
                orderBy('updated_at', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                relativeTime: this.getRelativeTime(doc.data().updated_at.toDate())
            }));
        } catch (error) {
            console.error('Error getting flagged questions:', error);
            throw error;
        }
    }

    async addFlag(userId, questionId, flag) {
        try {
            const flagsRef = collection(db, this.flagsCollection);
            const newFlag = {
                userId,
                questionId,
                flag,
                updated_at: new Date()
            };
            
            const docRef = await addDoc(flagsRef, newFlag);
            return {
                id: docRef.id,
                ...newFlag,
                relativeTime: this.getRelativeTime(newFlag.updated_at)
            };
        } catch (error) {
            console.error('Error adding flag:', error);
            throw error;
        }
    }

    async removeFlag(flagId) {
        try {
            const flagRef = doc(db, this.flagsCollection, flagId);
            await deleteDoc(flagRef);
        } catch (error) {
            console.error('Error removing flag:', error);
            throw error;
        }
    }

    getRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays}d ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths}mo ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears}y ago`;
    }
}

export const flagService = new FlagService();