/**
 * The graph worker transforms original data to draw graph instructions
 * @param {object} data - start parameters for calculation
 * @param {number} data.graphWidth - graph's canvas width
 * @param {number} data.meanMinValue - mean min data value for graph drawing
 * @param {number} data.meanMaxValue - mean max data value for graph drawing
 * @param {number} data.minValue - min data value
 * @param {number} data.maxValue - max data value
 * @param {array} data.data - data for transformation
 */

onmessage = ( { data: { graphWidth, meanMinValue, meanMaxValue, minValue, maxValue, data } } ) => {

  //Calculate min and max value if neccessary
  if ( ( minValue == null ) || ( maxValue == null ) ){
    minValue = null;
    maxValue = null;

    data.forEach( el => {
      minValue = minValue == null ? el.v : Math.min( minValue, el.v );
      maxValue = maxValue == null ? el.v : Math.max( maxValue, el.v );
    } )
  }

  const drawInfo = [];

  //Calculate now many data samples per one pixel
  const numSamplesPerPixel = data.length / graphWidth;
  let prevSampleStart = null;
  let prevSampleEnd = null;

  //Loop through all graph pixels
  for( let x = 0; x < graphWidth; x ++ ){

    //Array of samples per current pixel
    const pixelSamples = [];
    //Array of time per current pixel
    const timeIntervalsPerPixel = [];
    //Start copy index from data
    let sampleStart = x * numSamplesPerPixel;
    //How many samples to copy
    const sampleLength = Math.min( numSamplesPerPixel, data.length - sampleStart );
    //End copy index from data
    let sampleEnd = sampleStart + sampleLength - 1;

    sampleStart = Math.floor( sampleStart );
    sampleEnd = Math.floor( sampleEnd );

    if ( sampleStart >= sampleEnd ){
      sampleEnd = sampleStart + 1;
    }

    //data.length < graphWidth when we need skip some pixels
    if ( ( sampleStart === prevSampleStart ) && ( sampleEnd === prevSampleEnd ) ){
      continue;
    }

    data.slice( sampleStart, sampleEnd ).forEach( ( value ) => {
      pixelSamples.push( value.v );
      timeIntervalsPerPixel.push( value.t );
    } )

    //Calculate average value per current pixel
    const averageValue = pixelSamples.reduce( ( accumulator, currentValue ) => accumulator + currentValue, 0 ) / pixelSamples.length;
     
    //Push darw info per pixel
    drawInfo.push( {
      v: averageValue,
      t: timeIntervalsPerPixel,
      graphX: x
    } );

    /* postMessage( {
      type: "progress",
      v: averageValue,
      t: timeIntervalsPerPixel,
      graphX: x,
      meanMinValue,
      meanMaxValue,
      minValue,
      maxValue
    } ); */

    prevSampleStart = sampleStart;
    prevSampleEnd = sampleEnd;
  }
  
  //if meanMinValue or meanMaxValue not specified then calculate them
  if ( ! ( meanMinValue || meanMaxValue ) ){
    drawInfo.forEach( ( value ) => {
      meanMinValue = meanMinValue == null ? value.v : Math.min( value.v, meanMinValue ) ;
      meanMaxValue = meanMaxValue == null ? value.v : Math.max( value.v, meanMaxValue );
    } )
  }

  //Send "done" message
  postMessage( { type: "done", meanMinValue, meanMaxValue, minValue, maxValue, drawInfo } );
}

 
