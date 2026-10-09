Khayelitsha Fish & Chips AI
Tagline: Fresh. Crispy. Local.
An AI-powered restaurant website concept for a fish-and-chips business in Khayelitsha, South Africa. It brings customer ordering and restaurant operations together, using AI to support customer questions, menu choices, daily planning, and business insights.
> **Project status:** This README describes the planned project and intended features. Update the tools and commands to match the actual implementation before publishing or submitting it.
Project overview
Small restaurants often need to manage customer questions, orders, stock, staff tasks, promotions, and feedback at the same time. This project explores how a digital restaurant platform and carefully prompted AI assistants could help make those tasks easier.
The intended experience has two sides:
Customer experience: browse the menu, customise an order, use a cart and checkout flow, follow order status, and leave feedback.
Restaurant operations: manage menu items and orders, organise staff tasks, review stock, plan the day, and understand customer feedback.
The project demonstrates prompt engineering and responsible AI. AI outputs should be checked, customer information should be protected, and important business decisions should remain under human control.
Features
Customer-facing features
Digital menu: Browse menu items by category, with descriptions and prices.
Customisable orders: Select available options and add items to a cart.
Cart and checkout flow: Review an order before confirming it.
Order tracking: View the current status of an order.
AI customer assistant — “Fish & Chips AI”: Answer common questions using approved restaurant information.
AI food recommender: Suggest menu choices based on preferences and available menu items.
Customer feedback: Collect reviews and feedback after an order.
Restaurant and staff features
Order management: Review and update incoming orders.
Kitchen order view: Give staff a clear view of orders that need preparation.
Menu management: Maintain item details, availability, and prices.
Inventory support: Track stock and flag items that may need attention.
Staff task board: Organise operational tasks and responsibilities.
AI daily restaurant planner: Draft a daily checklist or suggested task schedule.
AI business analyst: Summarise supplied order and sales data to help identify patterns.
Feedback analyser: Group customer comments into themes for staff review.
AI promotion assistant: Draft promotional ideas and customer messages.
Productivity Centre: Show useful measures such as order volume, task completion, and customer feedback trends.
Some features may require additional services or backend implementation. Only describe a feature as live once it has been implemented and tested.
Responsible AI and security
Use approved menu, pricing, opening-hours, and policy information as the source of truth.
Do not let AI invent prices, stock availability, delivery details, or order status.
Clearly identify AI-generated assistance and allow staff to review important outputs.
Keep customer data private and collect only what is needed.
Use role-based access for customer, staff, and administrator functions.
Validate inputs and protect payment information; do not store raw card details.
Test AI responses for accuracy, bias, confusing wording, and unsafe assumptions.
Tools used
Replace this list with the exact tools used in your implementation. The project is compatible with options such as:
AI assistant / LLM: for customer support, recommendations, planning, analysis, and message drafting.
Prompt engineering: role, context, task, constraints, and expected output format.
Frontend framework: for example, React/Next.js or HTML, CSS, and JavaScript.
Backend/API: for example, Node.js/Express or framework API routes.
Database: for example, PostgreSQL, Supabase, or Firebase.
Version control: Git and GitHub.
Design and testing tools: browser developer tools and manual test cases.
These are suggested options, not a claim that every tool has already been used.
Setup instructions
The exact commands depend on the framework and services used in your repository. Follow the matching steps below and adjust example values as needed.
1. Get the project files
If the project is hosted in a Git repository:
```bash
git clone <repository-url>
cd <project-folder>
```
Alternatively, download and extract the project folder, then open a terminal in it.
2. Install dependencies
For a JavaScript project with a `package.json`, a common setup is:
```bash
npm install
```
Use the package manager and instructions for your actual stack if different.
3. Configure environment variables
If the app connects to an AI provider or database, create a local `.env` file using `.env.example` if the project includes one.
Example variable names (your code may require different names):
```env
AI_API_KEY=replace_with_your_key
DATABASE_URL=replace_with_your_database_url
```
Keep secrets in environment variables, never commit them to Git, and never expose private API keys in browser-side code. If no external API or database is used, this step may not be needed.
4. Start the development server
For a typical JavaScript project, the command may be:
```bash
npm run dev
```
Check `package.json` for the available scripts. Open the local address shown in the terminal.
5. Test the main flows
Browse the menu and confirm item details are correct.
Add and remove items from the cart.
Test checkout with a safe demo flow; do not use real payment details during development.
Confirm order status changes correctly.
Ask the AI assistant a question answerable from approved restaurant information.
Test how the assistant responds when it does not know an answer.
Review AI-generated plans, recommendations, and summaries before use.
Confirm staff/admin functions are unavailable to unauthorised users.
Check form validation, error messages, and mobile layout.
6. Build and deploy
Use the build and deployment process supported by your framework and hosting provider. Configure production environment variables securely, test the deployed site, and confirm privacy and security settings.
Suggested project structure
Your actual structure may differ. One possible organisation is:
```text
khayelitsha-fish-and-chips-ai/
├── README.md
├── src/
│   ├── components/
│   ├── pages/          # or app/
│   ├── features/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── inventory/
│   │   └── ai-assistant/
│   └── services/
├── public/
├── tests/
├── .env.example
└── package.json
```
Learning outcomes
This project can demonstrate learning in:
Turning a real-world business problem into a digital solution.
Writing structured prompts with clear roles, context, constraints, and output formats.
Designing AI-supported workflows for customers and staff.
Validating AI-generated information rather than assuming it is always correct.
Considering privacy, bias, security, and human oversight.
Testing features and evaluating whether they provide measurable business value.
Future improvements
Integrate real-time order updates and kitchen status.
Connect inventory quantities to menu availability.
Add sales dashboards based on verified transaction data.
Support local languages where appropriate and test responses with users.
Improve accessibility and mobile usability.
Measure time saved, order accuracy, task completion, and customer satisfaction against a baseline.
Project positioning
Khayelitsha Fish & Chips AI — An AI-Powered Restaurant Operations & Customer Assistant
The goal is not to replace restaurant staff. It is to explore how a well-designed digital workflow and responsibly used AI can support better service and more informed day-to-day decisions.
