/**
 * Firestore Viewer Launcher
 * 
 * This script provides a simple way to analyze and view your Firestore structure.
 * It first runs the analyzer and then starts the web viewer.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Analyzing Firestore structure...');

// Run the analyzer first
const analyzer = spawn('node', ['fetch_firestore_structure.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

analyzer.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Error analyzing Firestore structure.');
        process.exit(code);
    }
    
    console.log('✅ Firestore structure analysis complete.');
    console.log('🌐 Starting web viewer...');
    
    // Then start the web viewer
    const viewer = spawn('node', ['view_collections.js'], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    viewer.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Error starting web viewer.');
            process.exit(code);
        }
    });
    
    console.log('🚀 Web viewer started at http://localhost:3500');
    console.log('Press Ctrl+C to stop the server.');
});
