/*
 * Copyright 2013 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

describe('Portal.details.NcWmsPanel', function() {

    var map;
    var ncwmsPanel;
    var geoNetworkRecord = {
        id: '45678',
        updateNcwmsParams: noOp
    };
    var layer = _mockLayer();


    beforeEach(function() {
        map = new OpenLayers.SpatialConstraintMap();

        spyOn(map.events, 'register');
        spyOn(Portal.ui.TimeRangeLabel.prototype, 'update');

        ncwmsPanel = new Portal.details.NcWmsPanel({ map: map });

        ncwmsPanel._setBounds =  noOp;
        ncwmsPanel._removeLoadingInfo = noOp;
        layer.getMissingDays =  function() { return [] };
        layer.isNcwms = function() { return true };
        layer.events = { on: noOp };
        layer.processTemporalExtent = noOp;
    });

    describe('GeoNetworkRecord', function() {

        it('assigns a GeoNetworkRecord instance from a layer', function() {
            _applyCommonSpies();
            spyOn(ncwmsPanel, '_removeLoadingInfo');

            ncwmsPanel.handleLayer(layer, noOp, noOp, {});
            expect(ncwmsPanel.geoNetworkRecord).toBeTruthy();
            expect(ncwmsPanel.geoNetworkRecord.id).toEqual(geoNetworkRecord.id);
        });
    });

    describe('input controls', function() {

        beforeEach(function() {
            _applyCommonSpies();
        });

        it('updates the NcWMS panel object when the layer changes', function() {
            ncwmsPanel.handleLayer(layer, noOp, noOp, {});
            expect(ncwmsPanel._buildParameters).toHaveBeenCalled();
            delete ncwmsPanel.geoNetworkRecord;
        });

        it('updates the date when the start date changes via edit', function() {
            ncwmsPanel._addTemporalControls();
            ncwmsPanel.startDateTimePicker.fireEvent('change');
            expect(ncwmsPanel._onDateSelected).toHaveBeenCalled();
        });

        it('updates the date when the end date changes via edit', function() {
            ncwmsPanel._addTemporalControls();
            ncwmsPanel.endDateTimePicker.fireEvent('change');
            expect(ncwmsPanel._onDateSelected).toHaveBeenCalled();
        });

        it('clears the date and time pickers when the layer is updating', function() {
            spyOn(ncwmsPanel, '_clearDateTimeFields');
            ncwmsPanel.handleLayer(layer, noOp, noOp, {});
            expect(ncwmsPanel._clearDateTimeFields).toHaveBeenCalled();
            delete ncwmsPanel.geoNetworkRecord;
        });
    });

    describe('_newHtmlElement', function() {

        it('return an element with the html set', function() {

            var element = ncwmsPanel._newHtmlElement('the html');

            expect(element.html).toBe('the html');
        });
    });

    describe('clearing the date and time pickers', function() {
        it('resets the start picker', function() {
            spyOn(ncwmsPanel.startDateTimePicker, 'reset');
            ncwmsPanel._clearDateTimeFields();
            expect(ncwmsPanel.startDateTimePicker.reset).toHaveBeenCalled();
        });

        it('resets the end picker', function() {
            spyOn(ncwmsPanel.endDateTimePicker, 'reset');
            ncwmsPanel._clearDateTimeFields();
            expect(ncwmsPanel.endDateTimePicker.reset).toHaveBeenCalled();
        });

        it('hides the next and previous buttons', function() {
            spyOn(ncwmsPanel.buttonsPanel, 'hide');
            ncwmsPanel._clearDateTimeFields();
            expect(ncwmsPanel.buttonsPanel.hide).toHaveBeenCalled();
        });

        it('updates the time range label', function() {
            spyOn(ncwmsPanel, '_updateTimeRangeLabelLoading');
            ncwmsPanel._clearDateTimeFields();
            expect(ncwmsPanel._updateTimeRangeLabelLoading).toHaveBeenCalledWith();
        });
    });

    describe('layer temporal extent loaded', function() {

        beforeEach(function() {
            ncwmsPanel.selectedLayer = layer;
        });

        it('enables the start date picker', function() {
            ncwmsPanel._layerTemporalExtentLoaded();
            expect(ncwmsPanel.startDateTimePicker.disabled).toBeFalsy();
        });

        it('enables the end date picker', function() {
            ncwmsPanel._layerTemporalExtentLoaded();
            expect(ncwmsPanel.endDateTimePicker.disabled).toBeFalsy();
        });

        it('shows the next and previous buttons', function() {
            spyOn(ncwmsPanel.buttonsPanel, 'show');
            ncwmsPanel._layerTemporalExtentLoaded();
            expect(ncwmsPanel.buttonsPanel.show).toHaveBeenCalled();
        });

        it('updates the time range label', function() {
            spyOn(ncwmsPanel, '_updateTimeRangeLabel');
            ncwmsPanel._layerTemporalExtentLoaded();
            expect(ncwmsPanel._updateTimeRangeLabel).toHaveBeenCalled();
        });
    });

    describe('_addDateTimeFilterToLayer', function() {

        it('updates bodaacFilterParams in selected layer', function() {

            var startTime = moment('2000-01-01T01:01:01');
            var endTime = moment('2001-01-01T01:01:01');

            spyOn(ncwmsPanel.startDateTimePicker, 'getValue').andReturn(startTime.toDate());
            spyOn(ncwmsPanel.endDateTimePicker, 'getValue').andReturn(endTime.toDate());

            var selectedLayer = {};
            var selectedLayerName = {};

            ncwmsPanel.selectedLayer = selectedLayer;
            ncwmsPanel.selectedLayer.name = selectedLayerName;

            ncwmsPanel._addDateTimeFilterToLayer();

            expect(selectedLayer.bodaacFilterParams.dateRangeStart).toBeSame(startTime);
            expect(selectedLayer.bodaacFilterParams.dateRangeEnd).toBeSame(endTime);
        });
    });

    describe('_buildParameters', function () {

        var geom = {
            getBounds: function() {
                return {
                    bottom: 10,
                    top: 20,
                    left: 30,
                    right: 40
                }
            }
        };

        beforeEach(function() {

            spyOn(ncwmsPanel, '_buildAodaacParams');
            spyOn(ncwmsPanel, '_buildGogoduckParams');
        });

        it('builds aodaac parameters if an aodaac layer is passed', function() {

            var config;

            ncwmsPanel.productsInfo = 'productsInfo';
            ncwmsPanel.selectedProductInfo = {
                extents: {
                    lat: {
                        min: -42,
                        max: -20
                    },
                    lon: {
                        min: 160,
                        max: 170
                    }
                }
            };

            config = ncwmsPanel._buildParameters(geom);
            expect(ncwmsPanel._buildAodaacParams).toHaveBeenCalled();
        });

        it('builds gogoduck parameters if a gogoduck layer is passed', function() {

            var config;
            ncwmsPanel.selectedLayer = layer;

            config = ncwmsPanel._buildParameters(geom);
            expect(ncwmsPanel._buildGogoduckParams).toHaveBeenCalled();
        });
    });

    describe('_buildAodaacParams', function() {

        var aodaacParameters;

        beforeEach(function () {

            spyOn(ncwmsPanel, '_getDateFromPicker').andReturn('[date]');

            ncwmsPanel.productsInfo = [];
            ncwmsPanel.selectedProductInfo = {
                productId: 42,
                extents: {
                    lat: { min: 1, max: 2 },
                    lon: { min: 3, max: 4 }
                }
            };
        });

        it('includes some information regardless of geometry', function () {

            var geom = undefined;

            aodaacParameters = ncwmsPanel._buildAodaacParams(geom, ncwmsPanel.selectedProductInfo);

            expect(aodaacParameters.productId).toBe(42);
            expect(aodaacParameters.dateRangeStart).toBe('[date]');
            expect(aodaacParameters.dateRangeEnd).toBe('[date]');
            expect(aodaacParameters.productLatitudeRangeStart).toBe(1);
            expect(aodaacParameters.productLongitudeRangeStart).toBe(3);
            expect(aodaacParameters.productLatitudeRangeEnd).toBe(2);
            expect(aodaacParameters.productLongitudeRangeEnd).toBe(4);
        });

        it('includes spatialBounds if a geometry is present', function () {

            var geom = {
                getBounds: function() {
                    return {
                        bottom: 10,
                        top: 20,
                        left: 30,
                        right: 40
                    }
                }
            };

            aodaacParameters = ncwmsPanel._buildAodaacParams(geom, ncwmsPanel.selectedProductInfo);

            expect(aodaacParameters.latitudeRangeStart).toBe(10);
            expect(aodaacParameters.longitudeRangeStart).toBe(30);
            expect(aodaacParameters.latitudeRangeEnd).toBe(20);
            expect(aodaacParameters.longitudeRangeEnd).toBe(40);
        });
    });

    describe('_buildGogoduckParams', function() {

        var gogoduckParameters;

        beforeEach(function () {
            ncwmsPanel.selectedLayer = layer;
            spyOn(ncwmsPanel, '_getDateFromPicker').andReturn('[date]');
        });

        it('includes some information regardless of geometry', function () {

            gogoduckParameters = ncwmsPanel._buildParameters(null);

            expect(gogoduckParameters.layerName).toBe('gogoDingo');
            expect(gogoduckParameters.dateRangeStart).toBe('[date]');
            expect(gogoduckParameters.dateRangeEnd).toBe('[date]');
            expect(gogoduckParameters.productLatitudeRangeStart).toBe(-90);
            expect(gogoduckParameters.productLongitudeRangeStart).toBe(-180);
            expect(gogoduckParameters.productLatitudeRangeEnd).toBe(90);
            expect(gogoduckParameters.productLongitudeRangeEnd).toBe(180);
        });

        it('includes spatialBounds if a geometry is present', function () {

            var geom = {
                getBounds: function() {
                    return {
                        bottom: 10,
                        top: 20,
                        left: 30,
                        right: 40
                    }
                }
            };

            gogoduckParameters = ncwmsPanel._buildParameters(geom);

            expect(gogoduckParameters.latitudeRangeStart).toBe(10);
            expect(gogoduckParameters.longitudeRangeStart).toBe(30);
            expect(gogoduckParameters.latitudeRangeEnd).toBe(20);
            expect(gogoduckParameters.longitudeRangeEnd).toBe(40);
        });
    });

    function _applyCommonSpies(panel) {
        var _panel = panel || ncwmsPanel;
        spyOn(_panel, '_showAllControls');
        spyOn(_panel, '_buildParameters');
        spyOn(_panel, '_onDateSelected');
        spyOn(_panel, '_setBounds');
    }

    function _mockLayer() {
        var extent = new Portal.visualise.animations.TemporalExtent();
        for (var i = 0; i < 24; i++) {
            extent.add(moment("2001-01-01T01:00:00.000Z").add('h', i));
        }
        return {
            parentGeoNetworkRecord: geoNetworkRecord,
            temporalExtent: extent,
            missingDays: [],
            time: extent.min(),
            getTemporalExtent: function() {
                return this.temporalExtent;
            },
            getSubsetExtentMin: function() { return extent.min() },
            getSubsetExtentMax: function() { return extent.max() },
            wfsLayer: {
                name: 'gogoDingo'
            }
        };
    }
});
