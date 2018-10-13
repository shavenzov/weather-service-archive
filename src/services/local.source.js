import DateParser from './date.parser';

/**
 * Implements methods to store and get data from IndexedDB
 * @public
 * @class
 */
export default class LocalSource{

    /**
     * The class constructor
     */
    constructor(){
        this.DB_NAME = 'weather';
        this.TEMPERATURE_STORE = 'temperature';
        this.PRECIPITATION_STORE = 'precipitation';

        // check for prefix existence.
        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }

    /**
     * Opens DB and returns a Promise
     * @private
     * @returns {Promise<IDBDatabase>}
     */
    open(){
        return new Promise( ( resolve, reject ) => {

            const request = this.indexedDB.open( this.DB_NAME, 1 );
              
            request.onupgradeneeded = () => {
                request.result.createObjectStore( this.TEMPERATURE_STORE, { keyPath: 'time' } );
                request.result.createObjectStore( this.PRECIPITATION_STORE, { keyPath: 'time' } );           
            }
              
            request.onsuccess = () => {
                resolve( request.result );
            }
        
            request.onerror = () => {
               reject( request.error );    
            }

        } );
    }

    /**
     * Adds temperature data to DB
     * @public
     * @param {Array} data - data to add
     * @returns {Promise<null>} 
     */
    addTemperature( data ){
        return this.addData( this.TEMPERATURE_STORE, data );
    }

    /**
     * Adds precipitation data to DB
     * @public
     * @param {Array} data - data to add
     * @returns {Promise<null>} 
     */
    addPrecipitation( data ){
       return this.addData( this.PRECIPITATION_STORE, data );
    }

    /**
     * Adds data to DB
     * @private
     * @param {string} storeName - store name "temperature" or "precipitation"
     * @param {Array} data - data to add
     * @returns {Promise<null>} 
     */
    addData( storeName, data ){
        
        return new Promise( ( resolve, reject ) => {
            
            this.open().then( db => {
                
               const transaction = db.transaction( storeName, "readwrite" );
               const objectStore = transaction.objectStore( storeName );
               
               /*
                Dividing data by month and writing to object store
               */
               let key = DateParser.serializeYearMonth( data[0].t ); //create "year_month" key
               let startDate = data[ 0 ].t;
               let row = [];

               for( let i = 0; i < data.length; i ++ ){
                 let el = data[ i ];
                 let newKey = DateParser.serializeYearMonth( el.t ); //create "year_month" newKey

                 if ( key === newKey ){
                    row.push( {
                        ...el,
                        t: DateParser.serialize( el.t )
                    } ) 
                }
                else {

                    if ( row.length > 0 ) {
                        objectStore.add( {
                                time: startDate.getTime(),
                                data: row
                            } )  
                    }

                    row = [ {
                        ...el,
                        t: DateParser.serialize( el.t )
                    } ];

                    key = newKey;
                    startDate = el.t;
                 }
               }

               if ( row.length > 0 ){       
                    objectStore.add( {
                        time: startDate.getTime(),
                        data: row
                    } )
               }

               transaction.oncomplete = () => {
                console.log( 'complete' );
                resolve();
               }

               transaction.onabort = () => {
                  reject( transaction.error );
               }

               transaction.onerror = () => {
                 reject( transaction.error );
               }

            } ).catch( error => {
                reject( error );
            } )
            
        } )

    }

    /**
     * Requests precipitation data for interval of dates
     * @public
     * @param {Date} fromDate 
     * @param {Date} toDate
     * @returns {Promise<Array>} - Promise of requested data 
     */
    getPrecipitation( fromDate = null, toDate = null ){
        return this.getData( this.PRECIPITATION_STORE, fromDate, toDate );
    }

    /**
     * Requests temperature data for interval of dates
     * @public
     * @param {Date} fromDate 
     * @param {Date} toDate
     * @returns {Promise<Array>} - Promise of requested data 
     */
    getTemperature( fromDate = null, toDate = null ){
       return this.getData( this.TEMPERATURE_STORE, fromDate, toDate );
    }

    /**
     * Requests data for interval of dates
     * @private
     * @param {storeName} storeName - store name "temperature" or "precipitation"
     * @param {Date} fromDate 
     * @param {Date} toDate
     * @returns {Promise<Array>} - Promise of requested data 
     */
    getData( storeName, fromDate, toDate ){
        return new Promise( ( resolve, reject ) => {
            
            this.open().then( db => {
               const transaction = db.transaction( storeName, "readonly" );
               const objectStore = transaction.objectStore( storeName );
               
               let data = [];

               let keyRange = null;

               if ( fromDate && toDate ){
                    //include fromDate, not include toDate   
                    keyRange = IDBKeyRange.bound( fromDate.getTime(), toDate.getTime(), false, true );
               }
               else if ( fromDate ) {
                   keyRange = IDBKeyRange.lowerBound( fromDate.getTime() ); //include fromDate
               }
               else if ( toDate ) {
                   keyRange = IDBKeyRange.upperBound( toDate.getTime(), true ); //not include toDate
               }

                let request = objectStore.openCursor( keyRange );

                request.onsuccess = () => {
                 const cursor = request.result;
                 if(cursor) {
                   data.push( cursor.value );  
                   cursor.continue();
                 } 
                }

               transaction.oncomplete = () => {
                
                data = data.reduce( ( accumulator, currentValue ) => {
                    return accumulator.concat( currentValue.data.map( el => {
                       return {
                           ...el,
                           t: DateParser.deserialize( el.t )
                       } 
                    } ) )
                }, [] );

                console.log( 'complete' );
                resolve( data );
               }

               transaction.onabort = () => {
                  reject( transaction.error );
               }

               transaction.onerror = () => {
                  reject( transaction.error );
               }
               
            } )
          }
       )
    }

    /**
     * Checks if indexedDB supported by browser
     * @public
     * @returns {boolean}
     */
    get isSupported(){
        return this.indexedDB != null;
    }

}