# U.S. States Data Dashboard

## Overview
U.S. States Data Dashboard is a fully client-side web application built for ISM 6225 (Application Development for Analytics). It allows users to view and manage state-level data (population, GDP, area, etc.), visualize trends using Chart.js, and interact with an AI chatbot powered by Botpress.

This project is designed around:
- MVC architecture
- Persistent localStorage data
- CRUD operations
- External API read-only integration
- Azure deployment

## Features
- Responsive Bootstrap 5 UI with dark mode toggle
- CRUD pages (Create / Read / Update / Delete)
- State data persisted in the browser using a singleton-style Model service
- Chart.js visualizations for GDP, population share, and land area
- Botpress chatbot (StateBot) using our dataset as a knowledge base
- “External insight” panel powered by an API fetch (read-only)
- About Us page with ERD diagram and team roles

## Architecture (MVC)
**Model:**  
`assets/model.js` exposes `StateDataService`, which manages all state data. Data is stored in `localStorage`, so it persists across refreshes.

**View:**  
HTML pages plus render helpers.  
- `read.html` renders a table of states.  
- `data.html` renders three charts using Chart.js.  
- The layout is styled with `assets/styles.css`.

**Controller:**  
`assets/controller.js` wires user actions (form submits, edit, delete) to the model and then updates the tables/charts. For example:
- `initCreatePage()` handles adding a new state
- `initUpdatePage()` loads and saves edits
- `initDeletePage()` removes a state
- `refreshReadTable()` rebuilds the table dynamically

**charts.js** regenerates the charts based on the latest data in `StateDataService`.

## Data Model / ERD
We model:
- Region → State (1-to-many)
- State → City (1-to-many)

In the prototype, each `State` record includes:
- id (PK / state code)
- name
- region (FK to Region)
- capital
- population
- gdp
- area
- citiesCount (summary of how many cities)

In the About page, we display the ERD and explain how this would map to a relational database in a production environment.

## API Integration
The dashboard uses a read-only API fetch (see `assets/api.js`) to display a supplemental insight card. This satisfies the “API Integration” rubric requirement: external facts are fetched and displayed, but not used as the persistent data store.

## Deployment
This project is intended to be deployed on Azure as a static web app:
- All code is client-side (HTML, CSS, JS)
- No server runtime required
- Chatbot embed runs from Botpress Cloud
- localStorage ensures state CRUD persistence per user session

## Contributors
- Mohamed Faisal Sindhi — Frontend structure, integration, hosting, chatbot
- Hongxu Yang — Visual design, dark mode, responsive CSS, ERD diagram
- Jonathan James — CRUD logic, Chart.js visualizations, controller wiring, localStorage model

## Notes
This project went through an iterative Git process, including multiple branches and corrected repos. We resolved merge conflicts, enforced branch protection for `main`, and used feature branches for CSS, JS, and Botpress integration. This taught us proper collaboration workflows and version control discipline.
