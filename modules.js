module.exports = class FunTextModules {
    static async _init(main) {
    }

    static N({ctx, text, ...data}) {
        return text;
    }

    static CS({ctx, text, ...data}) {
        ctx.font = `${data.fontSize}px "Comic Sans MS"`;
        return text;
    }

    static C({ctx, text, ...data}) {
        if (text.split(':').length < 2) { this.N({ctx,text, ...data}); return; }
        const [color, ...rest] = text.split(':');
        text = rest.join(':');
        ctx.fillStyle = `${color}`;
        return text;
    }
}