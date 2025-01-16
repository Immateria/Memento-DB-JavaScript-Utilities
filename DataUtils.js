// ===============================
// Data Handling Utilities for Memento DB
// Trying to make handling data in Memento DB less painful, and more idiomatic.
// ===============================
var DataHandlingUtilities = (function()
{   /**
     * Safely retrieves the title of an entry.
     * @param {object} entry - The entry object.
     * @returns {string} - The title of the entry or "Untitled" if unavailable.
     */
    function getEntryTitle(entry) {
        return getEntryFieldOrProperty(entry, "Title") || "Untitled"
    }

    /**
     * Safely retrieves the value of a field or property in an entry.
     * @param {object} entry - The entry object.
     * @param {string} name - The name of the field or property to retrieve.
     * @returns {*} - The value of the field/property or null if unavailable.
     */
    function getEntryFieldOrProperty(entry, name)
    {   try {
            let value = entry.field(name)
            if (typeof value === 'undefined')
            {   // Attempt to access as property with exact name
                if (entry.hasOwnProperty(name))
                    return entry[name]

                else
                {   // Attempt to access as property with lowercase first letter
                    let propName = name.charAt(0).toLowerCase() + name.slice(1)
                    if (entry.hasOwnProperty(propName))
                        return entry[propName]

                    else
                    {   LoggingUtilities.logMessage(    'Field or property "' +
                                                                         name + 
                                                    '" not found for entry "' + 
                                                         getEntryTitle(entry) + 
                                                    '".', LoggingUtilities.LOG_LEVELS.WARNING
                                                   )
                        return null
                    }
                }
            }
            return value
        }
        catch (error)
        {   LoggingUtilities.logMessage('Error getting field/property "' + name + '" for entry "' + getEntryTitle(entry) + '": ' + error.message, LoggingUtilities.LOG_LEVELS.ERROR)
            return null
        }
    }

    /**
     * Safely sets the value of a field or property in an entry.
     * @param {object} entry - The entry object.
     * @param {string} name - The name of the field or property to set.
     * @param {*} value - The value to set.
     * @returns {boolean} - True if the field/property was set successfully, false otherwise.
     */
    function setEntryFieldOrProperty(entry, name, value)
    {   try {
            // Attempt to set as field first
            entry.set(name, value)
            LoggingUtilities.logMessage('Set field "' + name + '" to "' + value + '" for entry "' + getEntryTitle(entry) + '".', LoggingUtilities.LOG_LEVELS.INFO)
            return true
        }
        catch (error)
        {   // Attempt to set as property with exact name
            try
            {   if (entry.hasOwnProperty(name))
                {   entry[name] = value
                    LoggingUtilities.logMessage('Set property "' + name + '" to "' + value + '" for entry "' + getEntryTitle(entry) + '".', LoggingUtilities.LOG_LEVELS.INFO)
                    return true
                }
                else
                {   // Attempt to set as property with lowercase first letter
                    let propName = name.charAt(0).toLowerCase() + name.slice(1)
                    if (entry.hasOwnProperty(propName))
                    {   entry[propName] = value
                        LoggingUtilities.logMessage('Set property "' + propName + '" to "' + value + '" for entry "' + getEntryTitle(entry) + '".', LoggingUtilities.LOG_LEVELS.INFO)
                        return true

                    }
                    else
                    {   LoggingUtilities.logMessage('Cannot set field or property "' + name + '": ' + error.message, LoggingUtilities.LOG_LEVELS.ERROR)
                        return false
                    }
                }
            }
            catch (propError)
            {   LoggingUtilities.logMessage('Error setting property "' + name + '" for entry "' + getEntryTitle(entry) + '": ' + propError.message, LoggingUtilities.LOG_LEVELS.ERROR)
                return false
            }
        }
    }

    /**
     * Collects data from an entry based on provided field names.
     * @param {object} entry - The entry object.
     * @param {array} fields - An array of field or property names to collect.
     * @returns {object} - An object containing field/property-value pairs.
     */
    function collectEntryData(entry, fields)
    {   let entryData = {}
        for (let i = 0, len = fields.length; i < len; i++)
        {   let name = fields[i]
            entryData[name] = getEntryFieldOrProperty(entry, name)
        }
        return entryData
    }

    /**
     * Transforms an array of entries into an array of data objects based on field names.
     * @param {array} entries - An array of entry objects.
     * @param {array} fields - An array of field or property names.
     * @returns {array} - An array of data objects.
     */
    function transformEntriesToData(entries, fields)
    {   let allEntriesData = new Array(entries.length)
        for (let i = 0, len = entries.length; i < len; i++)
            allEntriesData[i] = collectEntryData(entries[i], fields)

        return allEntriesData
    }

    /**
     * Safely sets multiple fields or properties in an entry.
     * @param {object} entry - The entry object.
     * @param {object} fieldsToSet - An object containing field/property-value pairs.
     * @returns {boolean} - True if all fields/properties were set successfully, false otherwise.
     */
    function setMultipleFieldsOrProperties(entry, fieldsToSet)
    {   let success = true
        for (let name in fieldsToSet)
        {   if (fieldsToSet.hasOwnProperty(name))
            {   let value  = fieldsToSet[name]
                let result = setEntryFieldOrProperty(entry, name, value)
                if (!result)
                    success = false
            }
        }
        return success
    }

    /**
     * Deletes a field or property from an entry by setting its value to null or undefined.
     * @param {object} entry - The entry object.
     * @param {string} name - The name of the field or property to delete.
     * @returns {boolean} - True if the field/property was deleted successfully, false otherwise.
     */
    function deleteEntryFieldOrProperty(entry, name)
    {   try
        {   // Attempt to delete as field by setting to null
            entry.set(name, null)
            LoggingUtilities.logMessage('Deleted field "' + name + '" for entry "' + getEntryTitle(entry) + '".', LoggingUtilities.LOG_LEVELS.INFO)
            return true
        }
        catch (error)
        {   // Attempt to delete as property by setting to undefined
            try
            {   if (entry.hasOwnProperty(name))
                {   entry[name] = undefined
                    LoggingUtilities.logMessage('Deleted property "' + name + '" for entry "' + getEntryTitle(entry) + '".', LoggingUtilities.LOG_LEVELS.INFO)
                    return true
                }
                else
                {   // Attempt to delete as property with lowercase first letter
                    let propName = name.charAt(0).toLowerCase() + name.slice(1)
                    if (entry.hasOwnProperty(propName))
                    {   entry[propName] = undefined
                        LoggingUtilities.logMessage('Deleted property "' + propName + '" for entry "' + getEntryTitle(entry) + '".', LoggingUtilities.LOG_LEVELS.INFO)
                        return true
                    }
                    else
                    {   LoggingUtilities.logMessage('Cannot delete field or property "' + name + '": ' + error.message, LoggingUtilities.LOG_LEVELS.ERROR)
                        return false
                    }
                }
            }
            catch (propError)
            {   LoggingUtilities.logMessage('Error deleting property "' + name + '" for entry "' + getEntryTitle(entry) + '": ' + propError.message, LoggingUtilities.LOG_LEVELS.ERROR)
                return false
            }
        }
    }

    return {
        getEntryTitle                : getEntryTitle,
        getEntryFieldOrProperty      : getEntryFieldOrProperty,
        setEntryFieldOrProperty      : setEntryFieldOrProperty,
        collectEntryData             : collectEntryData,
        transformEntriesToData       : transformEntriesToData,
        setMultipleFieldsOrProperties: setMultipleFieldsOrProperties,
        deleteEntryFieldOrProperty   : deleteEntryFieldOrProperty
    }
})()
