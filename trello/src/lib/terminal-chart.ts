import chalk from 'chalk'

type Optional<T> = {
    [P in keyof T]?: T[P]
}

export type RGBColor = [number, number, number];

export type TextDecorator = Function | string;
export type TextDecorators = TextDecorator[];

export type CharDrawingOptions = {
    decorators: TextDecorators,
}
export type CharDrawingOptionsParam = Optional<CharDrawingOptions>;

export type LineDrawingOptions = {
    drawCrosses: boolean,
    char: string,
    decorators: TextDecorators
};
export type LineDrawingOptionsParam = Optional<LineDrawingOptions>;

export type BarDrawingOptions = LineDrawingOptions & {
    thickness: number,
    base: number,
    above?: string
}
export type BarDrawingOptionsParam = Optional<BarDrawingOptions>


// export 

export default class TerminalChart {
    cols: number;
    rows: number;
    
    _debug: boolean = false;
    _chars: string[][];
    _decorators: TextDecorators[][];

    constructor(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;
        const row = new Array(cols).fill(' ');
        this._chars = [
            ...new Array(rows)
                .fill('')
                .map(() => [...row])
        ];

        const decRow = new Array(cols).fill([]);
        this._decorators = [
            ...new Array(rows)
                .fill('')
                .map(() => [...decRow])
        ];

        // this.debug();
    }

    debugging(state?: boolean): boolean {
        if (typeof state !== 'undefined') {
            this._debug = state;
        }
        return this._debug;
    }

    dMsg(msg: string, level: number = 1) {
        if (this._debug) {
            console.log(msg);
        }
    }

    checkY(y: number): boolean {
        const yIdx = Math.round(y);
        return yIdx >= 0 && yIdx < this.rows;
    }

    checkX(x: number): boolean {
        const xIdx = Math.round(x);
        return xIdx >= 0 && xIdx < this.cols;
    }

    valid(x: number, y: number): boolean {
        const xIdx = Math.round(x);
        const yIdx = Math.round(y);
        return this.checkY(yIdx) && this.checkX(xIdx);
    }

    checkBounds(x: number, y: number): Boolean  {
        const xIdx = Math.round(x);
        const yIdx = Math.round(y);
        if (!this.checkY(yIdx)) {
            throw new Error(`y:${yIdx} is out of bounds!`);
        }
        if (!this.checkX(xIdx)) {
            throw new Error(`x:${xIdx} is out of bounds!`);
        }
        return true;
    }

    
    maxX() {
        return this.cols - 1
    }
    
    maxY() {
        return this.rows - 1;
    }

    set(x: number, y: number, char: string, options?: CharDrawingOptionsParam) {
        // this.dMsg(`set ${x}, ${y}, ${char}`);
        const xIdx = Math.round(x);
        const yIdx = Math.round(y);
        this.checkBounds(xIdx, yIdx);
        const o: CharDrawingOptions = {
            decorators: [],
            ...(options || {})
        };
        if (char.length > 1) {
            let nx = xIdx;
            for (let c of char.split('')) {
                this.set(nx, yIdx, c, o);
                nx += 1;
            }
        } else {
            this._chars[yIdx][xIdx] = char;
            this._decorators[yIdx][xIdx] = o.decorators;
            // this.dMsg(`_chars[${y}][${x}] = "${char}"`);
        }
    }

    get(x: number, y: number): string | false {
        const xIdx = Math.round(x);
        const yIdx = Math.round(y);
        if (!this.valid(xIdx, yIdx)) {
            return false;
        }
        return this._chars[yIdx][xIdx];
    }


    setV(x: number, y: number, s: string) {
        const xIdx = Math.round(x);
        const yIdx = Math.round(y);
        const chars = s.split('');
        let ny = yIdx;
        for (let c of chars) {
            this.set(xIdx, ny, c);
            ny += 1;
        }
    }
    
    vdiv(x: number, options?: LineDrawingOptionsParam ) {
        const xIdx = Math.round(x);
        const o: LineDrawingOptions = {
            drawCrosses: true,
            char: '|',
            decorators: [],
            ...(options || {})
        };
        for (let y = 0; y < this.rows; y++) {
            if (o.drawCrosses) {
                if (this.get(xIdx + 1, y) == '-' || this.get(xIdx - 1, y) == '-') {
                    this.set(xIdx, y, '+', o);
                } else {
                    this.set(xIdx, y, o.char, o);
                }
            } else {
                this.set(xIdx, y, o.char, o);
            }
        }
    }    

    hdiv(y: number, options?: LineDrawingOptionsParam ) {
        const yIdx = Math.round(y);
        const o: LineDrawingOptions = {
            char: '-',
            drawCrosses: true,
            decorators: [],
            ...(options || {})
        };

        for (let x = 0; x < this.cols; x++) {
            if (o.drawCrosses) {
                if (this.get(x, yIdx + 1) == '|' || this.get(x, yIdx + 1) == '|') {
                    this.set(x, yIdx, '+', o);
                } else {
                    this.set(x, yIdx, o.char, o);
                }
            } else {
                this.set(x, yIdx, o.char, o);
            }
        }
    }

    line(x1: number, y1: number, x2: number, y2: number, options?: LineDrawingOptionsParam) {
        this.dMsg(`line ${x1}, ${y1}, ${x2}, ${y2}`)
        const o: LineDrawingOptions = {
            char: '-',
            drawCrosses: true,
            decorators: [],
            ...(options || {})
        };

        if (x1 !== x2 && y1 !== y2) {
            throw new Error(`Invalid line (${x1}, ${y1})-(${x2}, ${y2}): alas, we can only draw orthogonal lines`);
        }

        const horiz = y1 === y2;
        const init = horiz ? x1 : y1;
        const final = horiz ? x2: y2;
        
        for (let m = init; m < final; m++) {
            let char = horiz ? '-' : '|';
            const x = horiz ? m : x1;
            const y = horiz ? y1 : m;
            if (o.drawCrosses) {
                const above = this.get(x, y - 1);
                const below = this.get(x, y + 1);
                const left = this.get(x - 1, y);
                const right = this.get(x +  1, y);
                if ((horiz && [above, below].indexOf('|') >= 0) ||
                    (!horiz && [left, right].indexOf('-') >= 0)) {
                        char = '+'
                }
            }
            this.set(x, y, char, o);
        }
    }

    box(x1: number, y1: number, x2: number, y2: number, options?: LineDrawingOptionsParam) {
        this.dMsg(`box: ${x1}, ${y1}, ${x2}, ${y2}`);
        const o: LineDrawingOptions = {
            char: '-',
            drawCrosses: true,
            decorators: [],
            ...(options || {})
        };
        this.checkBounds(x1, y1);
        this.checkBounds(x2, y2);
        this.line(x1, y1, x1, y2, o);
        this.line(x1, y1, x2, y1, o);
        this.line(x1, y2, x2, y2, o);
        this.line(x2, y1, x2, y2, o);
    }

    vbar(x: number, height: number, options?: BarDrawingOptionsParam) {
        this.dMsg(`bar ${x}, ${height}`);
        const xIdx = Math.round(x);
        const ht = Math.round(height);
        const o: BarDrawingOptions = {
            char: '█',
            thickness: 2,
            drawCrosses: true,
            decorators: [],
            ...(options || {}),
            base: 3
        };

        o.thickness = Math.abs(o.thickness);
        o.base = Math.abs(o.base);

        const yStart = this.rows - o.base - ht; 

        for (let y = yStart; y < this.rows - o.base; y++) {
            this.set(xIdx, y, o.char.repeat(o.thickness), o);
        }
        if (o.above) {
            this.set(xIdx, yStart - 1, o.above.toString(), o);
        }

    }

    randColor() {
        const options: string[] = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

        options.forEach(f => options.push[`${f}Bright`]);

        const rndIdx = Math.floor(Math.random() * options.length);
        const rndMethod = options[rndIdx];
        return chalk[rndMethod];
    }

    lighten(color: RGBColor, percent: number): RGBColor {
        const per = Math.max(Math.abs(percent), 100);
        const newAmt: RGBColor = (color.map(c => Math.min(Math.floor((255 - c) * (per / 100)), 255)) as RGBColor);
        return newAmt;
    }


    darken(color: RGBColor, percent: number): RGBColor {
        const per = Math.min(Math.abs(percent), 100);
        const newColor = color.map(c => Math.floor(c - (c * (per / 100)))) as RGBColor;
        return newColor;
    }
    
    randRGB(threshold: number = 150): RGBColor {
        let r = -1;
        let g = -1;
        let b = -1;
        let tries = 1;
        while(tries < 1000 && (r + g + b) / 3 < threshold) {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
            tries++;
        }
        return [r, g, b];
    }

    rgbColor(colors: RGBColor) {
        return chalk.rgb(colors[0], colors[1], colors[2]);
    }

    colorAverage(color: RGBColor, round: boolean = true): number {
        const avg = (color[0] + color[1] + color[2]) / 3;
        return round ? Math.round(avg) : avg;
    }

    randColorDistant(color: RGBColor, threshold: number = 75) {
        const [r, g, b] = color;
        const avg = this.colorAverage(color);
        let nc = this.randRGB();
        let tries = 0;
        while (tries < 1000 && Math.abs(this.colorAverage(nc)- avg)) {
            nc = this.randRGB();
        }
        return nc;
    }


    randRGBColor(threshold: number = 150) {
        const [r, g, b] = this.randRGB(threshold);
        return chalk.rgb(r, g, b);
    }

    render(x: number, y: number): string {
        const xIdx = Math.round(x);
        const yIdx = Math.round(y);
        if (!this.valid(xIdx, yIdx)) {
            throw new Error(`Cannot get rendered character at ${xIdx}, ${yIdx}: out of bounds`);
        }
        const char = this._chars[yIdx][xIdx];
        const dec = this._decorators[yIdx][xIdx]
        
        const rendered = dec.reduce((c: string, f: TextDecorator) => {
            if (typeof f == 'function') {
                return f(c);
            } else if (typeof f == 'string') {
                return chalk[f](c);
            }
            return c;
        }, char);
        return rendered;
    }

    sprint() {
        return this._chars
            .map((row, y) => `>${row
                                .map((c, x) => this.render(x, y))
                                .join('')
                            }<`)
            .join("\n");
    }

    print() {
        console.log(this.sprint());
    }

    debug() {
        console.log(this._chars);
    }

    


}