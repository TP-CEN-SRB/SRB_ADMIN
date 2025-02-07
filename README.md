# Temasek Polytechnic Smart Recycling Bin(Major Project)

## Installation

First, ensure that you have the following installed:

1. [Node.js 18.17](https://nodejs.org/en) or later
2. Visual Studio Code
3. Git

Once you clone the repository, enter the following commands
```bash
npm install # install the necessary dependencies

npx prisma generate # generate prisma client
```

## Setting up environent variables

Ensure your `.env` has the following environment variables
1. DATABASE_URL=********************************  <!-- Neon DB -->
2. BASE_URL="https://cen-smart-bin.vercel.app" <!-- Domain URL -->
3. AUTH_SECRET=******************************** <!-- Type npx auth secret to generate auth secret key -->
4. NEXT_JWT_SECRET_KEY=********************************
5. API_KEY=********************************

6. NEXT_PUBLIC_PERSONAL_EMAIL=******@gmail.com
7. NEXT_PUBLIC_EMAIL_PASSWORD=******************************** <!--Generate app password in gmail -->

Copy API keys from [Pusher](https://dashboard.pusher.com/)

8. NEXT_PUBLIC_PUSHER_APP_ID = ********************************
9. NEXT_PUBLIC_PUSHER_KEY = ********************************
10. PUSHER_SECRET = ********************************
11. NEXT_PUBLIC_PUSHER_CLUSTER = ********************************


