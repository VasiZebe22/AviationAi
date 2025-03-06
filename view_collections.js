/**
 * Firestore Collection Viewer
 * 
 * This script creates a simple web server that displays Firestore collections,
 * their structure, and provides insights about the database.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { analyzeFirestore, generatePerformanceRecommendations } = require('./fetch_firestore_structure');

// Create Express app
const app = express();
const PORT = 3500;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Create HTML file for the viewer
const createHtmlFile = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firestore Collection Viewer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding-top: 20px;
            padding-bottom: 20px;
            background-color: #f8f9fa;
        }
        .collection-card {
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .collection-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        .card-header {
            background-color: #f1f8ff;
            font-weight: bold;
        }
        pre {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            max-height: 400px;
            overflow-y: auto;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
        }
        .spinner-border {
            width: 3rem;
            height: 3rem;
        }
        .nav-tabs {
            margin-bottom: 15px;
        }
        .badge {
            margin-left: 5px;
        }
        .document-id {
            font-family: monospace;
            color: #6c757d;
        }
        .field-type {
            color: #0d6efd;
            font-size: 0.85em;
        }
        .recommendations {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 20px;
        }
        .security-warning {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin-bottom: 20px;
        }
        .tree-view {
            font-family: monospace;
        }
        .tree-view ul {
            list-style-type: none;
            padding-left: 20px;
        }
        .tree-view li {
            position: relative;
            padding-left: 15px;
        }
        .tree-view li::before {
            content: "├─";
            position: absolute;
            left: 0;
        }
        .tree-view li:last-child::before {
            content: "└─";
        }
        .refresh-btn {
            margin-bottom: 20px;
        }
        .timestamp {
            font-size: 0.8em;
            color: #6c757d;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="pb-3 mb-4 border-bottom">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="display-5 fw-bold">Firestore Collection Viewer</h1>
                <button id="refreshBtn" class="btn btn-primary">
                    <i class="bi bi-arrow-clockwise"></i> Refresh Data
                </button>
            </div>
            <p class="timestamp" id="timestamp"></p>
        </header>

        <div id="loading" class="loading">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div id="content" style="display: none;">
            <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="collections-tab" data-bs-toggle="tab" data-bs-target="#collections" type="button" role="tab" aria-controls="collections" aria-selected="true">Collections</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="rules-tab" data-bs-toggle="tab" data-bs-target="#rules" type="button" role="tab" aria-controls="rules" aria-selected="false">Security Rules</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="recommendations-tab" data-bs-toggle="tab" data-bs-target="#recommendations" type="button" role="tab" aria-controls="recommendations" aria-selected="false">Recommendations</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="structure-tab" data-bs-toggle="tab" data-bs-target="#structure" type="button" role="tab" aria-controls="structure" aria-selected="false">Database Structure</button>
                </li>
            </ul>
            
            <div class="tab-content" id="myTabContent">
                <div class="tab-pane fade show active" id="collections" role="tabpanel" aria-labelledby="collections-tab">
                    <div id="collectionsContainer" class="row"></div>
                </div>
                <div class="tab-pane fade" id="rules" role="tabpanel" aria-labelledby="rules-tab">
                    <div class="card">
                        <div class="card-header">Security Rules</div>
                        <div class="card-body">
                            <pre id="securityRules">Loading security rules...</pre>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="recommendations" role="tabpanel" aria-labelledby="recommendations-tab">
                    <div id="recommendationsContainer"></div>
                </div>
                <div class="tab-pane fade" id="structure" role="tabpanel" aria-labelledby="structure-tab">
                    <div class="card">
                        <div class="card-header">Database Structure</div>
                        <div class="card-body">
                            <div id="treeView" class="tree-view"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Fetch Firestore structure data
            fetchData();
            
            // Set up refresh button
            document.getElementById('refreshBtn').addEventListener('click', function() {
                fetchData(true);
            });
            
            function fetchData(refresh = false) {
                // Show loading spinner
                document.getElementById('loading').style.display = 'flex';
                document.getElementById('content').style.display = 'none';
                
                // Fetch data from API
                fetch('/api/structure' + (refresh ? '?refresh=true' : ''))
                    .then(response => response.json())
                    .then(data => {
                        // Update timestamp
                        document.getElementById('timestamp').textContent = 'Last updated: ' + new Date(data.timestamp).toLocaleString();
                        
                        // Render collections
                        renderCollections(data.collections);
                        
                        // Render security rules
                        renderSecurityRules(data.securityRules);
                        
                        // Render recommendations
                        renderRecommendations(data.recommendations);
                        
                        // Render tree view
                        renderTreeView(data);
                        
                        // Hide loading spinner and show content
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('content').style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        document.getElementById('loading').innerHTML = '<div class="alert alert-danger">Error loading data. Please check the console for details.</div>';
                    });
            }
            
            function renderCollections(collections) {
                const container = document.getElementById('collectionsContainer');
                container.innerHTML = '';
                
                if (!collections || Object.keys(collections).length === 0) {
                    container.innerHTML = '<div class="col-12"><div class="alert alert-info">No collections found.</div></div>';
                    return;
                }
                
                Object.keys(collections).forEach(collName => {
                    const collection = collections[collName];
                    const card = document.createElement('div');
                    card.className = 'col-md-6';
                    
                    let documentsHtml = '';
                    if (collection.sampleDocuments) {
                        Object.keys(collection.sampleDocuments).forEach(docId => {
                            const doc = collection.sampleDocuments[docId];
                            
                            let fieldsHtml = '';
                            if (doc.fields) {
                                Object.keys(doc.fields).forEach(fieldName => {
                                    const field = doc.fields[fieldName];
                                    fieldsHtml += `<li><strong>${fieldName}</strong> <span class="field-type">(${field.type})</span></li>`;
                                });
                            }
                            
                            let subcollectionsHtml = '';
                            if (doc.subcollections) {
                                Object.keys(doc.subcollections).forEach(subCollName => {
                                    subcollectionsHtml += `<li><strong>${subCollName}</strong></li>`;
                                });
                            }
                            
                            documentsHtml += `
                                <div class="card mb-2">
                                    <div class="card-header">
                                        <span class="document-id">${docId}</span>
                                    </div>
                                    <div class="card-body">
                                        <h6>Fields:</h6>
                                        <ul>${fieldsHtml || '<li>No fields</li>'}</ul>
                                        ${subcollectionsHtml ? `<h6>Subcollections:</h6><ul>${subcollectionsHtml}</ul>` : ''}
                                    </div>
                                </div>
                            `;
                        });
                    }
                    
                    card.innerHTML = `
                        <div class="card collection-card">
                            <div class="card-header">
                                ${collName}
                                <span class="badge bg-primary">${collection.documentCount || 0} documents</span>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">Sample Documents</h5>
                                ${documentsHtml || '<p>No sample documents available</p>'}
                            </div>
                        </div>
                    `;
                    
                    container.appendChild(card);
                });
            }
            
            function renderSecurityRules(rules) {
                const rulesElement = document.getElementById('securityRules');
                rulesElement.textContent = rules || 'No security rules available';
            }
            
            function renderRecommendations(recommendations) {
                const container = document.getElementById('recommendationsContainer');
                container.innerHTML = '';
                
                if (!recommendations) {
                    container.innerHTML = '<div class="alert alert-info">No recommendations available.</div>';
                    return;
                }
                
                // Render indexes recommendations
                if (recommendations.indexes && recommendations.indexes.length > 0) {
                    const indexesHtml = recommendations.indexes.map(rec => `
                        <div class="mb-2">
                            <strong>Collection:</strong> ${rec.collection}<br>
                            <strong>Recommendation:</strong> ${rec.recommendation}
                        </div>
                    `).join('');
                    
                    container.innerHTML += `
                        <div class="recommendations mb-4">
                            <h4>Index Recommendations</h4>
                            ${indexesHtml}
                        </div>
                    `;
                }
                
                // Render structure issues
                if (recommendations.structureIssues && recommendations.structureIssues.length > 0) {
                    const issuesHtml = recommendations.structureIssues.map(issue => `
                        <div class="mb-2">
                            <strong>Collection:</strong> ${issue.collection}<br>
                            <strong>Document:</strong> ${issue.document}<br>
                            <strong>Field:</strong> ${issue.field}<br>
                            <strong>Recommendation:</strong> ${issue.recommendation}
                        </div>
                    `).join('');
                    
                    container.innerHTML += `
                        <div class="recommendations mb-4">
                            <h4>Structure Issues</h4>
                            ${issuesHtml}
                        </div>
                    `;
                }
                
                // Render security concerns
                if (recommendations.securityConcerns && recommendations.securityConcerns.length > 0) {
                    const concernsHtml = recommendations.securityConcerns.map(concern => `
                        <div class="mb-2">
                            <strong>Severity:</strong> ${concern.severity}<br>
                            <strong>Recommendation:</strong> ${concern.recommendation}
                        </div>
                    `).join('');
                    
                    container.innerHTML += `
                        <div class="security-warning mb-4">
                            <h4>Security Concerns</h4>
                            ${concernsHtml}
                        </div>
                    `;
                }
                
                // If no recommendations in any category
                if ((!recommendations.indexes || recommendations.indexes.length === 0) &&
                    (!recommendations.structureIssues || recommendations.structureIssues.length === 0) &&
                    (!recommendations.securityConcerns || recommendations.securityConcerns.length === 0)) {
                    container.innerHTML = '<div class="alert alert-success">No issues or recommendations found. Your database structure looks good!</div>';
                }
            }
            
            function renderTreeView(data) {
                const treeView = document.getElementById('treeView');
                treeView.innerHTML = '';
                
                const rootUl = document.createElement('ul');
                
                // Project ID
                const projectLi = document.createElement('li');
                projectLi.textContent = `Project: ${data.projectId}`;
                rootUl.appendChild(projectLi);
                
                // Collections
                const collectionsLi = document.createElement('li');
                collectionsLi.textContent = 'Collections';
                const collectionsUl = document.createElement('ul');
                
                Object.keys(data.collections).forEach(collName => {
                    const collection = data.collections[collName];
                    const collLi = document.createElement('li');
                    collLi.textContent = `${collName} (${collection.documentCount || 0} documents)`;
                    
                    // Sample documents
                    if (collection.sampleDocuments && Object.keys(collection.sampleDocuments).length > 0) {
                        const docsUl = document.createElement('ul');
                        
                        Object.keys(collection.sampleDocuments).forEach(docId => {
                            const doc = collection.sampleDocuments[docId];
                            const docLi = document.createElement('li');
                            docLi.textContent = docId;
                            
                            // Fields
                            if (doc.fields && Object.keys(doc.fields).length > 0) {
                                const fieldsUl = document.createElement('ul');
                                
                                Object.keys(doc.fields).forEach(fieldName => {
                                    const field = doc.fields[fieldName];
                                    const fieldLi = document.createElement('li');
                                    fieldLi.textContent = `${fieldName}: ${field.type}`;
                                    fieldsUl.appendChild(fieldLi);
                                });
                                
                                docLi.appendChild(fieldsUl);
                            }
                            
                            // Subcollections
                            if (doc.subcollections) {
                                const subCollsUl = document.createElement('ul');
                                
                                Object.keys(doc.subcollections).forEach(subCollName => {
                                    const subColl = doc.subcollections[subCollName];
                                    const subCollLi = document.createElement('li');
                                    subCollLi.textContent = `${subCollName} (subcollection)`;
                                    subCollsUl.appendChild(subCollLi);
                                });
                                
                                docLi.appendChild(subCollsUl);
                            }
                            
                            docsUl.appendChild(docLi);
                        });
                        
                        collLi.appendChild(docsUl);
                    }
                    
                    collectionsUl.appendChild(collLi);
                });
                
                collectionsLi.appendChild(collectionsUl);
                rootUl.appendChild(collectionsLi);
                treeView.appendChild(rootUl);
            }
        });
    </script>
</body>
</html>
    `;
    
    fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);
};

// Create the HTML file when the server starts
createHtmlFile();

// API endpoint to get Firestore structure
app.get('/api/structure', async (req, res) => {
    try {
        const refresh = req.query.refresh === 'true';
        const outputFile = path.join(__dirname, 'firestore_structure.json');
        
        // Check if we need to refresh the data or if it already exists
        if (refresh || !fs.existsSync(outputFile)) {
            // Analyze Firestore and save to file
            const structure = await analyzeFirestore({
                outputFile,
                maxDepth: 3,
                includeRules: true
            });
            
            // Generate recommendations
            structure.recommendations = generatePerformanceRecommendations(structure);
            
            // Save updated structure with recommendations
            fs.writeFileSync(outputFile, JSON.stringify(structure, null, 2));
            
            res.json(structure);
        } else {
            // Read existing structure from file
            const structure = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
            res.json(structure);
        }
    } catch (error) {
        console.error('Error fetching structure:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Firestore Collection Viewer running at http://localhost:${PORT}`);
});
