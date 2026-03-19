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
      blockingWord: { $description: "屏蔽词" },
      r18Whitelist: { $description: "R18模式白名单群聊ID" },
      mixWhitelist: { $description: "混合模式白名单群聊ID" },
      deleteCache: { $description: "是否在发送后自动删除缓存图片（缓存图片仅用作留存，不复用）" },
      deleteCacheDelay: { $description: "发送后延迟多少秒删除缓存图片" },
      commands: {
        "p-setu": {
          description: "获取一张涩图，支持多个标签（空格分隔）",
          messages: {
            "account-notExists": "君现在还没有p点，请先签到哦",
            "no-enough-p1": "那个......",
            "no-enough-p2": "君的p点不够力...先签到再来吧qwq",
            "please-wait": "稍等哦...上一个图片还没处理完",
            "blocked-tag": "不可以看包含 {0} 的涩图！",
            "r18-disabled": "当前群聊未开启R18权限，请联系管理员添加白名单。",
            "no-img-for-tag": "没有你要的标签 [{0}] 呢，可能是xp太怪了吧...",
            "img-not-valid": "哎呀，找不到这张图了...P点已自动退回~", 
            "ai-filter-blocked": "哎呀，带这些标签都是AI图呢...P点已自动退回~", 
            "ai-only-blocked": "你就这么喜欢AI作品嘛！找不到的说...P点已自动退回~", 
            "pay-price": "已扣除{0}p点！现在君还有{1}p点！",
            "img-info": "作品名：{title}\n标签：{tags}\n作者：{author}\nUID：{uid}\nr18：{r18}\nPID：{pid}\nAI作品：{isAI}\n",
            "img-info-no-tags": "作品名：{title}\n作者：{author}\nUID：{uid}\nr18：{r18}\nPID：{pid}\nAI作品：{isAI}\n",
            "send-error": "发送图片时出现了问题，请稍后再试。"
          },
          options: { 
            r18: "请求R18涩图", 
            exai: "排除AI作品 (excludeAI=true)", 
            ai: "搜索AI作品 (excludeAI=false)",
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
var import_sharp = __toESM(require("sharp"));
var import_fs = require("fs");
var import_path = require("path");
var import_url = require("url");

var usage = `
- **指令：p-setu [tag...]**

    别名：涩图，色图

    支持多个标签，请使用空格分隔。例如：\`涩图 猫耳 女仆\`
    
    参数：
    
    -e, --exai   排除AI作品 (excludeAI=true)
    
    -a, --ai     搜索AI作品 (excludeAI=false)
    
    -u, --uid    指定画师UID
    
    -r           请求R18涩图 (需要群聊在白名单内)

    *不加 -e 或 -a 时，默认同时搜索AI和非AI作品*

- **指令：p-return [target]**

    别名：退款

    给上一个或指定的用户退款（例如图没发出来）需要管理员权限`;
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
  outputLogs: import_koishi.Schema.boolean().default(true),
  r18Whitelist: import_koishi.Schema.array(import_koishi.Schema.string()).default([]).description("R18模式白名单群聊ID"),
  mixWhitelist: import_koishi.Schema.array(import_koishi.Schema.string()).default([]).description("混合模式白名单群聊ID"),
  deleteCache: import_koishi.Schema.boolean().default(true).description("是否在发送后自动删除缓存图片"),
  deleteCacheDelay: import_koishi.Schema.number().default(60).description("发送后延迟多少秒删除缓存图片")
}).i18n({
  "zh-CN": require_zh_CN()
});

async function isValidImageUrl(ctx, url) {
  try {
    if (typeof fetch === "function") {
      const response = await fetch(url, { method: "HEAD" });
      if (response && typeof response.ok === "boolean")
        return response.ok;
    }
    await ctx.http.get(url, { responseType: "arraybuffer", headers: { Range: "bytes=0-0" } });
    return true;
  } catch (error) {
    return false;
  }
}
__name(isValidImageUrl, "isValidImageUrl");

async function apply(ctx, cfg) {
  ctx.model.extend("p_system", {
    id: "unsigned",
    userid: "string",
    p: "integer"
  }, { autoInc: true });
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

  const tempDir = import_path.join(__dirname, 'temp');
  if (!import_fs.existsSync(tempDir)) {
      try {
        import_fs.mkdirSync(tempDir, { recursive: true });
      } catch (e) {
        logger.warn('无法创建缓存目录，请检查文件夹权限');
      }
  }

  ctx.command("p/p-setu [...tags]")
    .alias("涩图", "色图")
    .option("r18", "-r")
    .alias("setu")
    .option("exai", "-e") 
    .option("ai", "-a")   
    .option("uid", "-u <uid:string>")
    .action(async ({ session, options }, ...tags) => {
    const USERID = session.userId;
    const CHANNELID = session.channelId;
    
    // 优化点：合并数据库查询，减少冗余
    const usersdata = await ctx.database.get("p_system", { userid: USERID });
    if (usersdata.length === 0) return session.text(".account-notExists");

    const saving = usersdata[0].p;
    if (saving < cfg.price) {
      await session.sendQueued((0, import_koishi.h)("at", { id: USERID }) + session.text(".no-enough-p1"));
      await session.sendQueued(session.text(".no-enough-p2"));
      return null;
    }

    let targetInfo = await ctx.database.get("p_setu", { channelid: CHANNELID });
    if (targetInfo.length === 0) {
      await ctx.database.create("p_setu", { channelid: CHANNELID, stage: "over", r18: 0 });
      if (cfg.outputLogs) logger.success(CHANNELID + "初始化完成");
      targetInfo = [{ channelid: CHANNELID, stage: "over", r18: 0 }];
    }

    let channelSetu = targetInfo[0];

    if (channelSetu.stage === "ing") {
      await session.send(String((0, import_koishi.h)("at", { id: USERID })) + session.text(".please-wait"));
      await ctx.sleep(6e4);
      await ctx.database.set("p_setu", { channelid: CHANNELID }, { stage: "over" });
      return null;
    }

    if (tags.length > 0) {
      const blocked = tags.find(t => cfg.blockingWord.includes(t));
      if (blocked) return session.text(".blocked-tag", [blocked]);
    }

    // === 白名单模式判断 ===
    let r18_config = 0;
    if (cfg.r18Whitelist.includes(CHANNELID)) {
        r18_config = 1;
    } else if (cfg.mixWhitelist.includes(CHANNELID)) {
        r18_config = 2;
    }

    if (options.r18) {
        if (r18_config === 0) {
            return session.text(".r18-disabled");
        }
        r18_config = 1; 
    }

    let url = "https://api.lolicon.app/setu/v2?size=regular&num=5&r18=" + r18_config;

    if (options.exai) {
        url += "&excludeAI=true";
    } else if (options.ai) {
        url += "&excludeAI=false";
    }
    
    if (tags.length > 0) {
      const tagQuery = tags.map(t => `tag=${encodeURIComponent(t)}`).join('&');
      url += `&${tagQuery}`;
    }

    if (options.uid) {
      url += `&uid=${encodeURIComponent(options.uid)}`;
    }

    if (cfg.outputLogs) logger.info(url);

    const JSON_RES = await ctx.http.get(url, { responseType: "json" });

    if (!JSON_RES.data || JSON_RES.data.length === 0) {
      await session.send(session.text(".no-img-for-tag", [tags.join(' & ')]));
    } else {
      let validImages = JSON_RES.data.filter(img => {
          const aiType = img.aiType || 0;
          if (options.exai && aiType > 0) return false;
          if (options.ai && aiType === 0) return false;
          return true;
      });

      if (validImages.length === 0) {
          if (options.exai) {
              if (cfg.outputLogs) logger.info("API 返回了 AI 图片，已被客户端拦截。");
              return session.text(".ai-filter-blocked");
          }
          if (options.ai) {
              if (cfg.outputLogs) logger.info("API 返回了非 AI 图片（用户仅请求AI），已被客户端拦截。");
              return session.text(".ai-only-blocked");
          }
          await session.send(session.text(".no-img-for-tag", [tags.join(' & ')]));
          return null;
      }

      const selectedImage = validImages[Math.floor(Math.random() * validImages.length)];

      const imageUrl = selectedImage.urls.regular;
      const isValid = await isValidImageUrl(ctx, imageUrl);
      await ctx.database.set("p_setu", { channelid: CHANNELID }, { src: USERID });

      const isAI = selectedImage.aiType > 0 ? "是" : "否";
      
      const infoParams = {
        title: selectedImage.title,
        tags: selectedImage.tags ? selectedImage.tags.join(', ') : '',
        author: selectedImage.author,
        uid: selectedImage.uid,
        r18: selectedImage.r18,
        pid: selectedImage.pid,
        isAI: isAI
      };

      let info = cfg.enableTags 
        ? session.text(".img-info", infoParams) 
        : session.text(".img-info-no-tags", infoParams);
      
      await session.send(info);

      if (isValid) {
        if (cfg.outputLogs) logger.success("图片已成功获取");
      } else {
        if (cfg.outputLogs) logger.info("图片链接无效");
        return session.text(".img-not-valid"); 
      }

      await ctx.database.set("p_setu", { channelid: CHANNELID }, { stage: "ing" });
      const rest = saving - cfg.price;
      await ctx.database.set("p_system", { userid: USERID }, { p: rest });

      try {
        const imageBuffer = await ctx.http.get(imageUrl, { responseType: "arraybuffer" });
        
        const getRandomColorValue = __name(() => Math.floor(Math.random() * 256), "getRandomColorValue");
        
        const imageWithBorder = await (0, import_sharp.default)(imageBuffer).extend({
          top: 1, bottom: 1, left: 1, right: 1,
          background: { r: getRandomColorValue(), g: getRandomColorValue(), b: getRandomColorValue(), alpha: 1 }
        }).png().toBuffer();

        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
        const filePath = import_path.join(tempDir, fileName);
        
        await import_fs.promises.writeFile(filePath, imageWithBorder);

        const fileUri = import_url.pathToFileURL(filePath).href;

        await session.sendQueued([
          (0, import_koishi.h)("at", { id: USERID }), 
          session.text(".pay-price", [cfg.price, rest]), 
          (0, import_koishi.h)("img", { src: fileUri })
        ].join(""));

        if (cfg.outputLogs) logger.success("图片发送成功");
        
        if (cfg.deleteCache) {
            ctx.setTimeout(() => {
              import_fs.unlink(filePath, (err) => {
                if (err) {
                  if(cfg.outputLogs) logger.warn(`删除临时文件失败: ${fileName}, 错误: ${err}`);
                }
              });
            }, cfg.deleteCacheDelay * 1000); 
        }

      } catch (err) {
        logger.error(`处理或发送图片时出错: ${err}`);
        await session.send(session.text(".send-error"));
      } finally {
        await ctx.database.set("p_setu", { channelid: CHANNELID }, { stage: "over" });
      }
    }
  });

  ctx.command("p/p-return [target]").alias("退款", "姐姐，图没啦！").action(async ({ session }, target) => {
    const USERID = session.userId;
    const CHANNELID = session.channelId;
    let targetid = (await ctx.database.get("p_setu", { channelid: CHANNELID }))[0]?.src;
    
    if (target != null) {
      const ats = session.elements.filter((element) => element.type == "at");
      const match = /\b([1-9]\d{6,})\b/.exec(String(target));
      if (ats.length) {
        targetid = String(ats.map((element) => element.attrs.id));
      } else if (match) {
        targetid = match[1];
      } else {
        return session.text(".no-id");
      }
    }

    if (cfg.outputLogs) logger.success(targetid + "申请退款");
    const targetdata = await ctx.database.get("p_system", { userid: targetid });

    if (cfg.adminUsers.includes(USERID)) {
      await ctx.database.set("p_system", { userid: targetid }, { p: (targetdata[0]?.p || 0) + cfg.price });
      if (cfg.outputLogs) logger.success(targetid + "退款成功");
      return session.text(".return-p", [cfg.price, targetid, (targetdata[0]?.p || 0) + cfg.price]);
    } else {
      const usersdata = await ctx.database.get("p_system", { userid: USERID });
      if (cfg.outputLogs) logger.success(targetid + "退款惩罚");
      if (usersdata[0]?.p >= cfg.punishment) {
        await ctx.database.set("p_system", { userid: USERID }, { p: usersdata[0]?.p - cfg.punishment });
        return session.text(".punishment1", [USERID, cfg.punishment]);
      } else {
        await ctx.database.set("p_system", { userid: USERID }, { p: 0 });
        return session.text(".punishment2", [USERID]);
      }
    }
  });
}
__name(apply, "apply");

0 && (module.exports = { Config, apply, inject, name, usage });
