import Worker from './graph.worker';

/**
 * Graph component implementation
 * @public
 * @class
 */
export default class Graph{

    /**
     * The class constructor
     * @param {string} container_id - The id attribute value of container 
     */
    constructor( container_id ){
        
        this.labelFontSize = 16;
        this.fontSetings = `${16}px Roboto`;
        this.axisStrokeStyle = "grey";
        this.graphStrokeStyle = "grey";

        this.fromDate = null;
        this.toDate = null;

        this.graphWorker = null;
        this._data = null;
        this.meanMinValue = null;
        this.meanMaxValue = null;
        this.minValue = null;
        this.maxValue = null;

        this.drawFn = ( event ) => this.draw( event );

        this.canvas = document.getElementById( container_id );
        this.ctx = this.canvas.getContext('2d');

        this.tid = -1;

        window.addEventListener('resize', () => {
            
            if ( this.tid  !== -1 ){
                clearTimeout( this.tid );
                this.tid = -1;
            }

            this.tid = setTimeout( () => {
                this.tid = -1;
                this.redraw();
            }, 200 )

            this.updateCanvasSize();
            
          });

        this.updateCanvasSize();  
    }

    /**
     * Getter gets current data to draw
     * @public
     * @return {array} - array of data or null 
     */
    get data(){
        return this._data;
    }

    /**
     * Setter sets data to draw
     * @public
     * @param {array} - array of data
     */
    set data( data ){
        this._data = data;
        this.meanMinValue = null;
        this.meanMaxValue = null;
        this.minValue = null;
        this.maxValue = null;

        this.fromDate = data[ 0 ].t;
        this.toDate = data[ data.length - 1 ].t;

        this.redraw();
    }

    /**
     * Getter returns "true" if graph is redrawing now or "false" if not
     * @public
     * @returns {boolean} 
     */
    get isRedrawing(){
        return this.graphWorker !== null;
    }

    /**
     * Returns components width
     * @public
     * @returns {number}
     */
    get width(){
       return this.canvas.width;
    }

    /**
     * Returns components height
     * @public
     * @returns {number}
     */
    get height(){
       return this.canvas.height;
    }

    /**
     * Starts worker calculation
     * @private
     */
    startWorker(){
        if ( this._data ){
            this.graphWorker = new Worker();
            this.graphWorker.postMessage( { graphWidth: this.width, meanMinValue: this.meanMinValue, meanMaxValue: this.meanMaxValue, data: this._data } );
            this.graphWorker.addEventListener( 'message', this.drawFn );
        }
    }

    /**
     * Stops worker calculation
     * @private
     */
    stopWorker(){
        if ( this.graphWorker ){
            this.graphWorker.removeEventListener( 'message', this.drawFn );
            this.graphWorker.terminate();
        }
    }

    /**
     * Updates canvas size based on canvas container size
     * While initialization or window resize
     * @private
     */
    updateCanvasSize(){
        
        const parent = this.canvas.parentNode;
        const cs = window.getComputedStyle( parent );
        const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        const paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        const borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

        // Element width and height minus padding and border
        this.canvas.width = parent.offsetWidth - paddingX - borderX;
        this.canvas.height = parent.offsetHeight - paddingY - borderY;
    }

    /**
     * Starts redrawing process
     * @private
     */
    redraw(){
        this.stopWorker();
        this.startWorker();

        console.log( 'redraw', this.width, this.height );
    }

    /**
     * Graph worker message callback
     * @private
     * @param {object} data - graph worker calculation info
     * @param {string} data.type - type of event worker "progress" or "done"
     * @param {number} data.meanMinValue - mean min data value for graph drawing
     * @param {number} data.meanMaxValue - mean max data value for graph drawing
     * @param {number} data.minValue - min data value
     * @param {number} data.maxValue - max data value
     * @param {object} data.drawInfo - calculated draw information
    */
    draw( { data: { type, meanMinValue, meanMaxValue, minValue, maxValue, drawInfo } } ){
        
        if ( type === "done" ){
            
            this.graphWorker.removeEventListener( 'message', this.drawFn );
            this.graphWorker = null; 

            this.meanMinValue = meanMinValue;
            this.meanMaxValue = meanMaxValue;
            this.minValue = minValue;
            this.maxValue = maxValue;

            this.ctx.clearRect( 0, 0, this.width, this.height );

            this.drawAxes( drawInfo );

            this.ctx.lineWidth = 2.0;
            this.ctx.strokeStyle = this.graphStrokeStyle;
            this.ctx.beginPath();
            
            drawInfo.forEach( info => {
              
                if ( info.graphX === 0 ){
                    this.ctx.moveTo( info.graphX, this.calcY( info.v ) );
                }

                this.ctx.lineTo( info.graphX, this.calcY( info.v ) );
                
            });

            this.ctx.stroke();
        }

    }

    /**
     * Converts data value to Y value on graph
     * @private
     * @param {number} value - data value
     * @returns {number} - Y value on graph  
     */
    calcY( value ){
       
        const height = ( this.meanMinValue < 0 ) && ( this.meanMaxValue > 0 ) ? this.height / 2 : this.height;
        const max = Math.max( Math.abs( this.meanMinValue ), Math.abs( this.meanMaxValue ) );
        
        if ( value > 0 ){
            return height - ( value * height / max );
        }

        return height + Math.abs( value ) * height / max;
    }

    /**
     * Draw graph axes and labels
     * @private
     */
    drawAxes(){
        
        this.ctx.lineWidth = 1.0;
        this.ctx.strokeStyle = this.axisStrokeStyle;
        this.ctx.font = this.fontSetings;

        //Draw the Y axis bellow
        if ( ( this.meanMinValue >= 0 ) && ( this.meanMaxValue > 0 ) ){

            this.ctx.beginPath();
            
            //draw X axis
            this.ctx.moveTo( 0, this.height);
            this.ctx.lineTo( this.width, this.height );

            //draw Y axis
            this.ctx.moveTo( 0, this.height );
            this.ctx.lineTo( 0, 0 );
            
            this.ctx.stroke();

            //draw maxValue
            this.ctx.fillText( this.formatValue( this.maxValue ), 8, this.labelFontSize );
            //draw date interval
            let dateText = this.formatDate( this.fromDate ) + ' - ' + this.formatDate( this.toDate );
            let tm = this.ctx.measureText( dateText );

            this.ctx.fillText( dateText, this.width - tm.width - 8, this.labelFontSize );

            return;
        }

        //Draw the Y axis at the top
        if ( ( this.meanMinValue < 0 ) && ( this.meanMaxValue <= 0 ) ){

            this.ctx.beginPath();
            
            //draw X axis
            this.ctx.moveTo( 0, 0 );
            this.ctx.lineTo( 0, this.height );

            //draw Y axis
            this.ctx.moveTo( 0, this.height );
            this.ctx.lineTo( 0, 0 );
            
            this.ctx.stroke();

             //draw minValue
             this.ctx.fillText( this.formatValue( this.minValue ), 8, this.height );
             //draw date interval
             let dateText = this.formatDate( this.fromDate ) + ' - ' + this.formatDate( this.toDate );
             let tm = this.ctx.measureText( dateText );
 
             this.ctx.fillText( dateText, this.width - tm.width - 8, this.height - 2 );

            return;
        }

        //Draw the Y axis at the center
        if ( ( this.meanMinValue < 0 ) && ( this.meanMaxValue > 0 ) ){

            const halfHeight = this.height / 2;
            
            this.ctx.beginPath();

            //draw X axis
            this.ctx.moveTo( 0, halfHeight);
            this.ctx.lineTo( this.width, halfHeight );
            
            //draw Y axis
            this.ctx.moveTo( 0, this.height );
            this.ctx.lineTo( 0, 0 );
            this.ctx.stroke();

            //draw maxValue
            this.ctx.fillText( this.formatValue( this.maxValue ), 8, this.labelFontSize );
            //draw minValue
            this.ctx.fillText( this.formatValue( this.minValue ), 8, this.height );
            //draw date interval
            let dateText = this.formatDate( this.fromDate ) + ' - ' + this.formatDate( this.toDate );
            let tm = this.ctx.measureText( dateText );

            this.ctx.fillText( dateText, this.width - tm.width - 8, this.height - 2 );
        }

    }

    /**
     * Formats value. Rounds value if necessary to two numbers after comma
     * @private
     * @param {number} value 
     */
    formatValue( value ){
        const fixedValue = value.toFixed( 2 );
        const split = fixedValue.split( '.' );
        const whole = split[ 0 ];
        const decimal = split[ 1 ];

        if ( ( decimal[ 0 ] === "0" ) && ( decimal[ 1 ] === "0" ) ) {
            return whole;
        }

        if ( decimal[ 1 ] === "0" ){
            return `${whole}.${decimal[0]}`;
        }

        return fixedValue;
    }

    /**
     * Formats Date as `${day} ${month}. ${year} г.`
     * @private
     * @param {Date} date 
     */
    formatDate( date ){
        
        const months = [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ];
        
        let day = date.getDate();

        if ( day < 10 ){
            day = `0${day}`;
        }

        let month = months[ date.getMonth() ];
        let year = date.getFullYear();

        return `${day} ${month}. ${year} г.`;
    }

}