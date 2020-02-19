/*jshint esversion: 6 */

var configs = {
  'DE':'Death','LT':'Life-Threatening',
  'HO':'Hospitalisation','DS':'Disability',
  'CA':'Congenital Anomaly','RI':'Required Intervention',
  'OT':'Other Serious','NA':'NA'
};

var confs = {
  'MD': 'Physician',
  'PH': 'Pharmacist',
  'OT': 'Other health-professional',
  'LW': 'Lawyer',
  'CN': 'Consumer',
  'NA': 'NA'
};

var colors = ['#1A9850', '#FFFFBF', '#F53F36'];

let $legend = $('script.legend');

function URL(){
  let _url = g1.url.parse(location.href);
  return _url;
}

function updateURL(obj) {
  let _url = URL();
  _url.update(obj);
  history.pushState({}, '', '?' + _url.search);
  draw();
}

$("input[name=view]").on('change', function(e){
  let selected = $(e.currentTarget).val();
  updateURL({'view': selected});
});

$('.yearpicker').on('changed.bs.select', function (e) {
  let selected = $(e.currentTarget).val();
  updateURL({'Year': selected});
});

const components = {
  'day-wise-events': {dataurl: 'day-wise-events-data', chartfunc: draw_day_wise},
  'manufacturer-wise-events': {dataurl: 'manufacturer-wise-data', chartfunc: draw_mfr_view},
  'serious-events-report': {dataurl: 'serious-events-data', chartfunc: draw_serious}
};

function draw(){
  let curr_page = currentpage || 'day-wise-events';
  $.getJSON(`${components[curr_page].dataurl}?${URL().search}`, function(data){
    components[curr_page].chartfunc(data);
  }).fail(function(){
    console.log("Failed!");
  });
}

function draw_mfr_view(data){
  $('#data-table').DataTable().destroy();
  let colors = ['#FBF7AB', '#F68336', '#F53F36'];
  let _cols = _.keys(data[0]).filter(d => ["mfr_sndr", "Total"].indexOf(d) < 0);
  let values = _.flatten(_.map(data, d => _.values(_.pickBy(d, _.isNumber))));
  let min = _.min(values);
  let max = quantile(values, 99);
  let median = (min+max)/2;
  let calcs = {
    'min': min, 'median': median, 'max': max
  };
  let $mfrtable = $('script.mfr-table');
  $mfrtable.template({
    'data': data, 'cols': _cols,
    'gradient': linearGradient([min, median, max], colors)
  });
  $('#data-table').DataTable();
  $legend.template({'colors': colors, 'calcs': calcs, 'subtext': ['Min. Count', '99 percentile count']});
}

function draw_serious(data) {
  data = {
    name: "root",
    children: data.map(d => {
      return {
        name: d.dim,
        value: d.total_report,
        color: d.percentage
      };
    })
  };
  const tree = new treeMap(
    document.querySelector('#chart'),
    data,
    {'colors': linearGradient([0, 0.5, 1], colors)}
  );
  $legend.template({'colors': colors, 'calcs': {min: 0, median: 0.5, max: 1}, 'subtext': ['', '']});
}

function draw_day_wise(data){
  let datavalues = data.map(d => d['No. of Event']);
  let min = _.min(datavalues)
  let max = quantile(datavalues, 99);
  let med = median(datavalues);
  let calcs = {'min': min, 'median': med, 'max': max};
  let year = URL().searchList.Year || 2018;
  calendarMap(d3.select('#chart'), data, {
    "year": year,
    "colors": linearGradient(_.values(calcs), colors)
  });
  $legend.template({'colors': colors, 'calcs': calcs, 'subtext': ['Min Count', '99 Percentile Count']});
}

draw();
$(window).on('popstate', draw);
