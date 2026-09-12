# AI Usage Note

## AI Tools Used

I used **ChatGPT** as a supporting development tool while building this project.

The majority of the project was **personally designed and implemented by me**. I used ChatGPT mainly when I needed help with boilerplate code, understanding errors, debugging issues, and checking possible solutions.

## How I Used AI

ChatGPT was mainly used for:

* Generating some initial boilerplate code and setup guidance.
* Helping troubleshoot bugs and error messages during development.
* Explaining unfamiliar code or implementation details when needed.
* Suggesting possible fixes when I encountered issues during local development or deployment.
* Helping improve small parts of the implementation after I had already built the main functionality.

I did **not** rely on AI to independently design and build the complete project.

## My Contribution

I personally worked on and was responsible for:

* Understanding the assignment requirements and deciding the project workflow.
* Designing the overall **Question → Understand → Clarify → Experiment → Test → Learn** flow.
* Choosing the technology stack.
* Building the React frontend and user interface.
* Building and configuring the Node.js/Express backend.
* Integrating the Gemini API into the application.
* Designing the structured experiment output and clarification flow.
* Handling missing information instead of blindly assuming important trading parameters.
* Implementing the prototype Test and Learn sections.
* Connecting the frontend and backend.
* Configuring environment variables and API communication.
* Deploying the backend and frontend.
* Testing the application and fixing issues encountered during development.
* Reviewing the code generated or suggested by AI before using it.

## How I Reviewed AI-Generated Code

Whenever I used code or suggestions from ChatGPT, I reviewed and adapted them to fit my project rather than directly relying on them without verification.

I tested the implementation locally, checked the API responses, debugged errors, and made the necessary changes myself.

One example was debugging the deployed backend when the Gemini API returned a quota-related error. I checked the Render logs, identified that the issue was related to the Gemini API request quota, and changed the model configuration accordingly.

## AI in the Product

The application itself uses the **Gemini API** to understand natural-language trading questions and convert them into a structured experiment.

This is separate from my use of ChatGPT during development. Gemini is part of the application's functionality, while ChatGPT was primarily used as a development assistant.

## Summary

Overall, I used AI as a **development aid rather than as a replacement for my own implementation**. I personally handled the main product decisions, architecture, implementation, testing, deployment, and debugging, while using ChatGPT selectively for boilerplate code, troubleshooting, explanations, and development guidance.
