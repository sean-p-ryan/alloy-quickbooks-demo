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

  app.post('/create-invoice/:userId', async (req, res) => {
    // Extract invoice details from the request body
    const invoiceDetails = req.body;
  
    // Define the request options
    const options = {
      method: 'POST',
      url: `https://embedded.runalloy.com/2023-12/one/accounting/invoices/?connectionId=${req.params.userId}`,
      headers: {
        'Authorization': `bearer ${process.env.ALLOY_API_KEY}`, // Use the API key from environment variables
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      data: invoiceDetails, // Set the request body
    };
  
    try {
      const response = await axios.request(options); // Use axios.request with the options object
      res.status(200).json(response.data); // Respond with the data from the Alloy API
    } catch (error) {
      console.error('Error creating invoice:', error);
      if (error.response) {
        // The request was made and the server responded with an error status code
        console.error('Error response:', error.response.data);
        res.status(error.response.status).send({
          success: false,
          message: 'Failed to create invoice',
          error: error.response.data,
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        res.status(500).send({
          success: false,
          message: 'Failed to create invoice',
          error: "The request was made but no response was received",
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        res.status(500).send({
          success: false,
          message: 'Failed to create invoice',
          error: error.message,
        });
      }
    }
  });

  app.get('/list-invoices', async (req, res) => {
    const { connectionId } = req.query; // Extract connectionId from query parameters
  
    const options = {
      method: 'GET',
      url: `https://embedded.runalloy.com/2023-12/one/accounting/invoices?connectionId=${connectionId}`,
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
