CREATE TABLE `coin_aradise_lost` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invest_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '项目/机构/人物ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '项目/机构/人物名称(脚本同步)',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'logo',
  `type` tinyint(1) DEFAULT NULL COMMENT '入选类型:1=项目,2=机构,3=人物',
  `one_liner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '一句话介绍(脚本同步)',
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '入选标签逗号分隔:closed=项目倒闭,closing=项目将关停,arrested=负责人被抓,abscond=负责人跑路',
  `tags_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '英文标签',
  `year` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '入选年度:2026=2026,2025=2025,2024=2024',
  `cause` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '入选原因',
  `cause_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '入选原因英文',
  `date` datetime DEFAULT NULL COMMENT '入选时间',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '背景图',
  `image_choose` tinyint DEFAULT NULL COMMENT '选择图片num',
  `status` tinyint(1) DEFAULT NULL COMMENT '显示状态:0=隐藏,1=显示',
  `desc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `invest_id` (`invest_id`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=1055 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='失乐园';

CREATE TABLE `coin_aradise_losts_tag` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '标签唯一id',
  `image` varchar(1024) COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片',
  `dark_image` varchar(1024) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '深色图片',
  `color` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '字体颜色',
  `dark_color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '深色字体颜色',
  `background_color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '背景颜色',
  `dark_background_color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '深色背景颜色',
  `background_image` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '背景图',
  `dark_background_image` varchar(1024) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '深色背景图',
  `tag_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '中文标签',
  `tag_name_en` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '英文标签',
  `remark` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '备注',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sys_events_timeline` (
  `event_id` bigint NOT NULL AUTO_INCREMENT COMMENT '事件ID：唯一ID（自动生成）',
  `event_name_cn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '事件名称：中文',
  `event_name_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '事件名称：英文',
  `event_image_160` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '事件配图：160x160（图片URL）',
  `event_summary_cn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '事件简介：中文',
  `event_summary_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '事件简介：英文',
  `event_introduction_cn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '事件介绍：中文（富文本/长文）',
  `event_introduction_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '事件介绍：英文（富文本/长文）',
  `event_types` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '事件类型（如：跨链桥攻击/支付/项目/代币/DAO/DeFi等）',
  `key_time` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关键时间：如“2022.10”，“2023.5 -- 7”，“2022年起”；原样保留',
  `event_natures` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '事件性质（如：崩盘/被黑/破产/Rug Pull 等）',
  `core_reason` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '核心原因（富文本）',
  `core_reason_en` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '核心原因（富文本，英文）',
  `current_status` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '当前状态（富文本）',
  `current_status_en` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '当前状态（富文本，英文）',
  `associated_pro_tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联标签（项目）',
  `time_line` json DEFAULT NULL COMMENT '时间线（时间、事件内容（中英）、链接、关联项目/机构/人物/代币）',
  `associated_org_tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联标签（机构）',
  `associated_per_tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联标签（人物）',
  `associated_coins` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联代币',
  `status` enum('1','0') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '显示状态:1=显示,0=隐藏',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间（后台自动生成）',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间（后台自动生成）',
  PRIMARY KEY (`event_id`),
  KEY `idx_event_name_cn` (`event_name_cn`),
  KEY `idx_key_time` (`key_time`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全事件/攻击/崩盘等时间线表';

CREATE TABLE `sys_events_timeline_types` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '标签唯一id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '中文标签',
  `name_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '英文标签',
  `remark` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '备注',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sys_events_timeline_natures` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '标签唯一id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '中文标签',
  `name_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '英文标签',
  `remark` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '备注',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
