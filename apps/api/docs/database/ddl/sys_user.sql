-- Existing database reference only.
-- Source: user-provided CREATE TABLE statement on 2026-05-22.
-- Do not execute this file as an application migration.

CREATE TABLE `sys_user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `group_id` int unsigned NOT NULL DEFAULT '0' COMMENT '组别ID',
  `username` varchar(32) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户名',
  `nickname` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '昵称',
  `password` varchar(32) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '密码',
  `salt` varchar(30) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '密码盐',
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '电子邮箱',
  `mobile` varchar(11) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '手机号',
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '头像',
  `level` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '等级',
  `gender` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '性别',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `bio` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '格言',
  `money` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '余额',
  `score` int NOT NULL DEFAULT '0' COMMENT '积分',
  `successions` int unsigned NOT NULL DEFAULT '1' COMMENT '连续登录天数',
  `maxsuccessions` int unsigned NOT NULL DEFAULT '1' COMMENT '最大连续登录天数',
  `prevtime` bigint DEFAULT NULL COMMENT '上次登录时间',
  `logintime` bigint DEFAULT NULL COMMENT '登录时间',
  `loginip` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '登录IP',
  `loginfailure` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '失败次数',
  `loginfailuretime` bigint DEFAULT NULL COMMENT '最后登录失败时间',
  `joinip` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '加入IP',
  `jointime` bigint DEFAULT NULL COMMENT '加入时间',
  `createtime` bigint DEFAULT NULL COMMENT '创建时间',
  `updatetime` bigint DEFAULT NULL COMMENT '更新时间',
  `token` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT 'Token',
  `status` varchar(30) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '状态',
  `verification` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '验证',
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  KEY `email` (`email`),
  KEY `mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='会员表';
