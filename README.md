# Baby names Cologne

Official dataset from the city of Cologne, Germany.

- [Source](https://offenedaten-koeln.de/dataset/vornamen)
- [License](https://creativecommons.org/licenses/by/3.0/)

## Installation

```bash
npm install baby-names-cologne
```

## Usage

```js
const names = require("baby-names-cologne");
console.log(names[0]);
// { count: 169, gender: 'male', name: 'Maximilian', year: 2010, rank: 1 }
```
