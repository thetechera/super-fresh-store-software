# Super Fresh Store – Inventory Management System

This is a full-stack inventory management system built with React and Vercel Serverless Functions, using Vercel Postgres as the database.

## Deployment with Vercel

This project is configured for seamless deployment on the [Vercel Platform](https://vercel.com).

### Step 1: Deploy the Project

1.  **Fork this repository** to your own GitHub account.
2.  Go to your Vercel dashboard and click **"Add New... -> Project"**.
3.  **Import the Git Repository** you just forked.
4.  Vercel will automatically detect that this is a Vite project. No configuration is needed for the frontend. Click **Deploy**.

Your frontend will be live, but it won't have a database yet.

### Step 2: Set Up the Vercel Postgres Database

1.  After the initial deployment, navigate to your project's dashboard on Vercel.
2.  Click the **Storage** tab at the top.
3.  Select **Postgres**, and click **Create Database**.
4.  Follow the on-screen instructions to create and connect the database to your project. Vercel will automatically handle all connection strings and environment variables.

### Step 3: Set Up the Database Tables

The backend API includes a special, one-time setup endpoint to create the necessary tables in your new database.

1.  After your database is connected, you need to run this setup. Find your Vercel deployment URL (e.g., `https://your-project-name.vercel.app`).
2.  In your browser, navigate to the following URL:
    **`https://<YOUR_DEPLOYMENT_URL>/api/setup`**
3.  You should see a message like `{"message":"Database tables created successfully"}`.
4.  Your database is now ready.

Your application is now fully configured and operational! Any pushes to the `main` branch of your GitHub repository will automatically trigger a new deployment on Vercel.
