require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../logger');

// Initialize Firebase Admin SDK (it will use the existing config from ../.env)
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? JSON.parse(JSON.stringify(process.env.FIREBASE_PRIVATE_KEY)) : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function readQuestionBank(questionBankPath) {
    const categories = await fs.readdir(path.join(questionBankPath, 'categories'));
    const allQuestions = [];

    for (const category of categories) {
        const categoryPath = path.join(questionBankPath, 'categories', category);
        const stat = await fs.stat(categoryPath);

        if (stat.isDirectory()) {
            try {
                // Read metadata.json for category info
                const metadataPath = path.join(categoryPath, 'metadata.json');
                const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

                // Read all question files in the category
                const files = await fs.readdir(categoryPath);
                for (const file of files) {
                    if (file.endsWith('.json') && file !== 'metadata.json') {
                        const questionPath = path.join(categoryPath, file);
                        const questionData = JSON.parse(await fs.readFile(questionPath, 'utf8'));
                        
                        // Get subcategory from filename (e.g., "010-01.json" -> "010-01")
                        const subcategoryId = file.replace('.json', '');
                        const subcategoryInfo = metadata.subcategories[subcategoryId];

                        // Transform questions to match Firestore schema
                        const transformedQuestions = transformQuestions(
                            questionData, 
                            category,
                            metadata,
                            subcategoryId,
                            subcategoryInfo
                        );
                        allQuestions.push(...transformedQuestions);
                    }
                }
            } catch (error) {
                logger.error(`Error processing category ${category}:`, error);
            }
        }
    }

    return allQuestions;
}

function transformQuestions(questionData, categoryId, metadata, subcategoryId, subcategoryInfo) {
    if (!Array.isArray(questionData)) {
        logger.warn(`Question data for ${categoryId}/${subcategoryId} is not an array`);
        return [];
    }

    return questionData
        .filter(q => q && typeof q === 'object')
        .map(q => {
            try {
                // Get question text
                const questionText = q.content?.question;
                if (!questionText) {
                    logger.warn(`Skipping question ${q.id} in ${categoryId}/${subcategoryId} - missing question text`);
                    return null;
                }

                // Get correct answer and options
                const correctLetter = q.content?.correct;
                if (!correctLetter || !q.content?.options?.[correctLetter]) {
                    logger.warn(`Skipping question ${q.id} in ${categoryId}/${subcategoryId} - missing correct answer`);
                    return null;
                }

                // Get correct answer text and incorrect answers
                const correctAnswer = q.content.options[correctLetter];
                const incorrectAnswers = Object.entries(q.content.options)
                    .filter(([key]) => key !== correctLetter)
                    .map(([_, value]) => value);

                return {
                    question_id: q.id,
                    question_text: questionText,
                    correct_answer: correctAnswer,
                    incorrect_answers: incorrectAnswers,
                    explanation: q.learning?.explanation || '',
                    categoryId: q.category,
                    category_name: metadata.name || '',
                    subcategory: {
                        id: q.subcategory,
                        name: subcategoryInfo?.name || '',
                        topics: [q.metadata?.topic || '']
                    },
                    difficulty: q.metadata?.difficulty || 3,
                    tags: [
                        ...(Array.isArray(q.metadata?.keywords) ? q.metadata.keywords : []),
                        ...(Array.isArray(subcategoryInfo?.keywords) ? subcategoryInfo.keywords.slice(0, 5) : [])
                    ],
                    metadata: {
                        source: 'question_bank',
                        last_updated: metadata.last_updated || new Date().toISOString(),
                        topic: q.metadata?.topic || '',
                        key_points: q.learning?.key_points || [],
                        reference: q.learning?.reference || ''
                    },
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    updated_at: admin.firestore.FieldValue.serverTimestamp()
                };
            } catch (error) {
                logger.error(`Error transforming question ${q.id}:`, error);
                return null;
            }
        })
        .filter(q => q !== null); // Remove any invalid questions
}

async function migrateToFirestore(questions) {
    const batch_size = 500; // Firestore batch limit
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let currentBatch = 1;
    const totalBatches = Math.ceil(questions.length / batch_size);

    for (let i = 0; i < questions.length; i += batch_size) {
        const batch = db.batch();
        const currentQuestions = questions.slice(i, i + batch_size);
        
        logger.info(`Processing batch ${currentBatch}/${totalBatches} (${currentQuestions.length} questions)`);

        // Check existing questions first
        const existingDocs = await Promise.all(
            currentQuestions.map(q => 
                db.collection('questions').doc(q.question_id).get()
            )
        );

        const questionsToUpload = currentQuestions.filter((question, index) => {
            const existingDoc = existingDocs[index];
            if (!existingDoc.exists) {
                return true; // Question doesn't exist, upload it
            }

            const existingData = existingDoc.data();
            // Compare relevant fields to check if update is needed
            const needsUpdate = 
                existingData.question_text !== question.question_text ||
                existingData.correct_answer !== question.correct_answer ||
                JSON.stringify(existingData.incorrect_answers) !== JSON.stringify(question.incorrect_answers) ||
                existingData.explanation !== question.explanation;

            if (!needsUpdate) {
                skipCount++;
                logger.info(`Skipping question ${question.question_id} - already exists and up to date`);
            }
            return needsUpdate;
        });

        if (questionsToUpload.length === 0) {
            logger.info(`Skipping batch ${currentBatch}/${totalBatches} - all questions up to date`);
            currentBatch++;
            continue;
        }

        logger.info(`Found ${questionsToUpload.length} questions to upload in batch ${currentBatch}`);

        questionsToUpload.forEach((question, index) => {
            const docRef = db.collection('questions').doc(question.question_id);
            try {
                batch.set(docRef, question);
                logger.info(`Added question ${question.question_id} to batch (${index + 1}/${questionsToUpload.length})`);
            } catch (error) {
                logger.error(`Failed to add question ${question.question_id} to batch:`, error);
                errorCount++;
            }
        });

        try {
            await batch.commit();
            successCount += questionsToUpload.length;
            logger.info(`Successfully committed batch ${currentBatch}/${totalBatches}`);
        } catch (error) {
            errorCount += questionsToUpload.length;
            logger.error(`Error in batch ${currentBatch}/${totalBatches}:`, error);
        }
        
        currentBatch++;
    }

    return { successCount, errorCount, skipCount };
}

async function main() {
    try {
        const questionBankPath = path.join(__dirname, '../../QuestionBank');
        logger.info('Starting question migration...');
        logger.info(`Reading questions from: ${questionBankPath}`);
        
        const questions = await readQuestionBank(questionBankPath);
        const totalQuestions = questions.length;
        logger.info(`Found ${totalQuestions} questions to migrate`);
        
        if (totalQuestions === 0) {
            logger.warn('No questions found to migrate. Check the following:');
            logger.warn('1. Question bank path is correct');
            logger.warn('2. Questions are in the correct format');
            logger.warn('3. All required fields are present');
            return;
        }

        const { successCount, errorCount, skipCount } = await migrateToFirestore(questions);
        
        // Clear some space in the console
        console.log('\n\n');
        
        // Create a summary table
        console.log('='.repeat(50));
        console.log('MIGRATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`New Questions Added    : ${successCount}`);
        console.log(`Already Exists        : ${skipCount}`);
        console.log(`Failed to Migrate     : ${errorCount}`);
        console.log('-'.repeat(50));
        console.log(`Total Questions       : ${totalQuestions}`);
        console.log('='.repeat(50));
        
        if (errorCount > 0) {
            console.log('\nWarning: Some questions failed to migrate. Check the logs above for details.');
        }
        
        if (successCount === 0 && errorCount === 0) {
            console.log('\nNote: All questions were already in the database. No changes were made.');
        }
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
main();
