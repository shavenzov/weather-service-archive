/**
 * Aside section chooser component implementation
 * @public
 * @class
 */
export default class Aside {

    /**
     * The class constructor
     * @param {string} container_id - The id attribute value of container 
     */
    constructor( container_id ){
        
        this.SELECTED_CLASS_NAME = "selected";

        //Component's container
        this.container = document.getElementById( container_id );
        
        //Aside buttons
        this.buttons = this.container.getElementsByTagName( "button" );

        //Id of current selected section
        this._selectedId = this.buttons[ 0 ].dataset.id;
        
        this.setSelection( this._selectedId );

        for ( let i = 0; i < this.buttons.length; i ++ ){
            this.buttons[ i ].addEventListener( "click", event => this.onButtonClick( event ) );
        }

        //callback calls then a user selecting another section
        //example : onchange = ( id : string ) => {}
        //where id is id of selected section
        this.onchange = null;
    }

    /**
     * Getter returns the Id of selected section
     * @public
     * @returns {string}
     */
    get selectedId(){
        return this._selectedId;
    }

    /**
     * Setter sets the id of selected section
     * @public
     * @param {string} id
     */
    set selectedId( id ){
        
        if ( this._selectedId !== id ){
            this._selectedId = id;
            this.setSelection( id );

            if ( this.onchange ){
                this.onchange( this._selectedId );
            }
        }

    }

    /**
     * Set buttons selection matching section id
     * @private
     * @param {string} id - section id 
     */
    setSelection( id ){

        for ( let i = 0; i < this.buttons.length; i ++ ){
        
            const button = this.buttons[ i ];
            const selectedButton = id === button.dataset.id;
            const classNames = button.className.split( ' ' );
            const selectedClassIndex = classNames.indexOf( this.SELECTED_CLASS_NAME );

            if ( selectedClassIndex !== -1 ){
                classNames.splice( selectedClassIndex, 1 );
            }

            if ( selectedButton ){
                classNames.push( this.SELECTED_CLASS_NAME );
            }

            button.className = classNames.join( ' ' );
        }

    }

    /**
     * Event callback fired when a user clicks on one of section buttons 
     * @param {MouseEvent} event 
     */
    onButtonClick( event ){
        this.selectedId = event.target.dataset.id;
    }

}