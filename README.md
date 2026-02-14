
# E-Shop RESTful API

A **production-ready E-Commerce Backend API** built with **Node.js, Express, MongoDB, Mongoose** and **Stripe**, supporting full e-commerce functionalities including authentication, payments, orders, products, and more.

🌐 **Live API:** [https://eshop-back-mu.vercel.app/](https://eshop-back-mu.vercel.app/)  
💾 **GitHub Repository:** [https://github.com/Mohamed215Elsayed/ESHOP-API](https://github.com/Mohamed215Elsayed/ESHOP-API)  

---

## **Features**

- CRUD operations for Products, Categories, Subcategories, Brands  
- Shopping Cart & Wishlist management  
- User Authentication & Role-based Authorization (JWT)  
- Stripe Payments integration (Cash & Online)  
- Email verification & password reset  
- Product reviews & rating system  
- Discount coupon system  
- Order management  
- Global validation & error handling  
- MongoDB Atlas integration  
- Deployed on **Vercel**  

---

## **Tech Stack**

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas, Mongoose  
- **Authentication:** JWT, Password Encryption, Email Verification  
- **Payments:** Stripe  
- **Validation:** class-validator, Zod  
- **Deployment:** Vercel  

---

## **Getting Started**

### **Prerequisites**

- Node.js >= 18  
- npm / yarn  
- MongoDB Atlas URI or local MongoDB  

### **Setup**

1. Clone the repository:
```bash
git clone https://github.com/Mohamed215Elsayed/ESHOP-API.git
cd ESHOP-API


Install dependencies:

npm install


Create .env.development file (example):

NODE_ENV=development
PORT=5000
DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eshop?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
EMAIL_HOST=smtp.example.com
EMAIL_USER=example@example.com
EMAIL_PASS=your_email_password


Start the development server:

npm run start:dev


Server will run on http://localhost:5000

Folder Structure
src/
├─ modules/
│  ├─ products/
│  ├─ users/
│  ├─ reviews/
├─ config/
├─ main.ts
├─ app.module.ts

API Documentation

Postman Development Docs: https://documenter.getpostman.com/view/35008610/2sB3WnvgqX

Postman Production Docs: https://documenter.getpostman.com/view/35008610/2sB3WnvgqZ

License

MIT License


---

## **Frontend README – NoonHub**

```markdown
# NoonHub – React E-Commerce Frontend

A **React Frontend for E-Commerce** fully integrated with **E-Shop API**, built with **React, React Bootstrap, Redux Toolkit, React Hook Form & Zod**, supporting shopping, wishlist, product reviews, and payments.

🌐 **Live Frontend:** [https://noon-hub.vercel.app/](https://noon-hub.vercel.app/)  
💾 **GitHub Repository:** [https://github.com/Mohamed215Elsayed/NoonHub](https://github.com/Mohamed215Elsayed/NoonHub)  

---

## **Features**

- Product listing with search, filtering, and pagination  
- Shopping cart & wishlist management  
- User authentication & role-based access  
- Stripe payments integration  
- Product reviews & ratings  
- React Bootstrap responsive UI  
- Redux Toolkit for state management  
- React Hook Form + Zod for validation  
- Image upload & preview  
- Fully integrated with backend API  

---

## **Tech Stack**

- **Frontend:** React, React Bootstrap, Vite  
- **State Management:** Redux Toolkit  
- **Form Handling:** React Hook Form + Zod  
- **Styling:** React Bootstrap  
- **HTTP Requests:** Axios  
- **Deployment:** Vercel  

---

## **Getting Started**

### **Prerequisites**

- Node.js >= 18  
- npm / yarn  
- Running backend API (E-Shop API)  

### **Setup**

1. Clone the repository:
```bash
git clone https://github.com/Mohamed215Elsayed/NoonHub.git
cd NoonHub


Install dependencies:

npm install


Create .env.development file:

REACT_APP_API_URL=https://eshop-back-mu.vercel.app/


Start the development server:

npm run start


Frontend will run on http://localhost:5173

Folder Structure
src/
├─ components/
├─ pages/
├─ store/
├─ hooks/
├─ services/
├─ App.tsx
├─ main.tsx

License

MIT License



