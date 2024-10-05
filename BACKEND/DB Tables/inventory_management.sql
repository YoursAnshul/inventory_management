CREATE TABLE `users` (
   `id` int NOT NULL AUTO_INCREMENT,
   `email` varchar(255) NOT NULL,
   `password` varchar(255) NOT NULL,
   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `status` varchar(25) DEFAULT NULL,
   `first_name` varchar(255) DEFAULT NULL,
   `last_name` varchar(255) DEFAULT NULL,
   `avatar` varchar(255) DEFAULT NULL,
   `customerId` varchar(255) DEFAULT NULL,
   `isCustomer` tinyint(1) DEFAULT '0',
   `mobile_number` varchar(50) DEFAULT NULL,
   `permission` enum('VIEW','VIEW_EDIT','ALL') DEFAULT NULL,
   `role` enum('ADMIN','MANAGER','SERVICE_ENGINEER') DEFAULT NULL,
   `createdBy` int DEFAULT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `email_status_unique` (`email`,`status`)
 ) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;
 
 
 CREATE TABLE `categories` (
   `id` bigint NOT NULL AUTO_INCREMENT,
   `created_at` datetime(6) NOT NULL,
   `updated_at` datetime(6) NOT NULL,
   `name` varchar(50) NOT NULL,
   `icon` varchar(100) DEFAULT NULL,
   `status` varchar(20) DEFAULT NULL,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=2606 DEFAULT CHARSET=latin1;
 
 
 CREATE TABLE `customers` (
   `id` bigint NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   `status` varchar(50) NOT NULL,
   `created_at` datetime NOT NULL,
   `updated_at` datetime NOT NULL,
   `mobile_number` varchar(20) DEFAULT NULL,
   `email` varchar(100) DEFAULT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `unique_customer_name_status` (`name`,`status`)
 ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 
 CREATE TABLE `inventory` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(75) NOT NULL,
   `category_id` int NOT NULL,
   `price` decimal(10,2) DEFAULT NULL,
   `status` enum('ACTIVE','DELETED') DEFAULT 'ACTIVE',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `category_id` (`category_id`)
 ) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 
 CREATE TABLE `inventory_transactions` (
   `id` int NOT NULL AUTO_INCREMENT,
   `inventory_id` int NOT NULL,
   `type` enum('IN','OUT') NOT NULL,
   `qty` int NOT NULL,
   `customer_id` int DEFAULT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `inventory_id` (`inventory_id`),
   KEY `customer_id` (`customer_id`)
 ) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;