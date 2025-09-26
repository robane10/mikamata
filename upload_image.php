<?php
header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if (isset($_FILES['image'])) {
    $file = $_FILES['image'];

    // Basic validation
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'File upload error: ' . $file['error'];
        echo json_encode($response);
        exit;
    }

    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed_types)) {
        $response['message'] = 'Invalid file type. Please upload a JPG, PNG, GIF, or WEBP.';
        echo json_encode($response);
        exit;
    }

    if ($file['size'] > 10 * 1024 * 1024) { // 10 MB limit
        $response['message'] = 'File is too large. Maximum size is 10MB.';
        echo json_encode($response);
        exit;
    }

    // Create a unique filename to prevent overwriting
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $unique_filename = uniqid('prod_', true) . '.' . $file_extension;

    // Define the upload directory. IMPORTANT: This path is relative to this PHP script.
    // We go up one level from /api to the root, then into /mik/products/uploads/
    $upload_dir = '../mik/products/uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true); // Create directory if it doesn't exist
    }
    $upload_path = $upload_dir . $unique_filename;

    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        $response['success'] = true;
        $response['message'] = 'Image uploaded successfully.';
        // Return the web-accessible path for the database
        $response['path'] = '/mik/products/uploads/' . $unique_filename;
    } else {
        $response['message'] = 'Failed to move uploaded file.';
    }
} else {
    $response['message'] = 'No image file received.';
}

echo json_encode($response);
?>