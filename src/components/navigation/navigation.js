/**
 * Year interval selector component implementation
 * @public
 * @class
 */
export default class Navigation{

    /**
     * The class constructor
     * @param {string} container_id - The id attribute value of container 
     */
    constructor( container_id ){
        
        //Component's container
        this.container = document.getElementById( container_id ); 
        
        const elements = this.container.getElementsByTagName( "select" );

        //From date ui selector
        this.fromUILIst = elements[ 0 ];
        this.fromUILIst.addEventListener( "change", event => this.onSelectedIntervalChanged( event ) ); 

        //To date ui selector
        this.toUIList = elements[ 1 ];
        this.toUIList.addEventListener( "change", event => this.onSelectedIntervalChanged( event ) );

        //Array of all possible years [{ {string} label, {Date} value }]
        this.interval = null;
        //Selected from date
        this.fromDate = null;
        //Selected to date
        this.toDate = null;

        //callback calls when a user selects year from select controls
        //example: onintervalchanged = ( { fromDate: Date, toDate: Date } ) => {}
        this.onintervalchanged = null;
    }

    /**
     * Calls when a user selects value from one of selectors
     * @private
     * @param {Event} event 
     */
    onSelectedIntervalChanged( event ){
        const selectUI = event.currentTarget;
        const date = new Date( parseInt( selectUI.options[ selectUI.selectedIndex ].value ) );

        if ( selectUI === this.fromUILIst ){
            this.fromDate = date;
        }
        else if ( selectUI === this.toUIList ){
            this.toDate = date;
        }

        //swap dates if fromDate > toDate
        if ( this.fromDate.getTime() > this.toDate.getTime() ){
            [ this.fromDate, this.toDate ] = [ this.toDate, this.fromDate ];
        }

        this.updateSelection();

        //Call onintervalchanged callback
        if ( this.onintervalchanged ){
            this.onintervalchanged( { fromDate: this.fromDate, toDate: this.toDate } );
        }
    }

    /**
     * Update selection of select controls based on fromDate and toDate values.
     * Disable option items that user must not select
     * @private
     */
    updateSelection(){
        const fromTime = this.fromDate.getTime().toString();
        const toTime = this.toDate.getTime().toString();

        for (var i = 0; i < this.fromUILIst.options.length; i++) {
            let option = this.fromUILIst.options[ i ];
                option.selected = fromTime === option.value;
                option.disabled = toTime === option.value;

                option = this.toUIList.options[ i ];
                option.selected = toTime === option.value;
                option.disabled = fromTime === option.value;
        }
    }

    /**
     * Create options for select controls based on year's interval
     * @private
     */
    populateOptions(){

        while ( this.fromUILIst.firstChild ) {
            this.fromUILIst.removeChild( this.fromUILIst.firstChild );
        }

        while ( this.toUIList.firstChild ) {
            this.toUIList.removeChild( this.toUIList.firstChild );
        }

        if ( this.interval && this.interval.length > 0 ){
            
            this.fromDate = this.interval[ 0 ].value;
            this.toDate = this.interval[ this.interval.length - 1 ].value;

            for( let i = 0; i < this.interval.length; i ++ ){
                
                const item = this.interval[ i ];
                const isFirstItem = i === 0;
                const isLastItem = i === this.interval.length - 1;

                const el = document.createElement("option");
                      el.textContent = item.label;
                      el.value = item.value.getTime();
                      el.selected = isFirstItem; //select first element
                      el.disabled = isLastItem; //disable last element

                const clonnedEl = el.cloneNode( true );
                      clonnedEl.selected = isLastItem; //select last element
                      clonnedEl.disabled = isFirstItem; //disable first element       

                this.fromUILIst.appendChild( el );
                this.toUIList.appendChild( clonnedEl ); 
            } 
        }
    } 

    /**
     * Sets data to generate year's interval and update select components
     * @public
     * @param {Array} data 
     */
    setData( data ){
        
        this.fromDate = null;
        this.toDate = null;

        if ( data && data.length > 0 ){
            let lastYear = data[ 0 ].t.getFullYear();
      
            this.interval = [ { label: lastYear, value: data[ 0 ].t } ]

            data.forEach( el => {

                const year = el.t.getFullYear();

                if ( year !== lastYear ){
                    this.interval.push( { label: year, value: el.t } );
                    lastYear = year;
                }

            } );

            const endYear = this.interval[ this.interval.length - 1 ].label + 1;
            this.interval.push( { label: endYear, value: new Date( endYear, 0, 1 ) } );

        }
        else{
            this.interval = null;
        }

        this.populateOptions();
    }

}