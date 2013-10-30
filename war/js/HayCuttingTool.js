/*
Author: Wenting Zhao ( wentingzhao@ufl.edu )
Version: 2.0, latest updated at 10/29/2013, add function tableControl
Description: This code file define three main functions: dataSeries, dataControl, highchartControl, tableControl

dataSeries is a self defined data structure:
- regulates the basic data format: (stationID, requestTime, and four 7-day data array: temperature, humidity, solar radiation, and rainfall)
- defines the basic data operation: get/set methods, and get display data

dataControl 
- consists of requestData and choiceLoad operations

highchartControl 
- consists of three operations: initialChart(Alachua, Temperature), updateChart, and showReference
function updateView() is triggered by user changing station or parameter view
function showRef() is triggered by reference zone checkbox is checked or unchecked
function startPage() is the initial loaded page
 
tableControl
show past data in the table (4 days)
- input:newData (dataSeries), output: table
*/


function dataSeries() {
	var stationID = 260;
	var requestTime=new Date();
	var temperatureData=new Array();
	var humidityData=new Array();
	var solarradiData=new Array();
	var rainfallData=new Array();
	var localTimeData=new Array();
	
	this.setStationID = function (stationid) {
		stationID = stationid;
	}
	this.getStationID = function () {
		return stationID;
	}

	this.setRequestTime = function (requesttime) {
		requestTime.setTime(requesttime.valueOf());
	}
	this.getRequestTime = function () {
		return requestTime;
	}
	
	this.setTemperatureData = function (tValue) {
		temperatureData = tValue;
	}
	this.getTemperatureData = function () {
		return temperatureData;
	}
	
	this.setHumidityData = function (hValue) {
		humidityData = hValue;
	}
	this.getHumidityData = function () {
		return humidityData;
	}

	this.setSolarradiData = function (sValue) {
		solarradiData = sValue;
	}
	this.getSolarradiData = function () {
		return solarradiData;
	}
	
	this.setRainfallData = function (rValue) {
		rainfallData = rValue;
	}
	this.getRainfallData = function () {
		return rainfallData;
	}
	
	this.setLocalTimeData = function (lValue) {
		localTimeData = lValue;
	}
	this.getLocalTimeData = function () {
		return localTimeData;
	}
	
	this.getCurrentDisplay = function (displayOption) {
		switch (displayOption) {
		case "1":
			return temperatureData;
			break;
		case "2":
			return humidityData;
			break;
		case "3":
			return solarradiData;
			break;
		case "4":
			return rainfallData;
			break;
		default:
			console.error("Incorrect Parameter Choice: "+displayOption);
		}	
	}
}

function dataControl() {
	
	var generateFormattedTimeSeries = function (requesttime) {
		var startDate = new Date(requesttime.valueOf() - 7*24*3600*1000);
		startDate.setHours(0,0,0,0);    //Date.setHours(hour,min,sec,millisec) 
		
		var oneInterval = 3600*1000;	//every 1 hour!!!!
		for (var fmtTimeSeries=[],ms=startDate*1,last=requesttime*1;ms<last;ms+=oneInterval) {
			fmtTimeSeries.push(new Date(ms));
		}
		return fmtTimeSeries;
	}
	
	this.requestData = function (dataseries) {
		//get station ID from dataseries, get JSON
		var data;
		var temperatureData = new Array();
		var humidityData = new Array();
		var solarradiData = new Array();
		var rainfallData = new Array();
		var localTime = new Array();
		var xAxisLabels = new Array();
		var cfConverter;
		var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
		
		var url = "http://test.fawn.ifas.ufl.edu/controller.php/haycutting/hourly/"+dataseries.getStationID();
		$.getJSON(url, function(dataJson) {
			data = dataJson;
		}).done( function() {
			var dateText = reggie.exec(data.request_db_time); 
			var requestTime = new Date(
				(+dateText[1]),
				(+dateText[2])-1, // Careful, month starts at 0!
				(+dateText[3]),
				(+dateText[4]),
				(+dateText[5]),
				(+dateText[6]),
				0
			);
			
			dataseries.setRequestTime(requestTime);
			var formattedTimeArray = new Array();
			formattedTimeArray = generateFormattedTimeSeries(requestTime);
			
			var timeArrayLength = formattedTimeArray.length;
			var tplot = 0;
			var dataSourcePlot = 0;
					
			for (tplot=0; tplot<timeArrayLength; tplot++) {
				
				if(formattedTimeArray[tplot].getHours()==0&&formattedTimeArray[tplot].getMinutes()==0) {
					xAxisLabels = formattedTimeArray[tplot].toDateString();
				}
				else {
					xAxisLabels = formattedTimeArray[tplot].toString();
				}
				
				if(dataSourcePlot < data.data.length) {
					dateText = reggie.exec(data.data[dataSourcePlot].local_time);
					localTime[dataSourcePlot] = new Date(
						(+dateText[1]),
						(+dateText[2])-1,
						(+dateText[3])
					);
					localTime[dataSourcePlot].setHours(dateText[4],dateText[5],dateText[6],0);
					
					if(formattedTimeArray[tplot].valueOf()==localTime[dataSourcePlot].valueOf()) {
						// cfConverter=parseFloat(data.data[dataSourcePlot].t2m_f_hourly_avg);
// 						var precision =(cfConverter*1.8+32).toFixed(2);
// 						temperatureData[tplot] = parseFloat(precision);
						var precision =(parseFloat(data.data[dataSourcePlot].t2m_f_hourly_avg)).toFixed(2);
						temperatureData[tplot] = parseFloat(precision);
						 // = precision.toFixed(2);
						//Convert temperature data of Celsius into Fahrenheit
						
						humidityData[tplot]=parseFloat(data.data[dataSourcePlot].rh_pct_hourly_avg);
						solarradiData[tplot]=parseFloat(data.data[dataSourcePlot].rfd_wm2_hourly_avg);
						rainfallData[tplot]=parseFloat(data.data[dataSourcePlot].rain_inch_hourly_sum);
						
						dataSourcePlot+=1;	
					}
					
					else {
						temperatureData[tplot]=null;						
						humidityData[tplot]=null;
						solarradiData[tplot]=null;
						rainfallData[tplot]=null;
					}
				}
				
				else {
					temperatureData[tplot]=null;						
					humidityData[tplot]=null;
					solarradiData[tplot]=null;
					rainfallData[tplot]=null;
				}
				
				formattedTimeArray[tplot] = xAxisLabels;
			}
			
			dataseries.setTemperatureData(temperatureData);
			dataseries.setHumidityData(humidityData);
			dataseries.setSolarradiData(solarradiData);
			dataseries.setRainfallData(rainfallData);
			dataseries.setLocalTimeData(formattedTimeArray);
			
			// console.log("the temperaturedata is"+dataseries.getTemperatureData());
			
		});
	}
		
	
	this.choiceLoad = function () {
		$.getJSON("http://test.fawn.ifas.ufl.edu/controller.php/stationsJson/", function(data) {
			var stationId=Object.keys(data);
			var stationArray=new Array();
			for (var i=0; i<stationId.length; i++) {
				var station = new Array();
				station['stationkey']=stationId[i];
				station['stationname']=data[stationId[i]].display_name;
				stationArray[i]=station;
			}
		
			stationArray.sort(function(a, b) {return compare(a['stationname'],b['stationname'])});
		
			for ( var i = 0; i < stationArray.length; i++) {
				$("#stationList").append(
						$('<option></option>')
								.val(stationArray[i]['stationkey']).html(
										stationArray[i]['stationname']));
			}

		});
		//tool functions
		function compare(a,b) {
			if (a < b) return -1;
			else if (a > b) return 1;
			else return 0;
		}
	}
	
}

function highchartControl() {
	this.initialChart = function (dataseries) {
		
		var chart = $('#container').highcharts();
		chart.showLoading('Loading chart...');
		
		var xAxisCategories = dataseries.getLocalTimeData();

		
		chart.xAxis[0].setCategories(xAxisCategories);   //very important step!!!
		chart.xAxis[0].update (
			{tickInterval: 24},
			{labels: {
				step: 24,
				formatter: function() { return this.value; }
			}}
		);
		
		chart.series[0].setData(dataseries.getCurrentDisplay("1"));  //initialize: temperature
		chart.series[0].update(
			{name: "Temperature"}
		);
		
		chart.hideLoading();
		
	}
		
	
	this.updateChart = function (chart, dataseries) {
		
		var paralist = document.getElementById("paraList");
		var paraChoice = paralist.options[paralist.selectedIndex].value;
//		var chart = $('#container').highcharts();
//		chart.showLoading('Loading chart...');
		
		var chartTitle, chartSubtitle, yTitle, seriesName;
		var xAxisCategories = dataseries.getLocalTimeData();
		
//		chart.xAxis[0].setCategories(xAxisCategories);   //very important step!!!
//		chart.xAxis[0].update (
//			{tickInterval: 24*4},
//			{labels: {
//				step: 96,
//				formatter: function() { return this.value; }
//			}}
//		);
		
		chart.series[0].setData(dataseries.getCurrentDisplay(paraChoice));
		
		switch (paraChoice) {
		case "1":
			chartTitle = 'Temperature View';
			yTitle = 'Temperature (\u2109)';
			seriesName = 'Temperature';
			break;
		case "2":
			chartTitle = 'Humidity View';
			yTitle = 'Humidity (%)';
			seriesName = 'Humidity';
			break;
		case "3":
			chartTitle = 'Solar Radiation View';
			yTitle = 'Solar Radiation (W/m2)';
			seriesName = 'Solar Radiance';
			break;
		case "4":
			chartTitle = 'Rainfall View';
			yTitle = 'Rainfall (inch)';
			seriesName = 'Rainfall';
			break;
		default:
			console.error("Incorrect Parameter Choice: "+displayOption);
		}
		chartSubtitle = dataseries.getRequestTime().toString();
		
		chart.setTitle(
			{text: chartTitle},
			{text: 'Request Time: '+chartSubtitle}
		);
		
		chart.series[0].update(
			{name: seriesName}
		);
		
		chart.yAxis[0].setTitle({
		            text: yTitle
		        });
		
	}
	
	this.showReference = function (showMark) {
		var paralist = document.getElementById("paraList");
		var paraChoice = paralist.options[paralist.selectedIndex].value;
		var chart = $('#container').highcharts();
		
		if(showMark) {
			switch (paraChoice) {
			case "1":	// temperature ideal zone: >30oC
				chart.yAxis[0].addPlotBand({
					from: 86,
					to: 95,
					color: '#43BFA7',
					label: {
						text: 'Ideal Zone',
						align: 'right',
						verticalAlign: 'top'
					},
					id: 'plot-band-temperature-ideal'
				});
				
				chart.yAxis[0].addPlotBand({
					from: 0,
					to: 86,
					color: '#F36966',
					id: 'plot-band-temperature-nonideal'
				});
				break;
			case "2":	//humididty ideal zone: < 70%
				chart.yAxis[0].addPlotBand({
					from: 0,
					to: 70,
					color: '#43BFA7',
					label: {
						text: 'Ideal Zone',
						align: 'right',
						verticalAlign: 'top'
					},
					id: 'plot-band-humidity-ideal'
				});
				
				chart.yAxis[0].addPlotBand({
					from: 70,
					to: 110,
					color: '#F36966',
					id: 'plot-band-humidity-nonideal'
				});
				break;
			case "3":	//solar radiance ideal zone: 600-700 W/m2
				chart.yAxis[0].addPlotBand({
					from: 600,
					to: 700,
					color: '#43BFA7',
					label: {
						text: 'Ideal Zone',
						align: 'right',
						verticalAlign: 'top'
					},
					id: 'plot-band-solarradi-ideal'
				});
				
				chart.yAxis[0].addPlotBand({
					from: 0,
					to: 600,
					color: '#F36966',
					id: 'plot-band-solarradi-nonideal'
				});
				break;
			case "4":	// rainfall ideal zone: 0
				chart.yAxis[0].addPlotLine({
					value: 0,
					width: 6,
					label: {
						text: 'Ideal Value: 0',
						align: 'right'
					},
					color: '#43BFA7',
					id: 'plot-line-rainfall-ideal'
				});
				
				chart.yAxis[0].addPlotBand({
					from: 0,
					to: 1,
					color: '#F36966',
					id: 'plot-band-rainfall-nonideal'
				});

				break;
			default:
				console.error("Incorrect Parameter Choice: "+displayOption);
			}
			
			
		}
		else {
			chart.yAxis[0].removePlotBand('plot-band-temperature-ideal');
			chart.yAxis[0].removePlotBand('plot-band-temperature-nonideal');
			chart.yAxis[0].removePlotBand('plot-band-humidity-ideal');
			chart.yAxis[0].removePlotBand('plot-band-humidity-nonideal');
			chart.yAxis[0].removePlotBand('plot-band-solarradi-ideal');
			chart.yAxis[0].removePlotBand('plot-band-solarradi-nonideal');
			chart.yAxis[0].removePlotLine('plot-line-rainfall-ideal');
			chart.yAxis[0].removePlotBand('plot-band-rainfall-nonideal');
		}
	}
}

function tableControl(newData) {
	// 12 items of data in a table page
	$('.paginated-table tr').not(function(){if ($(this).has('th').length){return true}}).remove();
	var maxRows = 12;
	var tRowData=new Array();
	var hRowData=new Array();
	var sRowData=new Array();
	var rRowData=new Array();
	var timeRowData=new Array();
	
	tRowData = newData.getTemperatureData();
	hRowData = newData.getHumidityData();
	rRowData = newData.getRainfallData();
	sRowData = newData.getSolarradiData();
	timeRowData = newData.getLocalTimeData();
		
	var tableRange = tRowData.length;
	// console.log("tableRange: "+tableRange);
	var cTable = $('.paginated-table');
	for ( var i = tableRange-1; i >= 72 ;i--) {
		if(!!tRowData[i])  //if the data value is not null
		{
			var localDate = new Date(timeRowData[i]).toString();
			var time = localDate.split(" ");	//After format Aug 07 2013 17:00:00
			var timeRow = time[1] + " " + time[2] + " " + time[3] + " " + time[4];	
				
			var rowcontend='<tr><td class="tcol">'+timeRow+'</td>'
	  		               +'<td class="tcol">'+tRowData[i]+'</td>'
	  		               +'<td class="tcol">'+hRowData[i]+'</td>'
	  		               +'<td class="tcol">'+rRowData[i]+'</td>'
	  		               +'<td class="tcol">'+sRowData[i]+'</td></tr>';
			// var tbody = $('.paginated-table tbody');
			// here can't use tbody: cause double data
			cTable.append(rowcontend);
		}
		
		else continue;
	}
	
	var cRows = cTable.find('tr:gt(0)');
	var cRowCount = cRows.size();
	// console.log("cRowCount"+cRowCount);
	
	if (cRowCount < maxRows) {
		return;
	}
	
	cRows.filter(':gt(' + (maxRows - 1) + ')').hide();
	
	var cPrev = cTable.siblings('.prev');
	var cNext = cTable.siblings('.next');
	
	cPrev.addClass('disabled');
	
	cPrev.click(function() {
		var cFirstVisible = cRows.index(cRows.filter(':visible'));
		if (cPrev.hasClass('disabled')) {
			return false;
		}
		
		cRows.hide();
		if (cFirstVisible - maxRows - 1 > 0) {
			cRows.filter(':lt(' + cFirstVisible + '):gt(' + (cFirstVisible - maxRows - 1) + ')').show();
		} else {
			cRows.filter(':lt(' + cFirstVisible + ')').show();
		}
		
		if (cFirstVisible - maxRows <= 0) {
			cPrev.addClass('disabled');
		}
		
		cNext.removeClass('disabled');
		return false;
	});
	
	cNext.click(function() {
		var cFirstVisible = cRows.index(cRows.filter(':visible'));
		
		if (cNext.hasClass('disabled')) {
			return false;
		}
		
		cRows.hide();
		cRows.filter(':lt(' + (cFirstVisible +2 * maxRows) + '):gt(' + (cFirstVisible + maxRows - 1) + ')').show();
		
		if (cFirstVisible + 2 * maxRows >= cRows.size()) {
			cNext.addClass('disabled');
		}
		
		cPrev.removeClass('disabled');
		return false;
	});	
}

function updateView() {
	
	var chart = $('#container').highcharts();
	chart.showLoading('Loading chart...');

	document.getElementById("checkRef").checked=true;
//	newChartController.showReference(0);
	
	var currentStationID=stationList.options[stationList.selectedIndex].value;
	
	if(currentStationID==newData.getStationID()) {
		newChartController.updateChart(chart, newData);
		chart.hideLoading();
	}
	
	else {
		newData.setStationID(currentStationID);
		newDataController.requestData(newData);
		setTimeout(function(){
			newChartController.updateChart(chart, newData);
			chart.hideLoading();
			
//			$('.paginated-table tr').not(function(){if ($(this).has('th').length){return true}}).remove();
			tableControl(newData);
			showRef();
		},500);
	}
}

function showRef() {
	if(document.getElementById("checkRef").checked==true) {
		newChartController.showReference(1);
		
		$(".paginated-table").each(function(){
		        var cTable = $(this);
		        var cRows = cTable.find('tr:gt(0)');
			
			// console.log(cols);
			cRows.each(function(i,row) {
				var cols = $(row).find("td");
				$.each(cols, function(i, col) {
					$(col).removeClass("tcol");
				});
				// console.log(cols);
				$(cols[0]).addClass("tcol");
				if(parseFloat(cols[1].innerHTML)>86) $(cols[1]).addClass("good");
				else $(cols[1]).addClass("bad");
			
				if(parseFloat(cols[2].innerHTML)<70) $(cols[2]).addClass("good");
				else $(cols[2]).addClass("bad");
			
				if(parseInt(cols[3].innerHTML)==0) $(cols[3]).addClass("good");
				else $(cols[3]).addClass("bad");
			
				if(parseFloat(cols[4].innerHTML)>=600 && parseFloat(cols[4].innerHTML)<=700) $(cols[4]).addClass("good");
				else $(cols[4]).addClass("bad");
			});
		});
	}
	else {
			newChartController.showReference(0);
			$(".paginated-table").each(function(){
			        var cTable = $(this);
			        var cRows = cTable.find('tr:gt(0)');
			
				// console.log(cols);
				cRows.each(function(i,row) {
					var cols = $(row).find("td");
					$.each(cols, function(i, col) {
						$(col).removeClass("good");
						$(col).removeClass("bad");
						$(col).addClass("tcol");
					});
				});
			});
		} 
	
}



function startPage() {
	
        newDataController.choiceLoad();
        document.getElementById("stationList").value = 260;
        document.getElementById("paraList").value = 1;
        document.getElementById("checkRef").checked=true;
 
        $('#container').highcharts({
       	 chart: {
       		 type: 'line'
       	 },
       	 title: {
       	 		 text: 'Temperature View'
       	 },
       	 subtitle: {
       	 		 text: 'Request Time: '+newData.getRequestTime()
       	 },
       	 yAxis: {
       		 title: {
       			 text: 'Temperature (\u2109)'
       		 }
       	 },
       	 series: [{
       		 marker: {
       			 radius: 2.5
       		 },
		 color: '#14446A',
       		 lineWidth: 1.5,
       		 turboThreshold: 1000
       	 }]
        }); 
 
        newDataController.requestData(newData);
        setTimeout(function(){ 
       	  newChartController.initialChart(newData); 
       	  tableControl(newData); 
       	  showRef();},500);
}

