require('dotenv').config();
const { initializeFirebase } = require('../firebase');
const { db } = require('../firebase');

// Initialize Firebase
initializeFirebase();

const sampleQuestions = [
    {
        categoryId: 'general',
        question: 'What is the primary purpose of ailerons on an aircraft?',
        options: [
            'Control roll movement',
            'Control pitch movement',
            'Control yaw movement',
            'Increase lift'
        ],
        correct_answer: 'Control roll movement',
        explanation: 'Ailerons are control surfaces located on the outer trailing edge of the wings that control the aircraft\'s roll movement by creating differential lift between the wings.',
        difficulty: 1
    },
    {
        categoryId: 'general',
        question: 'What does AGL stand for in aviation?',
        options: [
            'Above Ground Level',
            'Adjusted Ground Location',
            'Aerial Ground Line',
            'Aircraft Ground Limit'
        ],
        correct_answer: 'Above Ground Level',
        explanation: 'AGL stands for Above Ground Level and refers to the height of an aircraft above the ground directly below it.',
        difficulty: 1
    },
    {
        categoryId: 'navigation',
        question: 'What type of chart is primarily used for VFR navigation?',
        options: [
            'Sectional Chart',
            'IFR Low Altitude Chart',
            'Terminal Area Chart',
            'World Aeronautical Chart'
        ],
        correct_answer: 'Sectional Chart',
        explanation: 'Sectional Charts are the primary charts used in VFR navigation. They provide detailed information about airspace, terrain, and navigation aids.',
        difficulty: 2
    },
    {
        categoryId: 'systems',
        question: 'What is the purpose of the magnetos in an aircraft engine?',
        options: [
            'To provide electrical power to the spark plugs',
            'To control fuel mixture',
            'To regulate oil pressure',
            'To monitor engine temperature'
        ],
        correct_answer: 'To provide electrical power to the spark plugs',
        explanation: 'Magnetos are self-contained electrical generators that provide power to the spark plugs for ignition, operating independently of the aircraft\'s main electrical system.',
        difficulty: 2
    },
    {
        categoryId: 'weather',
        question: 'What weather phenomenon is associated with a warm front?',
        options: [
            'Steady, widespread precipitation',
            'Thunderstorms',
            'Clear skies',
            'Strong wind gusts'
        ],
        correct_answer: 'Steady, widespread precipitation',
        explanation: 'Warm fronts typically bring steady, widespread precipitation as warm air gradually rises over cooler air.',
        difficulty: 2
    }
];

async function populateQuestions() {
    try {
        // Clear existing questions
        const questionsRef = db.collection('questions');
        const batch = db.batch();
        
        // Add new questions
        for (const question of sampleQuestions) {
            const docRef = questionsRef.doc();
            batch.set(docRef, {
                ...question,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await batch.commit();
        console.log('Successfully populated questions');
        process.exit(0);
    } catch (error) {
        console.error('Error populating questions:', error);
        process.exit(1);
    }
}

populateQuestions();
