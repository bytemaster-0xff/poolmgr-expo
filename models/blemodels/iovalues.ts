export class IOValues {
    constructor(str: string){
        this.adcValues = [];
        this.ioValues = [];
        
console.log(str);

        let parts = str.split(',');
        for(let idx = 0; idx < 8; ++idx){
            this.adcValues.push(parseFloat(parts[idx]));
        }
        for(let idx = 8; idx < 16; ++idx){
            this.ioValues.push(parseFloat(parts[idx]));
        }
    };

    adcValues: number[];
    ioValues: number[];
}