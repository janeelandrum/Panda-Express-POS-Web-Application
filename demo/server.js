const express = require('express');
const cors = require('cors');
const db = require('./app/database/db');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Endpoint to get menu item by ID
app.get('/api/menu/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await db.getMenuItemById(id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get all menu items or items of a particular type if a type is specified
app.get('/api/menu', async (req, res) => {
    // Access item_type from the query parameter
    const { type: item_type } = req.query;

    try {
        let items;
        if (item_type) {
            // Fetch items of a specific type
            items = await db.getMenuItemsOfType(item_type);
            if (items.length === 0) {
                console.log(`No items found for type: ${item_type}`);
            }
        } else {
            // Fetch all items if no type is specified
            items = await db.getMenuItemNames();
        }
        res.json(items); // Return the fetched items
    } catch (error) {
        console.error('Error fetching menu items:', error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' }); // Respond with a server error
    }
});


// Endpoint to get all spicy menu items
app.get('/api/spice', async (req, res) => {

    try {
        let items;
            items = await db.getMenuItemOfSpice(); 
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get all wok smart menu items
app.get('/api/wok', async (req, res) => {

    try {
        let items;
            items = await db.getMenuItemOfWokSmart(); 
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get all wok smart menu items
app.get('/api/premium', async (req, res) => {

    try {
        let items;
            items = await db.getMenuItemOfPremium(); 
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get all menu items info
app.get('/api/info/:item?', async (req, res) => {
    // Access item_type from the query parameter
    const { item } = req.params;
    console.log(`${item}`); //for debugging - is showing 'undefined'

    try {
        let items;

            if (item) {
                items = await db.getMenuItemInfo(item);
                if (items.length === 0) {
                    console.log(`No allergens found for item: ${item}`);
                }
            } else {
                items = await db.getMenuItemInfo();
            }
            //items = await db.getMenuItemInfo(item);
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu item information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint for getting prices
app.get('/get-price/:item/:size', async (req, res) => {
    const { item, size } = req.params; // Destructure the item and size from params

    try {
        const price = await db.getPriceFromDatabase(item, size); // Call the price fetching function
        if (price === "Price not found" || price === "Invalid size") {
            res.status(404).json({ error: price });
        } else {
            res.json({ item, size, price }); // Send the price as a JSON response
        }
    } catch (error) {
        console.error('Error fetching price:', error); // Log the error
        res.status(500).json({ error: 'Failed to fetch price' }); // Send error response
    }
});

// Endpoint to getting log in information 
app.post('/api/login', async (req, res) => {
    const { email, employee_id } = req.body; // Ensure this matches the names in your fetch request

    try {
        console.log(`Attempting to log in with email: ${email} and employee_id: ${employee_id}`);
        const user = await db.authenticateUser(email, parseInt(employee_id));
        console.log(user); // Log the user returned by the database

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return structured user information
        res.json({ user: { employee_id:user.employee_id, employee_name: user.employee_name, job_title: user.job_title } }); // Modify this line
    } catch (error) {
        console.error('Error in login:', error); // Log the error details
        res.status(500).json({ message: 'Server error' });
    }
});


// Endpoint to get the highest menu item ID
app.get('/api/highest-menu-item-id', async (req, res) => {
    try {
        const max_id = await db.getHighestMenuItemId(); // Should call the correct function
        res.json({ max_id });
    } catch (error) {
        console.error('Failed to retrieve highest menu item id:', error);
        res.status(500).json({ message: 'Failed to retrieve highest menu item id' });
    }
});

// Endpoint to add a new menu item
app.post('/api/add-menu-item', async (req, res) => {
    const item = req.body;
    try {
        const newItemId = await db.addMenuItem(item);
        res.status(201).json({ message: 'Menu item added successfully', menu_item_id: newItemId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add menu item' });
    }
});

// Endpoint to remove a menu item (aka set its status to False)
app.post('/api/remove-menu-item', async (req, res) => {
    const { name } = req.body;
    try {
        const wasRemoved = await db.removeMenuItem(name); // Call the function from db.js
        if (wasRemoved) {
            res.json({ message: 'Menu item removed successfully' });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        console.error('Failed to remove menu item:', error);
        res.status(500).json({ message: 'Failed to remove menu item' });
    }
});

// Endpoint to get all employee information
app.get('/api/employees', async (req, res) => {
    console.log("Request received for /api/employees");
    try {
        const employees = await db.getEmployeeInfo();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employee information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get all employees whos accounts are not linked through google
app.get('/api/unlinked-employees', async (req, res) => {
    console.log("Request received for /api/unlinked-employees");
    try {
        const employees = await db.getEmployeesNotLinked();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching unlinked employee information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get highest employee ID
app.get('/api/highest-employee-id', async (req, res) => {
    try {
        const max_id = await db.getHighestEmployeeId();
        res.json({ max_id });
    } catch (error) {
        console.error('Failed to retrieve highest employee id:', error);
        res.status(500).json({ message: 'Failed to retrieve highest employee id' });
    }
});

// Endpoint to add a new employee
app.post('/api/add-employee', async (req, res) => {
    const employee = req.body;
    try {
        const newEmployeeId = await db.addEmployee(employee);
        res.status(201).json({ message: 'Employee added successfully', employee_id: newEmployeeId });
    } catch (error) {
        console.error('Failed to add employee:', error);
        res.status(500).json({ message: 'Failed to add employee' });
    }
});

// Endpoint to delete an employee
app.delete('/api/remove-employee/:id', async (req, res) => {
    const { id } = req.params; // Get the employee ID from the URL parameter
    try {
      const isRemoved = await db.removeEmployee(id); // Call the removeEmployee function
      if (isRemoved) {
        res.status(200).json({ message: 'Employee removed successfully.' });
      } else {
        res.status(404).json({ message: 'Employee not found.' });
      }
    } catch (error) {
      console.error('Error removing employee:', error.message);
      res.status(500).json({ message: 'Error removing employee.' });
    }
});

//Endpoint for Z Report
app.get('/api/zreport', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    console.log('Date received:', date);  // Log to see the date being passed

    try {
        const { orders, total } = await db.getDailyOrders(date);
        res.json({ orders, total });
    } catch (error) {

        console.error('Failed to retrieve Z-Report data:', error.message);
        res.status(500).json({ message: 'Failed to retrieve Z-Report data' });
    }
});

//Endpoint for X Report
app.get('/api/xreport', async (req, res) => {
    const { date } = req.query;
  
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
  
    try {
      const hourlySales = await db.getHourlySales(date);
      res.json({ hourlySales });
    } catch (error) {
      console.error('Failed to retrieve X-Report data:', error.message);
      res.status(500).json({ message: 'Failed to retrieve X-Report data' });
    }
});

//Endpoint for Sales Report
app.get('/api/salesreport', async (req, res) => {
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and End dates are required.' });
    }
  
    try {
      const menuItems = await db.getSalesReport(startDate, endDate);
      res.json({ menuItems });
    } catch (error) {
      console.error('Error fetching sales report:', error.message);
      res.status(500).json({ message: 'Failed to fetch sales report data.' });
    }
});

//Endpoint to fetch product usage report
app.get('/api/inventory/product-usage', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const productUsage = await db.getProductUsage(startDate, endDate);
      res.json({ productUsage });
    } catch (error) {
      console.error('Error fetching product usage report:', error.message);
      res.status(500).json({ message: 'Failed to fetch product usage data.' });
    }
});

//Endpoint for restock report
app.get('/api/inventory/restock-report', async (req, res) => {
    try {
      const restockReport = await db.getRestockReport();
      res.json({ restockReport });
    } catch (error) {
      console.error('Error fetching restock report:', error.message);
      res.status(500).json({ message: 'Failed to fetch restock report data.' });
    }
});

//Endpoint for restock inventory
app.post('/api/inventory/restock', async (req, res) => {
    try {
      const updatedRows = await db.restockInventory();
      res.json({ message: `${updatedRows} items restocked.` });
    } catch (error) {
      console.error('Error restocking inventory:', error.message);
      res.status(500).json({ message: 'Failed to restock inventory.' });
    }
});

// API endpoint to get weekly promos
app.get('/api/promos', async (req, res) => {
    try {
        let promos;
        promos = await db.getWeeklyPromos(); // Fetch the promos from the database
        res.json(promos); // Send the promos as a JSON response
    } catch (error) {
        console.error('Error fetching promos:', error.message);
        res.status(500).send('Server Error');
    }
});

// Route to add a new order
app.post('/api/add-order', async (req, res) => {
    const { employee_id, order_price, order_status, order_items } = req.body;
    try {
        // Add the order (create empty row and update with price/status)
        const orderId = await db.addOrder(employee_id, order_price, order_status);

        // Add the order items using the generated orderId
        await db.addOrderItems(orderId, order_items);

        //Update inventory based on items in the order
        await db.updateInventory(orderId);

        res.status(200).json({ message: 'Order placed successfully', order_id: orderId });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ message: 'Failed to add order', error: error.message });
    }
});

//function that has the query
// Endpoint to get pending orders
app.get('/api/pending-orders', async (req, res) => {
    try {
        const pendingOrders = await db.getPendingOrders(); // Call function from db.js
        res.json({ orders: pendingOrders });
    } catch (error) {
        console.error('Failed to fetch pending orders:', error); // Log the error message
        res.status(500).json({ message: 'Failed to fetch pending orders', error: error.message });
    }
});



// Endpoint to mark an order as completed to be changed in db
app.put('/api/order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    try {
        // Await the database update and check for an update result
        const updatedOrder = await db.updateOrderStatus(orderId, newStatus);

        if (updatedOrder) {
            await res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
        } else {
            await res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        // Await error handling
        await res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
});

// Endpoint to link a Google account to an exsiting employee
app.post('/api/link-google', async (req, res) => {
    const { googleId, employeeId } = req.body;

    try {
        const updatedEmployee = await db.linkGoogleAccount(googleId, employeeId);
        if (updatedEmployee) {
            res.status(200).json({ message: 'Google account linked successfully.', employee: updatedEmployee });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error('Failed to link Google account:', error);
        res.status(500).json({ message: 'Failed to link Google account' });
    }
});

// Endpoint to get a user given their google id
app.get('/api/get-user-by-google/:googleId', async (req, res) => {
    const { googleId } = req.params;
    try {
        const user = await db.findUserByGoogleId(googleId);
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user by Google ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/callback/google', (req, res) => {
    console.log('Received request at /api/auth/callback/google');
    res.send('Callback route is working.');
});

//for serving view to get order id and status to display to customers
app.get('/api/orders-status', async (req, res) => {
    try {
        const orders = await db.getOrderStatuses(); // Use the refactored function
        res.status(200).json(orders); // Return the orders with a 200 status
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders status', error: error.message });
    }
});



// Endpoint to handle customer points during cash-out
app.post('/api/cashout', async (req, res) => {
    const { name, email, phone_number, totalPrice } = req.body;
  
    try {
      let customer;
      let discount = 0;
      let points = 0;

      if (email) {
        // Existing customer: Look up by email
        customer = await db.getCustomerByEmail(email);

        if (customer) {
          // Add 5 points to the existing points
          points = customer.points + 5;

          // Apply discount if points >= 25
          if (points >= 25) {
            discount = 0.10; // 10% discount
            points -= 25;    // Deduct used points
          }

          // Update points in the database
          await db.updateCustomerPoints(email, points);
        } else {
          // New customer: Add to the database with 5 points
          customer = await db.addCustomer(name, email, phone_number);
          points = 5; // New customer starts with 5 points
        }
      } else {
        // No email provided: Treat as anonymous customer, no points accumulated
        points = 0;
      }

      // Calculate the final price after discount
      const finalPrice = discount ? totalPrice * (1 - discount) : totalPrice;

      // Send the response back to the kiosk view
      res.json({
        success: true,
        finalPrice,
        discountApplied: discount > 0,
        remainingPoints: points,
      });
    } catch (error) {
      console.error('Error handling cash-out:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get all customers
app.post('/api/customers', async (req, res) => {
    const { name, email, phone_number } = req.body;
    try {
        const newCustomer = await db.addCustomer(name, email, phone_number);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
});

// Endpoint to get the current highest order id
app.get('/api/highest-order-id', async (req, res) => {
    try {
      // Call the function to get the highest order ID
      const highestOrderId = await db.getHighestOrderId();
      
      // Send the result back as JSON
      res.status(200).json({
        success: true,
        highestOrderId,
      });
    } catch (error) {
      console.error('Error fetching highest order ID:', error);
      
      // Send an error response
      res.status(500).json({
        success: false,
        message: 'Failed to fetch the highest order ID.',
      });
    }
});

// Backend route for deleting an order item
app.delete('/api/delete-order-item', async (req, res) => {
    console.log('Received DELETE request');
    const { orderId, menu_item_id } = req.body;
  
    if (!orderId || !menu_item_id) {
      return res.status(400).json({ message: 'Both order_id and menu_item_id are required' });
    }
  
    try {
      const deletedItem = await db.deleteOrderItem(orderId, menu_item_id);
      res.status(200).json({ message: 'Order item deleted successfully', deletedItem });
    } catch (error) {
      console.error('Error deleting order item:', error);
      res.status(500).json({ message: 'Failed to delete order item' });
    }
});  

app.get('/api/order-items/:orderId', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Fetch menu items associated with the given order_id
      const menuItems = await db.getMenuItemsByOrderId(orderId);
  
      // Respond with the list of menu items
      res.json({
        menuItems,
      });
    } catch (error) {
      // If an error occurs (e.g., no items found), return an error response
      res.status(500).json({
        message: 'Error fetching menu items.',
        error: error.message,
      });
    }
});

// Route to update the unit cost to order
app.put('/api/update-unit-cost', async (req, res) => {
    try {
      const { inventoryId, newUnitCost } = req.body;

      if (!inventoryId || newUnitCost === undefined) {
        return res.status(400).json({ message: 'Invalid request. Missing inventoryId or newUnitCost.' });
      }

      const updatedItem = await db.updateUnitCost(inventoryId, newUnitCost);

      if (!updatedItem) {
        return res.status(404).json({ message: 'Inventory item not found.' });
      }

      res.status(200).json({ message: 'Unit cost updated successfully.', updatedItem });
    } catch (error) {
      console.error('Error updating unit cost:', error.message);
      res.status(500).json({ message: 'An error occurred while updating unit cost.' });
    }
});

app.post('/api/inventory/delete-item', async (req, res) => {
    const { name } = req.body;
    try {
      const result = await db.deleteInventoryItem(name); // Ensure this function exists
      if (result.rowCount > 0) {
        res.json({ message: 'Item deleted successfully.' });
      } else {
        res.status(404).json({ message: 'Item not found.' });
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
});

// Endpoint to get a menu_item_id given its name
app.get('/api/get-item-id-by-name/:name', async (req, res) => {
    const { name } = req.params; // Extract name from request parameters
    try {
        const menuItemId = await db.getMenuItemIdByName(name); // Call the database function
        if (menuItemId) {
            res.json({ menu_item_id: menuItemId });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        console.error('Error fetching menu_item_id by name:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to set a new value for the calories of a menu item
app.post('/api/set-calories', async (req, res) => {
    const { id, calories } = req.body;  // Destructure both id and calories from the request body
    console.log('Received data:', { id, calories });  // Log the received data

    try {
        const updatedItem = await db.updateMenuItemCalories(id, calories);  // Pass both id and calories to the function
        res.status(201).json(updatedItem);  // Return the updated item
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
});

// Endpoint to set a new value for the wage of an employee
app.post('/api/set-wage', async (req, res) => {
    const { id, wage } = req.body;  // Destructure both id and wage from the request body


    if (!id || !wage) {
        return res.status(400).json({ message: 'Employee ID and wage are required' });
    }

    console.log('Received data:', { id, wage });  // Log the received data

    try {
        const updatedWage = await db.updateEmployeeWage(id, wage);  // Pass both id and wage to the function
        res.status(200).json(updatedWage);  // Return the updated employee
    } catch (error) {
        console.error('Error updating employee wage:', error);
        res.status(500).json({ message: 'Error updating employee wage', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});