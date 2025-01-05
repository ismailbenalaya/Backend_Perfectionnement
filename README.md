# 🛒 Commerce Backend API

## 📖 Overview

This repository contains a **Node.js** backend API for managing a commerce system. The API is connected to a **MySQL database** and supports robust functionality for user management, contact form handling, and product inventory management. Designed with modularity and scalability in mind, this backend is a great starting point for any e-commerce project.

---

## ✨ Features

### 👤 User Management
- Create, update, and delete user profiles.
- Retrieve user details by name or fetch all users.
- Authenticate users for secure access.

### ✉️ Contact Form
- Save and manage customer inquiries.
- Retrieve all contact form submissions for review.

### 🛍️ Product Management
- View all products available in the inventory.
- Add, update, and delete products (Admin-only).
- Manage products in user carts.

---

## 🚀 Endpoints

### User Management
- `GET /getusers` - Retrieve all users.
- `GET /getS/:name` - Search for users by name.
- `POST /addUser` - Add a new user.
- `PUT /updateuser/:id` - Update a user's information.
- `DELETE /deleteUser/:id` - Remove a user.

### Contact Form
- `GET /getcontact` - Fetch all contact messages.
- `POST /addContact` - Submit a new contact message.

### Product Management
- `GET /api/products` - View all products.
- `POST /api/add-to-cart` - Add a product to the cart.
- `GET /api/products-admin` - Admin: Fetch all products.
- `POST /api/products-admin` - Admin: Add a new product.
- `PUT /api/products/:id` - Update product details.
- `DELETE /api/products/:id` - Delete a product.

---
