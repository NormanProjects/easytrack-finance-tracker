CREATE TABLE `users` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100),
  `last_name` varchar(100),
  `oauth_provider` varchar(50),
  `oauth_id` varchar(255),
  `profile_picture_url` varchar(500),
  `is_email_verified` boolean DEFAULT false,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `last_login_at` timestamp
);

CREATE TABLE `categories` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint,
  `name` varchar(100) NOT NULL,
  `icon` varchar(50),
  `type` enum(INCOME,EXPENSE) NOT NULL,
  `is_default` boolean DEFAULT false,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `transactions` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `merchant_name` varchar(255),
  `description` text,
  `transaction_date` date NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `budgets` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `category_id` bigint,
  `amount` decimal(12,2) NOT NULL,
  `period` enum(MONTHLY,YEARLY) DEFAULT 'MONTHLY',
  `start_date` date NOT NULL,
  `end_date` date,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `savings_goals` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `target_amount` decimal(12,2) NOT NULL,
  `current_amount` decimal(12,2) DEFAULT 0,
  `monthly_contribution` decimal(12,2),
  `target_date` date,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `debts` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `original_amount` decimal(12,2) NOT NULL,
  `current_balance` decimal(12,2) NOT NULL,
  `interest_rate` decimal(5,2),
  `minimum_payment` decimal(12,2),
  `due_date` date,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `password_reset_tokens` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(255) UNIQUE NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `refresh_tokens` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(500) UNIQUE NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` boolean DEFAULT false,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX `users_index_0` ON `users` (`email`);

CREATE INDEX `users_index_1` ON `users` (`oauth_provider`, `oauth_id`);

CREATE INDEX `categories_index_2` ON `categories` (`user_id`, `type`);

CREATE INDEX `transactions_index_3` ON `transactions` (`user_id`, `transaction_date`);

CREATE INDEX `transactions_index_4` ON `transactions` (`user_id`, `category_id`);

CREATE INDEX `budgets_index_5` ON `budgets` (`user_id`, `start_date`, `end_date`);

CREATE INDEX `savings_goals_index_6` ON `savings_goals` (`user_id`);

CREATE INDEX `debts_index_7` ON `debts` (`user_id`);

CREATE INDEX `password_reset_tokens_index_8` ON `password_reset_tokens` (`token`);

CREATE INDEX `password_reset_tokens_index_9` ON `password_reset_tokens` (`user_id`);

CREATE INDEX `refresh_tokens_index_10` ON `refresh_tokens` (`token`);

CREATE INDEX `refresh_tokens_index_11` ON `refresh_tokens` (`user_id`);

ALTER TABLE `categories` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `transactions` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `transactions` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `budgets` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `budgets` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `savings_goals` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `debts` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `password_reset_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `refresh_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
