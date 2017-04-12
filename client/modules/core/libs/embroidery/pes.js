import _ from 'lodash';

import Format from './format.js';
import struct from '../struct.js';
import _colors from './pes-colors.js';
import string2Hex from '../string_to_hex.js';

const hoopHeight = 1800,
      hoopWidth = 1300; 

class PESFile extends Format {
    magic_header = '#PES';
    colors = _colors;
    x = {
        min: 0,
        max: 0
    }
    y = {
        min: 0,
        max: 0
    }

    constructor(raw_file, name) {
        super(raw_file, name);
    }

    parse() {
        let offset = 0;

        const read = (num_bytes) => {
            let data = this.contents.substr(offset, num_bytes);
            offset += num_bytes;
            return data;
        }

        const seek = (_offset) => { offset = _offset; };

        const is_eof = () => offset >= this.contents.length;

        read(4);  // #PES
        read(4);  // PES version

        // Start of PEC
        const pec_start = struct.unpack('<I', read(4));

        // Color table
        seek(pec_start + 48);
        const color_count = struct.unpack('b', read(1)) + 1;
        const colors_list = [];
        for (let i = 0; i < color_count; i++) {
            colors_list.push(struct.unpack('b', read(1)));
        }

        seek(pec_start + 532);
        let section_done = false;
        let color_num = 0,
            x = {
                cur: 0,
            },
            y = {
                cur: 0,
            },
            cur_block = new Format.Block();

        while (!section_done && !is_eof()) {
            let val1 = struct.unpack('b', read(1));
            let val2 = struct.unpack('b', read(1));
            if (val1 === 255 && val2 === 0) {
                cur_block.color = this.colors[colors_list[color_num]];
                this.addBlock(cur_block);
                section_done = true;
            } else if (val1 === 254 && val2 === 176) {
                cur_block.color = this.colors[colors_list[color_num]];
                this.addBlock(cur_block);
                cur_block = new Format.Block();
                color_num++;
                read(1);
            } else {
                let dx = 0,
                    dy = 0,
                    val3 = 0,
                    is_jump_stitch = false;
                
                if ((val1 & 128) === 128) {
                    // Jump stitch
                    dx = ((val1 & 15) * 256) + val2;
                    dx = (dx & 0x800) === 0x800 ? dx - 0x1000 : dx;    // Signed 12 bit arithmetic
                    val2 = struct.unpack('b', read(1));
                    is_jump_stitch = true;
                } else {
                    // Normal stitch
                    dx = val1;
                    dx = dx >= 64 ? dx - 128 : dx;                   // Signed 7 bit arithmetic
                }

                if ((val2 & 128) === 128) {
                    // Jump stitch
                    val3 = struct.unpack('b', read(1));
                    dy = ((val2 & 15) * 256) + val3;
                    dy = (dy & 0x800) === 0x800 ? dy - 0x1000 : dy;    // Signed 12 bit arithmetic
                    is_jump_stitch = true;
                } else {
                    // Normal stitch
                    dy = val2;
                    dy = dy >= 64 ? dy - 128 : dy;                   // Signed 7 bit arithmetic
                }

                x.cur += dx;
                y.cur += dy;
                this.x.max = this.x.max < x.cur ? x.cur : this.x.max;
                this.x.min = this.x.min > x.cur ? x.cur : this.x.min;
                this.y.max = this.y.max < y.cur ? y.cur : this.y.max;
                this.y.min = this.y.min > y.cur ? y.cur : this.y.min;

                cur_block.stitches.push(new Format.Point(x.cur, y.cur, is_jump_stitch));
            }
        }
    }

    addBlock(block) {
        this.blocks.push(block);
    }

    export() {
        /* Format given at https://github.com/treveradams/libpes/blob/master/docs/PES%20File%20Format.odt */
        let output = '';
        let tmp = ''; // This will be prepended to output once pec_start is calculated
        
        tmp += '#PES0001';               // 0000 - 0007 -- version
        //tmp += struct.pack('<I', 0);     // 0008 - 000B -- pecstart -- fulfilled later

        output += struct.pack('<H', 0x10);  // 000C - 000D -- hoop -- 00 00, means 100mm x 100mm hoop, 10 00 means 130mm 180mm hoop
        output += struct.pack('<H', 1);     // 000E - 000F -- 01 00 seems to be fixed and may mean scale to fit (UNVERIFIED).
        output += struct.pack('<H', 1);     // 0010 - 0011 -- # of stitchgroups

        output += struct.pack('<I', 0xFFFF);// 0012 - 0015 -- Section termination

        // CEmbOne Block v1
        output += struct.pack('<H', 0x07);  // 0016 - 0017 -- Length of structure name -- len('CEmbOne') === 7
        output += 'CEmbOne';                // 0018 - 001E -- Structure name -- 'CEmbOne'

        output += struct.pack('<H', this.x.min);    // 001F - 0020 -- This appears to be the minimum x of all stitches in CSewSeg stitch data
        output += struct.pack('<H', this.y.min);    // 0021 - 0022 -- This appears to be the minimum y of all stitches in CSewSeg stitch data
        output += struct.pack('<H', this.x.max);    // 0023 - 0024 -- This appears to be the maximum x of all stitches in CSewSeg stitch data
        output += struct.pack('<H', this.y.max);    // 0025 - 0026 -- This appears to be the maximum y of all stitches in CSewSeg stitch data
        
        // ------------------------------------------------------------------------- //
        // Stitch Group. Offsets here are relative and INTEGERS instead of HEX. WHY? //
        // ------------------------------------------------------------------------- //
        
        // Duplicate of the stitch limits data
        output += struct.pack('<H', this.x.min);    // 0000 - 0001 -- This appears to be the minimum x of all stitches in CSewSeg stitch data
        output += struct.pack('<H', this.y.min);    // 0002 - 0003 -- This appears to be the minimum y of all stitches in CSewSeg stitch data
        output += struct.pack('<H', this.x.max);    // 0004 - 0005 -- This appears to be the maximum x of all stitches in CSewSeg stitch data
        output += struct.pack('<H', this.y.max);    // 0006 - 0007 -- This appears to be the maximum y of all stitches in CSewSeg stitch data

        // Translate math
        //
        // X = (350 + HoopWidth/2 - WidthOfDesign/2)
        //      
        //      350 is the distance from 0,0 that the 130mm x 180mm hoop is stored,
        //      if we add half the HoopWidth (1300 / 2) and subtract half our design's width.
        //      The embroidery will be centered in the hoop.
        // 
        // Y = (100 + HoopHeight/2 - HeightOfDesign/2)
        //      
        //      100 is the distance from 0,0 that our 130mm x 180mm hoop is stored,
        //      if we add half the HoopHeight (1800 / 2) and subtract half our design's height.
        //      The embroidery will be centered in the hoop.

        const off_x = 350 + hoopWidth / 2 - (this.x.max - this.x.min),
              off_y = 100 + hoopHeight / 2 - (this.y.max - this.y.min);

        /* Affine Transform */
        output += struct.pack('<f', 1.0);   // 0008 - 0011 -- Scale X
        output += struct.pack('<f', 0);     // 0012 - 0015 -- Skew X
        output += struct.pack('<f', 0);     // 0016 - 0019 -- Skew Y
        output += struct.pack('<f', 1.0);   // 0020 - 0023 -- Scale Y
        output += struct.pack('<f', off_x); // 0024 - 0027 -- Translate X
        output += struct.pack('<f', off_y); // 0028 - 0031 -- Translate Y

        output += struct.pack('<h', 1);     // 0032 - 0033 -- 01 00, unknown
        output += struct.pack('<h', 0);     // 0034 - 0035 -- 00 00, X Position
        output += struct.pack('<h', 0);     // 0036 - 0037 -- 00 00, Y Position
        output += struct.pack('<h', width); // 0038 - 0039 -- width of design
        output += struct.pack('<h', height);// 0040 - 0041 -- height of design 

        output += struct.pack('<I', 0);     // 0042 - 0045 -- 4 bytes -- 0 unknown
        output += struct.pack('<I', 0);     // 0046 - 0049 -- 4 bytes -- 0 unknown
        
        output += struct.pack('<h', this.blocks.length);    // 0050 - 0051 -- number of segments + (2 * colorChanges), the number of segments we will need to use. I'm leaving this as the number of blocks for now
        output += struct.pack('<I', 0xFFFF);                // 0052 - 0055 -- End of section -- FF FF 00 00


        // -------------------------------------------------- //
        // CSewSeg Block v1 (offsets are HEX from file start) //
        // -------------------------------------------------- //

        output += struct.pack('<h', 0x07);  // 005F - 0061 -- length of structure name -- len('CSewSeg') === 7
        output += 'CSewSeg';                // 0061 - 0067 -- CSewSeg
        
        // 0068 – pecstart -- CSewSeg Stitch Data
        _.each(this.blocks, (block) => {
            output += struct.pack('<h', block.stitches[0].is_jump_stitch ? 1 : 0);  // Color_Change_Indicator -- Is this always 0?
            output += struct.pack('<h', _.findIndex(block.color, this.colors));     // color_index
            output += struct.pack('<h', block.stitches.length);                     // Number of stitches in the block

            _.each(block.stitches, (stitch) => {
                output += struct.pack('b', stitch.x);
                output += struct.pack('b', stitch.y);
                if (stitch.is_jump_stitch) {
                    output += struct.pack('b', stitch.x);
                    output += struct.pack('b', stitch.y);
                }
            });

            output += struct.pack('h', 0x0380);     // Block change
            // TODO: Some other stuff goes here?
        });

        // -------------------------- //
        // PEC Code Block Stitch Data //
        // -------------------------- //
        
        // Prepend the version and pec_start to the PES file
        const pec_start = output.length;
        tmp += struct.pack('<I', pec_start);     // 0008 - 000B -- pecstart -- fulfilled later
        output = tmp + output;

        // Now start the PEC Code Block
        _.each(this.blocks, (block) => {
            // Color Change -- kx=254, ky=176, NN -- Byte following ky gives color No. NN seems to always follow the pattern of 2,1,2,1...
            output += struct.pack('b', 254);
            output += struct.pack('b', 176);
            output += struct.pack('b', _.findIndex(block.color, this.colors));

            for (let i = 1; i < block.stitches; i++) {
                let first_stitch = block.stitches[i - 1];
                let second_stitch = block.stitches[i];
                let dx = second_stitch.x - first_stitch.x;
                let dy = second_stitch.y - first_stitch.y;
                let kx = 0,
                    ky = 0;

                if (second_stitch.is_jump_stitch) {
                    kx = Math.floor(dx / 256); // Should be < 16 -- this is the lower nibble that indicates a multiplication factor for jump stitch ky
                    ky = dx / 256 - kx;        // Now (kx & 15) * 256 + ky is the correct jump
                    kx += 128; // This gets it in the appropriate range to be a jump stitch

                    // TODO: Keep working on stitch data
                }
            }
        });



        

        return btoa(output);
    }
}

export default PESFile;
