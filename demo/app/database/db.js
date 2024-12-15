const { Pool } = require('pg');
require('dotenv').config(); 

// Initialize a connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});


// Function to get menu item by ID
const getMenuItemById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items WHERE menu_item_id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu item');
    }
}

// Function to get all menu items sorted by type (only active ones)
const getMenuItemNames = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_id, menu_item_name, menu_item_type, menu_item_spice, menu_item_woksmart, menu_item_calories
            FROM menu_items 
            WHERE menu_item_status = true
            ORDER BY 
                CASE 
                    WHEN menu_item_type = 'entree' THEN 1 
                    WHEN menu_item_type = 'side' THEN 2 
                    ELSE 3
                END
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

// Function to get all menu items of a particular type
const getMenuItemsOfType = async (item_type) => {
    try {
        const result = await pool.query(`
            SELECT menu_item_id, menu_item_name, menu_item_spice, menu_item_woksmart, menu_item_calories
            FROM menu_items
            WHERE menu_item_type = $1
        `, [item_type]); // Parameterized query
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

// Function to get all menu items classified as 'spicy'
const getMenuItemOfSpice = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_name
            FROM menu_items
            WHERE menu_item_spice = 't'
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

// Function to get all menu items classified as 'wok smart'
const getMenuItemOfWokSmart = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_name
            FROM menu_items
            WHERE menu_item_woksmart = 't'
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

// Function to get all menu items classified as 'premium'
const getMenuItemOfPremium = async () => {
    try { //SELECT menu_item_name FROM menu_items WHERE menu_price_small = 6.70
        const result = await pool.query(`
            SELECT menu_item_name
            FROM menu_items
            WHERE menu_price_small = 6.70
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    } 
}

// Function to get additional menu item info
const getMenuItemInfo =  async (item) => {
    try {
        
        const result = await pool.query(`
            SELECT mi.menu_item_name, mi.menu_item_description, mi.menu_item_calories, COALESCE(array_agg(a.allergen_name), '{}') AS allergens
            FROM menu_items mi
            LEFT JOIN menu_item_allergens mia ON mi.menu_item_id = mia.menu_item_id
            LEFT JOIN allergens a ON mia.allergen_id = a.allergen_id ${item ? `WHERE mi.menu_item_name = $1` : ''}
            GROUP BY mi.menu_item_name, mi.menu_item_description, mi.menu_item_calories
            ORDER BY mi.menu_item_name;
        `, item ? [item] : []);
        
        return result.rows;

    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch additional menu item information');
    }
}

// Function to get prices from menu items
const getPriceFromDatabase = async (item, size) => {
    const query = `
        SELECT
            menu_price_small,
            menu_price_medium,
            menu_price_large,
            menu_price_bowl,
            menu_price_plate,
            menu_price_bplate
        FROM menu_items
        WHERE menu_item_name ILIKE $1
    `;


    try {
        const result = await pool.query(query, [item]);

        if (result.rows.length > 0) {
            const prices = result.rows[0];
            let selectedPrice;


            switch (size.toLowerCase()) {
                case "small":
                    selectedPrice = prices.menu_price_small;
                    break;
                case "medium":
                    selectedPrice = prices.menu_price_medium;
                    break;
                case "large":
                    selectedPrice = prices.menu_price_large;
                    break;
                case "bowl":
                    selectedPrice = prices.menu_price_bowl;
                    break;
                case "plate":
                    selectedPrice = prices.menu_price_plate;
                    break;
                case "bigger_plate":
                    selectedPrice = prices.menu_price_bplate;
                    break;
                default:
                    return "Invalid size";
            }


            return selectedPrice !== null ? selectedPrice.toFixed(2) : "Price not found";
        } else {
            console.log('No price found for item:', item); // Log if no rows were returned
            return "Price not found";
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch price');
    }
}

// Function to get the highest menu item ID
async function getHighestMenuItemId() {
    const query = 'SELECT menu_item_id FROM menu_items ORDER BY menu_item_id DESC LIMIT 1';
    try {
        const result = await pool.query(query);
        // Log the result to see what is returned
        console.log('Query result:', result.rows);
        
        // Check if we have any rows returned
        if (result.rows.length === 0) {
            return 0; // Return 0 if no items exist
        }
        return result.rows[0].menu_item_id; // Return the highest menu_item_id
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to get highest menu item ID');
    }
}

// Function to insert a new menu item
async function addMenuItem(item) {
    const query = `
        INSERT INTO menu_items (
            menu_item_id, menu_item_name, menu_item_type, menu_item_description,
            menu_item_spice, menu_item_woksmart, menu_item_calories,
            menu_price_small, menu_price_medium, menu_price_large,
            menu_price_bowl, menu_price_plate, menu_price_bplate, 
            menu_item_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 4.15, 4.90, 5.65, $11)
    `;
    const values = [
        item.menu_item_id,
        item.name,
        item.type,
        item.description,
        item.spice,
        item.woksmart,
        item.calories,
        item.priceSmall,
        item.priceMedium,
        item.priceLarge,
        item.status
    ];

    try {
        await pool.query(query, values);
        return item.menu_item_id;  // Return the ID used to insert the new item
    } catch (error) {
        console.error('Database insertion error:', error);
        throw new Error('Failed to add new menu item');
    }
}

// Function to remove a menu item (aka mark its status as inactive)
async function removeMenuItem(name) {
    const query = `
        UPDATE menu_items
        SET menu_item_status = false
        WHERE menu_item_name = $1
    `;
    try {
        const result = await pool.query(query, [name]);
        return result.rowCount > 0; // Return true if the item was found and updated
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to remove menu item');
    }
}

// Function to get the current highest employee ID
async function getHighestEmployeeId() {
    const query = 'SELECT employee_id FROM employees ORDER BY employee_id DESC LIMIT 1';
    try {
        const result = await pool.query(query);
        // Log the result to see what is returned
        console.log('Query result:', result.rows);
        
        // Check if we have any rows returned
        if (result.rows.length === 0) {
            return 0; // Return 0 if no items exist
        }
        return result.rows[0].employee_id; // Return the highest employee
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to get highest menu item ID');
    }
}


// Function to insert a new employee
async function addEmployee(employee) {
    const query = `
        INSERT INTO employees (
            employee_id, employee_name, email,
            phone_number, job_title, wage, hire_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
        employee.employee_id,
        employee.employee_name,
        employee.email,
        employee.phone_number,
        employee.job_title,
        employee.wage,
        employee.hire_date
    ];

    try {
        await pool.query(query, values);
        return employee.employee_id;  // Return the ID used to insert the new employee
    } catch (error) {
        console.error('Database insertion error:', error);
        throw new Error('Failed to add new menu item');
    }
}

// Function to remove an employee
const removeEmployee = async (employeeId) => {
    try {
        console.log("Attempt to delete employee...");
        const result = await pool.query('DELETE FROM employees WHERE employee_id = $1', [employeeId]);
        if (result.rowCount > 0)
            console.log("Employee deleted.");
        return result.rowCount > 0; // Returns true if the employee was removed
    } catch (error) {
        console.error('Error removing employee:', error);
        throw new Error('Failed to remove employee');
    }
}

//Function for Z Report
async function getDailyOrders(date) {
    const query = `
    SELECT order_id, order_price 
    FROM orders 
    WHERE order_date = $1 AND order_status = 'Completed'
    `;

    
    try {
        const result = await pool.query(query, [date]);

        // Process the results to calculate the total and format the orders
        const orders = result.rows.map(row => ({
            order_id: row.order_id,
            price: parseFloat(row.order_price)
        }));

        // Calculate daily total by summing up the order prices
        const total = orders.reduce((sum, order) => sum + order.price, 0);

        return { orders, total };
    } catch (error) {
        console.error('Database query error:', error.message);
        throw new Error('Failed to get daily orders');
    }
}

//Function for X Report
async function getHourlySales(date) {
    const query = `
      SELECT EXTRACT(HOUR FROM order_time) AS hour, SUM(order_price) AS total_sales 
      FROM orders 
      WHERE order_date = $1 AND order_status = 'Completed'
      GROUP BY EXTRACT(HOUR FROM order_time)
      ORDER BY hour ASC
    `;
  
    try {
      const result = await pool.query(query, [date]);
  
      // Format hourly sales results
      const hourlySales = result.rows.map(row => ({
        hour: `${row.hour.toString().padStart(2, '0')}:00`,
        totalSales: parseFloat(row.total_sales)
      }));
  
      return hourlySales;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw new Error('Failed to get hourly sales');
    }
}

//Function for Sales Report
async function getSalesReport(startDate, endDate) {
    const query = `
      SELECT mi.menu_item_name, mi.menu_item_type, COUNT(*) AS item_count
        FROM menu_items mi
        JOIN order_items oi ON mi.menu_item_id = oi.menu_item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_date BETWEEN $1 AND $2
          AND o.order_status = 'Completed'
        GROUP BY mi.menu_item_name, mi.menu_item_type
        ORDER BY 
          CASE mi.menu_item_type
            WHEN 'entree' THEN 1
            WHEN 'side' THEN 2
            WHEN 'appetizer' THEN 3
            WHEN 'drink' THEN 4
            WHEN 'dessert' THEN 5
            ELSE 6
          END;
    `;
    console.log('Executing Query:', query, 'With Parameters:', [startDate, endDate]);
  
    try {
      const result = await pool.query(query, [startDate, endDate]);
      console.log('Query Result:', result.rows);
      return result.rows.map(row => ({
        name: row.menu_item_name,
        count: row.item_count,
      }));
    } catch (error) {
      console.error('Error executing database query:', error.message);
      throw new Error('Failed to fetch sales data');
    }
  }
  

//Function for product usage in Inventory Report
async function getProductUsage(startDate, endDate) {
    const query = `
      SELECT iv.inventory_item_name, SUM(oi.recorded_quantity) AS total_used
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN ingredients ig ON oi.menu_item_id = ig.menu_item_id
      JOIN inventory iv ON ig.inventory_item_id = iv.inventory_id
      WHERE o.order_date BETWEEN $1 AND $2
        AND o.order_status = 'Completed'
      GROUP BY iv.inventory_item_name
      ORDER BY iv.inventory_item_name
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      name: row.inventory_item_name,
      amountUsed: row.total_used,
    }));
}

//Function to fetch restock in Inventory Report
async function getRestockReport() {
    const query = `
      SELECT inventory_item_name, quantity, (fill_level * 0.1) AS min_required_quantity
      FROM inventory
      ORDER BY inventory_item_name
    `;
    const result = await pool.query(query);
    return result.rows.map(row => ({
      name: row.inventory_item_name,
      quantity: row.quantity,
      minRequiredQuantity: Math.round(row.min_required_quantity),
    }));
}

//Function for restocking inventory in Inventory Report
async function restockInventory() {
    const query = `
      UPDATE inventory
      SET quantity = fill_level
      WHERE quantity <= fill_level * 0.1
    `;
    const result = await pool.query(query);
    return result.rowCount; // Returns the number of updated rows
}
  

// Function to get weekly promos from the database
const getWeeklyPromos = async () => {
    try {
        // Update the query to join promos with the menu_items table to get the name of the discounted item
        const query = await pool.query(
            `SELECT p.promo_id, m.menu_item_name, p.discount_amount
            FROM promos p
            JOIN menu_items m ON p.discounted_item = m.menu_item_id
            WHERE m.menu_item_status = TRUE` 
        );
        console.log('Fetched Promos:', query.rows);
        
        //const [rows] = await db.execute(query);
        return query.rows;
    } catch (error) {
        console.error('Error fetching promos from database:', error);
        throw error;
    }
};

// Function to get the highest order item ID
async function getHighestOrderId() {
    const query = 'SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1';
    try {
        const result = await pool.query(query);
       
        // Log the result to see what is returned
        console.log('Query result:', result.rows);
       
        // Check if we have any rows returned
        if (result.rows.length === 0) {
            return 0; // Return 0 if no orders exist
        }
       
        // Return the highest order_id (not menu_item_id)
        return result.rows[0].order_id;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to get highest order ID');
    }
}

const createEmptyOrderRow = async (employee_id) => {
    try {
        // Get the highest order ID
        const highestOrderId = await getHighestOrderId();
        const newOrderId = highestOrderId + 1;

        // SQL query to insert an empty order row with only order_id and employee_id
        const insertOrderQuery = `
            INSERT INTO orders (order_id, employee_id)
            VALUES ($1, $2) RETURNING order_id;
        `;

        // Execute the query
        const orderResult = await pool.query(insertOrderQuery, [newOrderId, employee_id]);

        // Return the newly created order ID
        return orderResult.rows[0].order_id;
    } catch (error) {
        console.error("Error creating empty order row:", error);
        throw error;
    }
};

// Function to add order details (price, status) to the empty order row
const addOrder = async (employee_id, order_price, order_status) => {
    try {
        // Create an empty order row first and get the new order_id
        const orderId = await createEmptyOrderRow(employee_id);

        // SQL query to update the order row with order details (price, status, date, and time)
        const insertOrderQuery = `
            UPDATE orders
            SET order_price = $1, order_status = $2, order_date = NOW(), order_time = NOW()
            WHERE order_id = $3
            RETURNING order_id;
        `;

        // Execute the update query
        const orderResult = await pool.query(insertOrderQuery, [
            order_price,
            order_status,
            orderId,
        ]);

        // Return the updated order_id for confirmation
        return orderResult.rows[0].order_id;
    } catch (error) {
        console.error("Error in addOrder:", error);
        throw error;
    }
};

const getHighestOrderItemId = async () => {
    try {
        const result = await pool.query('SELECT MAX(order_item_id) AS max_id FROM order_items');
        return result.rows[0].max_id || 0;  // Return 0 if there are no items
    } catch (error) {
        console.error('Error fetching highest order_item_id:', error);
        throw error;
    }
};

// Function to add items to the order
const addOrderItems = async (orderId, orderItems) => {
    // Get the highest order_item_id
    const highestOrderItemId = await getHighestOrderItemId();

    // Start incrementing from the highest order_item_id
    let currentOrderItemId = highestOrderItemId + 1;

    const orderItemsQuery = `
        INSERT INTO order_items (order_item_id, order_id, menu_item_id, combo, combo_type, item_size, recorded_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    for (const item of orderItems) {
        await pool.query(orderItemsQuery, [
            currentOrderItemId,  // Use the incremented order_item_id
            orderId,  // Order ID from the newly created order row
            item.menu_item_id,
            item.combo || 'f',
            item.combo_type || 'N/A',
            item.item_size || 'N/A',
            item.recorded_quantity,
        ]);
        
        // Increment the order_item_id for the next item
        currentOrderItemId++;
    }
};


// Function to get all orders that are "In Progress"

async function getPendingOrders() {
    const query = `
      SELECT
        o.order_id,
        o.order_date,
        o.order_time,
        o.order_price,
        o.order_status,
        STRING_AGG(mi.menu_item_name, '\n') AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.menu_item_id
      WHERE o.order_status = $1
      GROUP BY o.order_id, o.order_date, o.order_time, o.order_price, o.order_status
    `;
  
    const status = 'Awaiting';
  
    try {
      const { rows } = await pool.query(query, [status]);
      return rows.length > 0 ? rows : [];
    } catch (error) {
      console.error('Database query error while fetching pending orders:', error.message);
      throw new Error('Failed to fetch pending orders');
    }
  }
    
// Function to update the status of an order to 'completed'
async function updateOrderStatus(orderId, newStatus) {
    const query = 'UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *';
    try {
        // Await the query execution
        const { rows } = await pool.query(query, [newStatus, orderId]);

        // Await the return of the row if it exists, otherwise return null
        return await (rows.length > 0 ? rows[0] : null);
    } catch (error) {
        throw new Error('Failed to update order status');
    }
}

async function getOrderStatuses() {
    const query = `
        SELECT order_id, order_status
        FROM orders
        ORDER BY order_id DESC
    `;

    try {
        const { rows } = await pool.query(query);
        return rows; // Return the rows directly
    } catch (error) {
        console.error('Error fetching order statuses:', error.message);
        throw new Error('Failed to fetch order statuses');
    }
}

// Function to update the status of an order to 'completed'
async function completeOrder(orderId) {
    const query = 'UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *'; // Adjust as needed
    const status = 'Processing';
    try {
        const { rows } = await pool.query(query, [status, orderId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Database query error while updating order status:', error);
        throw new Error('Failed to update order status');
    }
}

// Function to get all employee information
const getEmployeeInfo = async () => {
    try {
        const result = await pool.query(`
            SELECT employee_id, employee_name, email, phone_number, job_title, wage, hire_date
            FROM employees
            ORDER BY employee_id
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch employee information');
    }
}

// Function to get all employees whos accounts are not already linked through google
const getEmployeesNotLinked = async () => {
    try {
        const result = await pool.query(`
            SELECT employee_id, employee_name, email, phone_number, job_title, wage, hire_date
            FROM employees
            WHERE google_id IS NULL
            ORDER BY employee_id
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch employee information');
    }
}

// UpdateInventory function
async function updateInventory(orderId) {
    // Step 1: Get the menu item IDs associated with the order
    const getMenuItemsQuery = 'SELECT menu_item_id FROM order_items WHERE order_id = $1';
    try {
        const { rows: menuItems } = await pool.query(getMenuItemsQuery, [orderId]);

        if (menuItems.length === 0) {
            console.log(`No menu items found for order ID ${orderId}`);
            return;  // Early return if no items found
        }

        console.log(`Found ${menuItems.length} menu items for order ID ${orderId}`);

        // Step 2: Loop through the menu items and update the inventory for each
        for (const menuItem of menuItems) {
            const menuItemID = menuItem.menu_item_id;
            console.log(`Processing menu item ID: ${menuItemID}`);

            // Get the inventory items associated with the menu item
            const getIngredientsQuery = 'SELECT inventory_item_id FROM ingredients WHERE menu_item_id = $1';
            const { rows: ingredients } = await pool.query(getIngredientsQuery, [menuItemID]);

            if (ingredients.length === 0) {
                console.log(`No ingredients found for menu item ID: ${menuItemID}`);
                continue;  // Skip if no ingredients found
            }

            console.log(`Found ${ingredients.length} ingredients for menu item ID: ${menuItemID}`);

            // Step 3: Update inventory for each inventory item associated with the menu item
            for (const ingredient of ingredients) {
                const inventoryItemID = ingredient.inventory_item_id;

                const updateInventoryQuery = 'UPDATE inventory SET quantity = quantity - 1 WHERE inventory_id = $1 RETURNING *';
                const { rows: updatedInventory } = await pool.query(updateInventoryQuery, [inventoryItemID]);

                if (updatedInventory.length > 0) {
                    console.log(`Inventory updated for inventory_item_id: ${inventoryItemID}`);
                } else {
                    console.log(`No inventory item found with inventory_id: ${inventoryItemID}`);
                }
            }
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw new Error('Failed to update inventory');
    }
}

// Function to get highest customer id from the customers table
const getHighestCustomerId = async () => {
    try {
        const query = 'SELECT MAX(customer_id) AS max_id FROM customers';
        const result = await pool.query(query);
        return result.rows[0].max_id || 0; // Default to 0 if table is empty
    } catch (error) {
        console.error('Error fetching highest customer ID:', error);
        throw error;
    }
};


// Function to get a customer by email
const getCustomerByEmail = async (email) => {
    try {
      const query = 'SELECT * FROM customers WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0]; // Returns undefined if no customer found
    } catch (error) {
      console.error('Error fetching customer by email:', error);
      throw error;
    }
};
  
// Function to add a new customer
const addCustomer = async (name, email, phoneNumber) => {
    try {
        // Get the highest customer ID and increment by 1
        const highestCustomerId = await getHighestCustomerId();
        const newCustomerId = highestCustomerId + 1;

        const query = `
            INSERT INTO customers (customer_id, name, email, phone_number, points)
            VALUES ($1, $2, $3, $4, 5)
            RETURNING *;
        `;
        const values = [newCustomerId, name, email, phoneNumber];
        const result = await pool.query(query, values);

        return result.rows[0]; // Return the newly added customer
    } catch (error) {
        console.error('Error adding new customer:', error);
        throw error;
    }
};

// Function to update customer points
const updateCustomerPoints = async (email, points) => {
    try {
      const query = `
        UPDATE customers
        SET points = $1
        WHERE email = $2
        RETURNING *;
      `;
      const result = await pool.query(query, [points, email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating customer points:', error);
      throw error;
    }
};

// Function to delete an order item by order_id and menu_item_id
const deleteOrderItem = async (order_id, menu_item_id) => {
    const query = 'DELETE FROM order_items WHERE order_id = $1 AND menu_item_id = $2 RETURNING *;';
    const values = [order_id, menu_item_id];

    try {
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('Order item not found for the given order ID and menu item ID');
      }
      return result.rows[0]; // Return the deleted order item details
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw new Error('Failed to delete order item');
    }
};  

// Function to fetch menu items based on order_id
const getMenuItemsByOrderId = async (orderId) => {
    try {
      // Query to fetch all order items for the given order_id
      const orderItemsQuery = `
        SELECT menu_item_id 
        FROM order_items
        WHERE order_id = $1;
      `;

      const orderItemsResult = await pool.query(orderItemsQuery, [orderId]);

      // If no items are found for this order_id
      if (orderItemsResult.rows.length === 0) {
        throw new Error('No items found for this order ID.');
      }

      const menuItemIds = orderItemsResult.rows.map(row => row.menu_item_id);

      // Query to fetch menu item names for each menu_item_id
      const menuItemsQuery = `
        SELECT menu_item_id, menu_item_name
        FROM menu_items
        WHERE menu_item_id = ANY($1);
      `;
      
      const menuItemsResult = await pool.query(menuItemsQuery, [menuItemIds]);
      return menuItemsResult.rows; // Return the list of menu items
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error; // Rethrow error to be handled by API route
    }
};

// Function to update the unit cost to order
const updateUnitCost = async (inventoryId, newUnitCost) => {
    try {
      const query = `
        UPDATE inventory
        SET unit_cost_to_order = $1
        WHERE inventory_id = $2
        RETURNING *;
      `;
      const values = [newUnitCost, inventoryId];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating unit cost to order:', error.message);
    }
};

// Function to delete an item from inventory
async function deleteInventoryItem(name) {
    const query = 'DELETE FROM inventory WHERE inventory_item_name = $1 RETURNING *';
    const values = [name];
    
    try {
      const result = await pool.query(query, values);
      return result; 
    } catch (err) {
      throw err; 
    }
}

// Function to link a Google account to an exsiting user
async function linkGoogleAccount(googleId, employeeId) {
    const query = 'UPDATE employees SET google_id = $1 WHERE employee_id = $2 RETURNING *';
    try {
        const { rows } = await pool.query(query, [googleId, employeeId]);
        return rows.length > 0 ? rows[0] : null; // Return the updated user, or null if not found
    } catch (error) {
        console.error('Database query error while linking Google account:', error);
        throw new Error('Failed to link Google account');
    }
}

// Function to check if a Google account is linked to an existing user
async function findUserByGoogleId(googleId) {
    const query = 'SELECT * FROM employees WHERE google_id = $1';
    try {
        const { rows } = await pool.query(query, [googleId]);
        return rows.length > 0 ? rows[0] : null; // Return rows[0] if found, or null if no matching user
    } catch (error) {
        console.error('Database query error while checking user:', error);
        throw new Error('Failed to check user in the database');
    }
}

// Function to get a menu_item_id given its name
async function getMenuItemIdByName(name) {
    const query = 'SELECT menu_item_id FROM menu_items WHERE menu_item_name = $1';
    try {
        const { rows } = await pool.query(query, [name]); // Pass the parameter into the query
        return rows.length > 0 ? rows[0].menu_item_id : null; // Return the actual menu_item_id
    } catch (error) {
        console.error('Database query error while fetching menu_item_id:', error);
        throw new Error('Failed to fetch menu_item_id from the database');
    }
}

// Function to update the calories for a menu item given its id
const updateMenuItemCalories = async (id, calories) => {
    try {
      const query = `
        UPDATE menu_items
        SET menu_item_calories = $1
        WHERE menu_item_id = $2
        RETURNING *;
      `;
      const result = await pool.query(query, [calories, id]);  // Pass both calories and id
      return result.rows[0];  // Return the updated row
    } catch (error) {
      console.error('Error updating menu item calories:', error);
      throw error;
    }
};

// Function to update the wage for an employee given their id
const updateEmployeeWage = async (id, wage) => {
    try {
        const query = `
            UPDATE employees
            SET wage = $1
            WHERE employee_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [wage, id]);  // Pass both wage and id
        if (result.rows.length === 0) {
            throw new Error('Employee not found');
        }
        return result.rows[0];  // Return the updated employee
    } catch (error) {
        console.error('Error updating employee wage:', error);
        throw error;
    }
};

// Export your functions using CommonJS syntax
module.exports = {
    getMenuItemById,
    getMenuItemNames,
    getMenuItemsOfType,
    getMenuItemOfSpice,
    getMenuItemOfWokSmart,
    getMenuItemOfPremium,
    getMenuItemInfo,
    getPriceFromDatabase,
    getHighestMenuItemId,
    getHighestCustomerId,
    addMenuItem,
    removeMenuItem,
    getEmployeeInfo,
    getHighestEmployeeId,
    addEmployee,
    removeEmployee,
    deleteInventoryItem,
    getDailyOrders,
    getWeeklyPromos,
    getHourlySales,
    getSalesReport,
    getProductUsage,
    getRestockReport,
    restockInventory,
    getHighestOrderId,
    addOrder,
    addOrderItems,
    createEmptyOrderRow,
    getPendingOrders,
    linkGoogleAccount,
    findUserByGoogleId,
    updateOrderStatus,
    getOrderStatuses,
    updateInventory,
    getCustomerByEmail,
    addCustomer,
    updateCustomerPoints,
    completeOrder,
    deleteOrderItem,
    getMenuItemsByOrderId,
    updateUnitCost,
    getEmployeesNotLinked,
    getMenuItemIdByName,
    updateMenuItemCalories,
    updateEmployeeWage,
};
