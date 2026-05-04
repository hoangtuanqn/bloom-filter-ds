class BloomFilter {
  expectedItems: number;
  falsePositiveRate: number;
  bitCount: number;
  hashCount: number;
  byteSize: number;
  constructor(
    expectedItems: number = 1_000_000_000,
    falsePositiveRate: number = 0.0001,
  ) {
    this.expectedItems = expectedItems;
    this.falsePositiveRate = falsePositiveRate;
    this.bitCount = this._bitCountCaculator(expectedItems, falsePositiveRate);
    this.hashCount = this._hashCountCaculator(this.bitCount, falsePositiveRate);

    this.byteSize = Math.ceil(this.bitCount / 8);
    Buffer.allocUnsafe(this.byteSize);

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

  private _hashCountCaculator(bitCount: number, falsePositiveRate: number) {
    if (falsePositiveRate == 0)
      throw Error("False Positive Rate (FPR) cannot be zero!");
    const valueFormula = (bitCount * Math.log(2)) / falsePositiveRate;
    return Math.ceil(valueFormula);
  }
}
export default BloomFilter;
