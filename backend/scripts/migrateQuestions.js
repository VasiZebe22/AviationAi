require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../logger');

// Debug environment variables
console.log('Checking environment variables:');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

// Initialize Firebase Admin SDK (it will use the existing config from ../.env)
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Verify service account
if (!serviceAccount.project_id) {
    throw new Error('Missing FIREBASE_PROJECT_ID in environment variables');
}
if (!serviceAccount.private_key) {
    throw new Error('Missing FIREBASE_PRIVATE_KEY in environment variables');
}
if (!serviceAccount.client_email) {
    throw new Error('Missing FIREBASE_CLIENT_EMAIL in environment variables');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function backupExistingQuestions() {
    try {
        logger.info('Starting backup of existing questions...');
        const snapshot = await db.collection('questions').get();
        const backup = {
            timestamp: new Date().toISOString(),
            questions: []
        };

        snapshot.forEach(doc => {
            backup.questions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Save backup to a JSON file
        const backupPath = path.join(__dirname, `../../backups/questions_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        await fs.mkdir(path.dirname(backupPath), { recursive: true });
        await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
        logger.info(`Backup completed: ${backupPath}`);
        
        // Delete existing collection in batches
        const batchSize = 250;
        const batches = [];
        let batch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
            count++;

            if (count % batchSize === 0) {
                batches.push(batch.commit());
                batch = db.batch();
                logger.info(`Queued deletion batch ${Math.ceil(count / batchSize)}`);
            }
        }

        // Commit any remaining deletions
        if (count % batchSize !== 0) {
            batches.push(batch.commit());
        }

        // Wait for all deletion batches to complete
        await Promise.all(batches);
        logger.info('Existing questions collection deleted');
    } catch (error) {
        logger.error('Backup failed:', error);
        throw error;
    }
}

async function readQuestionBank(questionsPath) {
    const allQuestions = [];
    const metadata = JSON.parse(await fs.readFile(path.join(questionsPath, 'metadata.json'), 'utf8'));

    // Read all question files
    const files = await fs.readdir(questionsPath);
    for (const file of files) {
        if (!file.endsWith('.json') || file === 'metadata.json') continue;

        try {
            const filePath = path.join(questionsPath, file);
            const categoryData = JSON.parse(await fs.readFile(filePath, 'utf8'));
            
            // Transform questions to match Firestore schema
            const transformedQuestions = transformQuestions(categoryData.questions);
            allQuestions.push(...transformedQuestions);
            
            logger.info(`Processed ${transformedQuestions.length} questions from ${file}`);
        } catch (error) {
            logger.error(`Error processing file ${file}:`, error);
        }
    }

    return allQuestions;
}

function transformQuestions(questions) {
    if (!Array.isArray(questions)) {
        logger.warn('Questions data is not an array');
        return [];
    }

    return questions
        .filter(q => q && typeof q === 'object')
        .map(q => {
            try {
                if (!q.question || !q.options || !q.correct_answer) {
                    logger.warn(`Skipping question ${q.id} - missing required fields`);
                    return null;
                }

                // Transform to Firestore schema
                return {
                    id: q.id,
                    category: {
                        code: q.category.code,
                        name: q.category.name
                    },
                    subcategories: q.subcategories.map(sub => ({
                        code: sub.code,
                        name: sub.name
                    })),
                    question: q.question,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation || '',
                    learning_materials: q.learning_materials || [],
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    updated_at: admin.firestore.FieldValue.serverTimestamp()
                };
            } catch (error) {
                logger.error(`Error transforming question ${q.id}:`, error);
                return null;
            }
        })
        .filter(Boolean); // Remove null values
}

async function migrateToFirestore(questions) {
    const batchSize = 400; // Firestore has a limit of 500 operations per batch
    let batch = db.batch();
    let count = 0;
    let batchCount = 0;
    const questionsRef = db.collection('questions');

    logger.info(`Starting migration of ${questions.length} questions`);

    for (const question of questions) {
        const docRef = questionsRef.doc(question.id);
        batch.set(docRef, question);
        count++;

        if (count % batchSize === 0) {
            await batch.commit();
            logger.info(`Migrated batch ${++batchCount} (${count} questions)`);
            batch = db.batch();
        }
    }

    // Commit any remaining questions
    if (count % batchSize !== 0) {
        await batch.commit();
        logger.info(`Migrated final batch (${count} questions total)`);
    }

    logger.info(`Migration complete. Total questions: ${count}, Total batches: ${batchCount + 1}`);
}

async function main() {
    try {
        logger.info('Starting migration process...');
        
        // Backup and delete existing questions
        await backupExistingQuestions();
        
        // Read and migrate new questions
        const questions = await readQuestionBank(path.join(__dirname, '../../Questions updated'));
        await migrateToFirestore(questions);
        
        logger.info('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
main();
