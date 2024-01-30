import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "./config";
import './App.css';
import { connectionId } from "alloy-node/utils.mjs";

function App() {
  const [showInput, setShowInput] = useState(true);
  const [showUsernameInput, setShowUsernameInput] = useState(true);
  const [alloyUserId, setAlloyUserId] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [showInvoices, setShowInvoices] = useState(false);

  useEffect(() => {
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Assuming the input field has a name attribute "username"
    const userId = event.target.username.value; // Access the input value from the form

    try {
      const data = { userId };
      const response = await axios.post(`${baseUrl}/user`, data);
      if (response) {
        setAlloyUserId(userId);
        setShowInput(false);
        setShowUsernameInput(false);
      }
    } catch (err) {
      console.log(`There was an error: ${err}`);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await axios.get(`${baseUrl}/token/${alloyUserId}`);

      if (response.data.token) {
        window.Alloy.setToken(response.data.token);
        window.Alloy.authenticate({
          app: "quickbooks",
          callback: (data) => {
            if (data) {
              const connectionId = data.connectionId;
              setConnectionId(connectionId);
              alert(`A connection was created. ConnectionId: ${connectionId}. Find more information in the console.`);
              console.log('-----------------------------');
              console.log(`ConnectionId: ${connectionId}`);
              console.log(data);
              console.log('-----------------------------');
            }
          },
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log(`There was an error: ${err}`);
    }
  };

  const createInvoice = async () => {
    // Define invoice details inside the method
    const invoiceDetails = {
      customerId: connectionId,
      lineItems: [
        {
          description: "November Services",
          totalAmount: "2373.45" 
        }
      ],
      invoiceNumber: "7452", 
      issueDate: "2023-12-10", 
      dueDate: "2023-12-27", 
      currency: "USD",
      balance: 2373.45 
    };
  
    try {
      const response = await axios.post('/create-invoice', invoiceDetails);
      console.log('Invoice created:', response.data);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const getInvoices = async () => {
    setShowInvoices(prevState => !prevState);
    try {
      const response = await axios.get('/gets-invoices'); // Make sure the endpoint matches your server setup
      setInvoices(response.data);
      setShowInvoices(true); // Show the table after fetching the data
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="container">
      {showInput && <div className="form-style">
        <form className="form-style" onSubmit={handleFormSubmit}>
          <h1>Let's set up a Quickbooks integration with Alloy!</h1>
          <p>Enter a username to create an account</p>
          <input type="text" name="username" className="input-style" />
          <button type="submit" className="button-style">Submit</button>
        </form>
      </div>}

      {!showInput && <div className="form-style">
        <button onClick={handleAuth} type="submit" className="button-style">Generate JWT</button>
      </div>}

      {isAuthenticated && <div className="form-style">
        <button onClick={() => createInvoice()}   type="submit" className="button-style">Create invoice in QuickBooks</button>
      </div>}

      {
        invoices.length > 0 && (
          <button className="button-style" onClick={getInvoices}>Display invoices</button>
        )
      }

      {showInvoices && (
        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>invoice Name</th>
                <th>Status</th>
                <th>Billing Address</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index}>
                  <td>{invoice.invoiceName}</td>
                  <td>{invoice.invoiceStatus}</td>
                  <td>{invoice.addresses.map(address => `${address.street1}, ${address.zipCode}, ${address.country}`).join(' | ')}</td>
                  <td>{invoice.phoneNumbers.map(phone => phone.phoneNumber).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
