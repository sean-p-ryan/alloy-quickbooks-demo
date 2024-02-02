const express = require('express');
const app = express();
app.use(express.json());

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
app.use(cors());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

app.get('/api', (req, res) => {
  res.json({ message: "Hello from Express!" });
});

// Creates a new user in Alloy Unified API
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
      console.error(err); // Log the error to the console
      res.status(500).send("Could not create user");
    }
  });

// Get short-lived JWT
app.get("/token/:userId", async (req, res) => {  
    const options = {
      method: "GET",
      url: `https://embedded.runalloy.com/2023-12/users/${req.params.userId}/token`,
      headers: {
        accept: "application/json",
        Authorization: `bearer ${process.env.ALLOY_API_KEY}`,
      },
    };
    let response;
    try {
      response = await axios.request(options);
      res.status(200).send(response.data);
    } catch (err) {
      res.status(500).send("Could not generate token");
    }
  });

  app.post('/create-invoice', async (req, res) => {
    // Extract invoice details from the request body
    const invoiceDetails = req.body;

    // Define the request headers
    const headers = {
      'Authorization': `bearer ${process.env.ALLOY_API_KEY}`, // Use the API key from environment variables
      'accept': 'application/json',
      'content-type': 'application/json',
    };
  
    try {
      // Send the request to the Alloy API
      const response = await axios.post(`https://embedded.runalloy.com/2023-12/one/accounting/invoices?connectionId=${req.params.connectionId}`, invoiceDetails, { headers });
  
      // Respond with the data from the Alloy API
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).send({ success: false, message: 'Failed to create invoice', error: error.message });
    }
  });

  app.get('/list-invoices', async (req, res) => {
    const { connectionId } = req.query; // Extract connectionId from query parameters
  
    // Define the request options, including the URL and headers
    const options = {
      method: 'GET',
      url: `https://embedded.runalloy.com/2023-12/one/accounting/invoices?connectionId=${req.params.connectionId}`,
      headers: {
        accept: 'application/json',
        Authorization: `bearer ${process.env.ALLOY_API_KEY}` // Use environment variable for API key
      }
    };
  
    try {
      const response = await axios.request(options);
      res.status(200).json(response.data); // Send the response data back to the client
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching invoices');
    }
  });
  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
