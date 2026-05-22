-- Existing database reference only.
-- Source: user-provided CREATE TABLE statement on 2026-05-22.
-- Do not execute this file as an application migration.

CREATE TABLE `sys_user_group` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '组名',
  `rules` text COLLATE utf8mb4_general_ci COMMENT '权限节点',
  `createtime` bigint DEFAULT NULL COMMENT '添加时间',
  `updatetime` bigint DEFAULT NULL COMMENT '更新时间',
  `status` enum('normal','hidden') COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='会员组表';
