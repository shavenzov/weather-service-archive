import Graph from './graph/graph';
import Navigation from './navigation/navigation';
import Aside from './aside/aside';
import DataSource from '../services/data.source';

/**
 * Application component implementation
 * @public
 * @class
 */
export default class Application{

    /**
     * The class constructor
     */
    constructor(){
        
        //Create data source service
        this.dataSource = new DataSource();

        //Create graph ui component
        this.graph = new Graph( "graph" );

        //create aside ui component
        this.aside = new Aside( "aside" );
        this.aside.onchange = id => this.asideOnChange( id );

        //create navigation ui component
        this.navigation = new Navigation( "navigation" );
        this.navigation.onintervalchanged = interval => this.navigationIntervalChanged( interval );

        this.loadData();
    }

    /**
     * Calls when navigation interval changed by a user
     * @private
     * @param {Date} interval.fromDate
     * @param {Date} interval.toDate 
     */
    navigationIntervalChanged( interval ){
        this.loadData( this.aside.selectedId, interval.fromDate, interval.toDate );
    }

    /**
     * Calls when aside section changed
     * @private
     * @param {string} id - current aside section id
     */
    asideOnChange( id ){
        this.loadData( id );
    }

    /**
     * Loads data for apropriate section
     * @private
     * @param {string} sectionId 
     * @param {Date} fromDate 
     * @param {Date} toDate 
     */
    loadData( sectionId = "temperature", fromDate = null, toDate = null ){

        const sourceMethod = sectionId === "temperature" ? this.dataSource.getTemperature : this.dataSource.getPrecipitation;

        sourceMethod.call( this.dataSource, fromDate, toDate ).then( ( { data, fromCache, caching } ) => {
            
            //set data to graph to draw it
            this.graph.data = data;
            
            //Update navigation interval if all data requested
            if ( ( fromDate == null ) && toDate == null ){
                this.navigation.setData( data );
            } 

        } ).catch( error => console.log( 'error', error ) )

    }

}