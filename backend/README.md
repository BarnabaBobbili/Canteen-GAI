# Smart Canteen Management - Backend

This directory contains the Node.js/Express backend server for the Smart Canteen Management System. It connects to a MongoDB database and provides a REST API for the frontend application.

## 🚀 Getting Started

Follow these steps to get the backend server running locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A MongoDB database. You can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 1. Install Dependencies

Navigate to this `backend` directory in your terminal and run the following command to install the required packages:

```bash
npm install
```

### 2. Configure Environment Variables

The server uses environment variables to store sensitive information like your database connection string and a secret key for authentication.

1.  Create a new file named `.env` in this `backend` directory.
2.  Copy the contents of `.env.example` into your new `.env` file.
3.  **Update the variables:**
    *   `MONGO_URI`: Replace the placeholder with your actual MongoDB connection string. Make sure to specify a database name in the URI (e.g., `/canteenDB`).
    *   `JWT_SECRET`: Change this to a long, random, and secret string. This is used to sign authentication tokens.
    *   `PORT`: You can leave this as `3001` or change it if that port is already in use on your system.

Your `.env` file should look something like this:

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/canteenDB?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-and-long-random-string
PORT=3001
```

### 3. Run the Server

Once your dependencies are installed and your `.env` file is configured, you can start the server with this command:

```bash
npm start
```

If everything is set up correctly, you should see a message in your terminal like:

```
Server is running on port 3001
Successfully connected to MongoDB
```

The backend is now running and ready to accept requests from the frontend application!
