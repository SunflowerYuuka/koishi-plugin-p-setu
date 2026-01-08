var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/locales/zh-CN.yml
var require_zh_CN = __commonJS({
  "src/locales/zh-CN.yml"(exports, module2) {
    module2.exports = {
      adminUsers: { $description: "管理员用户" },
      outputLogs: { $description: "是否将用户的签到操作打印在日志里" },
      price: { $description: "一张涩图的价格" },
      punishment: { $description: "冒充管理员的惩罚" },
      blockingWword: { $description: "屏蔽词" },
      commands: {
        "p-setu": {
          description: "获取一张涩图，可以指定多个tag或作者UID",
          messages: {
            "account-notExists": "君现在还没有p点，请先签到哦",
            "no-enough-p1": "那个......",
            "no-enough-p2": "君的p点不够力...先签到再来吧qwq",
            "please-wait": "稍等哦...上一个图片还没处理完",
            "blocked-tag": "不可以看{0}的涩图！",
            "r18-warning": "听不懂你在说什么呢，一定是冲多了吧",
            "r18-on": "就这么喜欢涩涩？真是无药可救的杂鱼",
            "r18-off": "终于知道收敛一点了？",
            "r18-mix": "知道了知道了，真没办法",
            "r18-error": "哎呀，出现了奇怪的错误",
            "r18-no-assignment": "杂鱼，你不配命令我哦",
            "no-img-for-tag": "没有你要的{0}呢，可能是xp太怪了吧...",
            "img-not-valid": "哎呀，找不到这张图了...",
            "pay-price": "已扣除{0}p点！现在君还有{1}p点！"
          },
          options: {
            r18: "t开启，f关闭，m混合",
            exai: "排除AI作品",
            uid: "指定作者UID"
          }
        },
        "p-return": {
          description: "退款",
          usage: "使用方法：“退款 @对方”，在旧版QQ需要将@元素改为qq号,需要配置管理员",
          messages: {
            "no-id": "退款失败，请尝试将@元素改为qq号！",
            "return-p": "已退款{0}p点！现在<at id={1}/>还有{2}p点！",
            punishment1: "<at id={0}/>冒充恋恋，扣你{1}p点！",
            punishment2: "<at id={0}/>冒充恋恋，扣光你p点！"
          }
        }
      }
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var import_jsonpath_plus = require("jsonpath-plus");
var import_sharp = __toESM(require("sharp"));
var usage = `
- **指令：p-setu [tag...]**

    别名：涩图，色图
    
    参数说明：
    -u [uid] : 指定作者UID
    -e (或 --exai) : 本次搜索排除AI作品 (默认允许)
    
    示例：
    1. 涩图 白丝 (搜索白丝，包含AI)
    2. 涩图 -e 白丝 (搜索白丝，排除AI)
    3. 涩图 -u 12345 (搜索特定作者，包含AI)
    4. 涩图 -e -u 12345 白丝 (搜索特定作者+标签，排除AI)

- **指令：p-return [target]**

    别名：退款

    给上一个或指定的用户退款（例如图没发出来）需要管理员权限

- **为什么需要puppeteer:**

    原装的涩图总是被tx吞，经过一次渲染后加了1px的彩色边框，妈妈再也不怕我的图发不出来啦`;
var name = "setu";
var inject = {
  required: ["database", "puppeteer"],
  optional: []
};
var Config = import_koishi.Schema.object({
  adminUsers: import_koishi.Schema.array(import_koishi.Schema.string()),
  enableTags: import_koishi.Schema.boolean().default(true).description("显示tag"),
  blockingWord: import_koishi.Schema.array(import_koishi.Schema.string()),
  price: import_koishi.Schema.number().default(500),
  punishment: import_koishi.Schema.number().default(250),
  outputLogs: import_koishi.Schema.boolean().default(true)
}).i18n({
  "zh-CN": require_zh_CN()
});
async function isValidImageUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}
__name(isValidImageUrl, "isValidImageUrl");
async function isTargetIdExists(ctx, USERID) {
  const targetInfo = await ctx.database.get("p_system", { userid: USERID });
  return targetInfo.length == 0;
}
__name(isTargetIdExists, "isTargetIdExists");
async function apply(ctx, cfg) {
  ctx.model.extend("p_system", {
    id: "unsigned",
    userid: "string",
    p: "integer"
  }, { autoInc: true });
  // 恢复原始数据库模型，移除 excludeAI 字段
  ctx.model.extend("p_setu", {
    id: "unsigned",
    channelid: "string",
    r18: "integer",
    src: "string",
    stage: "string",
    same_user_time: "integer"
  }, { autoInc: true });
  const logger = ctx.logger("p-setu");
  ctx.i18n.define("zh-CN", require_zh_CN());

  ctx.command("p/p-setu [...tags]")
    .alias("涩图", "色图")
    .option("r18", "-r <mode:string>")
    .option("exai", "-e") // 新增 excludeAI 选项，短参为 -e
    .option("uid", "-u <uid:string>") 
    .action(async ({ session, options }, ...tags) => {
      const USERID = session.userId;
      const CHANNELID = session.channelId;
      const notExists = await isTargetIdExists(ctx, USERID);
      if (notExists)
        return session.text(".account-notExists");
      const usersdata = await ctx.database.get("p_system", { userid: USERID });
      const saving = usersdata[0].p;
      if (saving < cfg.price) {
        await session.sendQueued((0, import_koishi.h)("at", { id: USERID }) + session.text(".no-enough-p1"));
        await session.sendQueued(session.text(".no-enough-p2"));
        return null;
      }
      ;
      const targetInfo = await ctx.database.get("p_setu", { channelid: CHANNELID });
      // 初始化
      if (targetInfo.length == 0) {
        await ctx.database.create("p_setu", { channelid: CHANNELID, stage: "over", r18: 0 });
        if (cfg.outputLogs)
          logger.success(CHANNELID + "初始化完成");
      }
      if ((await ctx.database.get("p_setu", { channelid: CHANNELID }))[0]?.stage == "ing") {
        await session.send(String((0, import_koishi.h)("at", { id: USERID })) + session.text(".please-wait"));
        await ctx.sleep(6e4);
        await ctx.database.set("p_setu", { channelid: CHANNELID }, { stage: "over" });
        return null;
      }

      // 获取当前配置 (R18状态)
      const currentConfig = (await ctx.database.get("p_setu", { channelid: CHANNELID }))[0];
      const r18_config = currentConfig?.r18;

      // 检查屏蔽词
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          if (cfg.blockingWord.includes(tag))
            return session.text(".blocked-tag", [tag]);
        }
      }

      // 处理 R18 开关设置 (保持原逻辑，管理员可修改)
      if (options.r18) {
        if (cfg.adminUsers.includes(USERID)) {
          if (options.r18 == "f")
            await ctx.database.set("p_setu", { channelid: CHANNELID }, { r18: 0 });
          else if (options.r18 == "t")
            await ctx.database.set("p_setu", { channelid: CHANNELID }, { r18: 1 });
          else if (options.r18 == "m")
            await ctx.database.set("p_setu", { channelid: CHANNELID }, { r18: 2 });
          else
            return session.text(".r18-wraning");
          if ((await ctx.database.get("p_setu", { channelid: CHANNELID }))[0]?.r18 == 0)
            return session.text(".r18-off");
          else if ((await ctx.database.get("p_setu", { channelid: CHANNELID }))[0]?.r18 == 1)
            return session.text(".r18-on");
          else if ((await ctx.database.get("p_setu", { channelid: CHANNELID }))[0]?.r18 == 2)
            return session.text(".r18-mix");
          else
            return session.text(".r18-error");
        } else
          return session.text(".r18-no-assignment");
      }

      // 核心逻辑修改：AI排除判断
      // 如果 options.exai 存在，则 excludeAI=true，否则为 false (默认允许)
      const isExcludeAI = !!options.exai;

      // 构建 URL
      let url = "https://api.lolicon.app/setu/v2?size=regular&r18=" + r18_config + "&excludeAI=" + isExcludeAI;

      // 处理多标签
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          url = url + "&tag=" + String(tag);
        }
      }

      // 处理指定 UID
      if (options.uid) {
        url = url + "&uid=" + options.uid;
      }

      if (cfg.outputLogs)
        logger.info(url);
      
      const JSON = await ctx.http.get(url, { responseType: "json" });
      const data = (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0", json: JSON });
      if (data.length === 0) {
          let msg = "";
          if(options.uid) msg += `UID:${options.uid} `;
          if(isExcludeAI) msg += `(已排除AI) `;
          if(tags.length > 0) msg += `Tags:[${tags.join(",")}]`;
          await session.send(session.text(".no-img-for-tag", [msg]));
      } else {
        const imageUrl = await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.urls.regular", json: JSON });
        const isValid = await isValidImageUrl(imageUrl);
        await ctx.database.set("p_setu", { channelid: CHANNELID }, { src: USERID });
        let info = `作品名：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.title", json: JSON })}
`;
        if (cfg.enableTags)
          info += `标签：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.tags", json: JSON })}
`;
        info += `作者：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.author", json: JSON })}
`;
        info += `UID：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.uid", json: JSON })}
`;
        info += `r18：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.r18", json: JSON })}
`;
        info += `AI：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.aiType", json: JSON }) > 0 ? "是" : "否"}
`;
        info += `PID：${await (0, import_jsonpath_plus.JSONPath)({ path: "$.data.0.pid", json: JSON })}
`;
        await session.send(info);
        if (isValid) {
          if (cfg.outputLogs)
            logger.success("图片已成功获取");
        } else {
          if (cfg.outputLogs)
            logger.info("图片链接无效");
          return session.text(".img-not-valid");
        }
        await ctx.database.set("p_setu", { channelid: CHANNELID }, { stage: "ing" });
        const rest = usersdata[0]?.p - cfg.price;
        await ctx.database.set("p_system", { userid: USERID }, { p: rest });
        const imageBuffer = await ctx.http.get(imageUrl, { responseType: "arraybuffer" });
        const getRandomColorValue = /* @__PURE__ */ __name(() => Math.floor(Math.random() * 256), "getRandomColorValue");
        const imageWithBorder = await (0, import_sharp.default)(imageBuffer).extend({
          top: 1,
          bottom: 1,
          left: 1,
          right: 1,
          background: {
            r: getRandomColorValue(),
            g: getRandomColorValue(),
            b: getRandomColorValue(),
            alpha: 1
          }
        }).toBuffer();
        const imageBase64 = imageWithBorder.toString("base64");
        const image = `data:image/png;base64,${imageBase64}`;
        await session.sendQueued([(0, import_koishi.h)("at", { id: USERID }), session.text(".pay-price", [cfg.price, rest]), (0, import_koishi.h)("img", { src: image })].join(""));
        if (cfg.outputLogs)
          logger.success("图片发送成功");
        await ctx.database.set("p_setu", { channelid: CHANNELID }, { stage: "over" });
      }
    });
  ctx.command("p/p-return [target]").alias("退款", "姐姐，图没啦！").action(async ({ session }, target) => {
    {
      const USERID = session.userId;
      const CHANNELID = session.channelId;
      let targetid = (await ctx.database.get("p_setu", { channelid: CHANNELID }))[0]?.src;
      if (target != null) {
        let text = session.elements.filter((element) => element.type == "at");
        let regex = /\b([1-9]\d{6,})\b/;
        let match = regex.exec(String(target));
        if (!(text.length === 0) || !match) {
          if (!match)
            return session.text(".no-id");
          targetid = String(text.map((element) => element.attrs.id));
        }
      }
      if (cfg.outputLogs)
        logger.success(targetid + "申请退款");
      const targetdata = await ctx.database.get("p_system", { userid: targetid });
      if (cfg.adminUsers.includes(USERID)) {
        await ctx.database.set("p_system", { userid: targetid }, { p: targetdata[0]?.p + cfg.price });
        if (cfg.outputLogs)
          logger.success(targetid + "退款成功");
        return session.text(".return-p", [cfg.price, targetid, targetdata[0]?.p + cfg.price]);
      } else {
        const usersdata = await ctx.database.get("p_system", { userid: USERID });
        if (cfg.outputLogs)
          logger.success(targetid + "退款惩罚");
        if (usersdata[0]?.p >= cfg.punishment) {
          await ctx.database.set("p_system", { userid: USERID }, { p: usersdata[0]?.p - cfg.punishment });
          return session.text(".punishment1", [USERID, cfg.punishment]);
        } else {
          await ctx.database.set("p_system", { userid: USERID }, { p: 0 });
          return session.text(".punishment2", [USERID]);
        }
      }
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name,
  usage
});
