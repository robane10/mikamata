<?php
require 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

try {
    $sql = "INSERT INTO products (name, description, price, stock, category, image, image_default, image_natural, image_dark, image_premium) 
            VALUES (:name, :description, :price, :stock, :category, :image, :image_default, :image_natural, :image_dark, :image_premium)";
    
    $stmt = $conn->prepare($sql);

    $stmt->bindParam(':name', $_POST['name']);
    $stmt->bindParam(':description', $_POST['description']);
    $stmt->bindParam(':price', $_POST['price']);
    $stmt->bindParam(':stock', $_POST['stock'], PDO::PARAM_INT);
    $stmt->bindParam(':category', $_POST['category']);
    $stmt->bindParam(':image', $_POST['image']);
    $stmt->bindParam(':image_default', $_POST['image_default']);
    $stmt->bindParam(':image_natural', $_POST['image_natural']);
    $stmt->bindParam(':image_dark', $_POST['image_dark']);
    $stmt->bindParam(':image_premium', $_POST['image_premium']);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product added successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add product.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn = null;