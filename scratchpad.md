
## Something to help with types I think if I try to redo some typing strategy.
const deser: <K extends keyof typeof deserializers>(key: K): (typeof deserializers)[K] => deserializers[key]

# Things I would like to look into/do
- Better Component class
  - maybe a `createComponent()` function?
  - 