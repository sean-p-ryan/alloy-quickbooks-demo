import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "./config";
import './App.css';

function App() {
  const [showJWT, setShowJWT] = useState(false);
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
        setShowJWT(true);
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
        setShowJWT(false)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.log(`There was an error: ${err}`);
    }
  };

  const createInvoice = async () => {
    // Define invoice details inside the method
    console.log(connectionId)
    const invoiceDetails = {
      customerId: "John Customer",
      lineItems: [
        {
          description: "November Services",
          totalAmount: "2373.45",
          accountingItemId: "242325235sef323"
        }
      ],
      invoiceNumber: "7452",
      issueDate: "2023-12-10",
      dueDate: "2023-12-27",
      currency: "USD",
      balance: 2373.45
    };

    try {
      const response = await axios.post(`/create-invoice/${connectionId}`, invoiceDetails);
      setInvoices(true);
      console.log('Invoice created:', response.data);

    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const getInvoices = async () => {
    try {
      const response = await fetch(`/list-invoices/${connectionId}`);
      const invoicesData = await response.json();
      setInvoices(invoicesData); // Update the invoices state with the fetched data
      setShowInvoices(true); // Set to true to display the invoices table
    } catch (error) {
      console.error('Error listing invoices:', error);
    }
  };

  return (
    <div className="container">
      {showUsernameInput && <div className="form-style">
        <form className="form-style" onSubmit={handleFormSubmit}>
          <h1>Let's set up a QuickBooks integration with Alloy!</h1>
          <p>Enter a username to create an account</p>
          <input type="text" name="username" className="input-style" />
          <button type="submit" className="button-style">Submit</button>
        </form>
      </div>}

      {showJWT && <div className="form-style">
        <button onClick={handleAuth} type="submit" className="button-style">Generate JWT</button>
      </div>}

      {isAuthenticated && <div className="form-style">
        <button onClick={() => createInvoice()} type="submit" className="button-style">Create invoice in QuickBooks</button>
      </div>}

      {isAuthenticated && <div className="form-style">
        <button onClick={() => createInvoice()} type="submit" className="button-style">Display invoices </button>
      </div>}

      {
        invoices.length > 0 && (
          <button className="button-style" onClick={getInvoices}>Display invoices</button>
        )
      }
      {showInvoices && (
        <table className="table-style">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Description</th>
              <th>Total Amount</th>
              <th>Invoice Number</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td>{invoice.customerId}</td>
                <td>{invoice.lineItems.map(item => item.description).join(', ')}</td>
                <td>{invoice.lineItems.map(item => item.totalAmount).join(', ')}</td>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.issueDate}</td>
                <td>{invoice.dueDate}</td>
                <td>{invoice.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

}

export default App;
