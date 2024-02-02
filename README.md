# QuickBooks Integration with Alloy's Unified API

This guide demonstrates how to use Alloy Automation's Unified API to launch a QuickBooks into your application allowing users to create and track invoices directly from your UI. 

## Step 1: Set Up Your Local Environment

Follow these steps to set up your local environment for the demo.

### Clone the Demo Repository

```bash
git clone https://github.com/sean-p-ryan/alloy-quickbooks-demo.git
```

To acquire an API key, sign up for a free Alloy account [free Alloy account](https://runalloy.com/signup/), then navigate to Settings > API Keys in your Alloy dashboard and generate an API key for a development environment.

Once you have your API key:
- Create a `.env` file in the root of the project. 
- Add a `ALLOY_API_KEY=YOUR_API_KEY` to the file using your actual API key. 

Install dependencies and start the server:
```
npm install
node server.js
```
Launch the frontend:
```
cd client
npm start
```

## Step 2: Implement Alloy's Unified API
### Create a User
The route on `server.js` below makes a POST request to the Create User endpoint to let Alloy's Unified API know which user has signed into your app.

```
app.post("/user", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send("No userId provided");
  }

  const headers = {
    accept: "application/json",
    Authorization: `bearer ${process.env.ALLOY_API_KEY}`,
    "content-type": "application/json",
  };

  try {
    const { data } = await axios.post("https://embedded.runalloy.com/2023-12/one/users", { username: userId }, { headers });
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not create user");
  }
});
```
### Securely Connect QuickBooks Account
The `handleAuth` method on `App.js` uses the Alloy frontend SDK to invoke the Alloy Modal, which renders a UI flow that allows the user to securely connect a QuickBooks account. 
```
// In App.js
const handleAuth = async () => {
  // Code to generate JWT and call Alloy.authenticate()
  if (response.data.token) {
    window.Alloy.setToken(response.data.token);
    window.Alloy.authenticate({
      app: "quickbooks",
      // Additional configuration...
    });
  }
};

```
## Step 3: Send New Invoices to QuickBooks
Use the Accounting API to send new invoices to the authenticated QuickBooks instance.
```
const createInvoice = async () => {
  const invoiceDetails = {
    // Define invoice details
  };

  try {
    const response = await axios.post('/create-invoice', invoiceDetails);
    console.log('Invoice created:', response.data);
  } catch (error) {
    console.error('Error creating invoice:', error);
  }
};
```
## Step 4: Retrieve All Invoices from QuickBooks
The `getInvoices method` on `App.js` retrieves all invoices and displays them in a table in the UI.
```
const getInvoices = async () => {
  try {
    const response = await fetch(`/list-invoices/${connectionId}`);
    const invoicesData = await response.json();
    setInvoices(invoicesData); // Update the invoices state
    setShowInvoices(true); // Display the invoices table
  } catch (error) {
    console.error('Error listing invoices:', error);
  }
};
```
