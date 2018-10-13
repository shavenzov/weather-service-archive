/**
 * DateParser implements static methods for Date serialization/deserialization
 * @public
 * @class
 */
export default class DateParser{

    /**
     * Deserializes date string to Date js Object
     * @static
     * @param {string} dateStr - date string as YEAR-MONTH-DAY. For example: 2006-12-30
     * @returns {Date} js object
     */
    static deserialize( dateStr ){
        return new Date( dateStr );
    }

    /**
     * Serializes Date js object to date string as YEAR-MONTH-DAY. For example: 2006-12-30 
     * @static
     * @param {Date} date - js Date
     * @returns {string} - date string 
     */
    static serialize( date ){
        let numOfDay = date.getDate();

        if ( numOfDay < 10 ){
            numOfDay = `0${numOfDay}`;
        }

        return `${DateParser.serializeYearMonth( date )}-${numOfDay}`;
    }

    /**
     * Serializes Date js object to date string as YEAR-MONTH. For example: 2006-12 
     * @static
     * @param {Date} date - js Date
     * @returns {string} - date string 
     */
    static serializeYearMonth( date ){
        let month = date.getMonth() + 1;

        if ( month < 10 ){
            month = `0${month}`;
        }

        return `${date.getFullYear()}-${month}`;
    }

}