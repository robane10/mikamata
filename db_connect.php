<?php
header("Access-Control-Allow-Origin: *"); // Payagan ang access mula sa kahit anong origin (para sa development)
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";       // Karaniwang username sa XAMPP
$password = "";           // Karaniwang blanko ang password sa XAMPP
$dbname = "mikamata_db";  // Ang pangalan ng database na ginawa natin

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit(); // Itigil ang script kung may error sa connection
}
?>