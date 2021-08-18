const VERSION = '1.0.0';

const { Plugin } = require("powercord/entities");
const { channels, getModule } = require('powercord/webpack');
const FunTextModules = require('./modules');

module.exports = class FunText extends Plugin {
    async startPlugin() {
        const { upload } = await getModule([ 'upload', 'cancel' ]);
        this.upload = upload;
        this.rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        await this.loadFont("Whitney","https://discord.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff")

        await FunTextModules._init(this);

        powercord.api.commands.registerCommand({
            command: `t_Scalar`,
            aliases: [],
            description: "",
            usage: "",
            executor: async (args) => {
                if (args.length === 0) return {send: false, result: `Scalar is set to ${this.scalar}.`};
                if (Number.isNaN(parseFloat(args[0]))) return {send: false, result: `Scalar must be an integer.`};

                this.scalar = parseFloat(args[0]);
                return {send: false, result: `Set scalar to ${args[0]}.`};
            }
        });

        powercord.api.commands.registerCommand({
            command: `t_Version`,
            aliases: [],
            description: "",
            usage: "",
            executor: async (args) => {
                return {send: false, result: `Version ${VERSION}`};
            }
        });

        const funcs = Object.getOwnPropertyNames(FunTextModules).filter(prop => typeof FunTextModules[prop] === "function");
        for (const func of funcs) {
            if (func.startsWith("_")) continue;

            powercord.api.commands.registerCommand({
                command: `t${func}`,
                aliases: [],
                description: "",
                usage: "",
                executor: async (args) => { await this.sendImage(FunTextModules[func],args); }
            });
        }
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand("funtext");
    }
    
    upload = _=>null;
    rem = 16;

    get scalar() {
        return this.settings.get("scalar", 1)
    }

    set scalar(value) {
        return this.settings.set("scalar", value)
    }

    async genImage(func, text) {
        const canvas = document.createElement("canvas");
        canvas.height = Math.floor(1.2 * this.rem * this.scalar);

        const lines = this.genLines(text);
        canvas.height += canvas.height * 1.9 * (lines.length-1);

        canvas.width = 400 * this.scalar;
        const ctx = canvas.getContext("2d");
        const unit = this.scalar * this.rem;

        ctx.font = `${unit}px Whitney`;
        ctx.fillStyle = "#ffffff";

        const data = {main: this,canvas,ctx,fontSize: unit,spaceDown: 0.8*unit,text};
        const result = func(data);
        const resultLines = this.genLines(result);
        if (typeof result === "string") {
            this.canvasFillText(data, resultLines);
        }

        return canvas;
    }

    getCanvasBlob(canvas) { return new Promise((resolve, reject) => {canvas.toBlob(resolve)}); }
    async send(buf) { this.upload(channels.getChannelId(), new File([await buf.arrayBuffer()], '_.png')); }
    async sendImage(func, args) { 
        await this.send(
            await this.getCanvasBlob(
                await this.genImage(func, args.join(' '))
            )
        ); 
    }
    async loadFont(fontName,fontUrl) {
        await (new FontFace(fontName, `url(${fontUrl})`)).load();
    }
    canvasFillText({ctx, spaceDown}, lines) {
        lines.map((line,i) => {
            ctx.fillText(line,0,spaceDown+spaceDown*1.9*i);
        });
    }
    genLines(text) {
        let finalArray = [];
        let index = 0;
        for (let i = 0;;i++) {
            if (this.getTextWidth( text.slice(0,i), `${this.rem}px Whitney` ) > 350) {
                finalArray[index] = text.slice(0,i);
                index++;
                text = text.slice(i);
            }
            if (i >= text.length) break;
        }
        if (finalArray.length === 0) finalArray.push(text);
        return finalArray;
    }
    getTextWidth(text, font) {
        // re-use canvas object for better performance
        var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        let context = canvas.getContext("2d");
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
    }
};