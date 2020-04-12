import Highcharts from 'highcharts';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsAnnotations from 'highcharts/modules/annotations';
import HighchartsMap from 'highcharts/modules/map';

let hasBeenInitialized = false;

// wrapper to make sure we only initialize the highcharts component once
function initHighcharts() {
  if (!hasBeenInitialized) {
    HighchartsTreemap(Highcharts);
    HighchartsExporting(Highcharts);
    HighchartsAnnotations(Highcharts);
    HighchartsMap(Highcharts);
    hasBeenInitialized = true;
  }
}

export default initHighcharts;
