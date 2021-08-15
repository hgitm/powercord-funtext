const { Plugin } = require("powercord/entities");
const { channels, getModule } = require('powercord/webpack');
const FunTextModules = require('./modules');

module.exports = class FunText extends Plugin {
    async startPlugin() {
        const { upload } = await getModule([ 'upload', 'cancel' ]);
        this.upload = upload;
        this.rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

        await FunTextModules._init(this);

        powercord.api.commands.registerCommand({
            command: `t_Scalar`,
            aliases: [],
            description: "",
            usage: "",
            executor: async (args) => {
                if (args.length === 0) return {send: false, result: `Scalar is set to ${this.scalar}.`};
                if (Number.isNaN(parseInt(args[0]))) return {send: false, result: `Scalar must be an integer.`};

                this.scalar = parseInt(args[0]);
                return {send: false, result: `Set scalar to ${args[0]}.`};
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
        canvas.height = Math.floor(1.2 * this.rem) * this.scalar;
        canvas.width = 400 * this.scalar;
        const ctx = canvas.getContext("2d");
        const unit = this.scalar * this.rem;

        func(canvas,ctx,unit,0.8*unit,text);

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
};