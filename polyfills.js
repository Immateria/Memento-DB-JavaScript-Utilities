// ===============================
// Memento DB - Polyfills for JS Engine(Rhino 1.7 something)
// ===============================
var Polyfills = (function()
{   /**
     * ---------------------
     *  Array Polyfills
     * ---------------------
     */

    /**
     * Polyfill for Array.from
     */
    if (!Array.from)
    {   Array.from = function(arrayLike)
        {   if (arrayLike == null)
                throw new TypeError('Array.from requires an array-like object - not null or undefined');

            let C     = this;
            let items = Object(arrayLike);
            let len   = items.length >>> 0;

            let mapFn = arguments.length > 1 ? arguments[1] : undefined;
            let T;
            if (typeof mapFn !== 'undefined')
            {   if (typeof mapFn !== 'function')
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                if (arguments.length > 2)
                    T = arguments[2];
            }

            let A = typeof C === 'function' ? Object(new C(len)) : new Array(len);

            for (let k = 0; k < len; k++)
            {   let kValue = items[k];
                if (mapFn)
                    A[k] = (typeof T === 'undefined') ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                else
                    A[k] = kValue;
            }

            A.length = len;
            return A;
        };
    }

    /**
     * Polyfill for Array.of
     */
    if (!Array.of)
    {   Array.of = function()
        {   let items = arguments;
            let len   = items.length >>> 0;
            let A     = new Array(len);
            for (let i = 0; i < len; i++)
                A[i] = items[i];
            A.length = len;
            return A;
        };
    }

    /**
     * Polyfill for Array.prototype.copyWithin
     */
    if (!Array.prototype.copyWithin)
    {   Array.prototype.copyWithin = function(target, start, end)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');

            let o    = Object(this);
            let len  = o.length >>> 0;
            let to   = target    >> 0;
            let from = start     >> 0;
            let fin  = (end === undefined) ? len : end >> 0;

            let final     = fin < 0 ? Math.max(len + fin, 0) : Math.min(fin, len);
            let count     = Math.min(final - from, len - to);
            let direction = 1;

            if (from < to && to < (from + count))
            {   direction = -1;
                from     += count - 1;
                to       += count - 1;
            }

            while (count > 0)
            {   if (from in o)
                    o[to] = o[from];
                else
                    delete o[to];

                from += direction;
                to   += direction;
                count--;
            }
            return o;
        };
    }

    /**
     * Polyfill for Array.prototype.fill
     */
    if (!Array.prototype.fill)
    {   Array.prototype.fill = function(value, start, end)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');

            let O   = Object(this);
            let len = O.length >>> 0;

            let relativeStart = start >> 0;
            let k             = relativeStart < 0  ? 
                 Math.max(len + relativeStart,  0) : 
                 Math.min(relativeStart, len)      ;

            let relativeEnd = (end === undefined) ? len : end >> 0;
            let final       = relativeEnd < 0  ? 
                Math.max(len + relativeEnd, 0) :
                Math.min(relativeEnd, len)     ;

            while (k < final)
            {   O[k] = value;
                k++;
            }
            return O;
        };
    }

    /**
     * Polyfill for Array.prototype.includes
     */
    if (!Array.prototype.includes)
    {   Array.prototype.includes = function(valueToFind, fromIndex)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');

            let o   = Object(this);
            let len = o.length >>> 0;

            if (len === 0)
                return false;

            let n = fromIndex  |  0  ;
            let k = Math.max(n >= 0  ? 
                                  n  :
               len - Math.abs(n), 0) ;

            while (k < len)
            {   if (o[k] === valueToFind)
                    return true;
                k++;
            }
            return false;
        };
    }

    /**
     * Polyfill for Array.prototype.find
     */
    if (!Array.prototype.find)
    {   Array.prototype.find = function(predicate, thisArg)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');
            
            if (typeof predicate !== 'function')
                throw new TypeError('predicate must be a function');

            let o   = Object(this);
            let len = o.length >>> 0;
            let k   = 0;

            while (k < len)
            {   let kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o))
                    return kValue;
                k++;
            }
            return undefined;
        };
    }

    /**
     * Polyfill for Array.prototype.findIndex
     */
    if (!Array.prototype.findIndex)
    {   Array.prototype.findIndex = function(predicate, thisArg)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');
            
            if (typeof predicate !== 'function')
                throw new TypeError('predicate must be a function');

            let o   = Object(this);
            let len = o.length >>> 0;
            let k   = 0;

            while (k < len)
            {   let kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o))
                    return k;
                k++;
            }
            return -1;
        };
    }

    /**
     * Polyfill for Array.prototype.reduce
     */
    if (!Array.prototype.reduce)
    {   Array.prototype.reduce = function(callback /*, initialValue*/)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');
            
            if (typeof callback !== 'function')
                throw new TypeError(callback + ' is not a function');

            let o   = Object(this);
            let len = o.length >>> 0;
            let k   = 0;
            let value;

            if (arguments.length >= 2)
                value = arguments[1];
            else
            {   while (k < len && !(k in o))
                    k++;
                if (k >= len)
                    throw new TypeError('Reduce of empty array with no initial value');
                value = o[k++];
            }

            for (; k < len; k++)
                if (k in o)
                    value = callback(value, o[k], k, o);

            return value;
        };
    }

    /**
     * Polyfill for Array.prototype.reduceRight
     */
    if (!Array.prototype.reduceRight)
    {   Array.prototype.reduceRight = function(callback)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');
            
            if (typeof callback !== 'function')
                throw new TypeError(callback + ' is not a function');

            let o   = Object(this);
            let len = o.length >>> 0;
            let k   = len - 1;
            let value;

            if (arguments.length >= 2)
                value = arguments[1];
            else
            {   while (k >= 0 && !(k in o))
                    k--;
                if (k < 0)
                    throw new TypeError('ReduceRight of empty array with no initial value');
                value = o[k--];
            }

            for (; k >= 0; k--)
                if (k in o)
                    value = callback(value, o[k], k, o);

            return value;
        };
    }

    /**
     * Polyfill for Array.prototype.some
     */
    if (!Array.prototype.some)
    {   Array.prototype.some = function(callback, thisArg)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');
            
            if (typeof callback !== 'function')
                throw new TypeError(callback + ' is not a function');

            let o   = Object(this);
            let len = o.length >>> 0;
            let T   = thisArg || undefined;

            for (let i = 0; i < len; i++)
                if (i in o && callback.call(T, o[i], i, o))
                    return true;
            
            return false;
        };
    }

    /**
     * Polyfill for Array.prototype.every
     */
    if (!Array.prototype.every)
    {   Array.prototype.every = function(callback, thisArg)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');
            
            if (typeof callback !== 'function')
                throw new TypeError(callback + ' is not a function');

            let o   = Object(this);
            let len = o.length >>> 0;
            let T   = thisArg || undefined;

            for (let i = 0; i < len; i++)
                if (i in o && !callback.call(T, o[i], i, o))
                    return false;
            return true;
        };
    }

    /**
     * Polyfill for Array.prototype.flat
     */
    if (!Array.prototype.flat)
    {   Array.prototype.flat = function(depth)
        {   let flatten = function(arr, depth)
            {   let result = [];
                for (let i = 0; i < arr.length; i++)
                {   let val = arr[i];
                    if (Array.isArray(val) && depth > 0)
                        result = result.concat(flatten(val, depth - 1));

                    else
                        result.push(val);
                }
                return result;
            };

            let d = (typeof depth === 'undefined') ? 1 : depth;
            if (d < 0) d = 0;
            return flatten(this, d);
        };
    }

    /**
     * Polyfill for Array.prototype.flatMap
     */
    if (!Array.prototype.flatMap)
    {   Array.prototype.flatMap = function(callback, thisArg)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');

            if (typeof callback !== 'function')
                throw new TypeError('callback must be a function');

            let o      = Object(this);
            let len    = o.length >>> 0;
            let T      = thisArg || undefined;
            let result = [];

            for (let i = 0; i < len; i++)
                if (i in o)
                {   let val = callback.call(T, o[i], i, o);
                    if (Array.isArray(val))
                        result = result.concat(val);
                    else
                        result.push(val);
                }
            return result;
        };
    }

    /**
     * ---------------------
     *  String Polyfills
     * ---------------------
     */

    /**
     * Polyfill for String.prototype.repeat
     */
    if (!String.prototype.repeat)
    {   String.prototype.repeat = function(count)
        {   if (this == null)
                throw new TypeError('String.prototype.repeat called on null or undefined');

            let str = '' + this;
            count   = +count;

            if (count !== count)  // NaN check
                count = 0;

            if (count < 0)
                throw new RangeError('Repeat count must be non-negative');

            if (count === Infinity)
                throw new RangeError('Repeat count must be less than infinity');

            count = Math.floor(count);
            if (str.length === 0 || count === 0)
                return '';

            let result  = '';
            let pattern = str;

            while (count > 0)
            {   if (count & 1)
                    result += pattern;
                pattern += pattern;
                count >>= 1;
            }
            return result;
        };
    }

    /**
     * Polyfill for String.prototype.padStart
     */
    if (!String.prototype.padStart)
    {   String.prototype.padStart = function(targetLength, padString)
        {   let str = '' + this;
            targetLength = targetLength >> 0;
            padString    = (typeof padString !== 'undefined') ?
                                               '' + padString :
                                               ' '            ;

            if (str.length >= targetLength)
                return str;

            let padLength = targetLength - str.length;
            while (padString.length < padLength)
                padString += padString;
            return padString.slice(0, padLength) + str;
        };
    }

    /**
     * Polyfill for String.prototype.padEnd
     */
    if (!String.prototype.padEnd)
    {   String.prototype.padEnd = function(targetLength, padString)
        {   let str = '' + this;
            targetLength = targetLength >> 0;
            padString    = (typeof padString !== 'undefined') ? '' + padString : ' ';

            if (str.length >= targetLength)
                return str;

            let padLength = targetLength - str.length;
            while (padString.length < padLength)
                padString += padString;

            return str + padString.slice(0, padLength);
        };
    }

    /**
     * Polyfill for String.prototype.startsWith
     */
    if (!String.prototype.startsWith)
    {   String.prototype.startsWith = function(searchString, position)
        {   let str = '' + this;
            position = position || 0;
            return str.substr(position, searchString.length) === searchString;
        };
    }

    /**
     * Polyfill for String.prototype.endsWith
     */
    if (!String.prototype.endsWith)
    {   String.prototype.endsWith = function(searchString, length)
        {   let str = '' + this;
            if ( typeof length !== 'number'    ||
                 !isFinite(length)             ||
                 Math.floor(length) !== length ||
                 length > str.length
               )
                length = str.length;

            length   -= searchString.length;
            let start = Math.max(length, 0);

            return str.indexOf(searchString, start) === start;
        };
    }

    /**
     * Polyfill for String.prototype.includes
     */
    if (!String.prototype.includes)
    {   String.prototype.includes = function(searchString, position)
        {   let str  = '' + this;
            position = position || 0;

            return str.indexOf(searchString, position) !== -1;
        };
    }

    /**
     * Polyfill for String.prototype.replaceAll
     * (ES2021 standard)
     */
    if (!String.prototype.replaceAll)
    {   String.prototype.replaceAll = function(searchValue, replaceValue)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');

            let str = '' + this;

            // If searchValue is not a string, bail out
            // (the real spec handles regex differently, potentially revisit implementation)
            // TODO - handle regex more accurately
            if (typeof searchValue === 'undefined' || searchValue === null)
                return str;

            let search = '' + searchValue;
            if (search.length === 0)
                return str; // trying to avoid infinite loops if searching for an empty string

            // Convert replaceValue to string
            let replacement = '' + replaceValue;
            let result      = '';
            let index       = 0;

            while (true)
            {   let foundIndex = str.indexOf(search, index);
                if (foundIndex === -1)
                {   // No more occurrences
                    result += str.slice(index);
                    break;
                }
                // Add everything up to the match
                result += str.slice(index, foundIndex);
                // Add replacement
                result += replacement;
                index = foundIndex + search.length;
            }
            return result;
        };
    }

    /**
     * Polyfill for String.prototype.matchAll (ES2020)
     * Implementation is quite simplified for typical cases, revisit?
     */
    if (!String.prototype.matchAll)
    {   String.prototype.matchAll = function(regexp)
        {   if (this == null)
                throw new TypeError('"this" is null or not defined');

            let str = '' + this;
            
            if (typeof regexp === 'undefined' || regexp === null)
                throw new TypeError('matchAll requires a valid RegExp or pattern');

            // Convert to RegExp if not one
            let pattern;
            
            if (regexp instanceof RegExp)
            {   // Ensure global or sticky flag is set (ES spec requires "g" or "y")
                if (!regexp.global && !regexp.sticky)
                    throw new TypeError('RegExp passed to matchAll must have global or sticky flag');
                pattern = new RegExp(regexp.source,     (regexp.global     ? 'g' : '') 
                                                      + (regexp.ignoreCase ? 'i' : '')
                                                      + (regexp.multiline  ? 'm' : '')
                                                      + (regexp.unicode    ? 'u' : '')
                                                      + (regexp.sticky     ? 'y' : '')
                                    );
            }
            else pattern = new RegExp('' + regexp, 'g'); // default to global

            let matches = [];
            let match;
            while ((match = pattern.exec(str)) !== null)
                matches.push(match);

            return matches; 
        };
    }

    /**
     * ---------------------
     *  Function Polyfills
     * ---------------------
     */

    /**
     * Polyfill for Function.prototype.bind
     */
    if (!Function.prototype.bind)
    {   Function.prototype.bind = function(thisArg)
        {   if (typeof this !== 'function')
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');

            let targetFunc = this;
            let args       = Array.prototype.slice.call(arguments, 1);
            let boundFunc  = function()
            {   let finalArgs = args.concat(Array.prototype.slice.call(arguments));
                return targetFunc.apply(
                    this instanceof boundFunc ?
                                      this    :
                                      thisArg , finalArgs
                );
            };

            if (targetFunc.prototype)
                boundFunc.prototype = Object.create(targetFunc.prototype);

            return boundFunc;
        };
    }

    /**
     * ---------------------
     *  Number Polyfills
     * ---------------------
     */

    /**
     * Polyfill for Number.isNaN
     */
    if (!Number.isNaN)
    {   Number.isNaN = function(value)
        { return typeof value === 'number' && isNaN(value); };
    }

    /**
     * Polyfill for Number.isFinite
     */
    if (!Number.isFinite)
    {   Number.isFinite = function(value)
        { return typeof value === 'number' && isFinite(value); };
    }

    /**
     * Polyfill for Number.isInteger
     */
    if (!Number.isInteger)
    {   Number.isInteger = function(value)
        {   return typeof value  === 'number' &&
                 isFinite(value)              && 
               Math.floor(value) === value;
        };
    }

    /**
     * Polyfill for Number.isSafeInteger
     */
    if (!Number.isSafeInteger)
    {   Number.isSafeInteger = function(value)
        {   if (!Number.isInteger(value))
                return false;

            return Math.abs(value) <= 9007199254740991;
        };
    }

    // Provide Number.EPSILON, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER if missing
    if (typeof Number.EPSILON === 'undefined')
        Number.EPSILON = 2.220446049250313e-16;  // ~2.22e-16

    if (typeof Number.MAX_SAFE_INTEGER === 'undefined')
        Number.MAX_SAFE_INTEGER = 9007199254740991;

    if (typeof Number.MIN_SAFE_INTEGER === 'undefined')
        Number.MIN_SAFE_INTEGER = -9007199254740991;

    /**
     * ---------------------
     *  Math Polyfills
     * ---------------------
     */

    /**
     * Polyfill for Math.trunc
     */
    if (!Math.trunc)
    {   Math.trunc = function(v)
        {   let value = +v;
            if (!isFinite(value))
                return value;
            
            return (value - value % 1 ) ||
                   (value < 0 ? -0 : 0) ;
        };
    }

    /**
     * Polyfill for Math.sign
     */
    if (!Math.sign)
    {   Math.sign = function(x)
        {   let n = +x;
            if (n === 0 || isNaN(n))
                return n;

            return n > 0 ? 1 : -1;
        };
    }

    /**
     * Polyfill for Math.log10
     */
    if (!Math.log10)
    {   Math.log10 = function(x)
        { return Math.log(x) / Math.LN10; };
    }

    /**
     * Polyfill for Math.log2
     */
    if (!Math.log2)
    {   Math.log2 = function(x)
        { return Math.log(x) / Math.LN2; };
    }

    /**
     * Polyfill for Math.log1p
     */
    if (!Math.log1p)
    {   Math.log1p = function(x)
        {   // Approximation for small x
            if (x <= -1)
                return NaN;

            return Math.log(1 + x);
        };
    }

    /**
     * Polyfill for Math.expm1
     */
    if (!Math.expm1)
    {   Math.expm1 = function(x)
        {   // Approximation for small x
            return Math.exp(x) - 1;
        };
    }

    /**
     * ---------------------
     *  Object Polyfills
     * ---------------------
     */

    /**
     * Polyfill for Object.create
     */
    if (!Object.create)
    {   Object.create = function(proto, propertiesObject)
        {   if (typeof proto !== 'object' && typeof proto !== 'function')
                throw new TypeError('Object.create called with non-object prototype');

            function F() {}

            F.prototype = proto;
            let obj     = new F();

            if (propertiesObject !== undefined)
                Object.defineProperties(obj, propertiesObject);

            return obj;
        };
    }

    /**
     * Polyfill for Object.getOwnPropertyNames
     */
    if (!Object.getOwnPropertyNames)
    {   Object.getOwnPropertyNames = function(obj)
        {   if (obj !== Object(obj))
                throw new TypeError('Object.getOwnPropertyNames called on non-object');

            let names = [];

            for (let key in obj)
                if (Object.prototype.hasOwnProperty.call(obj, key))
                    names.push(key);

            return names;
        };
    }

    /**
     * Polyfill for Object.getPrototypeOf
     */
    if (!Object.getPrototypeOf)
    {   Object.getPrototypeOf = function(obj)
        {   if (obj === null || typeof obj !== 'object')
                throw new TypeError('Object.getPrototypeOf called on non-object');
                
            return   obj.__proto__ ||
                    (obj.constructor ? 
                        obj.constructor.prototype : Object.prototype);
        };
    }

    /**
     * Polyfill for Object.fromEntries
     */
    if (!Object.fromEntries)
    {   Object.fromEntries = function(iterable)
        {   if (iterable == null)
                throw new TypeError('Object.fromEntries requires an iterable');
            
            let obj = {};

            for (let i = 0; i < iterable.length; i++)
            {   let pair = iterable[i];
                if (Object(pair) !== pair)
                    throw new TypeError('Iterator value ' + pair + ' is not an entry object');

                let key  = pair[0];
                let val  = pair[1];
                obj[key] = val;
            }
            return obj;
        };
    }

    /**
     * Polyfill for Object.freeze
     */
    if (!Object.freeze)
    {   Object.freeze = function(obj)
        {   if (typeof obj !== 'object' || obj === null)
                return obj;

            if (Object.preventExtensions)
                Object.preventExtensions(obj);

            let propNames = Object.keys(obj);
            for (let i = 0; i < propNames.length; i++)
            {   let prop = propNames[i];
                let desc = Object.getOwnPropertyDescriptor(obj, prop);

                if (desc && (desc.writable || desc.configurable))
                    Object.defineProperty(obj, prop,
                    {   writable    : false,
                        configurable: false
                    });
            }
            return obj;
        };
    }

    /**
     * Polyfill for Object.seal
     */
    if (!Object.seal)
    {   Object.seal = function(obj)
        {   if (typeof obj !== 'object' || obj === null)
                return obj;

            if (Object.preventExtensions)
                Object.preventExtensions(obj);

            let propNames = Object.keys(obj);

            for (let i = 0; i < propNames.length; i++)
            {   let prop = propNames[i];
                let desc = Object.getOwnPropertyDescriptor(obj, prop);

                if (desc && desc.configurable)
                    Object.defineProperty(obj, prop,
                    { configurable: false });
            }
            return obj;
        };
    }

    /**
     * Polyfill for Object.isFrozen
     */
    if (!Object.isFrozen)
    {   Object.isFrozen = function(obj)
        {   if (typeof obj !== 'object' || obj === null)
                throw new TypeError('Object.isFrozen called on non-object');

            if (Object.isExtensible && Object.isExtensible(obj))
                return false;

            let propNames = Object.keys(obj);

            for (let i = 0; i < propNames.length; i++)
            {   let prop = propNames[i];
                let desc = Object.getOwnPropertyDescriptor(obj, prop);

                if (desc && (desc.writable || desc.configurable))
                    return false;
            }
            return true;
        };
    }

    /**
     * Polyfill for Object.isSealed
     */
    if (!Object.isSealed)
    {   Object.isSealed = function(obj)
        {   if (typeof obj !== 'object' || obj === null)
                throw new TypeError('Object.isSealed called on non-object');

            if (Object.isExtensible && Object.isExtensible(obj))
                return false;

            let propNames = Object.keys(obj);
            
            for (let i = 0; i < propNames.length; i++)
            {   let prop = propNames[i];
                let desc = Object.getOwnPropertyDescriptor(obj, prop);

                if (desc && desc.configurable)
                    return false;
            }
            return true;
        };
    }

    /**
     * Polyfill for Object.is
     */
    if (!Object.is)
    {   Object.is = function(x, y)
        {   if (x === y)
                return x !== 0 || 1 / x === 1 / y;
            return (x !== x && y !== y);
        };
    }

    /**
     * ---------------------
     *  Return references
     * ---------------------
     */
    return {    // Array
                arrayFrom:                 Array.from,
                arrayOf:                   Array.of,
                arrayCopyWithin:           Array.prototype.copyWithin,
                arrayFill:                 Array.prototype.fill,
                arrayIncludes:             Array.prototype.includes,
                arrayFind:                 Array.prototype.find,
                arrayFindIndex:            Array.prototype.findIndex,
                arrayReduce:               Array.prototype.reduce,
                arrayReduceRight:          Array.prototype.reduceRight,
                arraySome:                 Array.prototype.some,
                arrayEvery:                Array.prototype.every,
                arrayFlat:                 Array.prototype.flat,
                arrayFlatMap:              Array.prototype.flatMap,

                // String
                stringRepeat:              String.prototype.repeat,
                stringPadStart:            String.prototype.padStart,
                stringPadEnd:              String.prototype.padEnd,
                stringStartsWith:          String.prototype.startsWith,
                stringEndsWith:            String.prototype.endsWith,
                stringIncludes:            String.prototype.includes,
                stringReplaceAll:          String.prototype.replaceAll,
                stringMatchAll:            String.prototype.matchAll,

                // Function
                functionBind:              Function.prototype.bind,

                // Number
                numberIsNaN:               Number.isNaN,
                numberIsFinite:            Number.isFinite,
                numberIsInteger:           Number.isInteger,
                numberIsSafeInteger:       Number.isSafeInteger,
                
                // Provide numeric constants if missing
                numberEPSILON:             Number.EPSILON,
                numberMAX_SAFE_INT:        Number.MAX_SAFE_INTEGER,
                numberMIN_SAFE_INT:        Number.MIN_SAFE_INTEGER,

                // Math
                mathTrunc:                 Math.trunc,
                mathSign:                  Math.sign,
                mathLog10:                 Math.log10,
                mathLog2:                  Math.log2,
                mathLog1p:                 Math.log1p,
                mathExpm1:                 Math.expm1,

                // Object
                objectAssign:              Object.assign,
                objectCreate:              Object.create,
                objectKeys:                Object.keys,
                objectValues:              Object.values,
                objectEntries:             Object.entries,
                objectFromEntries:         Object.fromEntries,
                objectGetOwnPropertyNames: Object.getOwnPropertyNames,
                objectGetPrototypeOf:      Object.getPrototypeOf,
                objectFreeze:              Object.freeze,
                objectSeal:                Object.seal,
                objectIsFrozen:            Object.isFrozen,
                objectIsSealed:            Object.isSealed,
                objectIs:                  Object.is
    };
})();
