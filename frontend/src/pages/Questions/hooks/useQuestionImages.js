import { useState, useEffect } from 'react';
import { getImageFromStorage } from '../../../services/firebase';

export const useQuestionImages = (questionData, activeTab) => {
    const [questionImageUrl, setQuestionImageUrl] = useState(null);
    const [explanationImageUrl, setExplanationImageUrl] = useState(null);

    // Load question image when needed and available
    useEffect(() => {
        const loadQuestionImage = async () => {
            if (questionData?.id && activeTab === 'question' && questionData.has_question_image) {
                setQuestionImageUrl(null);
                try {
                    const questionPath = `figures/${questionData.id}_question_0.png`;
                    const qImageUrl = await getImageFromStorage(questionPath);
                    setQuestionImageUrl(qImageUrl);
                } catch (error) {
                    console.error('Error loading question image:', error);
                }
            } else if (!questionData?.has_question_image) {
                setQuestionImageUrl(null);
            }
        };

        loadQuestionImage();
    }, [questionData, activeTab]);

    // Load explanation image only when explanation tab is active and available
    useEffect(() => {
        const loadExplanationImage = async () => {
            if (questionData?.id && activeTab === 'explanation' && questionData.has_explanation_image) {
                setExplanationImageUrl(null);
                try {
                    const explanationPath = `figures/${questionData.id}_explanation_0.png`;
                    const eImageUrl = await getImageFromStorage(explanationPath);
                    setExplanationImageUrl(eImageUrl);
                } catch (error) {
                    console.error('Error loading explanation image:', error);
                }
            } else if (!questionData?.has_explanation_image) {
                setExplanationImageUrl(null);
            }
        };

        loadExplanationImage();
    }, [questionData, activeTab]);

    return {
        questionImageUrl,
        explanationImageUrl
    };
};

export default useQuestionImages;
