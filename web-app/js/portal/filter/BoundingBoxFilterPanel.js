/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext.namespace('Portal.filter');

Portal.filter.BoundingBoxFilterPanel = Ext.extend(Portal.filter.BaseFilterPanel, {

    constructor: function(cfg) {
        var config = Ext.apply({
            colspan: 2
        }, cfg);

        Portal.filter.BoundingBoxFilterPanel.superclass.constructor.call(this, config);

        var map = config.layer.map;
        map.events.on({
            scope: this,
            'spatialconstraintadded': function(geometry) {
                this._updateWithGeometry(geometry);
            }
        });
    },

    _createField: function() {
        this.spatialConstraintDisplayPanel = new Portal.details.SpatialConstraintDisplayPanel({
            map: this.layer.map
        });
        this.add(this.spatialConstraintDisplayPanel);
    },

    isDownloadOnly: function() {
        return true;
    },

    handleRemoveFilter: function() {
        // Can't be removed
    },

    getFilterName: function() {
        return undefined;
    },

    setLayerAndFilter: function(layer, filter) {
        Portal.filter.BoundingBoxFilterPanel.superclass.setLayerAndFilter.apply(this, arguments);

        this._updateWithGeometry(layer.map.spatialConstraintControl.getConstraint());
    },

    _updateWithGeometry: function(geometry) {

        this.geometry = geometry;

        this._fireAddEvent();
    },

    _setExistingFilters: function() {
        // Never restored from an existing filter
    },

    getCQL: function() {

        var geometryExpression = this.geometry.isBox() ? this._geometryExpressionForBbox()
                                                       : this._geometryExpressionForPolygon();

        return String.format(
            "BBOX({0},{1})",
            this.filter.name,
            geometryExpression
        );
    },

    _geometryExpressionForBbox: function() {

        var geom = this.geometry;
        return String.format("{0},{1},{2},{3}", geom.left, geom.bottom, geom.right, geom.top);
    },

    _geometryExpressionForPolygon: function() {

        return Portal.utils.geo.geometryToWkt(this.geometry);
    }
});
