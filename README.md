# ObjectKeyVaule Class

A utility class for handling object key-value pairs and circular references.

## Introduction

This class can process multiple objects and convert their key-value pairs into a specific format. It correctly handles objects with circular references.

## Output Format Example

Input `{a:1,b:2,c:3}`, `{d:4,e:5,f:6}` will return:

```javascript
{
    '{"a":0,"b":1,"c":2}': [1,2,3],
    '{"d":0,"e":1,"f":2}': [4,5,6]
}
```

## Constructor

```javascript
new ObjectKeyVaule(...objects);
```

### Parameters

- `...objects`: List of objects to process

### Returns

Returns the processed instance, or an empty object if no parameters provided

## Public Methods

### toOriginalStructure()

Restores the processed data back to its original object structure

#### Returns

- `Object|Array<Object>`: Returns either a single object or an array of objects

### [Symbol.iterator]

Implements the iterator interface

#### Yields

- `Array`: Returns array of object values

## Usage Example

```javascript
// Create instance
let aaa = { d: 4, e: 5, f: 6 };
aaa.e = aaa; // Circular reference
const test = new ObjectKeyVaule({ a: 1, b: 2, c: 3 }, aaa);

// Iterate values
for (const value of test) {
  console.log(value);
}

// Restore structure
console.log(test.toOriginalStructure());
```

## Private Properties

### #seenObjects

- Type: `WeakMap`
- Purpose: Tracks seen objects during circular reference processing

## Private Methods

### #reconstructObject(obj)

Rebuilds the internal structure of an object

#### Parameters

- `obj`: Object to rebuild

#### Returns

- Reconstructed object

### #handleRecursiveValue(value, currentKey)

Handles values with recursive references

#### Parameters

- `value`: Value to process
- `currentKey`: Current key being processed

#### Returns

- Processed value with references handled
