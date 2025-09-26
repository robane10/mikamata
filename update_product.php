<?php
require 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

if (!isset($_POST['id']) || empty($_POST['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required for update.']);
    exit;
}

try {
    $sql = "UPDATE products SET 
                name = :name, 
                description = :description, 
                price = :price, 
                stock = :stock, 
                category = :category, 
                image = :image, 
                image_default = :image_default, 
                image_natural = :image_natural, 
                image_dark = :image_dark, 
                image_premium = :image_premium
            WHERE id = :id";
    
    $stmt = $conn->prepare($sql);

    // Bind all parameters from the POST data
    foreach ($_POST as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update product.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn = null;