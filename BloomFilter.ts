class BloomFilter {
  expectedItems: number;
  falsePositiveRate: number;
  bitCount: number;
  hashCount: number;
  byteSize: number;
  buffer: Buffer<ArrayBuffer>;
  itemCount: number = 0;
  constructor(
    expectedItems: number = 1_000_000_000,
    falsePositiveRate: number = 0.0001,
  ) {
    this.expectedItems = expectedItems;
    this.falsePositiveRate = falsePositiveRate;
    this.bitCount = this._bitCountCaculator(expectedItems, falsePositiveRate);
    this.hashCount = this._hashCountCaculator(this.bitCount, expectedItems);

    this.byteSize = Math.ceil(this.bitCount / 8);
    this.buffer = Buffer.alloc(this.byteSize);

    console.info(
      `Memory usage: ${Math.ceil(this.byteSize / 1024 / 1024 / 1024)} GB`,
    );
  }

  private _bitCountCaculator(
    expectedItems: number,
    falsePositiveRate: number,
  ): number {
    const valueFormula =
      (-expectedItems * Math.log(falsePositiveRate)) / Math.log(2) ** 2;
    return Math.ceil(valueFormula);
  }

  private _hashCountCaculator(bitCount: number, expectedItems: number) {
    if (expectedItems == 0)
      throw Error("False Positive Rate (FPR) cannot be zero!");
    const valueFormula = (bitCount / expectedItems) * Math.log(2);
    return Math.ceil(valueFormula);
  }

  private _fnv1a(value: string) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; ++i) {
      hash ^= value.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }

  private _getHashPositions(value: string): number[] {
    const h1 = this._fnv1a(value);
    const h2 = this._fnv1a(value + "\x00SALT" + value.split("").reverse().join(""));
    const positions = [];
    for (let i = 0; i < this.hashCount; ++i) {
      const position = ((h1 + i * h2) >>> 0) % this.bitCount;
      positions.push(position);
    }
    return positions;
  }

  private _setBit(position: number) {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;

    this.buffer[byteIndex]! |= 1 << bitIndex;
    // console.log(this.buffer[byteIndex]);

  }

  private _getBit(position: number) {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;

    return (this.buffer[byteIndex]! & (1 << bitIndex)) !== 0;
  }

  public add(value: string) {
    const positions = this._getHashPositions(value);
    for (let position of positions) {
      this._setBit(position);
    }
    this.itemCount++;
  }

  public has(value: string) {
    const positions = this._getHashPositions(value);
    for (let position of positions) {
      if (!this._getBit(position)) {
        return BloomResult.definitelyNot(positions);
      }
    }
    const fpr = this._falsePositveRate();
    return BloomResult.possiblyYes(positions, fpr);
  }

  private _falsePositveRate() {
    const k: number = this.hashCount;
    const m: number = this.bitCount;
    const n: number = this.itemCount;
    return Math.pow(1 - Math.exp((-k * n) / m), k);
  }
}

class BloomResult {
  constructor(
    public result: "definitely_not" | "possibly_yes",
    public checkedBits: number[],
    public falsePositiveProbability: number,
  ) { }

  static definitelyNot(bits: number[]) {
    return new BloomResult("definitely_not", bits, 0);
  }

  static possiblyYes(bits: number[], fp: number) {
    return new BloomResult("possibly_yes", bits, fp);
  }
}
export default BloomFilter;
