# US States Dashboard

**Live Website:** [https://usstatesdashboard-dxgda4c9gyd2edag.brazilsouth-01.azurewebsites.net](https://usstatesdashboard-dxgda4c9gyd2edag.brazilsouth-01.azurewebsites.net)

**GitHub Repository:** [https://github.com/MdFaisalS2025/us-states-dashboard](https://github.com/MdFaisalS2025/us-states-dashboard)

---

## Overview

The **US States Dashboard** is a dynamic web application that visualizes and manages data about U.S. states using a complete MVC architecture.  
It includes full CRUD functionality (Create, Read, Update, Delete), API integration, data persistence, and an embedded chatbot assistant.  
The project demonstrates end-to-end web development skills, including frontend design, JavaScript-based data handling, API consumption, and Azure deployment readiness.

---

## Project Objectives

- Implement a dynamic and fully functional MVC web application.  
- Provide data management through persistent local storage.  
- Integrate an API for external data insights.  
- Include CRUD operations that update dynamically across pages.  
- Host a chatbot using **Botpress Cloud** to assist users in exploring state data.  
- Deploy the final web application to **Azure** (and GitHub Pages for demo).

---

## Technology Stack

- **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript (ES6)
- **Architecture:** MVC (Model–View–Controller)
- **Data Management:** Local Storage (persistent between sessions)
- **API Integration:** World Bank Open Data API (for GDP and Population)
- **Version Control:** Git & GitHub
- **Deployment:** GitHub Pages / Azure Static Web Apps
- **Chatbot:** Botpress Cloud (embedded across all pages)

---

## MVC Architecture Implementation

- **Model Layer (`model.js`)**  
  Handles all data management operations, including reading, writing, and updating state data in local storage.  
  Acts as the single source of truth for the app’s state data.

- **View Layer (`index.html`, `read.html`, etc.)**  
  Displays structured data and charts. Pages update dynamically when CRUD actions are performed.

- **Controller Layer (`controller.js`)**  
  Connects user interactions with model updates and view rendering. Ensures smooth data flow across components.

---

## CRUD Implementation

- **Create (`create.html`):**  
  Allows users to add a new U.S. state record with details such as ID, Name, Capital, Region, Population, GDP, and Area.

- **Read (`read.html`):**  
  Displays all state data in a responsive table format. Dynamically updated as new records are created or modified.

- **Update (`update.html`):**  
  Enables users to select and modify existing state data.

- **Delete (`delete.html`):**  
  Allows safe removal of any state record from the dataset, updating all visualizations automatically.

All CRUD operations are connected to the **local storage** model, ensuring that changes are retained between browser sessions.

---

## API Integration

The dashboard integrates data from the **World Bank Open Data API**, specifically:
- **GDP (current US$)**  
- **Population (total)**  

These values are dynamically fetched and displayed in the “External Insights” section of the homepage.  
The API provides real-time global metrics, helping users compare U.S. state-level data with national totals.

---

## Chatbot Integration

The embedded **Botpress Cloud Chatbot** (StateBot) assists users by:
- Answering queries about states (e.g., GDP, capital, population)
- Providing general navigation guidance (e.g., “How can I add a state?”)
- Offering educational facts about U.S. regions and data visualization insights

The bot appears as a floating blue icon on every page for consistent accessibility.

---

## About Us

| Team Member | Role | Image |
|--------------|------|--------|
| **Mohamed Faisal Sindhi** | Frontend Development, Deployment, Chatbot Integration | ![Faisal](assets/team_faisal.JPGJPG) |
| **Hongxu Yang** | UI/UX Design, ERD & Documentation | ![Hongxu](assets/team_hongxu.JPGPG) |
| **Jonathan James** | Controllers, Charts, Data Services | ![Jonathan](assets/team_jonathan.jpgjpg) |

---

## Data Model (ERD)

![ERD Diagram](wwwroot/assets/logical_data_model_v3.png)

The ERD above shows the logical structure connecting **Region**, **State**, and **Metrics** tables.  
It ensures normalization and clarity in the application’s data relationships.

---

## Technical Details

### API Endpoints
**World Bank Open Data API**
- GDP: `https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json`
- Population: `https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?format=json`

### Data Persistence
All CRUD operations are saved to the browser’s **Local Storage**, ensuring data consistency across reloads.

### Charting
Uses **Chart.js** to visualize:
- GDP distribution
- Population comparisons
- Regional summaries

---

## Notable Technical Challenges & Solutions

**Challenge 1: Persistent Data Storage**  
LocalStorage initially failed to synchronize across CRUD operations.  
**Solution:** Implemented a Singleton data model pattern to ensure that all pages access and modify a single unified dataset.

**Challenge 2: API Data Rendering Delay**  
API responses were slow due to asynchronous fetching.  
**Solution:** Used `async/await` with loading states and fallback placeholders to ensure the UI doesn’t break.

**Challenge 3: Chart Updates After CRUD Operations**  
Charts were not refreshing when records changed.  
**Solution:** Triggered a custom event listener to reload chart data after each model update.

**Challenge 4: Responsive Layout for ERD and Cards**  
The ERD image overflowed and caused layout distortion.  
**Solution:** Added responsive scaling and CSS constraints to make it mobile-friendly.

---

## Deployment

- **Azure Static Web App (Primary Deployment)**  
  Hosted with all assets, scripts, and pages accessible publicly.

- **GitHub Pages (Backup)**  
  [https://mdfaisals2025.github.io/us-states-dashboard/](https://mdfaisals2025.github.io/us-states-dashboard/)

Both deployments ensure accessibility and demonstrate continuous integration workflows.

---

## Final Team Reflection

Working on the **US States Dashboard** allowed our team to bring together UI/UX design, data modeling, and real-world web application logic.  
Through this project, we learned how to implement a clean MVC architecture, integrate APIs, and handle persistent data.  
We faced challenges related to data binding, API latency, and responsive design, which helped strengthen our understanding of modern web development.

Overall, this project showcased our teamwork and technical growth, transforming a static concept into a fully dynamic, interactive web platform.

---

**Built with love and collaboration by Faisal, Hongxu, and Jonathan**  
© 2025 US States Dashboard
