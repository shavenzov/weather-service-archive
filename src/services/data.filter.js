/**
 * DataFilter implements static methods for data filtering
 * @public
 * @class
 */
export default class DataFilter{

    /**
     * Filter data on fromDate to toDate interval
     * @static
     * @param {Array} data 
     * @param {Date} fromDate 
     * @param {Date} toDate
     * @param {Array} - filtered data 
     */
    static onInterval( data, fromDate = null, toDate = null ){
        
        if ( ( fromDate == null ) && ( toDate == null ) ){
            return data.slice();
        }

        return data.filter( el => {
                    
            const fromCheck = fromDate ? el.t.getTime() >= fromDate.getTime() : true; //include fromDate
            const toCheck = toDate ? el.t.getTime() < toDate.getTime() : true; //not include toDate

            return fromCheck && toCheck; 
        } )
    }

}