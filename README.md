# AI-Based Resume Generator

An AI-powered web application that generates professional, ATS-friendly resumes based on user-provided information using open-source LLMs.

---

## Overview

The AI-Based Resume Generator allows users to input their personal, educational, and professional details through a user-friendly interface.  
The backend processes this information and uses an AI language model to generate a well-structured resume in JSON format, which is then displayed in a clean template on the frontend.

This project demonstrates the integration of **Generative AI** with a **full-stack application** using modern frontend frameworks and a Java-based backend.

---

## Features

- AI-generated professional resumes
- Clean and responsive UI
- JSON-based resume generation
- Open-source LLM integration 
- Easily extendable for multiple templates
- ATS-friendly resume structure

---

## Tech Stack

### Frontend
- **JavaScript**
- **Tailwind CSS**
- **DaisyUI**

### Backend
- **Java**
- **Spring Boot**
- REST APIs

### AI / LLM
- **Ollama**
- **DeepSeek Model**

---

## 🧠 How It Works

1. User enters resume details via frontend form
2. Frontend sends data as a JSON request to backend
3. Backend creates a prompt and sends it to Ollama
4. DeepSeek model generates resume content in JSON format
5. Backend returns the response
6. Frontend parses JSON and renders resume in a template

---

## ⚙️ Installation & Setup

### Prerequisites
- Java 17+
- Node.js & npm
- Ollama installed locally
- DeepSeek model pulled in Ollama

---

### Backend Setup

```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
### Ollama Setup
```bash
ollama pull deepseek
ollama run deepseek
```
### API Endpoint
```bash
POST /api/v1/resume/generate
```

### Response
```json
{
  "resume": {
    "summary": "...",
    "skills": [],
    "experience": []
  }
}
```

---

## UI Screenshots

### Navigation Bar
<img width="1280" height="130" alt="Navigation Bar" src="https://github.com/user-attachments/assets/ca6f3e0f-f386-4d13-9bed-2184b3c438cc" />

---

### Interactive Dashboard
<img width="1280" height="604" alt="Interactive Dashboard" src="https://github.com/user-attachments/assets/335dc5ef-d898-400d-b39f-63aa4313bcc3" />

---

### User Input
<img width="1008" height="630" alt="User Input" src="https://github.com/user-attachments/assets/78c31481-3305-4a29-96d5-b003ac43f5a1" />

---

### Generated Resume
<img width="356" height="525" alt="Generated Resume" src="https://github.com/user-attachments/assets/ec2d46a3-2138-4800-8e77-87cfe1be2af1" />

---

### Storage Options
<img width="1280" height="351" alt="Storage Options" src="https://github.com/user-attachments/assets/22837c59-fe80-415b-8c5e-e12660051108" />


### Acknowledgements
- Ollama for local LLM support
- DeepSeek open-source model
- Tailwind & DaisyUI for UI components

---
