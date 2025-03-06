/**
 * Firestore Structure Analyzer
 * 
 * This script fetches and analyzes the structure of Firestore collections
 * to provide insights about the database schema, relationships, and performance considerations.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.resolve(__dirname, 'backend', '.env') });

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    try {
        // Check if app is already initialized
        try {
            admin.app();
        } catch (e) {
            // Initialize Firebase Admin SDK with environment variables
            const serviceAccount = {
                type: process.env.FIREBASE_TYPE,
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY ? 
                    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
                    undefined,
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI,
                token_uri: process.env.FIREBASE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
            };

            // Validate required fields
            const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
            const missingFields = requiredFields.filter(field => !serviceAccount[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
            }

            // Initialize Admin SDK
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }

        console.log('Firebase Admin SDK initialized successfully');
        return admin.firestore();
    } catch (error) {
        console.error('Firebase Admin SDK initialization error:', error);
        throw error;
    }
};

/**
 * Fetches all collections from Firestore
 * @returns {Promise<Array>} Array of collection references
 */
const fetchCollections = async (db) => {
    try {
        const collections = await db.listCollections();
        return collections;
    } catch (error) {
        console.error('Error fetching collections:', error);
        throw error;
    }
};

/**
 * Analyzes a document and its subcollections recursively
 * @param {Object} docRef - Document reference
 * @param {Number} depth - Current depth in the recursion
 * @param {Object} structure - Object to store the structure information
 * @returns {Promise<Object>} Document structure with fields and subcollections
 */
const analyzeDocument = async (docRef, depth = 0, maxDepth = 3) => {
    if (depth > maxDepth) {
        return { note: `Max depth (${maxDepth}) reached. Stopping recursion.` };
    }

    try {
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return { exists: false };
        }

        const data = doc.data();
        const fields = {};
        
        // Analyze field types
        Object.keys(data).forEach(key => {
            const value = data[key];
            let type = typeof value;
            
            if (value === null) {
                type = 'null';
            } else if (value instanceof Date) {
                type = 'timestamp';
            } else if (Array.isArray(value)) {
                type = 'array';
                if (value.length > 0) {
                    type += ` of ${typeof value[0]}`;
                }
            } else if (type === 'object') {
                if (value.constructor && value.constructor.name === 'DocumentReference') {
                    type = 'reference';
                } else if (value._latitude !== undefined && value._longitude !== undefined) {
                    type = 'geopoint';
                }
            }
            
            fields[key] = { type };
        });

        // Get subcollections
        const subcollections = {};
        const subCollectionRefs = await docRef.listCollections();
        
        for (const subCollRef of subCollectionRefs) {
            const subCollName = subCollRef.id;
            const sampleDocs = await subCollRef.limit(2).get();
            
            subcollections[subCollName] = {
                count: sampleDocs.size,
                sample: {}
            };
            
            if (sampleDocs.size > 0) {
                const sampleDoc = sampleDocs.docs[0];
                subcollections[subCollName].sample = await analyzeDocument(sampleDoc.ref, depth + 1, maxDepth);
            }
        }

        return {
            exists: true,
            fields,
            subcollections: Object.keys(subcollections).length > 0 ? subcollections : null
        };
    } catch (error) {
        console.error(`Error analyzing document ${docRef.path}:`, error);
        return { error: error.message };
    }
};

/**
 * Analyzes a collection and its documents
 * @param {Object} collRef - Collection reference
 * @returns {Promise<Object>} Collection structure with document samples
 */
const analyzeCollection = async (collRef, maxDepth = 3) => {
    try {
        // Limit to 3 sample documents as requested
        const snapshot = await collRef.limit(3).get();
        const docCount = snapshot.size;
        
        console.log(`Analyzing collection ${collRef.id} (${docCount} sample documents)`);
        
        const documents = {};
        const promises = [];

        snapshot.forEach(doc => {
            promises.push(
                analyzeDocument(doc.ref, 0, maxDepth).then(structure => {
                    documents[doc.id] = structure;
                })
            );
        });

        await Promise.all(promises);

        // Get total document count (this might be expensive for large collections)
        const countSnapshot = await collRef.count().get();
        const totalCount = countSnapshot.data().count;

        return {
            id: collRef.id,
            documentCount: totalCount,
            sampleSize: docCount,
            sampleDocuments: documents
        };
    } catch (error) {
        console.error(`Error analyzing collection ${collRef.id}:`, error);
        return { 
            id: collRef.id, 
            error: error.message 
        };
    }
};

/**
 * Fetches Firestore security rules
 * @returns {Promise<String>} Security rules as string
 */
const fetchSecurityRules = async () => {
    try {
        // Try multiple methods to fetch security rules
        
        // Method 1: Check for the manual rules file first
        try {
            const fs = require('fs');
            const path = require('path');
            const manualRulesPath = path.join(__dirname, 'firestore.rules.manual');
            
            if (fs.existsSync(manualRulesPath)) {
                console.log('Using manually provided security rules from firestore.rules.manual');
                const rules = fs.readFileSync(manualRulesPath, 'utf8');
                return rules;
            }
        } catch (manualError) {
            console.log('Manual rules file not available:', manualError.message);
        }
        
        // Method 2: Try using the Firebase Admin SDK
        try {
            // Check if we can access the rules via Admin SDK
            const { getFirestore } = require('firebase-admin/firestore');
            const db = getFirestore();
            
            // Unfortunately, the Admin SDK doesn't provide direct access to security rules
            // We'll try other methods
        } catch (adminError) {
            console.log('Admin SDK method not available for fetching rules:', adminError.message);
        }
        
        // Method 3: Try using the Firebase CLI if installed
        try {
            const { execSync } = require('child_process');
            const rules = execSync('firebase firestore:rules --project=' + process.env.FIREBASE_PROJECT_ID).toString();
            if (rules && !rules.includes('Error:')) {
                return rules;
            }
        } catch (cliError) {
            console.log('Firebase CLI method not available for fetching rules:', cliError.message);
        }
        
        // Method 4: Try to read the firestore.rules file if it exists
        try {
            const fs = require('fs');
            const path = require('path');
            
            // Check common locations for the rules file
            const possiblePaths = [
                path.join(__dirname, 'firestore.rules'),
                path.join(__dirname, 'firebase', 'firestore.rules'),
                path.join(__dirname, 'backend', 'firestore.rules')
            ];
            
            for (const rulePath of possiblePaths) {
                if (fs.existsSync(rulePath)) {
                    const rules = fs.readFileSync(rulePath, 'utf8');
                    return rules;
                }
            }
        } catch (fsError) {
            console.log('File system method not available for fetching rules:', fsError.message);
        }
        
        // Method 5: Try using the Firebase REST API with a service account
        try {
            const axios = require('axios');
            const { GoogleAuth } = require('google-auth-library');
            
            const auth = new GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/firebase.database']
            });
            
            const client = await auth.getClient();
            const token = await client.getAccessToken();
            
            const response = await axios.get(
                `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/collectionGroups/-/fields?pageSize=1000`,
                {
                    headers: {
                        Authorization: `Bearer ${token.token}`
                    }
                }
            );
            
            // This doesn't give us the actual rules, but it gives us field configurations
            // which is still useful information
            return JSON.stringify(response.data, null, 2);
        } catch (apiError) {
            console.log('REST API method not available for fetching rules:', apiError.message);
        }
        
        // If all methods fail, return a helpful message
        return `
// ==========================================
// FIRESTORE SECURITY RULES
// ==========================================
// 
// Could not automatically fetch your Firestore security rules.
// 
// To view your current rules, you can:
// 
// 1. Run this command in your terminal:
//    firebase firestore:rules --project=${process.env.FIREBASE_PROJECT_ID}
// 
// 2. Or view them in the Firebase Console:
//    https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/rules
// 
// 3. If you have a local firestore.rules file, make sure it's in one of these locations:
//    - ${path.join(__dirname, 'firestore.rules')}
//    - ${path.join(__dirname, 'firebase', 'firestore.rules')}
//    - ${path.join(__dirname, 'backend', 'firestore.rules')}
// 
// 4. Or paste your rules into the firestore.rules.manual file:
//    - ${path.join(__dirname, 'firestore.rules.manual')}
//    Then run this analyzer again.
// 
// ==========================================
`;
    } catch (error) {
        console.error('Error fetching security rules:', error);
        return 'Error fetching security rules: ' + error.message;
    }
};

/**
 * Analyzes the entire Firestore database structure
 */
const analyzeFirestore = async (options = {}) => {
    const maxDepth = options.maxDepth || 3;
    const outputFile = options.outputFile || 'firestore_structure.json';
    const includeRules = options.includeRules !== false;
    
    try {
        const db = initializeFirebase();
        const collections = await fetchCollections(db);
        
        console.log(`Found ${collections.length} top-level collections`);
        
        const structure = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            timestamp: new Date().toISOString(),
            collections: {}
        };
        
        // Analyze each collection
        for (const collRef of collections) {
            structure.collections[collRef.id] = await analyzeCollection(collRef, maxDepth);
        }
        
        // Fetch security rules if requested
        if (includeRules) {
            try {
                structure.securityRules = await fetchSecurityRules();
            } catch (error) {
                structure.securityRules = 'Error fetching security rules: ' + error.message;
            }
        }
        
        // Save to file
        fs.writeFileSync(
            path.resolve(outputFile), 
            JSON.stringify(structure, null, 2)
        );
        
        console.log(`Firestore structure analysis complete. Results saved to ${outputFile}`);
        return structure;
    } catch (error) {
        console.error('Error analyzing Firestore:', error);
        throw error;
    }
};

/**
 * Provides performance recommendations based on the database structure
 * @param {Object} structure - The database structure
 * @returns {Object} Performance recommendations
 */
const generatePerformanceRecommendations = (structure) => {
    const recommendations = {
        indexes: [],
        structureIssues: [],
        securityConcerns: []
    };
    
    // Analyze collections for potential index needs
    Object.keys(structure.collections).forEach(collName => {
        const collection = structure.collections[collName];
        
        // Check for large collections that might need indexes
        if (collection.documentCount > 1000) {
            recommendations.indexes.push({
                collection: collName,
                recommendation: `Collection has ${collection.documentCount} documents. Consider adding indexes for frequently queried fields.`
            });
        }
        
        // Check sample documents for potential structure issues
        if (collection.sampleDocuments) {
            Object.keys(collection.sampleDocuments).forEach(docId => {
                const doc = collection.sampleDocuments[docId];
                
                if (doc.fields) {
                    // Check for large arrays
                    Object.keys(doc.fields).forEach(fieldName => {
                        const field = doc.fields[fieldName];
                        if (field.type && field.type.startsWith('array')) {
                            recommendations.structureIssues.push({
                                collection: collName,
                                document: docId,
                                field: fieldName,
                                recommendation: `Array field detected. Ensure arrays don't grow too large as Firestore has a 1MB document size limit.`
                            });
                        }
                    });
                }
            });
        }
    });
    
    // Check security rules for common issues
    if (structure.securityRules && typeof structure.securityRules === 'string') {
        if (structure.securityRules.includes('allow read, write: if true')) {
            recommendations.securityConcerns.push({
                severity: 'HIGH',
                recommendation: 'Security rules contain "allow read, write: if true" which grants unrestricted access. Review and restrict access appropriately.'
            });
        }
    }
    
    return recommendations;
};

// Command line interface
const main = async () => {
    const args = process.argv.slice(2);
    const options = {
        maxDepth: 3,
        outputFile: 'firestore_structure.json',
        includeRules: true,
        generateRecommendations: true
    };
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--max-depth' && args[i+1]) {
            options.maxDepth = parseInt(args[i+1], 10);
            i++;
        } else if (args[i] === '--output' && args[i+1]) {
            options.outputFile = args[i+1];
            i++;
        } else if (args[i] === '--no-rules') {
            options.includeRules = false;
        } else if (args[i] === '--no-recommendations') {
            options.generateRecommendations = false;
        } else if (args[i] === '--help') {
            console.log(`
Firestore Structure Analyzer

Options:
  --max-depth <number>     Maximum depth for subcollection analysis (default: 3)
  --output <file>          Output file path (default: firestore_structure.json)
  --no-rules               Skip fetching security rules
  --no-recommendations     Skip generating performance recommendations
  --help                   Show this help message
            `);
            process.exit(0);
        }
    }
    
    try {
        const structure = await analyzeFirestore(options);
        
        if (options.generateRecommendations) {
            const recommendations = generatePerformanceRecommendations(structure);
            
            // Add recommendations to the structure
            structure.recommendations = recommendations;
            
            // Update the output file
            fs.writeFileSync(
                path.resolve(options.outputFile), 
                JSON.stringify(structure, null, 2)
            );
            
            console.log('Performance recommendations generated and added to output file');
        }
        
        console.log('Analysis complete!');
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
};

// Run the script if executed directly
if (require.main === module) {
    main();
} else {
    // Export functions for use in other scripts
    module.exports = {
        analyzeFirestore,
        generatePerformanceRecommendations
    };
}
