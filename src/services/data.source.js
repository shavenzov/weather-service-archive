import LocalSource from './local.source';
import RemoteSource from './remote.source';
import DataFilter from './data.filter';

/**
 * Data source service implementation.
 * Unions local source and remote source.
 * First gets data from RemoteSource and caches it to LocalSource.
 * Next gets data from RemoteSource and caches it in memory.
 * @public
 * @class
 */
export default class DataSource{

    /**
     * The class constructor
     */
    constructor(){
        this.localSource = new LocalSource();
        this.remoteSource = new RemoteSource();

        this.temperature = null;
        this.precipitation = null;
    }

    /**
     * Loads precipitation data for date interval
     * @public
     * @param {Date} fromDate 
     * @param {Date} toDate 
     * @returns {Promise<Object>} response - requested data Promise
     * @returns {Array} response.data - requested data
     * @returns {boolean} response.fromCache - is data from cache or not
     * @returns {Promise} response.caching - if data is caching to LocalStorage now then process Promise or null
     */
    getPrecipitation( fromDate = null, toDate = null ){

        return new Promise( ( resolve, reject ) => {
            
            //If we have data in memory return it
            if ( this.precipitation ){
              resolve( { data: DataFilter.onInterval( this.precipitation, fromDate, toDate ),
                         fromCache: true, caching: null  } );
              return;
            }

            const saveAndResolve = ( result ) => {

                //cache to memory
                if ( ( fromDate == null ) && ( toDate == null ) ){
                    this.precipitation = result.data.slice();
                }

                resolve( result );
            } 

            if ( this.localSource.isSupported ){
                //trying to get data from LocalSource
                this.localSource.getPrecipitation( fromDate, toDate ).then( data => {
                    
                    //if we have local data
                    if ( data.length > 0 ){
                        saveAndResolve( { data, fromCache: true, caching: null } );
                        return;
                    }

                    //Else throw error and load data from remote source
                    throw new Error( 'Local source is empty.' );
                    
                } ).catch( error => {
                    this.remoteSource.getPrecipitation( fromDate, toDate ).then( data => {
                        //start caching data to local source
                        const caching = this.localSource.addPrecipitation( data ); 
                        saveAndResolve( { data, fromCache: false, caching } );
                    } ).catch( error => reject( error ) )
                } )
            }
            else { //get data from remote source
                this.remoteSource.getPrecipitation( fromDate, toDate ).then( data => {
                    saveAndResolve( { data, fromCache: false, caching: null } );
                } ).catch( error => reject( error ) )
            }
        } )

    }

     /**
     * Loads temperature data for date interval
     * @public
     * @param {Date} fromDate  
     * @param {Date} toDate
     * @returns {Promise<Object>} response - requested data Promise
     * @returns {Array} response.data - requested data
     * @returns {boolean} response.fromCache - is data from cache or not
     * @returns {Promise} response.caching - if data is caching to LocalStorage now then Promise or null
     */
    getTemperature( fromDate = null, toDate = null ){
        
        return new Promise( ( resolve, reject ) => {
            
            //If we have data in memory return it
            if ( this.temperature ){
                resolve( { data: DataFilter.onInterval( this.temperature, fromDate, toDate ),
                           fromCache: true, caching: null  } );
                return;
            }

            const saveAndResolve = ( result ) => {

                if ( ( fromDate == null ) && ( toDate == null ) ){
                    this.temperature = result.data.slice();
                }

                resolve( result );
            } 

            if ( this.localSource.isSupported ){
                this.localSource.getTemperature( fromDate, toDate ).then( data => {
                    
                    //if we have local data
                    if ( data.length > 0 ){
                        saveAndResolve( { data, fromCache: true, caching: null } );
                        return;
                    }

                    //Else throw error and load data from remote source
                    throw new Error( 'Local source is empty.' );

                } ).catch( error => {
                    this.remoteSource.getTemperature( fromDate, toDate ).then( data => {
                        //start caching data to local source
                        const caching = this.localSource.addTemperature( data );
                        saveAndResolve( { data, fromCache: false, caching } );
                    } ).catch( error => reject( error ) )
                } )
            }

            this.remoteSource.getTemperature( fromDate, toDate ).then( data => {
                saveAndResolve( { data, fromCache: false, caching: null } );
            } ).catch( error => reject( error ) )

        } )

    }

}