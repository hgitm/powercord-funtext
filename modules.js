module.exports = class FunTextModules {
    static async _init(main) {
        await main.loadFont("Whitney","https://discord.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff")
    }

    static N(canvas, ctx, fontSize, spaceDown, text) {
        ctx.font = `${fontSize}px Whitney`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text,0,spaceDown);
    }

    static CS(canvas, ctx, fontSize, spaceDown, text) {
        ctx.font = `${fontSize}px "Comic Sans MS"`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text,0,spaceDown);
    }
}