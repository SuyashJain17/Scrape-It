# Scrape-IT

**Scrape-IT** is a powerful SaaS platform for workflow automation with integrated web scraping capabilities. Built on **Next.js**, it allows users to automate complex data extraction workflows, securely store credentials, manage billing, and monitor performance—all in one intuitive interface.

![Scrape-IT Screenshot 1](/public/preview/preview.png)  
![Scrape-IT Screenshot 2](/public/preview/preview_2.png)

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [Usage](#usage)
- [Tech Stack](#-tech-stack)
- [Development](#development)
- [Roadmap](#roadmap)

---

## 📋 Key Features

- **Workflow Automation**: Easily build and execute multi-step workflows. Run tasks in distinct phases with assigned credits for fine-grained control over scraping executions.
- **Advanced Web Scraping Tools**: Design customized workflows with automated actions, scheduled executions, and flexible selector configuration.
- **Credential Storage**: Securely store API keys, tokens, and other sensitive information using encrypted storage.
- **Intuitive UI and Analytics**: Built with ShadCn for a modern UI, featuring real-time charts and reports for monitoring performance and credit usage.
- **Secure Server-Side Handling**: Backend processing powered by Next.js server actions ensures security and reliability.
- **AI-Powered Web Scraping (Beta)**: Use Gemini-powered AI to intelligently navigate and scrape data from complex websites (optional feature with API key).

---

## 🚀 Getting Started

1. **Sign Up**: Create an account on Scrape-IT and choose a subscription plan. First-time users get **100 FREE credits**.
2. **Claim Your Free Credits**: Instantly activate your free credits to begin executing workflows.
3. **Add Credentials**: Securely store your API keys, tokens, or website login info.
4. **Build Your Workflow**: Use Scrape-IT’s visual tools to create multi-step scraping workflows.
5. **Monitor and Analyze**: View real-time analytics, manage your billing, and optimize your scraping operations from the dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCn](https://shadcn.dev)
- **Backend**: Secure server-side processing using Next.js Server Actions
- **Billing (Beta)**: [Stripe](https://stripe.com) integration
- **Security**: Encrypted storage for sensitive data
- **Analytics**: Real-time visualization and reporting tools

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SuyashJain17/Scrape-It.git
   cd Scrape-It
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   GEMINI_API_KEY=your_gemini_api_key   # Optional - required for AI-powered scraping
   DATABASE_URL=postgresql://username:password@localhost:5432/yourdb
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## Usage

### 1. **Sign Up/Log In**
   - Use NextAuth.js to sign up or log in to your account.

### 2. **Claim your free credits**
   - First-time users receive 1000 free credits to test workflow executions.

### 2. **Create a Workflow**
   - Drag and drop nodes to define scraping tasks.
   - Use AI suggestions for selector optimization.

### 3. **Set Credentials**
   - Securely store website login credentials if required.

### 4. **Schedule Scraping**
   - Use the scheduling feature to automate scraping tasks.

### 5. **Export Data**
   - Download scraped data in the desired format.

---

## Development

### Scripts
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Run production server**: `npm start`

### Linting
- **Lint code**: `npm run lint`

---

## Roadmap
- Add support for multi-step scraping workflows.
- Integrate more export formats (e.g., Google Sheets, Excel).
- Enhance AI capabilities for broader use cases.



