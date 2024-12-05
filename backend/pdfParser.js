const fs = require('fs');
const pdf = require('pdf-parse');

// Function to parse a PDF
const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath); // Read the PDF file
        const data = await pdf(dataBuffer); // Extract text from PDF
        console.log("PDF Content:", data.text); // Print the extracted text
    } catch (error) {
        console.error("Error reading PDF:", error);
    }
};

// Test the function with a sample PDF
parsePDF('./data/sample.pdf'); // Replace 'sample.pdf' with the name of your PDF file
