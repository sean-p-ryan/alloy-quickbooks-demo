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

  app.post('/create-vendor', async (req, res) => {
    const apiClient = new UAPI(process.env.ALLOY_API_KEY);
    try {
      // Connect the API client using a specific connectionId
      await apiClient.connect("connectionId"); // Replace "connectionId" with your actual connection ID
  
      // Extract vendor details from the request body
      const { vendorName, vendorStatus, addresses, phoneNumbers } = req.body;
  
      // Define the vendor creation payload
      const body = {
        vendorName,
        vendorStatus,
        addresses,
        phoneNumbers,
      };
  
      // Create the vendor using the Alloy API client
      const data = await apiClient.Accounting.createVendor(body);
  
      // Send the response back to the client
      res.json({ success: true, data });
    } catch (error) {
      console.error('Failed to create vendor:', error);
      res.status(500).send({ success: false, message: 'Failed to create vendor' });
    }
  });

  app.get('/fetch-vendors', async (req, res) => {
    try {
      // Make sure the API client is initialized and connected
      await apiClient.connect("connectionId");
  
      const data = await apiClient.Accounting.listVendors();
      res.json(data); // Send the vendors data back to the client
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      res.status(500).send({ success: false, message: 'Failed to fetch vendors' });
    }
  });
  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
