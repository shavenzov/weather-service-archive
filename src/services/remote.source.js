import DateParser from './date.parser';
import DataFilter from './data.filter';

/**
 * Implements methods to store and get data from remote server
 * @public
 * @class
 */
export default class RemoteSource{

    /**
     * The class constructor
     */
    constructor(){
        this.TEMPERATURE_ENDPOINT = 'data/temperature.json';
        this.PRECIPITATION_ENDPOINT = 'data/precipitation.json';
    }

    /**
     * Transforms data object. Deserializes t property to Date js object 
     * @private
     * @param {Object} el - object to transform
     * @returns {Object} - transformed object 
     */
    dataTransform( el ){
        return {
            ...el,
            t: DateParser.deserialize( el.t )
        }
    }

    /**
     * Requests precipitation data from remote server
     * @public
     * @param {Date} fromDate 
     * @param {Date} toDate
     * @returns {Promise<Array>} 
     */
    getPrecipitation( fromDate = null, toDate = null ){
        
        const request = fetch( this.PRECIPITATION_ENDPOINT ).then( data => data.json() )
                                                            .then( data => data.map( el => this.dataTransform( el ) ) );          
 
        if ( fromDate || toDate ) {
            return request.then( data => DataFilter.onInterval( data, fromDate, toDate ) );
        }

        return request;
    }

    /**
     * Requests temperature data from remote server
     * @public
     * @param {Date} fromDate 
     * @param {Date} toDate
     * @returns {Promise<Array>} 
     */
    getTemperature( fromDate = null, toDate = null ){
        
        const request = fetch( this.TEMPERATURE_ENDPOINT ).then( data => data.json() )
                                                          .then( data => data.map( el => this.dataTransform( el ) ) );

        if ( fromDate || toDate ) {
            return request.then( data => DataFilter.onInterval( data, fromDate, toDate ) );
        }

        return request;
    }

}