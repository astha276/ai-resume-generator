<div align="center">

# AI-Based Resume Generator

**An AI-powered full-stack web application that generates, analyzes, and optimizes professional ATS-friendly resumes using open-source LLMs.**

</div>

---

## Overview

The **AI-Based Resume Generator** is a full-stack web application that enables users to create, analyze, and refine professional resumes through Generative AI.

Users can input their personal, educational, and professional details through an intuitive interface. The backend processes this information, constructs structured prompts, and leverages a locally running open-source LLM (DeepSeek via Ollama) to generate well-structured, ATS-optimized resumes in JSON format — rendered instantly on the frontend in a clean, professional template.

Beyond generation, the platform includes a **Resume–Job Match Analyzer**, **Gap Detection**, **Favorites and Resume History**, **Resume Preview**, **Section-Level Editing and Regeneration**, **Download Options**, and a secure **Login System**.

---

## Features

### Authentication
- Secure login and registration pages
- Session management with protected routes
- User-specific data isolation

### Resume Generation
- AI-generated professional resumes from user inputs
- Responsive UI with guided form inputs
- JSON-based resume generation via local LLM
- ATS-friendly resume structure
- Real-time resume preview before saving

### Resume–Job Match Analyzer
- Input a target job description alongside an existing resume
- AI analyzes the compatibility score between the resume and the job posting
- Highlights matched keywords, missing skills, and experience gaps
- Provides actionable recommendations to improve alignment

### Resume History and Management
- View all previously generated resumes in a history dashboard
- Preview any saved resume inline without leaving the page
- Mark resumes as favorites for quick access
- Delete unwanted resumes with confirmation
- Download resumes in supported formats (PDF / JSON)

### Resume Editing and Partial Regeneration
- Edit individual sections (Summary, Skills, Experience, Education, etc.)
- Regenerate specific sections using AI without rebuilding the entire resume
- Manual inline editing for fine-tuned customization
- Save updated versions back to history

### UI and UX
- Responsive design with Tailwind CSS and DaisyUI
- Interactive dashboard with resume statistics and quick actions
- Extendable architecture for multiple resume templates

---

## UI Screenshots

### Login Page
> Secure authentication gateway for all users.

<img width="300" height="700" alt="Login Page" src="https://github.com/user-attachments/assets/cc3447e7-e2ce-4fef-b92f-fa7865a34f2b" />


---

### Navigation Bar
<img width="1280" height="76" alt="image" src="https://github.com/user-attachments/assets/c6691027-b6a0-40ff-9435-1e4ecba59382" />

---

### Interactive Dashboard
<img width="1280" height="604" alt="Interactive Dashboard" src="https://github.com/user-attachments/assets/335dc5ef-d898-400d-b39f-63aa4313bcc3" />

---

### User Input Form
<img width="1441" height="764" alt="image" src="https://github.com/user-attachments/assets/7f828468-3bf3-48a9-b9a2-5f205f72b1e1" />


---

### Generated Resume Preview
> Users can preview the generated resume before saving or downloading.

<img width="724" height="749" alt="image" src="https://github.com/user-attachments/assets/59c86170-011a-4c6b-929f-fc404f1d3561" />


---

### Job Match Analyzer
> Input a target job description and receive an AI-powered compatibility analysis with gap detection and recommended actions.
> 1. Input Job Description with Resume
<img width="644" height="708" alt="image" src="https://github.com/user-attachments/assets/9677df99-da09-4a2d-bddf-ec5d463be371" />

> 2. Analysis
<img width="1280" height="845" alt="image" src="https://github.com/user-attachments/assets/38ad1bda-a444-4736-8b70-8cd755e7121b" />
<img width="1280" height="695" alt="image" src="https://github.com/user-attachments/assets/5154eece-64fe-421a-aab0-b2a22bb918fe" />
<img width="1270" height="326" alt="image" src="https://github.com/user-attachments/assets/59f32c45-69b5-402b-9b7b-5ebec935ed49" />

---

### Resume History with Actions
> Browse previously generated resumes with options to preview, favorite, download, or delete each entry.

<img width="1262" height="810" alt="image" src="https://github.com/user-attachments/assets/c5516a1f-1629-4d04-919d-7c2d8eff2bbc" />
<img width="1280" height="844" alt="image" src="https://github.com/user-attachments/assets/dfc9e951-3c93-4370-b501-8df11e0142ac" />
<img width="1276" height="365" alt="image" src="https://github.com/user-attachments/assets/fa35db1a-10e2-4e5e-9251-6c199e969b3a" />


---

### Resume Edit and Section Regeneration
> Edit or regenerate individual sections of any saved resume.
<img width="1280" height="474" alt="image" src="https://github.com/user-attachments/assets/c1c726d9-3e29-402d-8f3f-f5932dbbe676" />



---

### Storage Options
<img width="1280" height="351" alt="Storage Options" src="https://github.com/user-attachments/assets/22837c59-fe80-415b-8c5e-e12660051108" />

---

## How It Works

```
User Login
    |
User enters resume details via form
    |
Frontend sends JSON request to Spring Boot REST API
    |
Backend constructs structured prompt
    |
Ollama (DeepSeek) generates resume in JSON format
    |
Backend returns structured response
    |
Frontend renders resume in template
    |
User can Preview, Edit, Regenerate Sections, Save, or Download
    |
Job Match Analyzer: User submits a target job description
    |
AI compares resume against job description and returns match score and gap report
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| JavaScript | Core frontend logic |
| Tailwind CSS | Utility-first styling |
| DaisyUI | Component library |

### Backend

| Technology | Purpose |
|---|---|
| Java  | Core backend language |
| Spring Boot | REST API framework |
| Spring Security | Authentication and session management |

### AI / LLM

| Technology | Purpose |
|---|---|
| Ollama | Local LLM runtime |
| DeepSeek | Resume generation and analysis model |

---

## Installation and Setup

### Prerequisites

- Java 17+
- Node.js and npm
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

---


## Acknowledgements

- [Ollama](https://ollama.ai) — Local LLM runtime support
- [DeepSeek](https://github.com/deepseek-ai) — Open-source AI model
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [DaisyUI](https://daisyui.com) — Component library for Tailwind CSS
- [Spring Boot](https://spring.io/projects/spring-boot) — Java backend framework
