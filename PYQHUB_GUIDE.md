# PYQ Hub Full-Stack System

This is a dynamic folder-based structure for Previous Year Questions (PYQs).

## Folder Structure

### Backend (`server/features/pyqhub`)
- **`category.model.js`**: Handles root categories (ALL QUESTIONS, SUBJECT WISE, YEAR WISE).
- **`subject.model.js`**: Manages dynamic subjects (History, Geography, etc.).
- **`year.model.js`**: Manages grouped years (Group A/B/C + 2024, 2023, etc.).
- **`question.model.js`**: The MCQ data linked to subjects and years.
- **`pyqhub.controller.js`**: Centralized logic for the recursive tree structure.
- **`pyqhub.route.js`**: REST API endpoints for the Tree.

### Frontend (`client/`)
- **`src/App.jsx`**: The main File-Explorer interface.
- **Left Side**: Expandable folder tree for Categories, Subjects, and Years.
- **Right Side**: Question list with search, filtering, and loading animations.
- **RTK Query**: Integrated with the backend for real-time updates when folders are added by the Admin.

## Data Flow
1. **Admin Creation**: Admin uses buttons in the Explorer to add Subjects or Years.
2. **Database Storage**: Data is saved in the specialized schemas with referencing IDs.
3. **UI Sync**: RTK Query automatically fetches and organizes this data into the Tree component.
4. **Question Delivery**: Clicking any folder fetches questions filtered specifically for that hierarchy.

## How to Start

### Server
```bash
cd server
npm run dev
```

### Client (Web Admin)
```bash
cd client
npm install
npm run dev
```

### Mobile (Student App)
```bash
cd mobile
npx expo start
```
