# koishi-plugin-p-setu

[![npm](https://img.shields.io/npm/v/koishi-plugin-p-setu?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-p-setu) [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://choosealicense.com/licenses/mit/) ![Language](https://img.shields.io/badge/language-TypeScript-brightgreen) ![Static Badge](https://img.shields.io/badge/QQ交流群-2167028216-green)

东方风图片获取插件，集成智能防屏蔽与P点经济系统，建议配合 [p-qiandao](https://github.com/username/p-qiandao) 使用

---

## 功能特性

- **智能防屏蔽**：通过添加随机彩色边框规避平台审查
- **多功能搜索**：支持**多标签组合**搜索、指定**画师UID**搜索
- **AI作品控制**：支持**排除AI**、**仅搜索AI**或**混合模式**，内置客户端二次拦截检测与自动退款机制
- **R18分级控制**：支持纯净模式/混合模式/全年龄模式
- **经济系统**：消耗P点获取图片，支持管理员退款
- **安全审计**：自动拦截敏感关键词请求

---

## 安装指南

```bash
# 通过 npm 安装
npm install koishi-plugin-p-setu

```

```yaml
# koishi.yml 配置示例
plugins:
  p-setu:
    adminUsers:
      - '123456789'        # 管理员用户ID
    price: 500             # 单次请求消耗P点
    punishment: 250        # 违规退款惩罚值
    blockingWord:          # 屏蔽关键词列表
      - '血腥'
      - '暴力'
    enableTags: true       # 显示作品标签及AI状态

```

---

## 指令说明

### 获取图片 `p-setu`

* **别名**：涩图、色图
* **参数**：
* `[tag...]`：Pixiv标签，支持多个标签组合（使用空格分隔）


* **选项**：
* `-r <mode:string>`：R18模式（f=关闭/t=开启/m=混合）
* `-e` / `--exai`：**排除AI作品** (excludeAI=true)
* `-a` / `--ai`：**搜索AI作品** (excludeAI=false)
* `-u <uid:string>` / `--uid <uid:string>`：指定画师UID
* *(注：若不加 -e 或 -a，则默认混合搜索)*


* **示例**：
```bash
# 基础多标签搜索 (混合AI与非AI)
涩图 白丝 猫耳
> [系统] 作品名：猫耳メイド
> 标签：白丝、猫耳、女仆
> AI作品：否
> ...

```


```bash
# 排除AI作品（开启二次拦截保护）
涩图 -e 碧蓝档案
> [系统] (搜索碧蓝档案标签，且强制排除AI生成的图片)

```


```bash
# 仅搜索AI作品
涩图 -a 
> [系统] (仅搜索AI生成的图片)

```


```bash
# 指定画师UID（可配合标签和排除AI）
涩图 -u 123456 -e
> [系统] 作品名：xxxx (来自画师UID:123456，非AI)

```



### 退款操作 `p-return`

* **别名**：退款、姐姐，图没啦！
* **参数**：
* `[target]`：@用户 或 QQ号（默认最近请求者）


* **权限**：
* 管理员：全额退还P点
* 普通用户：扣除 250P点（余额不足则清零）


* **示例**：
```bash
退款 @魔理沙
> [系统] 已退还500P点给魔理沙
> 当前余额：魔理沙 5200P | 灵梦 4500P

```


```bash
退款
> [系统] 违规操作！扣除250P点
> 灵梦 当前余额：4250P

```



---

## 核心机制

### 搜索与过滤逻辑

1. **多标签逻辑**：使用 `Lolicon API V2`，多标签为“与”逻辑（即结果需包含所有指定标签）。
2. **AI作品拦截与自动退款**：
* **默认情况**：未指定参数时，混合搜索AI和非AI作品。
* **排除模式 (`-e`)**：请求 API 时添加排除参数。若 API 依然返回了 AI 图，插件会进行**二次拦截**，提示“带这些标签都是AI图”，并**自动退回P点**（不扣费）。
* **仅AI模式 (`-a`)**：请求 API 时添加允许参数。若 API 返回了非 AI 图（人手画的），插件会进行**二次拦截**，提示“你就这么喜欢AI作品嘛”，并**自动退回P点**（不扣费）。



### 防屏蔽系统

1. 使用 `sharp` 库为图片添加 1px 随机彩色边框
2. 通过 `puppeteer` 渲染实现像素级扰动
3. 动态调整边框颜色避免重复特征

```ts
// 随机颜色生成逻辑
const getRandomColorValue = () => Math.floor(Math.random() * 256)
const borderColor = {
  r: getRandomColorValue(),
  g: getRandomColorValue(),
  b: getRandomColorValue()
}

```

### R18分级控制

| 模式 | 值 | 说明 |
| --- | --- | --- |
| 全年龄 | 0 | 仅返回安全内容 |
| 混合模式 | 2 | 随机返回安全/R18内容 |
| R18模式 | 1 | 仅返回R18内容 |

---

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `price` | number | 500 | 单次请求消耗P点 |
| `punishment` | number | 250 | 非管理员退款惩罚值 |
| `blockingWord` | string[] | [] | 屏蔽标签黑名单 |
| `enableTags` | boolean | true | 显示作品标签及AI信息 |

---

## 注意事项

1. **敏感内容管理**：
* 请勿在非R18频道开启混合/R18模式
* 屏蔽词列表需定期更新维护


2. **API说明**：
* 本插件使用 Lolicon API V2，部分冷门标签组合可能无法搜到符合要求（如排除AI）的图，此时会触发客户端拦截提示。


3. **经济平衡**：
* 推荐 `price` 值为签到日均收益的 30-50%
* 惩罚值应大于基础收益防止滥用



---

## 问题反馈

如有问题请提交 Issue 至 [GitHub仓库](https://github.com/gfjdh/koishi-plugin-p-setu)

---

> "就算是涩图也要保持优雅呢~" —— 十六夜咲夜

```

```
