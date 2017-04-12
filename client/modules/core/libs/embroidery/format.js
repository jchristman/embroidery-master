class Format {
    magic_header = '#UNK';
    colors = [];

    static Block = class {
        color = 0;
        stitches = [];

        get stitch_count() {
            return this.stitches.length;
        }
    }

    static Point = class {
        x = 0;
        y = 0;

        constructor(x, y, is_jump_stitch) {
            this.x = x;
            this.y = y;
            this.is_jump_stitch = is_jump_stitch;
        }
    }

    constructor(raw_file, name) {
        this.name = name === undefined ? 'Project Name' : name;
        if (this.name.endsWith('.pes'))
            this.name = this.name.substr(0, this.name.length - 4);
        this.contents = raw_file;
        this.blocks = [];
    }

    check() {
        return this.contents.startsWith(this.magic_header);
    }
}

export default Format;
