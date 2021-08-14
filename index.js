const { Plugin } = require("powercord/entities");
const { channels, getModule } = require('powercord/webpack');

module.exports = class FunText extends Plugin {
    async startPlugin() {
        const { upload } = await getModule([ 'upload', 'cancel' ]);

        await (new FontFace('Whitney', 'url(https://discord.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff)')).load();

        powercord.api.commands.registerCommand({
            command: "funtext",
            aliases: ["ft"],
            description: "",
            usage: "",
            executor: async (_) => {
                await this.send(upload,
                    await this.getCanvasBlob(
                        await this.genImage()
                    )
                );
            }
        });
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand("funtext");
    }
    
    async genImage() {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 100;
        const ctx = canvas.getContext("2d");

        ctx.fillText("test",10,10);

        return canvas
    }

    getCanvasBlob(canvas) { return new Promise((resolve, reject) => {canvas.toBlob(resolve)}); }
    async send(upload, buf) { upload(channels.getChannelId(), new File([await buf.arrayBuffer()], '_.png')); }
};