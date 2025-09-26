<?php
require 'db_connect.php';

try {
    // I-format ang date_added para mas madaling basahin
    $stmt = $conn->prepare("SELECT id, name, description, price, stock, category, image, DATE_FORMAT(date_added, '%Y-%m-%d') as dateAdded, image_default, image_natural, image_dark, image_premium FROM products ORDER BY id DESC");
    $stmt->execute();

    $stmt->setFetchMode(PDO::FETCH_ASSOC);
    $products = $stmt->fetchAll();

    // I-format ang data para maging eksaktong kapareho ng original JS structure
    $formatted_products = array_map(function($product) {
        // Gawing number ang mga string
        $product['id'] = (int)$product['id'];
        $product['price'] = (float)$product['price'];
        $product['stock'] = (int)$product['stock'];
        
        // Gumawa ng nested 'images' object, tulad ng sa original JS
        $product['images'] = [
            'default' => $product['image_default'],
            'natural' => $product['image_natural'],
            'dark' => $product['image_dark'],
            'premium' => $product['image_premium']
        ];
        
        return $product;
    }, $products);

    echo json_encode($formatted_products);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}

$conn = null; // Isara ang connection
?>