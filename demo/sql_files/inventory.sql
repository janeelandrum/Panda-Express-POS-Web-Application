CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY, 
    inventory_item_name VARCHAR(100), 
    quantity INT, 
    unit_cost_to_order FLOAT, 
    fill_level INT, 
    inventory_item_type VARCHAR(100), 
);

INSERT INTO inventory (inventory_id, inventory_item_name, quantity, unit_cost_to_order, fill_level, inventory_item_type) VALUES 
(1, 'chicken', 55, 150.46, 110, 'food'),
(2, 'mushrooms', 97, 247.39, 194, 'food'),
(3, 'zucchini', 97, 230.24, 194, 'food'),
(4, 'beef', 97, 163.56, 194, 'food'),
(5, 'shrimp', 58, 212.11, 116, 'food'),
(6, 'noodles', 72, 241.56, 144, 'food'),
(7, 'mixed vegetables', 95, 220.25, 190, 'food'),
(8, 'white rice', 64, 229.11, 128, 'food'),
(9, 'eggs', 66, 167.62, 132, 'food'),
(10, 'peas', 79, 188.24, 158, 'food'),
(11, 'carrots', 68, 173.79, 136, 'food'),
(12, 'green onion', 90, 212.48, 180, 'food'),
(13, 'soy sauce', 94, 230.15, 188, 'food'),
(14, 'ginger sauce', 53, 174.91, 106, 'food'),
(15, 'sweet and sour sauce', 69, 247.22, 138, 'food'),
(16, 'teryaki sauce', 51, 194.48, 102, 'food'),
(17, 'orange sauce', 87, 150.26, 174, 'food'),
(18, 'honey sesame seed sauce', 88, 178.83, 176, 'food'),
(19, 'black pepper sauce', 88, 169.36, 176, 'food'),
(20, 'sweet-tangy sauce', 72, 240.11, 144, 'food'),
(21, 'cabbage', 65, 211.2, 130, 'food'),
(22, 'celery', 72, 247.94, 144, 'food'),
(23, 'oil', 54, 249.09, 108, 'food'),
(24, 'spices', 50, 234.55, 100, 'food'),
(25, 'green beans', 98, 247.31, 196, 'food'),
(26, 'bell peppers', 62, 164.84, 124, 'food'),
(27, 'broccoli', 53, 165.61, 106, 'food'),
(28, 'glazed walnuts', 80, 192.26, 160, 'food'),
(29, 'peanuts', 90, 201.86, 180, 'food'),
(30, 'chili peppers', 92, 208.81, 184, 'food'),
(31, 'onions', 56, 173.21, 112, 'food'),
(32, 'wonton wrapper', 76, 249.48, 152, 'food'),
(33, 'cream cheese', 83, 219.71, 166, 'food'),
(34, 'apples', 77, 177.58, 154, 'food'),
(35, 'cinnamon', 62, 231.85, 124, 'food'),
(36, 'fortune cookies', 82, 164.85, 164, 'food'),
(37, 'bottled water', 90, 205.99, 180, 'drink'),
(38, 'bottled drink', 66, 197.57, 132, 'drink'),
(39, 'fountain drink', 63, 214.33, 126, 'drink'),
(40, 'plastic bags', 83, 158.0, 166, 'supplies'),
(41, 'plastic cutlery', 71, 199.0, 142, 'supplies'),
(42, 'to-go boxes', 66, 195.08, 132, 'supplies'),
(43, 'small cups', 88, 217.3, 176, 'supplies'),
(44, 'medium cups', 91, 244.75, 182, 'supplies'),
(45, 'large cups', 61, 237.14, 122, 'supplies'),
(46, 'napkins', 62, 193.55, 124, 'supplies');