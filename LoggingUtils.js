// ===============================
// Logging Utilities for Memento DB
// ===============================
var LoggingUtilities = (function()
{   // Clear any existing instance if it exists
    if (typeof _loggingUtilsInstance !== 'undefined')
        delete _loggingUtilsInstance;

    // Define log levels with numeric values for easy comparison
    const LOG_LEVELS =
    {   ERROR:   0,
        WARNING: 1,
        INFO:    2
    };

      // Set the default current log level
    let currentLogLevel  = LOG_LEVELS.INFO;
    let isLoggingEnabled = true;               // Default logging mode
    let DEFAULT_LOG_FILE = 'memento_log.txt';
    let logFileName      = DEFAULT_LOG_FILE;   // Default log file name
    let logBuffer        = [];                 // Buffer to store log messages

    /**
     * Initializes logging by setting the log file name and the initial log level.
     * @param {string} customLogFileName - Optional. Custom name for the log file.
     * @param {string} initialLogLevel - Optional. Initial log level ('ERROR', 'WARNING', 'INFO').
     */
    function initializeLogging(customLogFileName, initialLogLevel)
    {   if (typeof customLogFileName !== 'undefined')
            logFileName = customLogFileName;

        // Set the initial log level if provided and valid
        if (typeof initialLogLevel === 'string' && LOG_LEVELS.hasOwnProperty(initialLogLevel.toUpperCase()))
            currentLogLevel = LOG_LEVELS[initialLogLevel.toUpperCase()];

        // Clear existing buffer
        logBuffer = [];

        // Initialize log with a starting message
        logMessage('----- Log Initialized -----', LOG_LEVELS.INFO);
    }

    /**
     * Serializes an object into a JSON-like string.
     * @param {object} obj - The object to serialize.
     * @returns {string} - The serialized string.
     */
    function serializeObject(obj)
    {   try
        { return JSON.stringify(obj) }
        catch (error)
        {   // Fallback for circular references or serialization errors
            return '[Unserializable Object]';
        }
    }

    /**
     * Logs a message with a specified level by adding it to the buffer.
     * Only logs messages that meet or exceed the current log level.
     * @param {string} message - The message to log.
     * @param {number} level - The log level (LOG_LEVELS.ERROR, LOG_LEVELS.WARNING, LOG_LEVELS.INFO).
     */
    function logMessage(message, level)
    {   if (!isLoggingEnabled) return;

        if (typeof level === 'undefined')
            level = LOG_LEVELS.INFO;

        // Only log messages that are at or above the current log level
        if (level > currentLogLevel) return;

        let timestamp = new Date().toISOString();
        let levelName = getLogLevelName(level);
        let logEntry  = '[' + timestamp + '] [' + levelName + '] ' + message;
        logBuffer.push(logEntry);
    }

    /**
     * Retrieves the string name of a log level given its numeric value.
     * @param {number} level - The numeric log level.
     * @returns {string} - The string representation of the log level.
     */
    function getLogLevelName(level)
    {   for (let key in LOG_LEVELS)
            if (LOG_LEVELS[key] === level)
                return key;

        return 'UNKNOWN';
    }

    /**
     * Logs an object by serializing it and adding it to the buffer.
     * Only logs messages that meet or exceed the current log level.
     * @param {object} obj - The object to log.
     * @param {number} level - The log level.
     */
    function logObject(obj, level)
    {   let serialized = serializeObject(obj);
        logMessage(serialized, level);
    }

    /**
     * Writes all buffered log messages to the log file.
     */
    function flushLogs()
    {   if (logBuffer.length === 0) return;
        try
        {   let logFile = file(logFileName);
            logFile.appendMode();
            let bufferLength = logBuffer.length;

            for (let i = 0; i < bufferLength; i++)
                logFile.writeLine(logBuffer[i]);

            logFile.close();
            logBuffer = []; // Clear the buffer after flushing
        }
        catch (error)
        {   // Fallback logging if file operations fail
            // Using logMessage here would cause recursion; instead, use a basic console log if available
            if (typeof console !== 'undefined' && typeof console.log === 'function')
                console.log('Logging Flush Error: ' + error.message);
        }
    }

    /**
     * Sets the current log level. Only messages with this level or higher will be logged.
     * @param {string} level - The desired log level ('ERROR', 'WARNING', 'INFO').
     * @returns {boolean} - True if the log level was set successfully, false otherwise.
     */
    function setCurrentLogLevel(level)
    {   if (typeof level === 'string' && LOG_LEVELS.hasOwnProperty(level.toUpperCase()))
        {   currentLogLevel = LOG_LEVELS[level.toUpperCase()];
            logMessage('Log level set to ' + level.toUpperCase() + '.', LOG_LEVELS.INFO);
            return true

        }
        else
        {   logMessage('Invalid log level: ' + level, LOG_LEVELS.ERROR);
            return false;
        }
    }

    /**
     * Retrieves the current log level as a string.
     * @returns {string} - The current log level ('ERROR', 'WARNING', 'INFO').
     */
    function getCurrentLogLevel()
    { return getLogLevelName(currentLogLevel); }

    /**
     * Enables or disables logging.
     * @param {boolean} enable - Set to true to enable logging, false to disable.
     */
    function setLoggingMode(enable)
    {   isLoggingEnabled = enable;
        logMessage('Logging mode set to ' + (enable ? 'ENABLED' : 'DISABLED') + '.', LOG_LEVELS.INFO);
    }

    /**
     * Checks if logging is enabled.
     * @returns {boolean} - True if logging is enabled, false otherwise.
     */
    function isLogging()
    { return isLoggingEnabled; }

    /**
     * Ensures that logs are flushed when the script ends.
     */
    function onScriptEnd()
    { flushLogs(); }

    // Attempt to attach the flushLogs function to the script's shutdown event using Java's Runtime and ShutdownHook
    try
    {   if (typeof java !== 'undefined' && java.lang && java.lang.Runtime)
        {   let runtime = java.lang.Runtime.getRuntime();
            runtime.addShutdownHook(new java.lang.Thread({
                run: onScriptEnd
            }));
        }
    }
    catch (e)
    { /* If adding a shutdown hook fails, do nothing. Users should manually call flushLogs if necessary. */ }

    // Create singleton instance
    let _loggingUtilsInstance =
    {   initializeLogging : initializeLogging,
        logMessage        : logMessage,
        setLoggingMode    : setLoggingMode,
        isLogging         : isLogging,
        logObject         : logObject,
        LOG_LEVELS        : LOG_LEVELS,
        flushLogs         : flushLogs,            // Expose flushLogs for manual flushing if needed
        setCurrentLogLevel: setCurrentLogLevel,   // Method to set the current log level
        getCurrentLogLevel: getCurrentLogLevel    // Method to get the current log level
    }

    return _loggingUtilsInstance;
})();
