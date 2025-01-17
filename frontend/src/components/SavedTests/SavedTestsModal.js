import React from 'react';
import Modal from '../Modal/Modal';
import SavedTestsList from './SavedTestsList';
import { useNavigate } from 'react-router-dom';

const SavedTestsModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleTestContinue = (test) => {
        onClose();
        navigate(`/questions/${test.categoryId}`, {
            state: {
                mode: test.mode,
                filters: test.filters,
                selectedSubcategories: test.selectedSubcategories,
                savedTestId: test.id,
                savedTestData: {
                    currentQuestion: test.currentQuestion,
                    timer: test.timer,
                    answeredQuestions: test.answeredQuestions
                }
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Saved Tests"
        >
            <div className="max-h-[60vh] overflow-y-auto">
                <SavedTestsList 
                    onTestContinue={handleTestContinue}
                    className="space-y-4"
                />
            </div>
        </Modal>
    );
};

export default SavedTestsModal;