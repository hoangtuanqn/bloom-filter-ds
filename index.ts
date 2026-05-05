import readline from "node:readline";
import BloomFilter from "./BloomFilter";

const bf = new BloomFilter(1_000_000_000, 0.01);

// seed demo
for (let i = 0; i < 7_000_000; i++) {
  const email = `email${i}@gmail.com`;
  bf.add(email);
  //   console.log(email);
}
let count = 0;
// for (let i = 0; i < 7_000_000; i++) {
//   const email = `email-1@gmail.com`;

//   if (bf.has(email).result == "definitely_not") count++;
// }
console.log(bf.has(`email@gmail.com`));
console.log(bf.has(`email1@gmail.com`));

