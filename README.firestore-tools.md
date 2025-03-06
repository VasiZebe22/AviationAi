# Firestore Structure Analyzer and Viewer

This set of tools helps you analyze and view your Firebase Firestore collections, structure, and security rules. These tools are designed to help us understand your database structure when working on your AviationAi project.

## Tools Included

1. **Firestore Structure Analyzer** (`fetch_firestore_structure.js`)
   - Analyzes your Firestore database structure
   - Identifies collections, documents, fields, and their types
   - Examines security rules
   - Generates performance recommendations

2. **Firestore Collection Viewer** (`view_collections.js`)
   - Provides a web interface to browse your Firestore collections
   - Displays collection structure in a user-friendly format
   - Shows security rules
   - Presents performance recommendations
   - Visualizes database structure in a tree view

## Prerequisites

- Node.js installed
- Firebase project with Firestore
- Firebase Admin SDK credentials (already configured in your backend/.env file)

## Setup

1. The tools are already configured to use your existing Firebase credentials from the `backend/.env` file.

2. Install dependencies:

```bash
npm install
```

## Usage

### Analyze Firestore Structure

Run the analyzer to generate a JSON file with your Firestore structure:

```bash
npm run analyze-firestore
```

Options:
- `--max-depth <number>`: Maximum depth for subcollection analysis (default: 3)
- `--output <file>`: Output file path (default: firestore_structure.json)
- `--no-rules`: Skip fetching security rules
- `--no-recommendations`: Skip generating performance recommendations

Example:
```bash
node fetch_firestore_structure.js --max-depth 4 --output my_structure.json
```

### View Firestore Collections

Start the web interface to view your Firestore collections:

```bash
npm run view-collections
```

Then open your browser to http://localhost:3500

Features:
- Browse collections and their structure
- View sample documents and fields
- Examine security rules
- See performance recommendations
- Visualize database structure

## How to Use with Cascade

When working on the AviationAi project, you can run these tools to provide me with the latest information about your Firestore database structure. This will help me provide more accurate assistance based on your actual database schema.

For example, if we're working on a feature that involves a specific collection, you can run:

```bash
npm run view-collections
```

Then share any relevant information about the collection structure with me.

## Notes

- The tools cache the database structure to avoid excessive Firestore reads
- Click the "Refresh Data" button in the web interface to update the cached data
- Security rules may require Firebase CLI to be installed and configured
