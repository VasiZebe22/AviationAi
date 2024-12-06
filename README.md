# AviationAI Project
Project by two gays united by the need of $$$


==Status==

Project Roadmap: Aviation AI Website
Completed Steps:
Initial Setup

Installed required tools (Node.js, Git, Visual Studio Code).
Created a GitHub repository for version control.
Established backend structure with Node.js and Express.
File Upload and Preprocessing

Set up file upload functionality using multer.
Configured preprocessing for plain text files.
Validated preprocessing pipeline (uploads, parsing, conversion to JSON).
Testing Backend

Tested upload and preprocess endpoints using PowerShell and Postman.
Verified backend functionality for plain text files.
Saved Progress

Organized backend code and maintained version control on GitHub.
Excluded unnecessary files like uploads using .gitignore.
Next Steps:
Short-Term Tasks:
Integrate OpenAI API (Next Step)

Implement functionality to generate embeddings for preprocessed files.
Store embeddings in a vector database like Pinecone or a local Faiss instance.
Develop an endpoint to handle user queries and return AI-generated responses based on embeddings.
Finalize Backend Testing

Fully test AI query and response pipeline.
Ensure safeguards to prevent hallucinations by restricting responses to trained data.
Mid-Term Tasks:
Frontend Development

Design and build a simple, user-friendly website interface.
Add user authentication and subscription model integration.
Connect the frontend to the backend for seamless interaction.
Content Security

Implement additional layers of security to protect your confidential training data.
Ensure users never directly access uploaded files.
Long-Term Goals:
Deploy Website
Set up hosting for the backend and frontend (e.g., AWS, Vercel).
Launch the website publicly with all features enabled.