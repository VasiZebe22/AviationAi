require('dotenv').config({ path: '../backend/.env' });
const admin = require('firebase-admin');

// Initialize Firebase Admin using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const indexes = {
  indexes: [
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'categoryId', order: 'ASCENDING' },
        { fieldPath: 'created_at', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'categoryId', order: 'ASCENDING' },
        { fieldPath: 'difficulty', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'categoryId', order: 'ASCENDING' },
        { fieldPath: 'topic', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'subcategory.id', order: 'ASCENDING' },
        { fieldPath: 'created_at', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'topic', order: 'ASCENDING' },
        { fieldPath: 'difficulty', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'tags', arrayConfig: 'CONTAINS' },
        { fieldPath: 'created_at', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'categoryId', order: 'ASCENDING' },
        { fieldPath: 'topic', order: 'ASCENDING' },
        { fieldPath: 'difficulty', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'questions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'categoryId', order: 'ASCENDING' },
        { fieldPath: 'topic', order: 'ASCENDING' },
        { fieldPath: 'difficulty', order: 'ASCENDING' },
        { fieldPath: 'created_at', order: 'DESCENDING' }
      ]
    }
  ],
  fieldOverrides: []
};

async function createIndexes() {
  try {
    console.log('Starting index creation...');
    
    // Use the proper index management API
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const databaseId = '(default)';
    
    const parent = `projects/${projectId}/databases/${databaseId}`;
    console.log(`Creating indexes in ${parent}`);
    
    // Create the indexes using the proper API
    await admin.firestore().collection('_').doc('_').delete().catch(() => {});
    const result = await admin.firestore().listIndexes();
    console.log('Current indexes:', result);
    
    // Create each index using the proper configuration
    for (const index of indexes.indexes) {
      try {
        await admin.firestore().createIndex(index);
        console.log(`Created index: ${JSON.stringify(index.fields)}`);
      } catch (error) {
        if (error.code === 6) { // ALREADY_EXISTS
          console.log(`Index already exists: ${JSON.stringify(index.fields)}`);
        } else {
          console.error(`Error creating index: ${error.message}`);
        }
      }
    }
    
    console.log('Index creation completed. Check Firebase Console > Firestore > Indexes to monitor progress.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createIndexes();
