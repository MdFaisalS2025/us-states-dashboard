🗺️ US States Data Dashboard

Course: ISM 6225 — Application Development for Analytics
Team: Mohamed Faisal Sindhi · Hongxu Yang · Jonathan James

📘 Overview

The US States Data Dashboard is a static, front-end web application built with HTML, CSS, JavaScript, and Bootstrap 5.
It allows users to explore U.S. state-level data interactively with integrated CRUD operations, data visualizations, and a chatbot powered by Botpress.

This project demonstrates core web-development and data-analytics integration concepts, including front-end data storage, visualization, and intelligent user interaction.

✨ Features

Bootstrap 5 + Custom CSS — Clean, responsive UI with light/dark theme toggle
CRUD Functionality — Create, Read, Update, and Delete state data using localStorage
Chart.js Visualizations — Interactive charts showing population, GDP, and area comparisons
Botpress Chatbot — “StateBot” answers natural-language questions about U.S. states
Logical Data Model — Two one-to-many relationships (Region → State, State → City)
Dark Mode Support — Persistent user theme stored locally
Logical Data Model

The project follows a simple hierarchical model:

Region (1) ────< State (∞) ────< City (∞)


Keys:

Region_ID → PK
State_ID → PK, Region_ID → FK
City_ID → PK, State_ID → FK

<img src="assets/logical_data_model_v2.png" width="600" alt="Logical Data Model">

🧠 Chatbot Integration (StateBot)

Built using Botpress Cloud
Uses a Botpress Table as a knowledge base with ≥10 U.S. states
Columns: State_ID, State_Name, Capital, Region, Population_Million, GDP_Billion, Area_sqmi
Answers sample queries like:
“Which state has the largest GDP?”
“What is the capital of Texas?”
“Which region is Florida in?”

🧮 Technologies Used
Category	Tools / Frameworks
Frontend	HTML5, CSS3, JavaScript
Framework	Bootstrap 5
Charts	Chart.js
Data Storage	localStorage
Chatbot	Botpress Cloud
Deployment	GitHub Pages / USF MyWeb
💻 Run Locally

Clone the repository:

git clone https://github.com/MdFaisalS2025/us-states-dashboard.git
cd us-states-dashboard


Open index.html in your browser.
(No server or build step required — fully static)

🚀 Deploy

USF MyWeb: Upload the project folder to
~/public_html/us-states-dashboard/ using Cyberduck.

GitHub Pages:


Visit your site at:
http://myweb.usf.edu/~sindhi/us-states-dashboard/index.html

👥 Team & Roles
Member	Role	Contributions
Mohamed Faisal Sindhi - Frontend & Integration	HTML structure, Botpress embedding, layout design
Hongxu Yang - CSS & Styling	Theme system, responsive styles, color palette
Jonathan James - JavaScript Developer	CRUD logic, Chart.js implementation, localStorage functions
