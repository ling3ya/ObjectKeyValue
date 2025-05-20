/**
 * Utility class for handling object key-value pairs and circular references
 * @class Actually I don't know what it's used for, just an interesting idea
 * @param {...Object} objects - List of objects to process
 * @returns Accepts multiple objects and returns an object where keys are set to indices of corresponding values in arrays,
 * and values are arrays containing the object's values
 * Example: For input {a:1,b:2,c:3}, {d:4,e:5,f:6}, returns {'{a:0,b:1,c:2}':[1,2,3],'{'d':0,'e':1,'f':2}':[4,5,6]}
 */
class ObjectKeyVaule {
    /** @private */
    #seenObjects

    /**
     * Creates a new instance for processing object key-value pairs
     * @param {...Object} objects - List of objects to process
     * @returns {ObjectKeyVaule} Returns the processed instance, or empty object if no parameters
     */
    constructor(...objects) {
        if (!objects.length) return {}
        this.#seenObjects = new WeakMap()
        objects.forEach(obj => {
            const object_key = Object.keys(obj).reduce((acc, key, index) => {
                acc[key] = index
                return acc
            }, {})
            const values = Object.entries(obj).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return this.#handleRecursiveValue(value, key)
                }
                return value
            })
            this[JSON.stringify(object_key)] = values
        })
        this.#seenObjects = null
    }
    
    /**
     * Restores the processed data back to its original object structure
     * @returns {Object|Array<Object>} Returns either a single restored object or an array of objects
     */
    toOriginalStructure() {
        const result = []
        const refMap = new Map()
        Object.entries(this).forEach(([keyStr, values]) => {
            const keys = Object.keys(JSON.parse(keyStr))
            const obj = {}
            keys.forEach((key, index) => {
                const value = values[index]
                if (typeof value === 'object' && value !== null) {
                    obj[key] = this.#reconstructObject(value)
                } else {
                    obj[key] = value
                }
            })
            result.push(obj)
        })
        const processReferences = (obj) => {
            for (let [key, value] of Object.entries(obj)) {
                if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                    const refKey = value.slice(1, -1)
                    let target = obj
                    while (target && !target.hasOwnProperty(refKey)) {
                        target = Object.getPrototypeOf(target)
                    }
                    if (target) {
                        obj[key] = target
                    }
                } else if (typeof value === 'object' && value !== null) {
                    processReferences(value)
                }
            }
        }

        result.forEach(processReferences)
        return result.length === 1 ? result[0] : result
    }

    /**
     * Rebuilds the internal structure of an object
     * @private
     * @param {Object} obj - Object to be rebuilt
     * @returns {Object} Returns the rebuilt object
     */
    #reconstructObject(obj) {
        if (typeof obj !== 'object') return obj
        const result = Array.isArray(obj) ? [] : {}
        for (let [key, value] of Object.entries(obj)) {
            result[key] = typeof value === 'object' && value !== null
                ? this.#reconstructObject(value)
                : value
        }
        return result
    }

    /**
     * Handles recursive reference values
     * @private
     * @param {*} value - Value to be processed
     * @param {string} currentKey - Current key being processed
     * @returns {*} Returns the processed value
     */
    #handleRecursiveValue(value, currentKey) {
        if (this.#seenObjects.has(value)) {
            return `{${this.#seenObjects.get(value)}}`
        }

        this.#seenObjects.set(value, currentKey)

        if (Array.isArray(value)) {
            return value.map(item => 
                typeof item === 'object' && item !== null 
                    ? this.#handleRecursiveValue(item, currentKey)
                    : item
            )
        }

        const processedObj = {}
        for (const [key, val] of Object.entries(value)) {
            processedObj[key] = typeof val === 'object' && val !== null
                ? this.#handleRecursiveValue(val, key)
                : val
        }
        return processedObj
    }

    /**
     * Implements iterator interface
     * @generator
     * @yields {Array} Returns array of object values
     */
    *[Symbol.iterator]() {
        for (const [key, value] of Object.entries(this)) {
            yield value
        }
    }
}