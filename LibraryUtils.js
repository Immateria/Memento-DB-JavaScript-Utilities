// ===============================
// Library Access Utilities for Memento DB 
// Trying to make using Memento DB libraries less painful, and more idiomatic.
// ===============================
var LibraryAccessUtilities = (function() {
    // Clear any existing instance if it exists
    if (typeof _libraryUtilsInstance !== 'undefined')
        delete _libraryUtilsInstance

    /**
     * Retrieves a library by its name.
     * @param {string} libraryName - The name of the library.
     * @returns {object} - The library object.
     * @throws Will throw an error if the library is not found.
     */
    function getLibraryByName(libraryName)
    {   let library = libByName(libraryName)
        if (!library)
            throw new Error('Library "' + libraryName + '" not found.')
        return library
    }

    /**
     * Retrieves all entries from a library and makes using it not suck
     * Adds a separate entries array, length, and index-based access to the library object.
     * Also defines properties on each entry for direct access to fields and properties.
     * @param {object} library - The library object.
     * @returns {array} - An array of entry objects.
     * @throws Will throw an error if no entries are found.
     */
    function getLibraryEntries(library) {
        let entries = library.entries()
        if (!entries || entries.length === 0)
            throw new Error('No entries found in library "' + library.name + '".')

        // Retrieve field names once
        let fields     = getLibraryFields(library)
        let fieldCount = fields.length

        // Precompute sanitized property names
        let sanitizedFieldMap = new Array(fieldCount)
        for (let i = 0; i < fieldCount; i++)
            sanitizedFieldMap[i] = fields[i].replace(/[^a-zA-Z0-9_$]/g, '_').toLowerCase()

        // Enhance library object without overwriting library.entries()
        library._entriesArray = entries // Use a different property name to store entries
        library.length        = entries.length

        // Make the library iterable by adding array methods
        makeLibraryIterable(library)

        let defineProperty = Object.defineProperty
        let hasOwnProperty = Object.prototype.hasOwnProperty

        for (let i = 0, len = entries.length; i < len; i++) {
            let entry  = entries[i]
            library[i] = entry

            for (let j = 0; j < fieldCount; j++)
            {   let fieldName = fields[j]
                let propName  = sanitizedFieldMap[j]

                if (!hasOwnProperty.call(entry, propName))
                {   try
                    {   defineProperty(entry, propName,
                        {   get: (function(entry, fieldName)
                            {   return function()
                                { return DataHandlingUtilities.getEntryFieldOrProperty(entry, fieldName); }
                            })(entry, fieldName),

                            set: (function(entry, fieldName)
                            {   return function(value)
                                { DataHandlingUtilities.setEntryFieldOrProperty(entry, fieldName, value) }
                            })(entry, fieldName),

                            enumerable  : true,
                            configurable: true
                        })
                    } catch (error)
                    {   // Fallback for environments that do not support Object.defineProperty
                        entry[propName] = DataHandlingUtilities.getEntryFieldOrProperty(entry, fieldName)
                        LoggingUtilities.logMessage('Unable to define property for field "' + fieldName + '": ' + error.message, LoggingUtilities.LOG_LEVELS.WARNING)
                    }
                }
            }
        }
        return entries
    }

    /**
     * Retrieves a specific entry by its index in the library.
     * @param {object} library - The library object.
     * @param {number} index - The index of the entry.
     * @returns {object} - The entry object.
     * @throws Will throw an error if the index is out of bounds.
     */
    function getEntryByIndex(library, index)
    {   if (typeof index === 'undefined')
            index = 0

        let entries = library._entriesArray // Access the enhanced entries array
        if (!entries)
            entries = getLibraryEntries(library)

        if (index < 0 || index >= entries.length)
            throw new Error('Index out of bounds for library "' + library.name + '".')

        return entries[index]
    }

    /**
     * Retrieves all field names of a library.
     * @param {object} library - The library object.
     * @returns {array} - An array of field names.
     */
    function getLibraryFields(library)
    { return library.fields() }

    /**
     * Makes the library object iterable like a normal JavaScript array.
     * Adds common array methods like forEach, map, filter, etc., delegating to the _entriesArray.
     * TODO: Add in missing things like reduce, reduceRight, etc.
     * @param {object} library - The library object.
     */
    function makeLibraryIterable(library)
    {   // Cache library length
        let length = library.length

        // Define forEach
        library.forEach = function(callback)
        {   for (let i = 0; i < length; i++)
                callback(library[i], i, library)
        }

        // Define map
        library.map = function(callback)
        {   let result = new Array(length)
            for (let i = 0; i < length; i++)
                result[i] = callback(library[i], i, library)
            return result
        }

        // Define filter
        library.filter = function(callback)
        {   let result = []
            for (let i = 0; i < length; i++)
                if (callback(library[i], i, library))
                    result.push(library[i])
            return result
        }

        // Define some
        library.some = function(callback)
        {   for (let i = 0; i < length; i++)
                if (callback(library[i], i, library))
                    return true
            return false
        }

        // Define every
        library.every = function(callback)
        {   for (let i = 0; i < length; i++)
                if (!callback(library[i], i, library))
                    return false
            return true
        }

        // Define find
        library.find = function(callback)
        {   for (let i = 0; i < length; i++)
                if (callback(library[i], i, library))
                    return library[i]
            return null
        }

        // Define findIndex
        library.findIndex = function(callback)
        {   for (let i = 0; i < length; i++)
                if (callback(library[i], i, library))
                    return i
            return -1
        }
    }

    // Create singleton instance
    let _libraryUtilsInstance = {
        getLibraryByName : getLibraryByName,
        getLibraryEntries: getLibraryEntries,
        getEntryByIndex  : getEntryByIndex,
        getLibraryFields : getLibraryFields,
        enhanceLibrary   : makeLibraryIterable
    }

    return _libraryUtilsInstance
})()
